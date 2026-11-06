import{
ancestorsOf,
buildListing,
buttonOf,
childrenIn,
placeRows,
rowAt,
}from"./file-list-table.js";
import{sortTree}from"./file-tree.js";
const BYTES_PER_KB=1000;
export function formatSize(bytes){
if(bytes<BYTES_PER_KB){
return`${bytes} B`;
}
return`${(bytes/BYTES_PER_KB).toFixed(1)} KB`;
}
export function mediaTypeOf(header){
return(header??"").split(";")[0].trim().toLowerCase();
}
function fileIn(response){
if(!response.ok){
throw new Error(`the file responded ${response.status}`);
}
const type=mediaTypeOf(response.headers.get("content-type"));
return response.arrayBuffer().then((body)=>({
type,
size:body.byteLength,
text:new TextDecoder("utf-8",{ignoreBOM:true}).decode(body),
}));
}
function fillRow(row,fetched){
row.cells[1].textContent=fetched.type;
row.cells[2].textContent=formatSize(fetched.size);
}
function onFirstOpen(doc,panel,start){
const view=doc.defaultView;
if(!view){
return;
}
const observer=new view.MutationObserver(()=>{
if(!panel.hidden){
observer.disconnect();
start();
}
});
observer.observe(panel,{attributes:true,attributeFilter:["hidden"]});
}
function showFile(doc,box,fetched){
const status=doc.getElementById("files-status");
box.textContent=fetched?fetched.text:"";
if(status){
status.textContent=fetched?"":status.getAttribute("data-words");
}
}
function nextSort(sort,column){
if(sort.column!==column){
return{column,direction:"ascending"};
}
return{
column,
direction:sort.direction==="ascending"?"descending":"ascending",
};
}
export function initFileList(doc,fetchImpl){
const carrier=(
doc.querySelector("#file-box #file-list")
);
const box=(
doc.querySelector("#file-box .debug-box__text")
);
if(!carrier||!box){
return;
}
const panel=(doc.getElementById("file-box"));
const{body,headings,rows,kinds,tree,children}=buildListing(
doc,
carrier,
);
const open=new Set();
const facts=new Map();
const asked=new Set();
let sort={column:"name",direction:"ascending"};
const showOpen=()=>{
for(const[path,row]of rows){
row.hidden=ancestorsOf(path).some((folder)=>!open.has(folder));
}
};
const reorder=()=>{
placeRows(
doc,
body,
sortTree(tree,sort.column,sort.direction,facts).map((entry)=>
rowAt(rows,entry.path),
),
);
};
const fetches=new Map();
const fetchOf=(path)=>{
let fetched=fetches.get(path);
if(!fetched){
fetched=fetchImpl(`../${path}`)
.then(fileIn)
.then(
(file)=>{
fillRow(rowAt(rows,path),file);
facts.set(path,{type:file.type,size:file.size});
if(sort.column!=="name"){
reorder();
}
return file;
},
()=>{
fetches.delete(path);
return null;
},
);
fetches.set(path,fetched);
}
return fetched;
};
const fetchFilesIn=(folder)=>{
if(asked.has(folder)){
return;
}
asked.add(folder);
for(const entry of childrenIn(children,folder)){
if(entry.kind==="file"){
fetchOf(entry.path);
}
}
};
const toggle=(path)=>{
const opening=!open.has(path);
if(opening){
open.add(path);
}else{
open.delete(path);
}
buttonOf(rowAt(rows,path)).setAttribute("aria-expanded",String(opening));
showOpen();
if(opening){
fetchFilesIn(path);
}
};
const sortBy=(column)=>{
sort=nextSort(sort,column);
for(const[each,heading]of headings){
heading.setAttribute(
"aria-sort",
each===sort.column?sort.direction:"none",
);
}
reorder();
};
const files=[...rows.keys()].filter((path)=>kinds.get(path)==="file");
let chosen=null;
const choose=(path)=>{
chosen=chosen===path?null:path;
for(const other of files){
buttonOf(rowAt(rows,other)).setAttribute(
"aria-pressed",
String(other===chosen),
);
}
box.textContent="";
const status=doc.getElementById("files-status");
if(status){
status.textContent="";
}
if(!chosen){
return;
}
fetchOf(path).then((fetched)=>{
if(chosen===path){
showFile(doc,box,fetched);
}
});
};
for(const path of rows.keys()){
const act=kinds.get(path)==="folder"?toggle:choose;
buttonOf(rowAt(rows,path)).addEventListener("click",()=>act(path));
}
for(const[column,heading]of headings){
(
heading.firstElementChild
).addEventListener("click",()=>sortBy(column));
}
showOpen();
onFirstOpen(doc,panel,()=>fetchFilesIn(""));
}
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
function headerCell(doc,words){
const cell=doc.createElement("th");
cell.scope="col";
cell.textContent=words;
return cell;
}
function fileRow(doc,name){
const button=doc.createElement("button");
button.type="button";
button.className="file-list__name";
button.setAttribute("aria-pressed","false");
button.textContent=name;
const row=doc.createElement("tr");
row.insertCell().append(button);
row.insertCell().className="file-list__type";
row.insertCell().className="file-list__size";
return row;
}
function buttonOf(row){
return(row.cells[0].firstElementChild);
}
function buildListing(doc,carrier){
const{files="",name="",type="",size=""}=carrier.dataset;
const head=doc.createElement("thead");
head
.insertRow()
.append(
headerCell(doc,name),
headerCell(doc,type),
headerCell(doc,size),
);
const names=files.split(/\s+/).filter(Boolean).sort();
const rows=names.map((file)=>fileRow(doc,file));
const body=doc.createElement("tbody");
body.setAttribute("translate","no");
body.append(...rows);
const table=doc.createElement("table");
table.className="file-list__table";
table.append(head,body);
carrier.append(table);
return new Map(rows.map((row,index)=>[row,names[index]]));
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
const names=buildListing(doc,carrier);
const rows=[...names.keys()];
const fetches=new Map();
const fetchOf=(row)=>{
let fetched=fetches.get(row);
if(!fetched){
fetched=fetchImpl(`../${names.get(row)}`)
.then(fileIn)
.then(
(file)=>{
fillRow(row,file);
return file;
},
()=>{
fetches.delete(row);
return null;
},
);
fetches.set(row,fetched);
}
return fetched;
};
let chosen=null;
const choose=(row)=>{
chosen=chosen===row?null:row;
for(const other of rows){
buttonOf(other).setAttribute("aria-pressed",String(other===chosen));
}
box.textContent="";
const status=doc.getElementById("files-status");
if(status){
status.textContent="";
}
if(!chosen){
return;
}
fetchOf(row).then((fetched)=>{
if(chosen===row){
showFile(doc,box,fetched);
}
});
};
for(const row of rows){
buttonOf(row).addEventListener("click",()=>choose(row));
}
onFirstOpen(doc,panel,()=>{
for(const row of rows){
fetchOf(row);
}
});
}
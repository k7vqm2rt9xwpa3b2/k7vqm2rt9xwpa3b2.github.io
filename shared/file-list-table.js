import{buildTree,sortTree}from"./file-tree.js";
function buttonReading(doc,className,words){
const button=doc.createElement("button");
button.type="button";
button.className=className;
button.textContent=words;
return button;
}
function headerCell(doc,words,column){
const cell=doc.createElement("th");
cell.scope="col";
cell.setAttribute("aria-sort",column==="name"?"ascending":"none");
cell.append(buttonReading(doc,"file-list__sort",words));
return cell;
}
function treeRow(doc,entry,button){
const row=doc.createElement("tr");
row.className=`file-list__depth-${entry.depth}`;
row.dataset.path=entry.path;
row.insertCell().append(button);
row.insertCell().className="file-list__type";
row.insertCell().className="file-list__size";
return row;
}
function fileRow(doc,entry){
const button=buttonReading(doc,"file-list__name",entry.name);
button.setAttribute("aria-pressed","false");
return treeRow(doc,entry,button);
}
function folderRow(doc,entry){
const button=buttonReading(doc,"file-list__folder",`${entry.name}/`);
button.setAttribute("aria-expanded","false");
return treeRow(doc,entry,button);
}
function parentOf(path){
return path.replace(/[^/]+\/?$/,"");
}
export function ancestorsOf(path){
const folders=[];
for(let folder=parentOf(path);folder;folder=parentOf(folder)){
folders.push(folder);
}
return folders;
}
export function rowAt(rows,path){
return(rows.get(path));
}
export function childrenIn(children,folder){
return children.get(folder)??[];
}
function childrenOf(order){
const children=new Map();
for(const entry of order){
const parent=parentOf(entry.path);
children.set(parent,[...(children.get(parent)??[]),entry]);
}
return children;
}
export function buttonOf(row){
return(row.cells[0].firstElementChild);
}
export function buildListing(doc,carrier){
const{files="",name="",type="",size=""}=carrier.dataset;
const headings=new Map([
["name",headerCell(doc,name,"name")],
["type",headerCell(doc,type,"type")],
["size",headerCell(doc,size,"size")],
]);
const head=doc.createElement("thead");
head.insertRow().append(...headings.values());
const tree=buildTree([...new Set(files.split(/\s+/).filter(Boolean))]);
const order=sortTree(tree,"name","ascending",new Map());
const rows=new Map();
const kinds=new Map();
order.forEach((entry,index)=>{
const row=(entry.kind==="folder"?folderRow:fileRow)(doc,entry);
row.id=`file-row-${index}`;
rows.set(entry.path,row);
kinds.set(entry.path,entry.kind);
});
const children=childrenOf(order);
for(const entry of order){
if(entry.kind==="folder"){
const ids=childrenIn(children,entry.path).map(
(child)=>rowAt(rows,child.path).id,
);
buttonOf(rowAt(rows,entry.path)).setAttribute(
"aria-controls",
ids.join(" "),
);
}
}
const body=doc.createElement("tbody");
body.setAttribute("translate","no");
body.append(...rows.values());
const table=doc.createElement("table");
table.className="file-list__table";
table.append(head,body);
carrier.append(table);
return{body,headings,rows,kinds,tree,children};
}
export function placeRows(doc,body,ordered){
const focused=(doc.activeElement);
let next=body.firstElementChild;
for(const row of ordered){
if(row===next){
next=row.nextElementSibling;
}else{
body.insertBefore(row,next);
}
}
if(doc.activeElement!==focused){
focused.focus({preventScroll:true});
}
}
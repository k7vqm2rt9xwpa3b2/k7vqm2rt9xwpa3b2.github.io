const byName=(a,b)=>(a<b?-1:a>b?1:0);
export function buildTree(paths){
const root={kind:"folder",name:"",path:"",folders:[],files:[]};
for(const path of paths){
const parts=path.split("/");
const name=(parts.pop());
let folder=root;
for(const part of parts){
let child=folder.folders.find((each)=>each.name===part);
if(!child){
child={
kind:"folder",
name:part,
path:`${folder.path}${part}/`,
folders:[],
files:[],
};
folder.folders.push(child);
}
folder=child;
}
folder.files.push({kind:"file",name,path});
}
return root;
}
function valueOf(row,column,facts){
if(column==="name"){
return row.name;
}
const fact=facts.get(row.path);
if(!fact){
return null;
}
return column==="size"?fact.size:fact.type||null;
}
export function compareRows(column,direction,facts){
const sign=direction==="descending"?-1:1;
return(a,b)=>{
const first=valueOf(a,column,facts);
const second=valueOf(b,column,facts);
if(first===null||second===null){
return first===second
?byName(a.name,b.name)
:first===null
?1
:-1;
}
const order=
typeof first==="number"&&typeof second==="number"
?first-second
:byName(String(first),String(second));
return order===0?byName(a.name,b.name):sign*order;
};
}
export function sortTree(tree,column,direction,facts){
const compare=compareRows(column,direction,facts);
const rows=[];
const visit=(folder,depth)=>{
const children=[...folder.folders,...folder.files]
.map((child)=>({
child,
row:{kind:child.kind,name:child.name,path:child.path,depth},
}))
.sort((a,b)=>compare(a.row,b.row));
for(const{child,row}of children){
rows.push(row);
if(child.kind==="folder"){
visit(child,depth+1);
}
}
};
visit(tree,0);
return rows;
}
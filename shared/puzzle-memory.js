const STORAGE_KEY="puzzle";
function isReload(view){
const[entry]=view.performance?.getEntriesByType?.("navigation")??[];
return entry!==undefined&&entry.type==="reload";
}
export function rememberedPuzzle(view){
if(isReload(view)){
return null;
}
try{
const raw=view.sessionStorage.getItem(STORAGE_KEY);
const index=raw===null?null:Number(raw);
return Number.isFinite(index)?index:null;
}catch{
return null;
}
}
export function rememberPuzzle(view,index){
try{
if(index===null){
view.sessionStorage.removeItem(STORAGE_KEY);
}else{
view.sessionStorage.setItem(STORAGE_KEY,String(index));
}
}catch{
}
}
const recordNothing=()=>false;
export function recordingVisits(view,remember,load){
let recorder;
return(index)=>{
remember(index);
const visit=
index===null?{page:"home"}:{page:"home",number:index+1};
const now=Date.now();
recorder??=load().then(
({recordVisit})=>recordVisit,
()=>recordNothing,
);
recorder.then((record)=>record(view,visit,now));
};
}
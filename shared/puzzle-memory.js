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
return raw===null?null:Number(raw);
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
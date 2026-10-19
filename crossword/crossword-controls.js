import{mergeSettings}from"./crossword-settings.js";
const ROW=".crossword__controls";
const CONTROLS=Object.freeze([
Object.freeze({
name:"exit",
words:"exitLabel",
face:"×",
discloses:false,
}),
Object.freeze({
name:"start",
words:"startLabel",
face:null,
discloses:false,
}),
Object.freeze({
name:"next",
words:"nextLabel",
face:"",
discloses:false,
}),
Object.freeze({
name:"theme",
words:"themeLabel",
face:null,
discloses:true,
}),
]);
function buildControl(doc,control,id,words){
const button=doc.createElement("button");
button.id=id;
button.className="crossword__"+control.name;
button.type="button";
button.hidden=true;
if(control.face===null){
button.textContent=words;
}else{
button.setAttribute("aria-label",words);
button.textContent=control.face;
}
if(control.discloses){
button.setAttribute("aria-expanded","false");
}
return button;
}
export function buildCrosswordControls(doc,settings){
const{ids}=mergeSettings(settings);
const row=(doc.querySelector(ROW));
if(!row||row.firstElementChild){
return;
}
for(const control of CONTROLS){
const words=row.dataset[control.words];
if(words!==undefined&&words.trim()!==""){
row.append(buildControl(doc,control,ids[control.name],words));
}
}
}
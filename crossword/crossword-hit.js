import{
deselect,
gridHeld,
lockEntry,
lockedEntryKey,
selectEntry,
selectedEntryKey,
}from"./crossword-interact.js";
import{
hideSpotlight,
showSpotlight,
spotlightHeld,
}from"./crossword-spotlight.js";
function pressEntry(doc,data,key){
if(lockedEntryKey(doc)===key){
deselect(doc);
return;
}
lockEntry(doc,data,key);
}
function previewEntry(doc,data,key){
if(selectedEntryKey(doc)===key){
return;
}
selectEntry(doc,data,key);
}
export function wireHit(doc,rect,key,data){
rect.addEventListener("pointerenter",function(event){
if(event.pointerType==="touch"||gridHeld(doc)){
return;
}
previewEntry(doc,data,key);
});
rect.addEventListener("focus",function(){
if(gridHeld(doc)){
return;
}
previewEntry(doc,data,key);
});
rect.addEventListener("click",function(){
pressEntry(doc,data,key);
});
rect.addEventListener("keydown",function(event){
if(event.key!=="Enter"&&event.key!==" "){
return;
}
if(event.key===" "){
event.preventDefault();
}
pressEntry(doc,data,key);
});
}
export function wireCircleHit(doc,rect,svg){
rect.addEventListener("pointerenter",function(event){
if(event.pointerType==="touch"||gridHeld(doc)){
return;
}
deselect(doc);
showSpotlight(svg,false);
});
rect.addEventListener("pointerleave",function(){
if(spotlightHeld(doc)){
return;
}
hideSpotlight(svg);
});
rect.addEventListener("click",function(){
const wasHeld=spotlightHeld(doc);
deselect(doc);
if(!wasHeld){
showSpotlight(svg,true);
}
});
}
import{
deselect,
dimSpotlight,
gridHeld,
lightSpotlight,
lockEntry,
lockedEntryKey,
selectEntry,
selectedEntryKey,
}from"./crossword-interact.js";
import{spotlightHeld}from"./crossword-spotlight.js";
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
function handsOver(svg,event){
const to=(event.relatedTarget);
return(
event.pointerType!=="touch"&&
to!==null&&
svg.contains(to)&&
to.matches(".cw-circle-hit, .cw-hit")
);
}
export function wireCircleHit(doc,rect,svg,clue){
function previewWord(){
if(!gridHeld(doc)){
lightSpotlight(doc,svg,false,clue);
}
}
function pressWord(){
if(spotlightHeld(doc)){
deselect(doc);
return;
}
lightSpotlight(doc,svg,true,clue);
}
rect.addEventListener("pointerenter",function(event){
if(event.pointerType!=="touch"){
previewWord();
}
});
rect.addEventListener("pointerleave",function(event){
if(!handsOver(svg,event)){
dimSpotlight(doc,svg);
}
});
rect.addEventListener("click",pressWord);
if(!clue){
return;
}
rect.addEventListener("focus",previewWord);
rect.addEventListener("keydown",function(event){
if(event.key!=="Enter"&&event.key!==" "){
return;
}
if(event.key===" "){
event.preventDefault();
}
pressWord();
});
}
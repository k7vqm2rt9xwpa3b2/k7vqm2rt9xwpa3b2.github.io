import{deselect,gridHeld}from"./crossword-interact.js";
import{elementFor,settingsFor}from"./crossword-settings.js";
export function wireDismissal(doc){
const mount=elementFor(doc,"mount");
const figure=mount?mount.closest("figure"):null;
if(!figure){
console.warn(
"crossword-dismiss.js: no <figure> around #"+
settingsFor(doc).ids.mount+
" -- selection cannot be dismissed",
);
return;
}
figure.addEventListener("pointerleave",function(){
if(gridHeld(doc)){
return;
}
deselect(doc);
});
figure.addEventListener("focusout",function(event){
if(
figure.contains((event.relatedTarget))||
gridHeld(doc)
){
return;
}
deselect(doc);
});
doc.addEventListener("click",function(event){
if(figure.contains(event.target)){
return;
}
deselect(doc);
});
doc.addEventListener("keydown",function(event){
if(event.key!=="Escape"){
return;
}
deselect(doc);
});
}
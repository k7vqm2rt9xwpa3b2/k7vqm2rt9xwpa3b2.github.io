import{squareKey}from"./crossword-anchor.js";
import{
THEME_LIT,
clearSelection,
deselect,
markAsSelected,
squareOf,
}from"./crossword-interact.js";
import{linkedEntries,themeLine,writeReadout}from"./crossword-readout.js";
import{elementFor}from"./crossword-settings.js";
function showTheme(doc,block,button){
const circled=new Set(
(block.circled||[]).map(([row,col])=>squareKey(row,col)),
);
clearSelection(doc);
linkedEntries(block).forEach(function(entry){
markAsSelected(doc,block,entry,circled);
});
const mount=(elementFor(doc,"mount"));
mount
.querySelectorAll(".cw-cell, .cw-letter, .cw-circle")
.forEach(function(element){
if(circled.has(squareOf(element))){
element.classList.add(THEME_LIT);
}
});
button.setAttribute("aria-pressed","true");
writeReadout(doc,[themeLine((block.theme))]);
}
export function initThemeControl(doc){
const button=(
elementFor(doc,"theme")
);
if(!button){
return function(){};
}
button.disabled=true;
button.setAttribute("aria-pressed","false");
let onScreen=null;
button.addEventListener("click",function(){
if(button.disabled){
return;
}
if(button.getAttribute("aria-pressed")==="true"){
deselect(doc);
}else{
showTheme(doc,(onScreen),button);
}
});
return function(block,offered){
clearSelection(doc);
onScreen=block;
button.setAttribute("aria-pressed","false");
button.hidden=!offered;
button.disabled=!(block&&block.theme);
};
}
import{entryId}from"./crossword-anchor.js";
import{squareOf}from"./crossword-interact.js";
import{elementFor}from"./crossword-settings.js";
export const THEME_LIT="is-theme-lit";
export const PANEL_ID="crossword-theme-panel";
function buildPanel(doc,button){
const panel=doc.createElement("p");
panel.id=PANEL_ID;
panel.className="crossword__theme-panel";
panel.hidden=true;
button.setAttribute("aria-controls",PANEL_ID);
button.parentNode.after(panel);
return panel;
}
function linkedEntries(block){
return block.entries.filter((entry)=>entry.answer===block.linked);
}
function squaresOfEntries(mount,entries){
const ids=entries.map(entryId);
const squares=new Set();
mount.querySelectorAll(".cw-cell").forEach(function(cell){
const tokens=(cell.getAttribute("data-entries")||"").split(" ");
if(tokens.some((token)=>ids.includes(token))){
squares.add(squareOf(cell));
}
});
return squares;
}
function lightOwnNumbers(mount,entries,squares){
const numbers=entries.map((entry)=>String(entry.number));
mount.querySelectorAll(".cw-number").forEach(function(number){
if(squares.has(squareOf(number))&&numbers.includes(number.textContent)){
number.classList.add(THEME_LIT);
}
});
}
function lightSquares(mount,selector,squares){
mount.querySelectorAll(selector).forEach(function(element){
if(squares.has(squareOf(element))){
element.classList.add(THEME_LIT);
}
});
}
function lightTheme(doc,block){
const mount=(elementFor(doc,"mount"));
const circled=new Set(
(block.circled||[]).map(([row,col])=>row+","+col),
);
lightSquares(mount,".cw-cell, .cw-letter, .cw-circle",circled);
const entries=linkedEntries(block);
const linked=squaresOfEntries(mount,entries);
lightSquares(mount,".cw-cell, .cw-letter",linked);
lightOwnNumbers(mount,entries,linked);
}
function putOutTheme(doc){
doc.querySelectorAll("."+THEME_LIT).forEach(function(element){
element.classList.remove(THEME_LIT);
});
}
export function initThemeControl(doc){
const button=(
elementFor(doc,"theme")
);
if(!button){
return function(){};
}
button.disabled=true;
const panel=buildPanel(doc,button);
let onScreen=null;
button.addEventListener("click",function(){
if(button.disabled){
return;
}
const opening=panel.hidden;
panel.hidden=!opening;
button.setAttribute("aria-expanded",String(opening));
if(opening){
lightTheme(doc,(onScreen));
}else{
putOutTheme(doc);
}
});
return function(block,offered){
putOutTheme(doc);
onScreen=block;
const sentence=block?block.theme:undefined;
panel.textContent=sentence||"";
panel.hidden=true;
button.setAttribute("aria-expanded","false");
button.hidden=!offered;
button.disabled=!sentence;
};
}
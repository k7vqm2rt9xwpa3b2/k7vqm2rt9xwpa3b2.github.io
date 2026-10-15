import{deselect}from"./crossword-interact.js";
import{settlePuzzleNumber}from"./crossword-number.js";
import{elementFor,settingsFor}from"./crossword-settings.js";
export function openerGrid(doc){
const noscript=elementFor(doc,"mount")
?.closest("figure")
?.querySelector("noscript");
if(!noscript){
return null;
}
const holder=doc.createElement("template");
holder.innerHTML=(noscript.textContent);
return holder.content.querySelector("svg.crossword__drawn");
}
export function drawnGridStart(doc){
const start=elementFor(doc,"start");
return start&&openerGrid(doc)?start:null;
}
export function showDrawnGrid(hero,start){
const{doc}=hero;
const mount=(elementFor(doc,"mount"));
mount.replaceChildren((openerGrid(doc)));
mount.style.removeProperty("--grid-columns");
hero.onScreen=null;
settlePuzzleNumber(doc,hero.button,null);
hero.remember(null);
start.hidden=false;
}
function forgetPuzzleNumber(doc){
const{queryKey}=settingsFor(doc);
if(queryKey===null){
return;
}
const view=(doc.defaultView);
const url=new URL(view.location.href);
url.searchParams.delete(queryKey);
view.history.replaceState(null,"",url.href);
}
export function wayBack(hero,start){
const arrivedOn=hero.onScreen;
return function(focusOptions){
if(hero.onScreen!==arrivedOn){
return;
}
if(start){
showDrawnGrid(hero,start);
}
forgetPuzzleNumber(hero.doc);
start?.focus(focusOptions);
};
}
function closePuzzle(hero,start,exit){
const{doc,button}=hero;
deselect(doc);
hero.showTheme(null,false);
if(button){
button.hidden=true;
}
const readout=elementFor(doc,"readout");
if(readout){
readout.hidden=true;
}
exit.hidden=true;
showDrawnGrid(hero,start);
forgetPuzzleNumber(doc);
start.focus();
}
export function wireOpener(hero,start,begin){
start.addEventListener("click",function(){
if(hero.onScreen!==null){
return;
}
start.hidden=true;
begin();
});
const exit=hero.exit;
if(exit){
exit.addEventListener("click",function(){
if(hero.onScreen===null){
return;
}
closePuzzle(hero,start,exit);
});
}
}
export function settleExit(hero,drawn){
if(hero.exit){
hero.exit.hidden=!drawn;
}
}
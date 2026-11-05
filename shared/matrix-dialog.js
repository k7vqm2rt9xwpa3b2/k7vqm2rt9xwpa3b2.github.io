import{
aboveGrid,
fitsLeftOf,
leftOfGrid,
scrollToFitAbove,
}from"./magic-word-place.js";
import{buildPaperCopy}from"./magic-word-paper.js";
export const MATRIX_CHOICE_SHEET="/shared/matrix-choice.css";
export const STYLED_PROPERTY="--matrix-choice-styled";
const TITLE_ID="matrix-choice-title";
const MESSAGE_ID="matrix-choice-message";
const PAPER_CLASS="matrix-choice-paper";
const PRESSES="a, button";
export function buildMatrixDialog(doc,words,presses){
const dialog=doc.createElement("dialog");
dialog.className="matrix-choice";
dialog.setAttribute("aria-labelledby",TITLE_ID);
dialog.setAttribute("aria-describedby",MESSAGE_ID);
const title=doc.createElement("h2");
title.id=TITLE_ID;
title.className="matrix-choice__title";
title.tabIndex=-1;
title.textContent=words.title;
const message=doc.createElement("p");
message.id=MESSAGE_ID;
message.className="matrix-choice__message";
message.textContent=words.message;
const row=doc.createElement("p");
row.className="matrix-choice__pills";
row.append(...presses);
dialog.append(title,message,row);
return dialog;
}
export function openBesideSquare(win,dialog,square){
square.after(dialog);
const paper=paperCopy(win.document,dialog);
square.before(paper);
dialog.hidden=true;
dialog.showModal();
let unplace=doNothing;
whenStyled(win,dialog,()=>{
if(!dialog.isConnected){
return;
}
dialog.hidden=false;
(dialog.querySelector(`#${TITLE_ID}`)).focus();
unplace=placeBesideSquare(win,dialog,square);
});
return()=>{
unplace();
paper.remove();
dialog.remove();
};
}
function paperCopy(doc,dialog){
const copy=buildPaperCopy(doc,dialog);
copy.className=PAPER_CLASS;
for(const press of copy.querySelectorAll(PRESSES)){
const words=doc.createElement("span");
words.className=press.className;
words.textContent=press.textContent;
press.replaceWith(words);
}
return copy;
}
function whenStyled(win,dialog,then){
const link=win.document.querySelector(
`link[rel="stylesheet"][href="${MATRIX_CHOICE_SHEET}"]`,
);
const styled=win
.getComputedStyle(dialog)
.getPropertyValue(STYLED_PROPERTY)
.trim();
if(!link||styled!==""){
then();
return;
}
const once=()=>{
link.removeEventListener("load",once);
link.removeEventListener("error",once);
then();
};
link.addEventListener("load",once);
link.addEventListener("error",once);
}
function placeBesideSquare(win,dialog,grid){
let placedFor=viewportOf(win);
place(win,dialog,grid,placedFor);
const placeAgain=()=>{
const viewport=viewportOf(win);
if(
viewport.width===placedFor.width&&
viewport.height===placedFor.height
){
return;
}
placedFor=viewport;
place(win,dialog,grid,viewport);
};
win.addEventListener("resize",placeAgain);
return()=>win.removeEventListener("resize",placeAgain);
}
function place(win,dialog,grid,viewport){
const popUp=dialog.getBoundingClientRect();
const beside=grid.getBoundingClientRect();
let spot;
if(fitsLeftOf(beside,popUp)){
spot=leftOfGrid(beside,popUp,viewport);
}else{
win.scrollBy({top:scrollToFitAbove(beside,popUp),behavior:"instant"});
spot=aboveGrid(grid.getBoundingClientRect(),popUp,viewport);
}
dialog.style.left=`${spot.left+win.scrollX}px`;
dialog.style.top=`${spot.top+win.scrollY}px`;
}
function viewportOf(win){
const{clientWidth,clientHeight}=win.document.documentElement;
return{width:clientWidth,height:clientHeight};
}
function doNothing(){}
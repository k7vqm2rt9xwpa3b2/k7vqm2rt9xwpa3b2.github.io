import{wordOn}from"./dom-words.js";
import{openMatrixChoice}from"./matrix-choice.js";
import{MATRIX_CHOICE_SHEET}from"./matrix-dialog.js";
import{MATRIX_HANDS_SHEET,drawMatrixHands}from"./matrix-hands.js";
import{MATRIX_RAIN_SHEET,drawMatrixRain}from"./matrix-rain.js";
import{openRedPillDialog}from"./matrix-red-pill-dialog.js";
import{stillOnPrint}from"./print-still.js";
export const MATRIX_TOKENS_SHEET="/shared/matrix-tokens.css";
export const MATRIX_EGG_SHEET="/shared/matrix-egg.css";
const SQUARE_CLASS="matrix-egg__square";
const MOUNT_ID="crossword-mount";
const START_ID="crossword-start";
const CARRIER="section.hero";
const CARRIER_NAME="matrix-egg.js: the hero's carrier";
const CHOICE_WORDS=Object.freeze({
title:"data-magic-matrix-choice-title",
message:"data-magic-matrix-choice-message",
red:"data-magic-matrix-choice-red",
blue:"data-magic-matrix-choice-blue",
});
const RED_PILL_WORDS=Object.freeze({
title:"data-magic-red-pill-dialog-title",
message:"data-magic-red-pill-dialog-message",
button:"data-magic-red-pill-dialog-button",
});
export const MATRIX_EGGS=Object.freeze({
matrix:Object.freeze({
address:"/matrix",
name:"data-magic-matrix-square-name",
sheets:Object.freeze([MATRIX_HANDS_SHEET,MATRIX_CHOICE_SHEET]),
square:(win)=>
Object.freeze({
drawing:drawMatrixHands(win.document),
settle:doNothing,
stop:doNothing,
}),
beside:(carrier)=>{
const words=choiceWordsOn(carrier);
return(win,mount)=>openMatrixChoice(win,words,mount);
},
}),
"red-pill":Object.freeze({
address:"/red-pill",
name:"data-magic-red-pill-square-name",
sheets:Object.freeze([MATRIX_RAIN_SHEET,MATRIX_CHOICE_SHEET]),
square:(win)=>drawMatrixRain(win),
beside:(carrier)=>{
const words=redPillWordsOn(carrier);
return(win,mount,end)=>openRedPillDialog(win,words,mount,end);
},
}),
});
export function openMatrixEgg(win,name,eggs=MATRIX_EGGS){
const doc=win.document;
const egg=eggs[name];
const mount=(doc.getElementById(MOUNT_ID));
const carrier=(mount.closest(CARRIER));
const squareName=wordOn(carrier,egg.name,CARRIER_NAME);
const openBeside=egg.beside(carrier);
for(const sheet of[MATRIX_TOKENS_SHEET,MATRIX_EGG_SHEET,...egg.sheets]){
linkSheet(doc,sheet);
}
const square=egg.square(win);
nameSquare(square.drawing,squareName);
const drawn=[...mount.childNodes];
mount.replaceChildren(square.drawing);
writeBackAddress(win,egg.address,square,mount);
return openBeside(win,mount,(focusOptions)=>{
mount.replaceChildren(...drawn);
(doc.getElementById(START_ID)).focus(
focusOptions,
);
});
}
function choiceWordsOn(carrier){
return Object.freeze({
title:wordOn(carrier,CHOICE_WORDS.title,CARRIER_NAME),
message:wordOn(carrier,CHOICE_WORDS.message,CARRIER_NAME),
red:wordOn(carrier,CHOICE_WORDS.red,CARRIER_NAME),
blue:wordOn(carrier,CHOICE_WORDS.blue,CARRIER_NAME),
});
}
function redPillWordsOn(carrier){
return Object.freeze({
title:wordOn(carrier,RED_PILL_WORDS.title,CARRIER_NAME),
message:wordOn(carrier,RED_PILL_WORDS.message,CARRIER_NAME),
button:wordOn(carrier,RED_PILL_WORDS.button,CARRIER_NAME),
});
}
function nameSquare(drawing,words){
drawing.classList.add(SQUARE_CLASS);
drawing.setAttribute("role","img");
drawing.setAttribute("aria-label",words);
}
function writeBackAddress(win,address,square,mount){
const arrivedAt=win.location.pathname;
win.history.replaceState(null,"",address);
const unstill=stillOnPrint(win,square.settle);
const{MutationObserver:Observer}=
(win);
const watch=new Observer(()=>{
if(square.drawing.isConnected){
return;
}
watch.disconnect();
unstill();
square.stop();
const{search,hash}=win.location;
win.history.replaceState(null,"",`${arrivedAt}${search}${hash}`);
});
watch.observe(mount,{childList:true});
}
function linkSheet(doc,href){
const link=doc.createElement("link");
link.rel="stylesheet";
link.href=href;
doc.head.append(link);
}
function doNothing(){}
import{wordOn}from"./dom-words.js";
import{giveWayToWords}from"./magic-word-drawing.js";
import{
CARRIER_NAME,
HINTED,
heldStill,
rewardShowing,
}from"./magic-word-eggs.js";
import{drawFigure}from"./magic-word-figure.js";
import{drawLettering}from"./magic-word-lettering.js";
import{
aboveGrid,
fitsLeftOf,
leftOfGrid,
scrollToFitAbove,
}from"./magic-word-place.js";
import{buildPaperCopy}from"./magic-word-paper.js";
import{REWARD_GRAPHIC}from"./magic-word-reward-graphic.js";
import{drawSentence}from"./magic-word-sentence.js";
import{stillOnPrint}from"./print-still.js";
const WORDS=Object.freeze({
says:"data-magic-says",
close:"data-magic-close",
sentence:"data-magic-sentence",
});
const TRAP_LINE=Object.freeze({says:WORDS.says,sentence:WORDS.sentence});
const CARRIER=Object.values(WORDS)
.map((name)=>`[${name}]`)
.join(", ");
const DIALOG_ID="magic-word";
const SAYS_ID="magic-word-says";
const PANEL_ID="magic-word-panel";
const VISUALLY_HIDDEN="visually-hidden";
const CLOSE_FACE="×";
function buildClose(doc,name){
const close=doc.createElement("button");
close.type="button";
close.className="magic-word__close";
close.setAttribute("aria-label",name);
close.textContent=CLOSE_FACE;
return close;
}
function buildLine(doc,says,sentence){
const line=doc.createElement("p");
line.id=SAYS_ID;
line.className="magic-word__says";
if(sentence!==undefined){
line.dataset.grid=sentence;
}
const lettering=drawLettering(doc,says);
if(lettering===null){
line.textContent=says;
return line;
}
const words=doc.createElement("span");
words.className=VISUALLY_HIDDEN;
words.textContent=says;
line.append(words,lettering);
return line;
}
export function buildMagicWordDialog(doc,line=TRAP_LINE){
const built=doc.getElementById(DIALOG_ID);
if(built){
return(built);
}
const carrier=(doc.querySelector(CARRIER));
const close=buildClose(doc,wordOn(carrier,WORDS.close,CARRIER_NAME));
const dialog=doc.createElement("dialog");
dialog.id=DIALOG_ID;
dialog.className="magic-word";
dialog.tabIndex=-1;
dialog.append(close);
if(line===null){
dialog.setAttribute("aria-labelledby",PANEL_ID);
}else{
dialog.setAttribute("aria-labelledby",SAYS_ID);
dialog.append(
buildLine(
doc,
wordOn(carrier,line.says,CARRIER_NAME),
line.sentence&&wordOn(carrier,line.sentence,CARRIER_NAME),
),
);
}
carrier.append(dialog);
return dialog;
}
export function sayTheMagicWord(win,back){
const doc=win.document;
const dialog=buildMagicWordDialog(doc);
const says=(
dialog.querySelector(".magic-word__says")
);
openBesideGrid(
win,
back,
dialog,
heldStill(drawSentence(doc,(says.dataset.grid))),
drawFigure(doc),
);
}
export function rewardTheMagicWord(win,back,drawing=REWARD_GRAPHIC){
openRewardFrame(win,back,rewardShowing(drawing));
}
export function rewardTheHintedWord(win,back){
openRewardFrame(win,back,HINTED);
}
function openRewardFrame(win,back,egg){
const dialog=buildMagicWordDialog(win.document,egg.line);
dialog.classList.add(egg.modifier);
const carrier=(dialog.parentElement);
const panel=egg.panel(win,carrier);
const close=openBesideGrid(
win,
back,
dialog,
egg.square(win,carrier),
panel,
);
egg.offer(panel,close);
}
function openBesideGrid(win,back,dialog,square,panelContent){
const doc=win.document;
const says=dialog.querySelector(".magic-word__says");
const close=(
dialog.querySelector(".magic-word__close")
);
const grid=(
doc.getElementById("crossword-mount")
);
const drawn=[...grid.childNodes];
grid.replaceChildren(square.drawing);
const panel=doc.createElement("div");
panel.className="magic-word__panel";
panel.append(panelContent);
if(says){
says.before(panel);
}else{
panel.id=PANEL_ID;
dialog.append(panel);
}
const paper=buildPaperCopy(doc,dialog);
for(const image of paper.querySelectorAll("img")){
giveWayToWords(doc,image);
}
grid.before(paper);
dialog.showModal();
dialog.focus();
let placedFor=viewportOf(win);
place(win,dialog,grid,placedFor);
const placeIt=()=>{
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
win.addEventListener("resize",placeIt);
const unstill=stillOnPrint(win,square.settle);
let focusOptions;
const closeBy=(event)=>{
focusOptions=
(event).detail>0
?{focusVisible:false}
:undefined;
dialog.close();
};
close.addEventListener("click",closeBy);
dialog.addEventListener(
"close",
()=>{
win.removeEventListener("resize",placeIt);
unstill();
square.stop();
panel.remove();
paper.remove();
grid.replaceChildren(...drawn);
back(focusOptions);
},
{once:true},
);
return closeBy;
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
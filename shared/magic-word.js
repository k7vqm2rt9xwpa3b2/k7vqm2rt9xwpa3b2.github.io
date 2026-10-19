import{wordOn}from"./dom-words.js";
import{drawFigure}from"./magic-word-figure.js";
import{drawLettering}from"./magic-word-lettering.js";
import{drawOldSite}from"./magic-word-old-site.js";
import{
aboveGrid,
fitsLeftOf,
leftOfGrid,
scrollToFitAbove,
}from"./magic-word-place.js";
import{PAPER_SRC,buildPaperCopy}from"./magic-word-paper.js";
import{REWARD_GRAPHIC}from"./magic-word-reward-graphic.js";
import{drawSentence}from"./magic-word-sentence.js";
import{stillOnPrint}from"./print-still.js";
const WORDS=Object.freeze({
says:"data-magic-says",
close:"data-magic-close",
sentence:"data-magic-sentence",
});
const TRAP_LINE=Object.freeze({says:WORDS.says,sentence:WORDS.sentence});
const REWARD_LINE=Object.freeze({says:"data-magic-reward-note"});
const REWARD_WORDS=Object.freeze({
graphicAlt:"data-magic-reward-graphic-alt",
oldSiteName:"data-magic-old-site-name",
oldSiteStatus:"data-magic-old-site-status",
});
const CARRIER=Object.values(WORDS)
.map((name)=>`[${name}]`)
.join(", ");
const DIALOG_ID="magic-word";
const SAYS_ID="magic-word-says";
const VISUALLY_HIDDEN="visually-hidden";
const CLOSE_FACE="×";
const STILL_ADDRESS="?still#still";
const REDUCED_MOTION="(prefers-reduced-motion: reduce)";
const CARRIER_NAME="magic-word.js: the pop-up's carrier";
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
const says=buildLine(
doc,
wordOn(carrier,line.says,CARRIER_NAME),
line.sentence&&wordOn(carrier,line.sentence,CARRIER_NAME),
);
const close=buildClose(doc,wordOn(carrier,WORDS.close,CARRIER_NAME));
const dialog=doc.createElement("dialog");
dialog.id=DIALOG_ID;
dialog.className="magic-word";
dialog.tabIndex=-1;
dialog.setAttribute("aria-labelledby",SAYS_ID);
dialog.append(close,says);
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
drawSentence(doc,(says.dataset.grid)),
drawFigure(doc),
);
}
export function rewardTheMagicWord(win,back,drawing=REWARD_GRAPHIC){
const doc=win.document;
const dialog=buildMagicWordDialog(doc,REWARD_LINE);
dialog.classList.add("magic-word--reward");
const carrier=(dialog.parentElement);
const alt=wordOn(carrier,REWARD_WORDS.graphicAlt,CARRIER_NAME);
const graphic=drawing
?buildDrawing(doc,drawing,alt,win.matchMedia(REDUCED_MOTION).matches)
:buildGraphicWords(doc,alt);
const oldSite=drawOldSite(
doc,
wordOn(carrier,REWARD_WORDS.oldSiteName,CARRIER_NAME),
wordOn(carrier,REWARD_WORDS.oldSiteStatus,CARRIER_NAME),
);
openBesideGrid(win,back,dialog,oldSite,graphic);
}
function buildGraphicWords(doc,alt){
const words=doc.createElement("p");
words.className="magic-word__graphic";
words.textContent=alt;
return words;
}
function buildDrawing(doc,drawing,alt,still){
const stillAddress=`${drawing.src}${STILL_ADDRESS}`;
const image=doc.createElement("img");
image.setAttribute("class","magic-word__graphic magic-word__drawing");
image.setAttribute("alt",alt);
image.setAttribute("width",String(drawing.width));
image.setAttribute("height",String(drawing.height));
image.setAttribute(PAPER_SRC,stillAddress);
giveWayToWords(doc,image);
image.setAttribute("src",still?stillAddress:drawing.src);
return image;
}
function giveWayToWords(doc,image){
image.addEventListener(
"error",
()=>image.replaceWith(buildGraphicWords(doc,image.alt)),
{once:true},
);
}
function openBesideGrid(win,back,dialog,square,panelContent){
const doc=win.document;
const says=(
dialog.querySelector(".magic-word__says")
);
const close=(
dialog.querySelector(".magic-word__close")
);
const grid=(
doc.getElementById("crossword-mount")
);
const drawn=[...grid.childNodes];
grid.replaceChildren(square);
const panel=doc.createElement("div");
panel.className="magic-word__panel";
panel.append(panelContent);
says.before(panel);
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
const unstill=stillOnPrint(win);
let focusOptions;
close.addEventListener("click",(event)=>{
focusOptions=event.detail>0?{focusVisible:false}:undefined;
dialog.close();
});
dialog.addEventListener(
"close",
()=>{
win.removeEventListener("resize",placeIt);
unstill();
panel.remove();
paper.remove();
grid.replaceChildren(...drawn);
back(focusOptions);
},
{once:true},
);
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
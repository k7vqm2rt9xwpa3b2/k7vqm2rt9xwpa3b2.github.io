import{buildMatrixDialog,openBesideSquare}from"./matrix-dialog.js";
export const RED_PILL_ADDRESS="/red-pill";
export const BLUE_PILL_ADDRESS="/blue-pill";
const HOME_LINK="a.masthead__name";
export function buildMatrixChoice(win,words){
const doc=win.document;
return buildMatrixDialog(doc,words,[
pillLink(doc,"red",RED_PILL_ADDRESS,words.red),
" ",
pillLink(doc,"blue",BLUE_PILL_ADDRESS,words.blue),
]);
}
export function openMatrixChoice(win,words,square){
const dialog=buildMatrixChoice(win,words);
goHomeOnEscape(win,dialog);
openBesideSquare(win,dialog,square);
return dialog;
}
function pillLink(doc,pill,address,label){
const link=doc.createElement("a");
link.className=`matrix-choice__pill matrix-choice__pill--${pill}`;
link.href=address;
const words=doc.createElement("span");
words.className="matrix-choice__label";
words.textContent=label;
link.append(words);
return link;
}
function goHomeOnEscape(win,dialog){
let leaving=false;
const goHome=()=>{
if(leaving){
return;
}
leaving=true;
win.location.assign(
(
(
win.document.querySelector(HOME_LINK)
).getAttribute("href")
),
);
};
dialog.addEventListener("keydown",(event)=>{
if(event.key==="Escape"){
event.preventDefault();
goHome();
}
});
dialog.addEventListener("cancel",(event)=>{
event.preventDefault();
goHome();
});
dialog.addEventListener("close",goHome);
win.addEventListener("pageshow",(event)=>{
if((event).persisted){
leaving=false;
}
});
}
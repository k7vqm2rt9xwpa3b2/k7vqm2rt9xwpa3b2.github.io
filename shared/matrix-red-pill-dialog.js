import{buildMatrixDialog,openBesideSquare}from"./matrix-dialog.js";
export function buildRedPillDialog(win,words){
const doc=win.document;
const button=doc.createElement("button");
button.type="button";
button.className="matrix-choice__pill matrix-choice__pill--green";
button.textContent=words.button;
return buildMatrixDialog(doc,words,[button]);
}
export function openRedPillDialog(win,words,square,end){
const dialog=buildRedPillDialog(win,words);
const button=(
dialog.querySelector("button")
);
const takeDown=openBesideSquare(win,dialog,square);
let focusOptions;
button.addEventListener("click",(event)=>{
focusOptions=event.detail>0?{focusVisible:false}:undefined;
dialog.close();
});
dialog.addEventListener(
"close",
()=>{
takeDown();
end(focusOptions);
},
{once:true},
);
return dialog;
}
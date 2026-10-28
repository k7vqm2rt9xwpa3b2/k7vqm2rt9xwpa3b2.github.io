import{wordOn}from"./dom-words.js";
import{buildPanelGraphic}from"./magic-word-drawing.js";
import{drawHintedCascade}from"./magic-word-hinted-cascade.js";
import{drawHintedDialog,offerClose}from"./magic-word-hinted-dialog.js";
import{drawOldSite}from"./magic-word-old-site.js";
export const CARRIER_NAME="magic-word.js: the pop-up's carrier";
export function rewardShowing(drawing){
return Object.freeze({
modifier:"magic-word--reward",
line:Object.freeze({says:"data-magic-reward-note"}),
panel:(win,carrier)=>
buildPanelGraphic(
win,
drawing,
wordOn(carrier,"data-magic-reward-graphic-alt",CARRIER_NAME),
),
square:(win,carrier)=>
heldStill(
drawOldSite(
win.document,
wordOn(carrier,"data-magic-old-site-name",CARRIER_NAME),
wordOn(carrier,"data-magic-old-site-status",CARRIER_NAME),
),
),
offer:doNothing,
});
}
const HINTED_DIALOG=Object.freeze({
title:"data-magic-hinted-dialog-title",
message:"data-magic-hinted-dialog-message",
button:"data-magic-hinted-dialog-button",
});
export const HINTED=Object.freeze({
modifier:"magic-word--hinted",
line:null,
panel:(win,carrier)=>{
const read=(name)=>
wordOn(carrier,name,CARRIER_NAME);
return drawHintedDialog(win.document,{
title:read(HINTED_DIALOG.title),
message:read(HINTED_DIALOG.message),
button:read(HINTED_DIALOG.button),
});
},
square:(win,carrier)=>
drawHintedCascade(
win,
wordOn(carrier,"data-magic-hinted-screen",CARRIER_NAME),
),
offer:(content,close)=>
offerClose((content),close),
});
export function heldStill(drawing){
return Object.freeze({
drawing:(drawing),
settle:doNothing,
stop:doNothing,
});
}
function doNothing(){}
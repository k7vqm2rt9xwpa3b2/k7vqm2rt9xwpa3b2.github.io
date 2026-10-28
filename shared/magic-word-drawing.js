import{PAPER_SRC}from"./magic-word-paper.js";
const STILL_ADDRESS="?still#still";
const REDUCED_MOTION="(prefers-reduced-motion: reduce)";
export function buildPanelGraphic(win,drawing,alt){
const doc=win.document;
return drawing
?buildDrawing(doc,drawing,alt,readerAsksForStill(win))
:buildGraphicWords(doc,alt);
}
export function readerAsksForStill(win){
return win.matchMedia(REDUCED_MOTION).matches;
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
export function giveWayToWords(doc,image){
image.addEventListener(
"error",
()=>image.replaceWith(buildGraphicWords(doc,image.alt)),
{once:true},
);
}
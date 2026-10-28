import{entryId,entryIdsIn,squareKey}from"./crossword-anchor.js";
import{
readoutLines,
spotlightLines,
writeReadout,
}from"./crossword-readout.js";
import{elementFor}from"./crossword-settings.js";
import{
SPOTLIGHT_CLASSES,
hideSpotlight,
showSpotlight,
spotlightClued,
spotlightHeld,
}from"./crossword-spotlight.js";
export const THEME_LIT="is-theme-lit";
const SELECTION_CLASSES=[
"is-selected",
"is-sibling",
"is-locked",
...SPOTLIGHT_CLASSES,
THEME_LIT,
];
const LOCKED_RECT=".cw-hit:not(.cw-hit-anchor).is-locked";
const PRESSED_RECT=
'.cw-hit[aria-pressed="true"], .cw-circle-hit[aria-pressed="true"]';
export function clearSelection(doc){
const selector=SELECTION_CLASSES.map((name)=>"."+name).join(", ");
doc.querySelectorAll(selector).forEach(function(element){
SELECTION_CLASSES.forEach(function(name){
element.classList.remove(name);
});
});
doc.querySelectorAll(PRESSED_RECT).forEach(function(rect){
rect.setAttribute("aria-pressed","false");
});
pressedThemeButton(doc)?.setAttribute("aria-pressed","false");
}
function pressedThemeButton(doc){
const button=elementFor(doc,"theme");
return button!==null&&button.getAttribute("aria-pressed")==="true"
?button
:null;
}
function themeShowing(doc){
return pressedThemeButton(doc)!==null;
}
function cellsForEntry(doc,entryKey){
const cells=doc.querySelectorAll(".cw-cell");
const covering=[];
cells.forEach(function(cell){
const ids=entryIdsIn(cell.getAttribute("data-entries"));
if(ids.indexOf(entryKey)!==-1){
covering.push(cell);
}
});
return covering;
}
export function selectedEntryKey(doc){
const rect=doc.querySelector(".cw-hit:not(.cw-hit-anchor).is-selected");
return rect?rect.dataset.entry:null;
}
export function lockedEntryKey(doc){
const rect=doc.querySelector(LOCKED_RECT);
return rect?rect.dataset.entry:null;
}
export function lockEntry(doc,data,entryKey){
if(selectedEntryKey(doc)!==entryKey){
if(!selectEntry(doc,data,entryKey)){
return null;
}
}
markEntry(doc,entryKey,"is-locked");
const rect=(doc.querySelector(LOCKED_RECT));
rect.setAttribute("aria-pressed","true");
return entryKey;
}
export function gridHeld(doc){
return(
lockedEntryKey(doc)!==null||spotlightHeld(doc)||themeShowing(doc)
);
}
export function deselect(doc){
const wasShowing=
selectedEntryKey(doc)!==null||spotlightClued(doc)||themeShowing(doc);
clearSelection(doc);
if(wasShowing){
writeReadout(doc,[]);
}
}
export function lightSpotlight(doc,svg,held,data){
const lines=spotlightLines(data);
if(lines.length===0){
deselect(doc);
showSpotlight(svg,held,false);
return;
}
if(spotlightClued(doc)){
showSpotlight(svg,held,true);
return;
}
clearSelection(doc);
showSpotlight(svg,held,true);
writeReadout(doc,lines);
}
export function dimSpotlight(doc,svg){
if(spotlightHeld(doc)){
return;
}
const wasClued=spotlightClued(doc);
hideSpotlight(svg);
if(wasClued){
writeReadout(doc,[]);
}
}
export function squareOf(element){
return squareKey(
element.getAttribute("data-row"),
element.getAttribute("data-col"),
);
}
function markEntry(doc,entryKey,className){
markSquares(doc,entryKey,className);
doc.querySelectorAll(".cw-hit:not(.cw-hit-anchor)").forEach(function(hit){
if(hit.dataset.entry===entryKey){
hit.classList.add(className);
}
});
}
function markSquares(doc,entryKey,className,spared=new Set()){
const cells=cellsForEntry(doc,entryKey).filter(
(cell)=>!spared.has(squareOf(cell)),
);
cells.forEach(function(cell){
cell.classList.add(className);
});
const squares=new Set(cells.map(squareOf));
const mount=(elementFor(doc,"mount"));
mount.querySelectorAll(".cw-number, .cw-circle").forEach(function(mark){
if(squares.has(squareOf(mark))){
mark.classList.add(className);
}
});
}
export function markAsSelected(doc,data,entry,spared){
markSquares(doc,entryId(entry),"is-selected");
themeSiblings(entry,data).forEach(function(sibling){
markSquares(doc,entryId(sibling),"is-sibling",spared);
});
}
function themeSiblings(entry,data){
if(!entry.theme){
return[];
}
return data.entries.filter(function(candidate){
return candidate.theme===entry.theme&&candidate!==entry;
});
}
export function selectEntry(doc,data,entryKey){
const entry=data.entries.find(function(candidate){
return entryId(candidate)===entryKey;
});
if(!entry){
return null;
}
const lines=readoutLines(entry,data);
clearSelection(doc);
markEntry(doc,entryKey,"is-selected");
themeSiblings(entry,data).forEach(function(sibling){
markEntry(doc,entryId(sibling),"is-sibling");
});
writeReadout(doc,lines);
return entry;
}
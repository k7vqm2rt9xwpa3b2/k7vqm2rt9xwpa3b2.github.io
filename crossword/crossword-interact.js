import{entryId}from"./crossword-anchor.js";
import{elementFor,settingsFor}from"./crossword-settings.js";
import{SPOTLIGHT_CLASSES,spotlightHeld}from"./crossword-spotlight.js";
const SELECTION_CLASSES=[
"is-selected",
"is-sibling",
"is-locked",
...SPOTLIGHT_CLASSES,
];
function clearSelection(doc){
const selector=SELECTION_CLASSES.map((name)=>"."+name).join(", ");
doc.querySelectorAll(selector).forEach(function(element){
SELECTION_CLASSES.forEach(function(name){
element.classList.remove(name);
});
});
}
function cellsForEntry(doc,entryKey){
const cells=doc.querySelectorAll(".cw-cell");
const covering=[];
cells.forEach(function(cell){
const ids=(cell.getAttribute("data-entries")||"").split(" ");
if(ids.indexOf(entryKey)!==-1){
covering.push(cell);
}
});
return covering;
}
function restingText(readout){
return readout.dataset.resting??"";
}
export function themeText(key,data){
const theme=data.themes[key];
if(
!theme||
typeof theme.label!=="string"||
typeof theme.summary!=="string"
){
throw new Error("crossword-interact.js: unknown entry theme "+key);
}
return theme.label+": "+theme.summary;
}
function readoutLines(entry,data){
const lines=[];
if(entry.theme){
lines.push({
className:"crossword__readout-summary",
text:themeText(entry.theme,data),
});
}
if(entry.clue){
lines.push({className:"crossword__readout-clue",text:entry.clue});
}
return lines;
}
function writeReadout(doc,lines){
const readout=elementFor(doc,"readout");
if(!readout){
return;
}
const resting=restingText(readout);
if(lines.length===0){
readout.replaceChildren(doc.createTextNode(resting));
return;
}
readout.replaceChildren(
...lines.map(function(line){
const span=doc.createElement("span");
span.className=line.className;
span.textContent=line.text;
return span;
}),
);
}
export function selectedEntryKey(doc){
const rect=doc.querySelector(".cw-hit:not(.cw-hit-anchor).is-selected");
return rect?rect.dataset.entry:null;
}
export function lockedEntryKey(doc){
const rect=doc.querySelector(".cw-hit:not(.cw-hit-anchor).is-locked");
return rect?rect.dataset.entry:null;
}
export function lockEntry(doc,data,entryKey){
if(selectedEntryKey(doc)!==entryKey){
if(!selectEntry(doc,data,entryKey)){
return null;
}
}
markEntry(doc,entryKey,"is-locked");
return entryKey;
}
export function gridHeld(doc){
return lockedEntryKey(doc)!==null||spotlightHeld(doc);
}
export function deselect(doc){
const wasSelected=selectedEntryKey(doc)!==null;
clearSelection(doc);
if(wasSelected){
writeReadout(doc,[]);
}
}
export function resetReadout(doc){
writeReadout(doc,[]);
}
function squareOf(element){
return(
element.getAttribute("data-row")+","+element.getAttribute("data-col")
);
}
function markEntry(doc,entryKey,className){
const cells=cellsForEntry(doc,entryKey);
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
doc.querySelectorAll(".cw-hit:not(.cw-hit-anchor)").forEach(function(hit){
if(hit.dataset.entry===entryKey){
hit.classList.add(className);
}
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
export function wireDismissal(doc){
const mount=elementFor(doc,"mount");
const figure=mount?mount.closest("figure"):null;
if(!figure){
console.warn(
"crossword-interact.js: no <figure> around #"+
settingsFor(doc).ids.mount+
" -- selection cannot be dismissed",
);
return;
}
figure.addEventListener("pointerleave",function(){
if(gridHeld(doc)){
return;
}
deselect(doc);
});
figure.addEventListener("focusout",function(event){
if(
figure.contains((event.relatedTarget))||
gridHeld(doc)
){
return;
}
deselect(doc);
});
doc.addEventListener("click",function(event){
if(figure.contains(event.target)){
return;
}
deselect(doc);
});
doc.addEventListener("keydown",function(event){
if(event.key!=="Escape"){
return;
}
deselect(doc);
});
}
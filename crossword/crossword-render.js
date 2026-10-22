import{
computeAnchorCells,
entryCellsFromMap,
entryId,
entryIdsValue,
squareKey,
}from"./crossword-anchor.js";
import{wireCircleHit,wireHit}from"./crossword-hit.js";
import{CELL,numberPlace,ringPath}from"./crossword-ring.js";
import{elementFor,settingsFor}from"./crossword-settings.js";
const SVG_NS="http://www.w3.org/2000/svg";
const LETTER_DROP=0.5;
const FRAME_STROKE=0.3;
const EDGE_INSET=FRAME_STROKE/2;
const BLOCK=".";
const STEPS=new Map([
["across",{row:0,col:1}],
["down",{row:1,col:0}],
]);
function svgEl(doc,name,attributes){
const element=doc.createElementNS(SVG_NS,name);
Object.keys(attributes).forEach(function(key){
element.setAttribute(key,String(attributes[key]));
});
return element;
}
function renderGridCell(doc,svg,rows,row,col,pass){
const letter=rows[row][col];
const x=col*CELL;
const y=row*CELL;
if(letter===BLOCK){
return;
}
const key=squareKey(row,col);
const coveringEntries=pass.cellEntries.get(key)||[];
svg.appendChild(
svgEl(doc,"rect",{
class:"cw-cell",
"data-row":row,
"data-col":col,
"data-entries":entryIdsValue(coveringEntries),
x:x,
y:y,
width:CELL,
height:CELL,
}),
);
const text=svgEl(doc,"text",{
class:pass.circledKeys.has(key)
?"cw-letter cw-letter--circled"
:"cw-letter",
"data-row":row,
"data-col":col,
x:x+CELL/2,
y:y+CELL/2+LETTER_DROP,
});
text.textContent=letter;
text.style.setProperty("--i",pass.letterIndex.count++);
svg.appendChild(text);
}
function renderBlocks(doc,svg,data){
for(let row=0;row<data.height;row++){
for(let col=0;col<data.width;col++){
if(data.rows[row][col]!==BLOCK){
continue;
}
svg.appendChild(
svgEl(doc,"rect",{
class:"cw-block",
x:col*CELL,
y:row*CELL,
width:CELL,
height:CELL,
}),
);
}
}
}
function renderFrame(doc,svg,data){
svg.appendChild(
svgEl(doc,"rect",{
class:"cw-frame",
x:0,
y:0,
width:data.width*CELL,
height:data.height*CELL,
}),
);
}
function renderNumbers(doc,svg,numbers){
numbers.forEach(function({row,col,number}){
const text=svgEl(doc,"text",{
class:"cw-number",
"data-row":row,
"data-col":col,
...numberPlace(col*CELL,row*CELL),
});
text.textContent=String(number);
svg.appendChild(text);
});
}
function stepFor(direction){
const step=STEPS.get(direction);
if(!step){
throw new Error(
"crossword-render.js: unknown entry direction "+direction,
);
}
return step;
}
function buildCellEntryMap(entries){
const map=new Map();
entries.forEach(function(entry){
const step=stepFor(entry.direction);
const id=entryId(entry);
for(let offset=0;offset<entry.answer.length;offset++){
const row=entry.row+offset*step.row;
const col=entry.col+offset*step.col;
const key=squareKey(row,col);
const covering=map.get(key)||[];
covering.push(id);
map.set(key,covering);
}
});
return map;
}
function numberDigits(numbers){
return new Map(
numbers.map(function({row,col,number}){
return[squareKey(row,col),String(number).length];
}),
);
}
function renderCircles(doc,svg,data){
const digits=numberDigits(data.numbers);
(data.circled||[]).forEach(function(cell){
const[row,col]=cell;
const width=digits.get(squareKey(row,col))||0;
svg.appendChild(
svgEl(doc,"path",{
class:"cw-circle",
"data-row":row,
"data-col":col,
d:ringPath(col*CELL,row*CELL,CELL,width),
}),
);
});
}
function renderHitTargets(doc,svg,entries,anchorCells,data){
entries.forEach(function(entry){
const step=stepFor(entry.direction);
const length=entry.answer.length;
const width=step.col?CELL*length:CELL;
const height=step.row?CELL*length:CELL;
const key=entryId(entry);
const hit=svgEl(doc,"rect",{
class:"cw-hit",
"data-entry":key,
x:entry.col*CELL,
y:entry.row*CELL,
width:width,
height:height,
tabindex:0,
role:"button",
"aria-label":entry.clue||entry.answer,
"aria-pressed":"false",
});
wireHit(doc,hit,key,data);
svg.appendChild(hit);
});
entries.forEach(function(entry){
const key=entryId(entry);
const cellKey=anchorCells.get(key);
if(!cellKey){
throw new Error(
"crossword-render.js: no anchor cell computed for "+key,
);
}
const[row,col]=cellKey.split(",").map(Number);
const anchor=svgEl(doc,"rect",{
class:"cw-hit cw-hit-anchor",
"data-entry":key,
x:col*CELL,
y:row*CELL,
width:CELL,
height:CELL,
"aria-hidden":"true",
});
wireHit(doc,anchor,key,data);
svg.appendChild(anchor);
});
}
function renderCircleHits(doc,svg,data){
const clue=data.circled_clue;
const cells=data.circled||[];
const[first]=[...cells].sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
const stop={tabindex:0,role:"button","aria-pressed":"false"};
cells.forEach(function(cell){
const[row,col]=cell;
const square=svgEl(doc,"rect",{
class:"cw-circle-hit",
x:col*CELL,
y:row*CELL,
width:CELL,
height:CELL,
...(clue&&cell===first
?{...stop,"aria-label":clue}
:{"aria-hidden":"true"}),
});
wireCircleHit(doc,square,svg,clue);
svg.appendChild(square);
});
}
export function renderGrid(doc,data){
const mount=elementFor(doc,"mount");
if(!mount){
const id=settingsFor(doc).ids.mount;
console.warn("crossword-render.js: could not render -- missing #"+id);
return null;
}
const svg=svgEl(doc,"svg",{
id:"crossword-grid",
viewBox:[
-EDGE_INSET,
-EDGE_INSET,
data.width*CELL+FRAME_STROKE,
data.height*CELL+FRAME_STROKE,
].join(" "),
});
const cellEntryMap=buildCellEntryMap(data.entries);
const circledKeys=new Set(
(data.circled||[]).map(([row,col])=>squareKey(row,col)),
);
const pass={
cellEntries:cellEntryMap,
circledKeys:circledKeys,
letterIndex:{count:0},
};
renderBlocks(doc,svg,data);
for(let row=0;row<data.height;row++){
for(let col=0;col<data.width;col++){
renderGridCell(doc,svg,data.rows,row,col,pass);
}
}
renderCircles(doc,svg,data);
renderNumbers(doc,svg,data.numbers);
renderFrame(doc,svg,data);
const pressable=new Map(
[...cellEntryMap].filter(([key])=>!circledKeys.has(key)),
);
const anchorCells=computeAnchorCells(
data.entries,
entryCellsFromMap(pressable),
pressable,
);
renderHitTargets(doc,svg,data.entries,anchorCells,data);
renderCircleHits(doc,svg,data);
mount.style.setProperty("--grid-columns",String(data.width));
mount.textContent="";
mount.appendChild(svg);
return data;
}
import{
COLUMNS,
DARK,
LEAD,
ROWS,
fallDrop,
shadeAt,
spawnDrop,
stepSeconds,
}from"./matrix-rain-columns.js";
import{
GLYPHS,
GLYPH_HEIGHT,
GLYPH_WIDTH,
drawGlyphs,
glyphAddress,
}from"./matrix-rain-glyphs.js";
import{readerAsksForStill}from"./magic-word-drawing.js";
import{SQUARE}from"./not-found-screen.js";
import{svgElement}from"./svg.js";
export const MATRIX_RAIN_SHEET="/shared/matrix-rain.css";
const SWAPS_PER_SECOND=0.6;
const CELL_WIDTH=SQUARE/COLUMNS;
const CELL_HEIGHT=SQUARE/ROWS;
const HUNDREDTHS=100;
const GLYPH_CLASS="matrix-rain__glyph";
export function drawMatrixRain(win,options={}){
const{
requestFrame=(callback)=>win.requestAnimationFrame(callback),
cancelFrame=(id)=>win.cancelAnimationFrame(id),
now=()=>win.performance.now(),
random=Math.random,
}=options;
const doc=win.document;
const svg=(
svgElement(doc,"svg",{
class:"matrix-rain",
viewBox:`0 0 ${SQUARE} ${SQUARE}`,
})
);
const cells=drawCells(doc);
svg.append(
drawGlyphs(doc),
svgElement(doc,"rect",{
class:"matrix-rain__field",
width:SQUARE,
height:SQUARE,
}),
cells,
);
const fall=rainOn([...cells.children],random);
if(readerAsksForStill(win)){
return Object.freeze({drawing:svg,settle:holdStill,stop:holdStill});
}
const frames={requestFrame,cancelFrame,now};
return Object.freeze({drawing:svg,...play(frames,fall)});
}
function holdStill(){}
function rounded(value){
return Math.round(value*HUNDREDTHS)/HUNDREDTHS;
}
function drawCells(doc){
const group=svgElement(doc,"g",{class:"matrix-rain__cells"});
for(let column=0;column<COLUMNS;column+=1){
for(let row=0;row<ROWS;row+=1){
group.append(
svgElement(doc,"use",{
href:glyphAddress(0),
x:rounded(column*CELL_WIDTH+(CELL_WIDTH-GLYPH_WIDTH)/2),
y:rounded(row*CELL_HEIGHT+(CELL_HEIGHT-GLYPH_HEIGHT)/2),
}),
);
}
}
return group;
}
function pickGlyph(random){
return Math.floor(random()*GLYPHS.length);
}
function shadeClass(shade){
if(shade===DARK){
return`${GLYPH_CLASS} ${GLYPH_CLASS}--dark`;
}
if(shade===LEAD){
return`${GLYPH_CLASS} ${GLYPH_CLASS}--lead`;
}
return`${GLYPH_CLASS} ${GLYPH_CLASS}--fade-${shade}`;
}
function rainOn(cells,random){
let drops=Array.from({length:COLUMNS},()=>spawnDrop(random,true));
const glyphs=cells.map(()=>pickGlyph(random));
const marked=cells.map(()=>"");
const shown=cells.map(()=>-1);
const mark=()=>{
cells.forEach((cell,index)=>{
const shade=shadeAt(drops[Math.floor(index/ROWS)],index%ROWS);
const name=shadeClass(shade);
if(name!==marked[index]){
cell.setAttribute("class",name);
marked[index]=name;
}
if(glyphs[index]!==shown[index]){
cell.setAttribute("href",glyphAddress(glyphs[index]));
shown[index]=glyphs[index];
}
});
};
mark();
return(seconds)=>{
drops=drops.map((drop,column)=>{
const next=fallDrop(drop,seconds,random);
const lead=Math.floor(next.head);
if(lead!==Math.floor(drop.head)&&lead>=0&&lead<ROWS){
glyphs[column*ROWS+lead]=pickGlyph(random);
}
return next;
});
swapSome(glyphs,marked,seconds,random);
mark();
};
}
function swapSome(glyphs,marked,seconds,random){
const chance=SWAPS_PER_SECOND*seconds;
marked.forEach((name,index)=>{
if(!name.endsWith("--dark")&&random()<chance){
glyphs[index]=pickGlyph(random);
}
});
}
function play({requestFrame,cancelFrame,now},fall){
let then=now();
let frame=null;
let playing=true;
const step=()=>{
if(!playing){
return;
}
const at=now();
fall(stepSeconds(then,at));
then=at;
frame=requestFrame(step);
};
frame=requestFrame(step);
const stop=()=>{
playing=false;
if(frame!==null){
cancelFrame(frame);
frame=null;
}
};
return{settle:stop,stop};
}
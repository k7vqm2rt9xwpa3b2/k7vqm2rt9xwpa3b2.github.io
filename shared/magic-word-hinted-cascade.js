import{readerAsksForStill}from"./magic-word-drawing.js";
import{
CARD_HEIGHT,
CARD_WIDTH,
CASCADE_WINDOW,
PILE_COUNT,
PILE_TOP,
RANK_COUNT,
cascadeStamps,
pileLeft,
}from"./magic-word-hinted-flight.js";
import{svgElement}from"./svg.js";
export const STAMP_LIMIT=1200;
export const TICK_MS=12;
export const RANK_GLYPHS=Object.freeze([
"A",
"2",
"3",
"4",
"5",
"6",
"7",
"8",
"9",
"10",
"J",
"Q",
"K",
]);
export const SUIT_GLYPHS=Object.freeze(["♠","♥","♦","♣"]);
const RED_SUITS=new Set([1,2]);
const CORNER_X=6;
const RANK_BASELINE=18;
const SUIT_BASELINE=34;
const PIP_CENTER_Y=56;
function faceId(rank,suit){
return`hinted-cascade-face-${rank}-${suit}`;
}
function faceAddress(rank,suit){
return`#${faceId(rank,suit)}`;
}
export function drawHintedCascade(
win,
words,
stamps=cascadeStamps(STAMP_LIMIT),
){
const doc=win.document;
const svg=(
svgElement(doc,"svg",{
class:"hinted-cascade",
viewBox:`0 0 ${CASCADE_WINDOW} ${CASCADE_WINDOW}`,
role:"img",
"aria-label":words,
})
);
const table=svgElement(doc,"rect",{
class:"hinted-cascade__table",
width:CASCADE_WINDOW,
height:CASCADE_WINDOW,
});
const piles=drawPiles(doc);
const trail=svgElement(doc,"g",{class:"hinted-cascade__trail"});
const frame=svgElement(doc,"rect",{
class:"hinted-cascade__frame",
x:0,
y:0,
width:CASCADE_WINDOW,
height:CASCADE_WINDOW,
});
svg.append(drawFaces(doc),table,piles,trail,frame);
const showUpTo=stamper(doc,piles,trail,stamps);
if(readerAsksForStill(win)){
showUpTo(stamps.length);
return Object.freeze({drawing:svg,settle:holdStill,stop:holdStill});
}
return Object.freeze({drawing:svg,...play(win,showUpTo,stamps.length)});
}
function holdStill(){}
function drawFaces(doc){
const defs=svgElement(doc,"defs");
for(let rank=0;rank<RANK_COUNT;rank+=1){
for(let suit=0;suit<PILE_COUNT;suit+=1){
defs.append(drawFace(doc,rank,suit));
}
}
return defs;
}
function drawFace(doc,rank,suit){
const red=RED_SUITS.has(suit)?" hinted-cascade__card--red":"";
const face=svgElement(doc,"g",{
id:faceId(rank,suit),
class:`hinted-cascade__card${red}`,
});
const card=svgElement(doc,"rect",{
class:"hinted-cascade__face",
width:CARD_WIDTH,
height:CARD_HEIGHT,
rx:4,
});
const glyphs=[
["hinted-cascade__rank",CORNER_X,RANK_BASELINE,RANK_GLYPHS[rank]],
["hinted-cascade__suit",CORNER_X,SUIT_BASELINE,SUIT_GLYPHS[suit]],
["hinted-cascade__pip",CARD_WIDTH/2,PIP_CENTER_Y,SUIT_GLYPHS[suit]],
].map(([name,x,y,glyph])=>{
const text=svgElement(doc,"text",{class:name,x,y});
text.textContent=(glyph);
return text;
});
glyphs[2].setAttribute("text-anchor","middle");
glyphs[2].setAttribute("dominant-baseline","central");
face.append(card,...glyphs);
return face;
}
function drawPiles(doc){
const piles=svgElement(doc,"g",{class:"hinted-cascade__piles"});
for(let pile=0;pile<PILE_COUNT;pile+=1){
const at={x:pileLeft(pile),y:PILE_TOP};
const group=svgElement(doc,"g",{class:"hinted-cascade__pile"});
group.append(
svgElement(doc,"rect",{
class:"hinted-cascade__slot",
...at,
width:CARD_WIDTH,
height:CARD_HEIGHT,
rx:4,
}),
svgElement(doc,"use",{
class:"hinted-cascade__top",
href:faceAddress(RANK_COUNT-1,pile),
...at,
}),
);
piles.append(group);
}
return piles;
}
function stamper(doc,piles,trail,stamps){
const tops=[...piles.querySelectorAll(".hinted-cascade__top")];
let shown=0;
return(count)=>{
for(;shown<count;shown+=1){
const{rank,suit,x,y,launch}=stamps[shown];
if(launch){
if(rank===0){
tops[suit].remove();
}else{
tops[suit].setAttribute("href",faceAddress(rank-1,suit));
}
}
trail.append(
svgElement(doc,"use",{href:faceAddress(rank,suit),x,y}),
);
}
};
}
function play(win,showUpTo,total){
let start=null;
let frame=null;
const step=(now)=>{
start??=now;
const due=Math.min(total,Math.floor((now-start)/TICK_MS)+1);
showUpTo(due);
frame=due<total?win.requestAnimationFrame(step):null;
};
frame=win.requestAnimationFrame(step);
const stop=()=>{
if(frame!==null){
win.cancelAnimationFrame(frame);
frame=null;
}
};
const settle=()=>{
stop();
showUpTo(total);
};
return{settle,stop};
}
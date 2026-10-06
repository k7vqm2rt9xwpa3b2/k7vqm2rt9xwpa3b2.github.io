import{dotCapacity,placeDots}from"./now-pager-dots.js";
function pixelsOf(value){
const pixels=parseFloat(value);
return Number.isFinite(pixels)?pixels:0;
}
function buildArrow(doc,direction,glyph,label){
const button=doc.createElement("button");
button.type="button";
button.className=`now-pager__arrow now-pager__arrow--${direction}`;
button.setAttribute("aria-label",label);
const mark=doc.createElement("span");
mark.className="now-pager__glyph";
mark.textContent=glyph;
button.append(mark);
button.addEventListener("click",(event)=>{
if(button.getAttribute("aria-disabled")==="true"){
event.preventDefault();
event.stopImmediatePropagation();
}
});
return button;
}
function buildCount(doc){
const count=doc.createElement("span");
count.className="now-pager__count";
count.append(doc.createElement("b"),doc.createTextNode(""));
return count;
}
export function buildLiveRegion(doc){
const region=doc.createElement("p");
region.className="visually-hidden";
region.setAttribute("aria-live","polite");
return region;
}
export function buildControlRow(doc,labels){
const controls=doc.createElement("div");
controls.className="now-pager__controls";
const prev=buildArrow(doc,"prev","‹",labels.previous);
const next=buildArrow(doc,"next","›",labels.next);
const strip=doc.createElement("span");
strip.className="now-pager__dots";
strip.setAttribute("aria-hidden","true");
const count=buildCount(doc);
controls.append(prev,strip,next,count);
return{controls,prev,next,strip,count};
}
function dotUnit(view){
const{doc,strip,window}=view;
const probe=doc.createElement("i");
probe.className="now-pager__dot";
strip.replaceChildren(probe);
return(
probe.getBoundingClientRect().width+
pixelsOf(window.getComputedStyle(strip).columnGap)
);
}
function spareWidth(view){
const{controls,strip,window}=view;
const gap=pixelsOf(window.getComputedStyle(controls).columnGap);
const siblings=[...controls.children].filter(
(child)=>child!==strip&&!child.hidden,
);
const taken=siblings.reduce(
(total,child)=>total+child.getBoundingClientRect().width,
0,
);
return controls.clientWidth-taken-gap*siblings.length;
}
function renderDots(view,at,total,shown){
const marks=placeDots(at,total,shown).map((dot)=>{
const mark=view.doc.createElement("i");
mark.className="now-pager__dot";
if(dot.cap){
mark.classList.add("now-pager__dot--cap");
}
if(dot.active){
mark.classList.add("is-active");
}
return mark;
});
view.strip.replaceChildren(...marks);
return marks.length;
}
function writeCount(view,at,total){
const denominator=String(total);
const[numerator,tail]=view.count.childNodes;
numerator.textContent=String(at+1);
numerator.style.minWidth=`${denominator.length}ch`;
tail.textContent=` / ${denominator}`;
}
function fitStrip(view,at,total){
let shown=dotCapacity(spareWidth(view),dotUnit(view),total);
renderDots(view,at,total,shown);
while(view.strip.scrollWidth>view.strip.clientWidth&&shown>1){
shown-=1;
renderDots(view,at,total,shown);
}
return shown;
}
function fitDots(view,at,total){
writeCount(view,at,total);
view.count.hidden=true;
if(fitStrip(view,at,total)>=total){
return;
}
view.count.hidden=false;
fitStrip(view,at,total);
}
function markArrow(button,dead){
if(dead){
button.setAttribute("aria-disabled","true");
return;
}
button.removeAttribute("aria-disabled");
}
export function renderControlRow(view,at,total){
fitDots(view,at,total);
markArrow(view.prev,at===0);
markArrow(view.next,at===total-1);
}
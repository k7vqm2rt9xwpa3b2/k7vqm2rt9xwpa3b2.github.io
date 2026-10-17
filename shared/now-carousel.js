import{buildControlRow,renderControlRow}from"./now-pager-controls.js";
const CAROUSEL_CLASS="is-carousel";
export const SHOWING_CLASS="is-showing";
export const CAROUSEL_ROLE="group";
export const CAROUSEL_ROLEDESCRIPTION="carousel";
export const MIN_SLIDES=1;
export const RESIZE_SETTLE_MS=120;
const VISIBLE_ENOUGH=0.6;
function travelTo(state,index){
const frame=state.frame.getBoundingClientRect();
const slide=state.slides[index].getBoundingClientRect();
state.frame.scrollBy({
left:slide.left+slide.width/2-(frame.left+frame.width/2),
behavior:state.reducedMotion?"auto":"smooth",
});
}
function markShowing(slides,index){
slides.forEach((slide,at)=>
slide.classList.toggle(SHOWING_CLASS,at===index),
);
}
function showPosition(state,index){
const total=state.slides.length;
renderControlRow(state,index,total);
markShowing(state.slides,index);
state.index=index;
state.onMove(index,total);
}
function wireArrows(state){
state.prev.addEventListener("click",()=>{
travelTo(state,Math.max(0,state.index-1));
});
state.next.addEventListener("click",()=>{
travelTo(state,Math.min(state.slides.length-1,state.index+1));
});
}
function followScrolling(state,ObserverCtor){
const observer=new ObserverCtor(
(entries)=>{
const arrived=entries.find(
(entry)=>
entry.isIntersecting&&entry.intersectionRatio>=VISIBLE_ENOUGH,
);
if(arrived===undefined){
return;
}
showPosition(state,state.slides.indexOf(arrived.target));
},
{root:state.frame,threshold:VISIBLE_ENOUGH},
);
state.slides.forEach((slide)=>observer.observe(slide));
}
function refit(state){
renderControlRow(state,state.index,state.slides.length);
}
function refitWhenStale(state){
const{window,doc}=state;
let settle;
window.addEventListener("resize",()=>{
window.clearTimeout(settle);
settle=window.setTimeout(()=>refit(state),RESIZE_SETTLE_MS);
});
doc.fonts?.ready.then(()=>refit(state));
}
export function whenTextMayRewrap(window,refit){
const root=window.document.documentElement;
let fittedWidth=root.clientWidth;
let settle;
window.addEventListener("resize",()=>{
window.clearTimeout(settle);
settle=window.setTimeout(()=>{
const width=root.clientWidth;
if(width!==fittedWidth){
fittedWidth=width;
refit();
}
},RESIZE_SETTLE_MS);
});
window.document.fonts?.ready.then(refit);
}
export function initSlideCarousel({
doc,
frame,
slides,
labels,
observerCtor,
place,
onMove,
}){
if(slides.length<MIN_SLIDES){
return null;
}
if(typeof observerCtor!=="function"){
return null;
}
const window=(doc.defaultView);
frame.classList.add(CAROUSEL_CLASS);
markShowing(slides,0);
frame.setAttribute("role",CAROUSEL_ROLE);
frame.setAttribute("aria-roledescription",CAROUSEL_ROLEDESCRIPTION);
frame.setAttribute("aria-label",labels.carousel);
const row=buildControlRow(doc,labels);
const state={
window,
doc,
frame,
slides,
onMove,
...row,
reducedMotion:window.matchMedia("(prefers-reduced-motion: reduce)")
.matches,
index:0,
};
wireArrows(state);
place(row.controls);
if(!row.controls.isConnected){
throw new Error(
"place must attach the control row to the document before it is drawn",
);
}
followScrolling(state,observerCtor);
showPosition(state,0);
refitWhenStale(state);
return{controls:row.controls};
}
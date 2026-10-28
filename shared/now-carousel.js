import{buildControlRow,renderControlRow}from"./now-pager-controls.js";
import{
RESIZE_SETTLE_MS,
whenLayoutMayGoStale,
whenTextMayRewrap,
}from"./now-layout-stale.js";
export{RESIZE_SETTLE_MS,whenLayoutMayGoStale,whenTextMayRewrap};
const CAROUSEL_CLASS="is-carousel";
export const SHOWING_CLASS="is-showing";
export const CAROUSEL_ROLE="group";
export const CAROUSEL_ROLEDESCRIPTION="carousel";
export function entryLabel(band,noun){
const heading=band===null?null:band.querySelector(".now-entry h3");
if(heading===null||heading.textContent.trim()===""){
return`${noun} from this month`;
}
return`${noun} from ${heading.textContent.trim()}`;
}
export const MIN_SLIDES=1;
const VISIBLE_ENOUGH=0.6;
function travelTo(state,index,behavior){
const frame=state.frame.getBoundingClientRect();
const slide=state.slides[index].getBoundingClientRect();
state.frame.scrollBy({
left:slide.left+slide.width/2-(frame.left+frame.width/2),
behavior,
});
}
function motionOf(state){
return state.reducedMotion?"auto":"smooth";
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
travelTo(state,Math.max(0,state.index-1),motionOf(state));
});
state.next.addEventListener("click",()=>{
const last=state.slides.length-1;
travelTo(state,Math.min(last,state.index+1),motionOf(state));
});
}
function followScrolling(state,ObserverCtor){
state.observer=new ObserverCtor(
(entries)=>{
const arrived=entries.find(
(entry)=>
entry.isIntersecting&&
entry.intersectionRatio>=VISIBLE_ENOUGH&&
state.slides.includes(entry.target),
);
if(arrived===undefined){
return;
}
const index=state.slides.indexOf(arrived.target);
if(index!==state.index){
showPosition(state,index);
}
},
{root:state.frame,threshold:VISIBLE_ENOUGH},
);
state.slides.forEach((slide)=>state.observer.observe(slide));
}
function reslide(state,slides,index){
if(slides.length<MIN_SLIDES){
throw new Error("reslide needs at least one slide to show");
}
const at=Math.min(slides.length-1,Math.max(0,index));
const moved=at!==state.index||slides.length!==state.slides.length;
state.slides.forEach((slide)=>state.observer.unobserve(slide));
markShowing(state.slides,-1);
state.slides=slides;
state.index=at;
slides.forEach((slide)=>state.observer.observe(slide));
travelTo(state,at,"auto");
renderControlRow(state,at,slides.length);
markShowing(slides,at);
if(moved){
state.onMove(at,slides.length);
}
}
function refit(state){
renderControlRow(state,state.index,state.slides.length);
}
function refitWhenStale(state){
whenLayoutMayGoStale(state.window,()=>refit(state),{widthOnly:false});
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
return{
controls:row.controls,
reslide:(next,index)=>reslide(state,next,index),
};
}
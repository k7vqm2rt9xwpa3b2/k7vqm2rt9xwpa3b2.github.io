import{
CAROUSEL_ROLE,
CAROUSEL_ROLEDESCRIPTION,
RESIZE_SETTLE_MS,
}from"./now-carousel.js";
import{paginate,tallestPage}from"./now-notes-paging.js";
import{
buildControlRow,
buildLiveRegion,
renderControlRow,
}from"./now-pager-controls.js";
const PAGED_CLASS="is-paged";
const MIN_NOTES=1;
function carouselLabel(band){
const heading=band.querySelector(".now-entry h3");
if(heading===null||heading.textContent.trim()===""){
return"Notes from this month";
}
return`Notes from ${heading.textContent.trim()}`;
}
function measureGap(list,notes){
if(notes.length<2){
return 0;
}
list.replaceChildren(notes[0],notes[1]);
return(
notes[1].getBoundingClientRect().top-
notes[0].getBoundingClientRect().bottom
);
}
function measure(pager,list,notes){
list.replaceChildren();
const room=pager.clientHeight;
const gap=measureGap(list,notes);
const heights=notes.map((note)=>{
list.replaceChildren(note);
return note.getBoundingClientRect().height;
});
list.replaceChildren();
return{room,gap,heights};
}
function show(state){
const{list,notes,pages,at}=state;
list.replaceChildren(...pages[at].map((index)=>notes[index]));
renderControlRow(state,at,pages.length);
state.live.textContent=`Notes ${at+1} of ${pages.length}`;
}
function ceilingOf(window,pager){
const ceiling=Number.parseFloat(window.getComputedStyle(pager).maxHeight);
return Number.isFinite(ceiling)?ceiling:null;
}
function rebuild(state){
state.pager.style.height="";
if(state.pager.clientHeight<=0){
markUnpaged(state);
return;
}
const ceiling=ceilingOf(state.window,state.pager);
const{room,gap,heights}=measure(state.pager,state.list,state.notes);
state.pages=paginate(heights,gap,ceiling??room);
if(ceiling!==null){
state.pager.style.height=`${tallestPage(heights,gap,state.pages)}px`;
}
state.at=clampPage(state,state.at);
show(state);
}
function markUnpaged(state){
if(state.pages.length>0){
return;
}
for(const arrow of[state.prev,state.next]){
arrow.setAttribute("aria-disabled","true");
}
}
function clampPage(state,at){
return Math.max(0,Math.min(at,state.pages.length-1));
}
function step(state,delta){
state.at=clampPage(state,state.at+delta);
show(state);
}
function wire(state){
const{window,prev,next}=state;
prev.addEventListener("click",()=>step(state,-1));
next.addEventListener("click",()=>step(state,1));
let settle;
window.addEventListener("resize",()=>{
window.clearTimeout(settle);
settle=window.setTimeout(()=>rebuild(state),RESIZE_SETTLE_MS);
});
window.document.fonts?.ready.then(()=>rebuild(state));
}
function initOneCarousel(window,band,list,notes){
const doc=window.document;
const pager=doc.createElement("div");
pager.className="now-pager";
pager.setAttribute("role",CAROUSEL_ROLE);
pager.setAttribute("aria-roledescription",CAROUSEL_ROLEDESCRIPTION);
pager.setAttribute("aria-label",carouselLabel(band));
list.replaceWith(pager);
pager.append(list);
const{controls,prev,next,strip,count}=buildControlRow(doc,{
previous:"Previous notes",
next:"Next notes",
});
const live=buildLiveRegion(doc);
pager.after(controls,live);
band.classList.add(PAGED_CLASS);
const state={
window,
doc,
band,
pager,
list,
notes,
controls,
prev,
next,
strip,
count,
live,
pages:[],
at:0,
};
wire(state);
rebuild(state);
}
export function initNoteCarousel(window){
const bands=[...window.document.querySelectorAll(".now-body")];
bands.forEach((band)=>{
const list=band.querySelector(".now-notes");
if(list===null){
return;
}
const notes=[...list.querySelectorAll(".now-note")];
if(notes.length>=MIN_NOTES){
initOneCarousel(window,band,list,notes);
}
});
}
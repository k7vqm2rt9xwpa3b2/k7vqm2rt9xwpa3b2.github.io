import{
entryLabel,
initSlideCarousel,
whenLayoutMayGoStale,
}from"./now-carousel.js";
import{paginateEvenly,tallestPage}from"./now-notes-paging.js";
import{buildLiveRegion}from"./now-pager-controls.js";
const PAGED_CLASS="is-paged";
const MIN_NOTES=1;
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
pager.replaceChildren(list);
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
function ceilingOf(window,pager){
const ceiling=Number.parseFloat(window.getComputedStyle(pager).maxHeight);
return Number.isFinite(ceiling)?ceiling:null;
}
function rebuild(state){
state.pager.style.height="";
if(state.pager.clientHeight<=0){
return;
}
const reached=state.pages[state.at][0];
const ceiling=ceilingOf(state.window,state.pager);
const{room,gap,heights}=measure(state.pager,state.list,state.notes);
state.pages=paginateEvenly(heights,gap,ceiling??room,{
boxFromPages:ceiling!==null,
});
if(ceiling!==null){
state.pager.style.height=`${tallestPage(heights,gap,state.pages)}px`;
}
const lists=buildPageLists(state);
state.pager.replaceChildren(...lists);
state.carousel.reslide(
lists,
state.pages.findIndex((page)=>page.includes(reached)),
);
}
function buildPageLists(state){
return state.pages.map((page,at)=>{
const list=at===0?state.list:state.list.cloneNode(false);
list.replaceChildren(...page.map((index)=>state.notes[index]));
return list;
});
}
function initOneCarousel(window,band,list,notes,ObserverCtor){
const doc=window.document;
const pager=doc.createElement("div");
pager.className="now-pager";
list.replaceWith(pager);
pager.append(list);
const live=buildLiveRegion(doc);
band.classList.add(PAGED_CLASS);
const state={
window,
pager,
list,
notes,
pages:[notes.map((note,index)=>index)],
at:0,
carousel:((null)),
};
state.carousel=(
initSlideCarousel({
doc,
frame:pager,
slides:[list],
labels:{
carousel:entryLabel(band,"Notes"),
previous:"Previous notes",
next:"Next notes",
},
observerCtor:ObserverCtor,
place:(row)=>pager.after(row,live),
onMove:(index,total)=>{
state.at=index;
live.textContent=`Notes ${index+1} of ${total}`;
},
})
);
whenLayoutMayGoStale(window,()=>rebuild(state),{widthOnly:false});
rebuild(state);
}
export function initNoteCarousel(window,ObserverCtor){
if(typeof ObserverCtor!=="function"){
return;
}
const bands=[...window.document.querySelectorAll(".now-body")];
bands.forEach((band)=>{
const list=band.querySelector(".now-notes");
if(list===null){
return;
}
const notes=[...list.querySelectorAll(".now-note")];
if(notes.length>=MIN_NOTES){
initOneCarousel(window,band,list,notes,ObserverCtor);
}
});
}
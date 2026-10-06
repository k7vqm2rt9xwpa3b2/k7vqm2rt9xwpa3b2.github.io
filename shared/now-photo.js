import{initSlideCarousel,MIN_SLIDES}from"./now-carousel.js";
import{buildLiveRegion}from"./now-pager-controls.js";
import{createReveal,fitReveal,wrapLine}from"./text-reveal.js";
function showPosition(state,index,total){
const{slides,text,live}=state;
const caption=slides[index].dataset.tag??"";
text.textContent=caption;
fitReveal(state);
live.textContent=`Photo ${index+1} of ${total}: ${caption}`;
}
function carouselLabel(frame){
const band=frame.closest(".now-body");
const heading=band===null?null:band.querySelector(".now-entry h3");
if(heading===null||heading.textContent.trim()===""){
return"Photographs from this month";
}
return`Photographs from ${heading.textContent.trim()}`;
}
function initOneCarousel(window,frame,slides,ObserverCtor){
const doc=window.document;
const figure=(frame.closest(".now-photo"));
const live=buildLiveRegion(doc);
figure.append(live);
const tag=(figure.querySelector(".now-photo__tag"));
const state=Object.assign(
createReveal(
doc,
(figure.querySelector("figcaption")),
),
{text:tag,line:wrapLine(doc,tag),slides,live},
);
initSlideCarousel({
doc,
frame,
slides,
labels:{
carousel:carouselLabel(frame),
previous:"Previous photo",
next:"Next photo",
},
observerCtor:ObserverCtor,
place:(controls)=>figure.append(controls),
onMove:(index,total)=>showPosition(state,index,total),
});
}
export function initPhotoCarousel(window,ObserverCtor){
if(typeof ObserverCtor!=="function"){
return;
}
const frames=[...window.document.querySelectorAll(".now-photo__frame")];
frames.forEach((frame)=>{
const slides=([
...frame.querySelectorAll(".now-photo__slide"),
]);
if(slides.length>=MIN_SLIDES){
initOneCarousel(window,frame,slides,ObserverCtor);
}
});
}
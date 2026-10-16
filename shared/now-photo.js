import{initSlideCarousel,MIN_SLIDES}from"./now-carousel.js";
import{buildLiveRegion}from"./now-pager-controls.js";
import{createReveal,fitReveal,wrapLine}from"./text-reveal.js";
const FETCHING_ATTRIBUTES=(["srcset","sizes","src"]);
const COPIED_ATTRIBUTES=new Set(["class","alt","data-tag"]);
function deferredSlideFrom(doc,noscript){
const view=(doc.defaultView);
const parsed=new view.DOMParser().parseFromString(
noscript.innerHTML,
"text/html",
);
const source=parsed.querySelector("img.now-photo__slide[src]");
if(source===null){
return null;
}
const slide=doc.createElement("img");
[...source.attributes]
.filter((attribute)=>COPIED_ATTRIBUTES.has(attribute.name))
.forEach((attribute)=>
slide.setAttribute(attribute.name,attribute.value),
);
FETCHING_ATTRIBUTES.forEach((name)=>{
const value=source.getAttribute(name);
if(value!==null){
slide.dataset[name]=value;
}
});
return slide;
}
function materializeSlides(frame){
const doc=frame.ownerDocument;
frame.querySelectorAll(":scope > noscript").forEach((noscript)=>{
const slide=deferredSlideFrom(doc,noscript);
if(slide!==null){
noscript.replaceWith(slide);
}
});
}
function loadSlide(slide){
if(slide.dataset.src===undefined){
return;
}
FETCHING_ATTRIBUTES.forEach((name)=>{
const value=slide.dataset[name];
if(value!==undefined){
slide.setAttribute(name,value);
delete slide.dataset[name];
}
});
}
function loadAround(state){
state.slides.slice(state.index,state.index+2).forEach(loadSlide);
}
function followPosition(state,index){
state.index=index;
if(state.seen||index>0){
loadAround(state);
}
}
function loadWhenSeen(frame,state,ObserverCtor){
const observer=new ObserverCtor(
(entries)=>{
if(entries.some((entry)=>entry.isIntersecting)){
state.seen=true;
loadAround(state);
}
},
{rootMargin:"0px",threshold:0},
);
observer.observe(frame);
}
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
const deferred={slides,index:0,seen:false};
loadWhenSeen(frame,deferred,ObserverCtor);
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
onMove:(index,total)=>{
showPosition(state,index,total);
followPosition(deferred,index);
},
});
}
function slidesOf(frame){
return([
...frame.querySelectorAll(".now-photo__slide"),
]);
}
export function initPhotoCarousel(window,ObserverCtor){
const frames=[...window.document.querySelectorAll(".now-photo__frame")];
frames.forEach(materializeSlides);
if(typeof ObserverCtor!=="function"){
frames.forEach((frame)=>slidesOf(frame).forEach(loadSlide));
return;
}
frames.forEach((frame)=>{
const slides=slidesOf(frame);
if(slides.length>=MIN_SLIDES){
initOneCarousel(window,frame,slides,ObserverCtor);
}
});
}
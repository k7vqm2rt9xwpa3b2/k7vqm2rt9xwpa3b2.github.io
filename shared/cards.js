import{favoritedGloss,favoritedSignal}from"./card-signals.js";
import{moveAnnouncement}from"./card-slides.js";
import{CARD_SOURCES}from"./card-sources.js";
import{initSlideCarousel}from"./now-carousel.js";
import{buildLiveRegion}from"./now-pager-controls.js";
import{
bindReveal,
clearLineClamps,
createCardLines,
createReveal,
fitCardText,
}from"./text-reveal.js";
function committedNote(doc,source){
const noscript=doc.querySelector(".media + noscript");
if(!noscript){
return null;
}
const parsed=new doc.defaultView.DOMParser().parseFromString(
(noscript.textContent),
"text/html",
);
const note=parsed.querySelector(`[data-source="${source.id}"]`);
note?.querySelectorAll(":scope > b").forEach(function(label){
label.remove();
});
return note;
}
function addSourceReveal(doc,box,frame,source){
const note=committedNote(doc,source);
if(note===null){
return;
}
const state=createReveal(doc,box,frame,null);
state.panel.classList.add("card__source-panel");
state.panel.append(...note.childNodes);
const more=doc.createElement("button");
more.type="button";
more.className="reveal__more card__source-more";
more.setAttribute("aria-label","Where these "+source.unit+"s come from");
box.insertBefore(more,state.panel);
bindReveal(state,more);
}
function refreshClockSignals(card,now){
card.querySelectorAll("[data-added]").forEach(function(glyphs){
const record={
favorited:0,
tracks:glyphs.getAttribute("data-tracks"),
added:glyphs.getAttribute("data-added"),
};
const gloss=(favoritedGloss(record,now));
glyphs.setAttribute("aria-label",gloss);
glyphs.setAttribute("title",gloss);
glyphs.textContent=favoritedSignal(record,now);
});
}
function guardCovers(card){
card.querySelectorAll("img").forEach(function(img){
if(img.complete&&img.naturalWidth===0&&img.currentSrc!==""){
img.remove();
return;
}
img.addEventListener("error",function(){
img.remove();
});
});
}
function wireCarousel(doc,li,source,observerCtor){
const box=(li.querySelector(".card__box"));
const frame=(box.querySelector(".card__frame"));
const slides=Array.from(frame.children);
addSourceReveal(doc,box,frame,source);
const live=buildLiveRegion(doc);
li.appendChild(live);
const lines=createCardLines(doc,box,frame);
let shown=0;
initSlideCarousel({
doc,
frame,
slides,
labels:{
carousel:`Recent ${source.unit}s`,
previous:`Previous ${source.unit}`,
next:`Next ${source.unit}`,
},
observerCtor,
place:function(controls){
li.appendChild(controls);
},
onMove:function(index,total){
shown=index;
fitCardText(lines,slides[index]);
live.textContent=moveAnnouncement(source,slides,index,total);
},
});
(doc.defaultView).addEventListener(
"resize",
function(){
fitCardText(lines,slides[shown]);
},
);
}
function wireCard(doc,li,source,now,observerCtor){
refreshClockSignals(li,now);
const asBaked=(li.cloneNode(true));
clearLineClamps(asBaked);
let card=li;
try{
wireCarousel(doc,li,source,observerCtor);
}catch{
li.replaceWith(asBaked);
card=asBaked;
}
guardCovers(card);
}
export function wireCards(root,now=new Date(),observerCtor){
const list=root.querySelector(".media");
if(!list){
return;
}
const doc=list.ownerDocument;
const cards=Array.from(list.children);
CARD_SOURCES.forEach(function(source){
const li=cards.find(function(card){
return card.id===source.id;
});
if(li===undefined||li.querySelector(".card__frame")===null){
return;
}
if(li.querySelector(":scope > [aria-live]")!==null){
return;
}
wireCard(doc,li,source,now,observerCtor);
});
}
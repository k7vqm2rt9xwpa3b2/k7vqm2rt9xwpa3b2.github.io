import{createCardLines,fitCardText}from"./card-lines.js";
import{buildPlaceholderCard}from"./card-placeholder.js";
import{present}from"./card-signals.js";
import{buildSlides,moveAnnouncement}from"./card-slides.js";
import{CARD_SOURCES}from"./card-sources.js";
import{initSlideCarousel}from"./now-carousel.js";
import{buildLiveRegion}from"./now-pager-controls.js";
import{bindReveal,createReveal}from"./text-reveal.js";
function hasRequiredFields(record,fields){
if(record===null){
return false;
}
return fields.every(function(field){
return present(record[field]);
});
}
function usableRecords(body,required){
if(!Array.isArray(body)){
return[];
}
return body.filter(function(record){
return hasRequiredFields(record,required);
});
}
function loadRecords(source,fetchImpl){
return fetchImpl(source.file).then(function(response){
if(!response.ok){
throw new Error(source.file+" responded "+response.status);
}
return response.json();
});
}
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
function buildCardShell(doc,source,records,now){
const li=doc.createElement("li");
li.className="card";
li.id=source.id;
const box=doc.createElement("div");
box.className="card__box";
li.appendChild(box);
const label=doc.createElement("p");
label.className="card__label";
label.textContent=source.label;
box.appendChild(label);
const frame=doc.createElement("div");
frame.className="card__frame";
const slides=buildSlides(doc,source,records,now,frame);
box.appendChild(frame);
addSourceReveal(doc,box,frame,source);
const live=buildLiveRegion(doc);
li.appendChild(live);
return{li,box,frame,slides,live};
}
function appendCard(list,source,records,now,observerCtor){
const doc=list.ownerDocument;
const{li,box,frame,slides,live}=buildCardShell(
doc,
source,
records,
now,
);
if(slides.length===0){
list.appendChild(buildPlaceholderCard(doc,source));
return;
}
list.appendChild(li);
const lines=createCardLines(doc,box,frame);
let shown=0;
try{
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
}catch(wiringFailure){
li.remove();
throw wiringFailure;
}
doc.defaultView.addEventListener("resize",function(){
fitCardText(lines,slides[shown]);
});
}
export function renderCards(root,fetchImpl,now=new Date(),observerCtor){
const list=root.querySelector(".media");
if(!list){
return Promise.resolve();
}
return Promise.allSettled(
CARD_SOURCES.map(function(source){
return loadRecords(source,fetchImpl);
}),
).then(function(results){
results.forEach(function(result,index){
const source=CARD_SOURCES[index];
try{
const records=
result.status==="fulfilled"
?usableRecords(result.value,source.required)
:[];
appendCard(list,source,records,now,observerCtor);
}catch{
return;
}
});
});
}
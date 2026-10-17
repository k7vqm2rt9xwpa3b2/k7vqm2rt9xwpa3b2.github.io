export const MORE_LABEL="more →";
export const CLOSE_LABEL="close ✕";
const TOGGLING_LABELS={shut:MORE_LABEL,open:CLOSE_LABEL};
const registries=new WeakMap();
function revealsOf(doc){
let reveals=registries.get(doc);
if(reveals===undefined){
reveals=[];
registries.set(doc,reveals);
doc.addEventListener("click",()=>closeAllReveals(doc));
doc.addEventListener("keydown",(event)=>{
if(event.key==="Escape"){
closeAllReveals(doc);
}
});
}
return reveals;
}
function closeAllReveals(doc){
revealsOf(doc).forEach((state)=>{
state.panel.hidden=true;
if(state.more!==null){
markRevealControl(state,false);
}
});
}
function markRevealControl(state,open){
state.more.setAttribute("aria-expanded",String(open));
if(state.labels!==null){
state.more.textContent=open?state.labels.open:state.labels.shut;
}
}
export function bindReveal(state,more){
state.more=more;
markRevealControl(state,!state.panel.hidden);
more.addEventListener("click",(event)=>{
event.stopPropagation();
const opening=state.panel.hidden;
closeAllReveals(state.doc);
state.panel.hidden=!opening;
markRevealControl(state,opening);
});
}
export function wrapLine(doc,text){
const line=doc.createElement("div");
line.className="reveal__line";
text.replaceWith(line);
line.appendChild(text);
return line;
}
export function createReveal(
doc,
host,
before=host.firstChild,
labels=TOGGLING_LABELS,
){
const panel=doc.createElement("span");
panel.className="reveal__panel";
panel.hidden=true;
host.insertBefore(panel,before);
const state={doc,text:null,line:null,panel,more:null,labels};
revealsOf(doc).push(state);
return state;
}
export function fitReveal(state){
state.panel.textContent=state.text.textContent;
closeAllReveals(state.doc);
offerControlIfClipped(state);
}
export function refitReveal(state){
if(state.text===null){
return;
}
const focused=state.more!==null&&state.more===state.doc.activeElement;
state.panel.textContent=state.text.textContent;
offerControlIfClipped(state);
if(focused&&state.more===null){
const row=(state.line);
row.setAttribute("tabindex","-1");
row.focus({preventScroll:true});
}
}
function offerControlIfClipped(state){
const{doc,text,line}=state;
const clipped=text.scrollHeight>text.clientHeight;
if(clipped&&state.more===null){
const more=doc.createElement("button");
more.type="button";
more.className="reveal__more";
line.appendChild(more);
bindReveal(state,more);
}else if(!clipped&&state.more!==null){
state.panel.hidden=true;
state.more.remove();
state.more=null;
}
}
export const LINE_BUDGET=4;
export const LINE_CAP=3;
const SHARE_WHEN_BOTH_OVERFLOW=2;
export function allocateLines(title,maker){
const cappedTitle=Math.min(title,LINE_CAP);
const cappedMaker=Math.min(maker,LINE_CAP);
if(cappedTitle+cappedMaker<=LINE_BUDGET){
return{title:cappedTitle,maker:cappedMaker};
}
return{title:SHARE_WHEN_BOTH_OVERFLOW,maker:SHARE_WHEN_BOTH_OVERFLOW};
}
export const LINES_PROPERTY="--lines";
function linesNeeded(element){
element.style.setProperty(LINES_PROPERTY,"1");
const oneLine=element.clientHeight;
if(!(oneLine>0)){
element.style.removeProperty(LINES_PROPERTY);
return null;
}
return Math.max(1,Math.round(element.scrollHeight/oneLine));
}
export function createCardLines(doc,box,frame){
return{
title:createReveal(doc,box,frame),
maker:createReveal(doc,box,frame),
};
}
function aim(state,text){
if(state.more!==null){
state.more.remove();
state.more=null;
}
state.text=text;
state.line=text===null?null:text.parentElement;
}
function clampSlide(slide){
const title=(
slide.querySelector(".card__title")
);
const maker=makerLineOf(slide);
const needed={
title:linesNeeded(title),
maker:maker===null?0:linesNeeded(maker),
};
if(needed.title===null||needed.maker===null){
clearLineClamps(slide);
}else{
const shown=allocateLines(needed.title,needed.maker);
title.style.setProperty(LINES_PROPERTY,String(shown.title));
if(maker!==null){
maker.style.setProperty(LINES_PROPERTY,String(shown.maker));
}
}
return{title,maker};
}
function makerLineOf(slide){
const maker=(
slide.querySelector(".card__meta--maker")
);
return maker===null||maker.textContent.trim()===""?null:maker;
}
export function fitNewestSlides(root){
root.querySelectorAll(".media .card__frame").forEach(function(frame){
const newest=frame.firstElementChild;
if(newest!==null){
clampSlide(newest);
}
});
}
export function clearLineClamps(root){
root
.querySelectorAll(".card__title, .card__meta--maker")
.forEach(function(line){
(line).style.removeProperty(LINES_PROPERTY);
});
}
export function fitCardText(lines,slide){
const{title,maker}=clampSlide(slide);
aim(lines.title,title);
fitReveal(lines.title);
aim(lines.maker,maker);
if(maker!==null){
fitReveal(lines.maker);
}
}
export function refitCardText(lines,slide){
clampSlide(slide);
refitReveal(lines.title);
refitReveal(lines.maker);
}
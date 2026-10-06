import{createReveal,fitReveal}from"./text-reveal.js";
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
export function fitCardText(lines,slide){
const title=(
slide.querySelector(".card__title")
);
const maker=(
slide.querySelector(".card__meta--maker")
);
const needed={
title:linesNeeded(title),
maker:maker===null?0:linesNeeded(maker),
};
if(needed.title!==null&&needed.maker!==null){
const shown=allocateLines(needed.title,needed.maker);
title.style.setProperty(LINES_PROPERTY,String(shown.title));
if(maker!==null){
maker.style.setProperty(LINES_PROPERTY,String(shown.maker));
}
}
aim(lines.title,title);
fitReveal(lines.title);
aim(lines.maker,maker);
if(maker!==null){
fitReveal(lines.maker);
}
}
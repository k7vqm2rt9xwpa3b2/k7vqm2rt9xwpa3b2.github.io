import{drawCrashScreen}from"./not-found-screen.js";
const FUTURE_ADDRESS=/^\/future\/?$/i;
const MOTION="(prefers-reduced-motion: no-preference)";
const FALL="nf-move";
const LETTERS=".nf-fall, .nf-dangle";
const WORDS=Object.freeze({
code:"data-future-code",
headingName:"data-future-heading-name",
gridName:"data-future-grid-name",
title:"data-future-screen-title",
lines:Object.freeze([
"data-future-screen-line-1",
"data-future-screen-line-2",
"data-future-screen-line-3",
"data-future-screen-line-4",
]),
prompt:"data-future-screen-prompt",
});
export function addressClass(pathname){
return FUTURE_ADDRESS.test(pathname)?"future":"elsewhere";
}
export function reactToAddress(win,pathname){
if(addressClass(pathname)==="future"){
reactToFuture(win);
}
}
export function reactToFuture(win){
const doc=win.document;
const words=jokeWordsOn(
(doc.getElementById("not-found-words")),
);
const heading=(doc.querySelector("h1"));
const grid=(
doc.querySelector("svg.not-found__grid")
);
swapCode(doc,words.code);
heading.setAttribute("aria-label",words.headingName);
grid.setAttribute("aria-label",words.gridName);
crashOnFirstLanding(win,grid,words.screen);
}
function wordOn(carrier,name){
const word=carrier.getAttribute(name);
if(word===null){
throw new Error(`not-found-future.js: the carrier has no ${name}`);
}
return word;
}
function jokeWordsOn(carrier){
return{
code:wordOn(carrier,WORDS.code),
headingName:wordOn(carrier,WORDS.headingName),
gridName:wordOn(carrier,WORDS.gridName),
screen:{
title:wordOn(carrier,WORDS.title),
lines:WORDS.lines.map((name)=>wordOn(carrier,name)),
prompt:wordOn(carrier,WORDS.prompt),
},
};
}
function swapCode(doc,code){
const shown=(
doc.querySelector(".not-found__code")
);
doc.title=doc.title.replace(shown.textContent,()=>code);
shown.textContent=code;
}
function crashOnFirstLanding(win,grid,words){
const crash=()=>crashGrid(win,grid,words);
if(!win.matchMedia(MOTION).matches||!landingAhead(grid)){
crash();
return;
}
const onEnd=(event)=>{
if(event.animationName===FALL){
grid.removeEventListener("animationend",onEnd);
crash();
}
};
grid.addEventListener("animationend",onEnd);
}
function landingAhead(grid){
if(!("getAnimations"in grid)){
return true;
}
const falls=grid
.getAnimations({subtree:true})
.filter(
(animation)=>
"animationName"in animation&&animation.animationName===FALL,
);
return(
falls.length===0||falls.some((fall)=>fall.playState!=="finished")
);
}
function crashGrid(win,grid,words){
freezeLetters(win,grid);
grid.append(drawCrashScreen(win.document,words));
}
function freezeLetters(win,grid){
const letters=(
grid.querySelectorAll(LETTERS)
);
const places=[...letters].map((letter)=>{
const{transform,rotate}=win.getComputedStyle(letter);
return{letter,transform,rotate};
});
for(const{letter,transform,rotate}of places){
letter.style.transform=transform;
letter.style.rotate=rotate;
letter.style.animation="none";
}
}
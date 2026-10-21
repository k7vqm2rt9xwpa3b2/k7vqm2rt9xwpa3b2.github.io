import{wordOn}from"./dom-words.js";
import{offerReboot}from"./not-found-reboot.js";
import{drawCrashScreen}from"./not-found-screen.js";
const FUTURE_ADDRESS=/^\/future\/?$/i;
const MOTION="(prefers-reduced-motion: no-preference)";
const FALL="nf-move";
const LETTERS=".nf-fall, .nf-dangle";
const WORDS=Object.freeze({
code:"data-future-code",
headingName:"data-future-heading-name",
gridName:"data-future-grid-name",
rebootedGridName:"data-future-rebooted-grid-name",
lead:"data-future-lead",
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
const lead=(
doc.querySelector("p.not-found__lead")
);
const grid=(
doc.querySelector("svg.not-found__grid")
);
swapCode(doc,words.code);
heading.setAttribute("aria-label",words.headingName);
grid.setAttribute("aria-label",words.gridName);
lead.textContent=words.lead;
crashOnFirstLanding(win,grid,words);
}
const CARRIER_NAME="not-found-future.js: the carrier";
function jokeWordsOn(carrier){
return{
code:wordOn(carrier,WORDS.code,CARRIER_NAME),
headingName:wordOn(carrier,WORDS.headingName,CARRIER_NAME),
gridName:wordOn(carrier,WORDS.gridName,CARRIER_NAME),
rebootedGridName:wordOn(carrier,WORDS.rebootedGridName,CARRIER_NAME),
lead:wordOn(carrier,WORDS.lead,CARRIER_NAME),
screen:{
title:wordOn(carrier,WORDS.title,CARRIER_NAME),
lines:WORDS.lines.map((name)=>wordOn(carrier,name,CARRIER_NAME)),
prompt:wordOn(carrier,WORDS.prompt,CARRIER_NAME),
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
const screen=drawCrashScreen(win.document,words.screen);
grid.append(screen);
offerReboot(win,grid,screen,{rebootedGridName:words.rebootedGridName});
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
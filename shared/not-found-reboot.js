const MOTION="(prefers-reduced-motion: no-preference)";
const BLANK="nf-blank";
const BLANKED="nf-screen--blank";
const RETURN="nf-return";
const RETURN_MS=800;
const STAGGER_MS=60;
const LETTERS=".nf-fall, .nf-dangle";
const SCREEN_WORDS=
".nf-screen__bar, .nf-screen__title, .nf-screen__line, .nf-screen__prompt";
const NOT_ANY_KEY=new Set([
"Alt",
"AltGraph",
"CapsLock",
"Control",
"Dead",
"Fn",
"FnLock",
"Hyper",
"Meta",
"NumLock",
"OS",
"ScrollLock",
"Shift",
"Super",
"Symbol",
"SymbolLock",
"Tab",
"Unidentified",
]);
const FUNCTION_KEY=/^F([1-9]|1[0-2])$/;
export function countsAsAnyKey(event){
if(event.ctrlKey||event.altKey||event.metaKey||event.isComposing){
return false;
}
return!NOT_ANY_KEY.has(event.key)&&!FUNCTION_KEY.test(event.key);
}
export function offerReboot(win,grid,screen,words){
screen.setAttribute("role","button");
screen.setAttribute("tabindex","0");
grid.setAttribute("role","group");
let started=false;
const start=()=>{
if(!started){
started=true;
blankScreen(win,grid,screen,words);
}
};
screen.addEventListener("click",start);
screen.addEventListener("keydown",(event)=>{
if(countsAsAnyKey(event)){
event.preventDefault();
start();
}
});
}
function blankScreen(win,grid,screen,words){
for(const part of screen.querySelectorAll(SCREEN_WORDS)){
part.remove();
}
const onEnd=(event)=>{
if(event.animationName===BLANK){
screen.removeEventListener("animationend",onEnd);
restartGrid(win,grid,screen,words);
}
};
screen.addEventListener("animationend",onEnd);
screen.classList.add(BLANKED);
if(!runsAnimation(screen,BLANK)){
screen.removeEventListener("animationend",onEnd);
restartGrid(win,grid,screen,words);
}
}
function restartGrid(win,grid,screen,words){
const hadFocus=win.document.activeElement===screen;
screen.remove();
grid.setAttribute("role","img");
grid.setAttribute("aria-label",words.rebootedGridName);
if(hadFocus){
grid.setAttribute("tabindex","-1");
grid.focus({preventScroll:true});
}
const letters=([
...grid.querySelectorAll(LETTERS),
]);
if(win.matchMedia(MOTION).matches&&letters.length>0){
returnLetters(grid,letters);
}else{
settleLetters(letters);
}
}
function returnLetters(grid,letters){
let waiting=letters.length;
const onEnd=(event)=>{
if(event.animationName===RETURN){
waiting-=1;
if(waiting===0){
grid.removeEventListener("animationend",onEnd);
settleLetters(letters);
}
}
};
grid.addEventListener("animationend",onEnd);
letters.forEach((letter,index)=>{
letter.style.animation=`${RETURN} ${RETURN_MS}ms ease-in-out ${index*STAGGER_MS}ms both`;
});
if(!runsAnimation(grid,RETURN)){
grid.removeEventListener("animationend",onEnd);
settleLetters(letters);
}
}
function runsAnimation(element,name){
if(!("getAnimations"in element)){
return true;
}
return element
.getAnimations({subtree:true})
.some(
(animation)=>
"animationName"in animation&&animation.animationName===name,
);
}
function settleLetters(letters){
for(const letter of letters){
letter.style.transform="none";
letter.style.rotate="none";
letter.style.animation="none";
}
}
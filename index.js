import{fitNewestSlides}from"./shared/text-reveal.js";
import{initDisclosures}from"./shared/disclosure.js";
import{initNoteCarousel}from"./shared/now-notes.js";
import{initPhotoCarousel}from"./shared/now-photo.js";
import{initMode}from"./shared/mode.js";
import{
recordingVisits,
rememberedPuzzle,
rememberPuzzle,
}from"./shared/puzzle-memory.js";
export function fetchViaWindow(timedFetch){
return(url,init)=>timedFetch(window,url,init);
}
initMode(window);
initDisclosures(document);
fitNewestSlides(document);
initPhotoCarousel(window,window.IntersectionObserver);
initNoteCarousel(window);
const crosswordOptions={
search:window.location.search,
random:Math.random,
remembered:rememberedPuzzle(window),
remember:recordingVisits(
window,
(index)=>rememberPuzzle(window,index),
()=>import("./shared/visit-list.js"),
),
};
const LIVE_MARK="data-crossword-live";
function settleLiveMark(){
stopWaiting();
document.documentElement.toggleAttribute(LIVE_MARK,mountFilled());
}
const WAITING_MARK="data-crossword-waiting";
const WAITING_DELAY_MS=2000;
function mountFilled(){
return document.querySelector("#crossword-mount > *")!==null;
}
let waitingTimer;
const mountWatch=new window.MutationObserver(()=>{
if(mountFilled())stopWaiting();
});
function markWaiting(waiting){
document.documentElement.toggleAttribute(WAITING_MARK,waiting);
}
function stopWaiting(){
clearTimeout(waitingTimer);
mountWatch.disconnect();
markWaiting(false);
}
function armWaiting(){
for(const mount of document.querySelectorAll("#crossword-mount")){
mountWatch.observe(mount,{childList:true});
waitingTimer=setTimeout(markWaiting,WAITING_DELAY_MS,true);
}
}
document.documentElement.setAttribute(LIVE_MARK,"");
armWaiting();
export const ready=Promise.all([
Promise.all([
import("./crossword/crossword-set.js"),
import("./crossword/crossword-controls.js"),
import("./shared/magic-word-hook.js"),
import("./shared/timed-fetch.js"),
])
.then(
([
{renderCrossword},
{buildCrosswordControls},
{magicWordHook},
{timedFetch},
])=>{
buildCrosswordControls(document);
const{
magicWordDigests,
magicWordSalt,
magicWordIterations,
onMagicWord,
onMalformedAddress,
opened,
}=magicWordHook(window);
return renderCrossword(document,fetchViaWindow(timedFetch),{
...crosswordOptions,
magicWordDigests,
magicWordSalt,
magicWordIterations,
onMagicWord,
onMalformedAddress,
}).then(opened);
},
)
.finally(settleLiveMark),
import("./shared/cards.js").then(({wireCards})=>
wireCards(document,undefined,window.IntersectionObserver),
),
import("./shared/connect.js").then(({initConnect})=>
initConnect(document),
),
import("./shared/masthead-menu.js").then(({initMastheadMenu})=>
initMastheadMenu(document),
),
]);
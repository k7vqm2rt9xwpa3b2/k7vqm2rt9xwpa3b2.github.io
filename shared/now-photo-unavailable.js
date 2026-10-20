import{whenImageFails}from"./image-failure.js";
import{SHOWING_CLASS}from"./now-carousel.js";
import{svgElement}from"./svg.js";
const UNAVAILABLE_WORDS="Photo coming back soon";
const UNAVAILABLE_CLASS="is-unavailable";
const NOTE_CLASS="now-photo__unavailable";
const FRAME_ICON=[
["rect",{x:3,y:5,width:18,height:14,rx:1.5}],
["circle",{cx:16,cy:9.5,r:1.5}],
["path",{d:"M3 16l5-5 5 5 3-3 5 5"}],
];
function buildFrameIcon(doc){
const icon=svgElement(doc,"svg",{
viewBox:"0 0 24 24",
class:"now-photo__unavailable-icon",
"aria-hidden":"true",
focusable:"false",
fill:"none",
stroke:"currentColor",
"stroke-width":1.25,
"stroke-linecap":"round",
"stroke-linejoin":"round",
});
FRAME_ICON.forEach(([tag,attributes])=>
icon.append(svgElement(doc,tag,attributes)),
);
return icon;
}
export function mirrorShowing(frame){
frame.querySelectorAll(`:scope > .${NOTE_CLASS}`).forEach((note)=>{
const slide=(note.previousElementSibling);
note.classList.toggle(
SHOWING_CLASS,
slide.classList.contains(SHOWING_CLASS),
);
});
}
function showUnavailable(slide){
const doc=slide.ownerDocument;
slide.classList.add(UNAVAILABLE_CLASS);
const note=doc.createElement("div");
note.className=NOTE_CLASS;
const words=doc.createElement("span");
words.textContent=UNAVAILABLE_WORDS;
note.append(buildFrameIcon(doc),words);
slide.after(note);
note.classList.toggle(SHOWING_CLASS,slide.classList.contains(SHOWING_CLASS));
}
export function watchForFailures(slides){
slides.forEach((slide)=>
whenImageFails(slide,()=>showUnavailable(slide)),
);
}
export const RESIZE_SETTLE_MS=120;
export function whenLayoutMayGoStale(window,refit,{widthOnly}){
const root=window.document.documentElement;
let fittedWidth=root.clientWidth;
let settle;
window.addEventListener("resize",()=>{
window.clearTimeout(settle);
settle=window.setTimeout(()=>{
const width=root.clientWidth;
if(widthOnly&&width===fittedWidth){
return;
}
fittedWidth=width;
refit();
},RESIZE_SETTLE_MS);
});
window.document.fonts?.ready.then(()=>refit());
}
export function whenTextMayRewrap(window,refit){
whenLayoutMayGoStale(window,refit,{widthOnly:true});
}
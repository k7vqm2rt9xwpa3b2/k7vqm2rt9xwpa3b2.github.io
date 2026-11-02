const MOVING="data-scrolling";
export const SETTLE_MS=1000;
export function markScrolling(box){
if(!("onscrollend"in box)){
return;
}
let settle;
box.addEventListener(
"scroll",
()=>{
clearTimeout(settle);
box.setAttribute(MOVING,"");
},
{passive:true},
);
box.addEventListener("scrollend",()=>{
settle=setTimeout(()=>box.removeAttribute(MOVING),SETTLE_MS);
});
}
export function initScrollRest(doc){
doc.querySelectorAll(".debug-box__text").forEach(markScrolling);
}
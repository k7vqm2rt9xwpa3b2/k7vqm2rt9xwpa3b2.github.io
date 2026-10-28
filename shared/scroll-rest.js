const MOVING="data-scrolling";
export function markScrolling(box){
if(!("onscrollend"in box)){
return;
}
box.addEventListener("scroll",()=>box.setAttribute(MOVING,""),{
passive:true,
});
box.addEventListener("scrollend",()=>box.removeAttribute(MOVING));
}
export function initScrollRest(doc){
doc.querySelectorAll(".debug-box__text").forEach(markScrolling);
}
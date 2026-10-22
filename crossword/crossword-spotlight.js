export const SPOTLIGHT_CLASSES=[
"is-spotlit",
"is-spotlight-held",
"is-spotlight-clued",
];
function pressWordButton(svg,held){
const button=svg.querySelector(".cw-circle-hit[aria-pressed]");
if(button){
button.setAttribute("aria-pressed",String(held));
}
}
export function showSpotlight(svg,held,clued){
svg.classList.add("is-spotlit");
svg.classList.toggle("is-spotlight-held",held);
svg.classList.toggle("is-spotlight-clued",clued);
pressWordButton(svg,held);
}
export function hideSpotlight(svg){
svg.classList.remove(...SPOTLIGHT_CLASSES);
pressWordButton(svg,false);
}
export function spotlightClued(doc){
return doc.querySelector(".is-spotlight-clued")!==null;
}
export function spotlightHeld(doc){
return doc.querySelector(".is-spotlight-held")!==null;
}
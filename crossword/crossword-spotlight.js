export const SPOTLIGHT_CLASSES=["is-spotlit","is-spotlight-held"];
export function showSpotlight(svg,held){
svg.classList.add("is-spotlit");
svg.classList.toggle("is-spotlight-held",held);
}
export function hideSpotlight(svg){
svg.classList.remove(...SPOTLIGHT_CLASSES);
}
export function spotlightHeld(doc){
return doc.querySelector(".is-spotlight-held")!==null;
}
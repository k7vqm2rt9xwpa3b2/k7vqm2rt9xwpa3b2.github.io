const DISMISS_KEY="Escape";
function panelRevealedBy(doc,trigger){
const panel=doc.getElementById(trigger.getAttribute("aria-controls")??"");
if(panel===null){
throw new Error(
"masthead-menu.js: the Menu's <summary> names no panel by aria-controls",
);
}
return panel;
}
export function initMastheadMenu(doc){
const menu=doc.querySelector(".masthead__menu");
if(menu===null){
return;
}
const trigger=(menu.querySelector("summary"));
const panel=panelRevealedBy(doc,trigger);
const inMenu=(node)=>menu.contains(node)||panel.contains(node);
const close=()=>menu.removeAttribute("open");
doc.addEventListener("pointerup",(event)=>{
if(!inMenu(event.target)){
close();
}
});
panel.addEventListener("click",(event)=>{
if((event.target).closest("a")!==null){
close();
}
});
doc.addEventListener("keydown",(event)=>{
if(event.key!==DISMISS_KEY||!menu.hasAttribute("open")){
return;
}
const focusWasInMenu=inMenu(doc.activeElement);
close();
if(focusWasInMenu){
trigger.focus();
}
});
}
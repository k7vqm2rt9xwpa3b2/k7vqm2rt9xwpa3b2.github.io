import{elementFor}from"./crossword-settings.js";
export const PANEL_ID="crossword-theme-panel";
function buildPanel(doc,button){
const panel=doc.createElement("p");
panel.id=PANEL_ID;
panel.className="crossword__theme-panel";
panel.hidden=true;
button.setAttribute("aria-controls",PANEL_ID);
button.parentNode.after(panel);
return panel;
}
export function initThemeControl(doc){
const button=(
elementFor(doc,"theme")
);
if(!button){
return function(){};
}
button.disabled=true;
const panel=buildPanel(doc,button);
button.addEventListener("click",function(){
if(button.disabled){
return;
}
const opening=panel.hidden;
panel.hidden=!opening;
button.setAttribute("aria-expanded",String(opening));
});
return function(sentence,offered){
panel.textContent=sentence||"";
panel.hidden=true;
button.setAttribute("aria-expanded","false");
button.hidden=!offered;
button.disabled=!sentence;
};
}
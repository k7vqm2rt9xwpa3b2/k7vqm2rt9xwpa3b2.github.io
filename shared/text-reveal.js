export const MORE_LABEL="more →";
export const CLOSE_LABEL="close ✕";
const TOGGLING_LABELS={shut:MORE_LABEL,open:CLOSE_LABEL};
const registries=new WeakMap();
function revealsOf(doc){
let reveals=registries.get(doc);
if(reveals===undefined){
reveals=[];
registries.set(doc,reveals);
doc.addEventListener("click",()=>closeAllReveals(doc));
doc.addEventListener("keydown",(event)=>{
if(event.key==="Escape"){
closeAllReveals(doc);
}
});
}
return reveals;
}
function closeAllReveals(doc){
revealsOf(doc).forEach((state)=>{
state.panel.hidden=true;
if(state.more!==null){
markRevealControl(state,false);
}
});
}
function markRevealControl(state,open){
state.more.setAttribute("aria-expanded",String(open));
if(state.labels!==null){
state.more.textContent=open?state.labels.open:state.labels.shut;
}
}
export function bindReveal(state,more){
state.more=more;
markRevealControl(state,!state.panel.hidden);
more.addEventListener("click",(event)=>{
event.stopPropagation();
const opening=state.panel.hidden;
closeAllReveals(state.doc);
state.panel.hidden=!opening;
markRevealControl(state,opening);
});
}
export function wrapLine(doc,text){
const line=doc.createElement("span");
line.className="reveal__line";
text.replaceWith(line);
line.appendChild(text);
return line;
}
export function createReveal(
doc,
host,
before=host.firstChild,
labels=TOGGLING_LABELS,
){
const panel=doc.createElement("span");
panel.className="reveal__panel";
panel.hidden=true;
host.insertBefore(panel,before);
const state={doc,text:null,line:null,panel,more:null,labels};
revealsOf(doc).push(state);
return state;
}
export function fitReveal(state){
const{doc,text,panel,line}=state;
panel.textContent=text.textContent;
closeAllReveals(doc);
const clipped=text.scrollHeight>text.clientHeight;
if(clipped&&state.more===null){
const more=doc.createElement("button");
more.type="button";
more.className="reveal__more";
line.appendChild(more);
bindReveal(state,more);
}else if(!clipped&&state.more!==null){
state.more.remove();
state.more=null;
}
}
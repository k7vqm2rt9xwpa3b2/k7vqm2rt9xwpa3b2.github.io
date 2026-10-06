import{
activeMode,
forgetMode,
paintChrome,
restoreStoredMode,
setMode,
}from"./mode-state.js";
export{forgetMode,setMode};
function part(document,tag,className){
const element=document.createElement(tag);
element.className=className;
return element;
}
function worded(document,className,words){
const span=part(document,"span",className);
span.textContent=words;
return span;
}
export function buildModeNoteAction(document){
const note=(
document.querySelector(".mode-note")
);
if(!note||note.querySelector(".mode-note__action")){
return null;
}
const{actionLead,actionDark,actionJoiner,actionLight}=note.dataset;
if(
actionLead===undefined||
actionDark===undefined||
actionJoiner===undefined||
actionLight===undefined
){
return null;
}
const lead=document.createElement("span");
lead.id="mode-note-lead";
lead.setAttribute("aria-hidden","true");
lead.textContent=actionLead;
const button=part(document,"button","mode-note__switch");
button.setAttribute("type","button");
button.id="mode-note-switch";
button.setAttribute("aria-labelledby","mode-note-lead mode-note-switch");
button.append(
worded(document,"mode-note__word mode-note__when-light",actionDark),
worded(document,"mode-note__joiner",actionJoiner),
worded(document,"mode-note__word mode-note__when-dark",actionLight),
);
const action=part(document,"span","mode-note__action");
action.id="mode-note-action";
action.append(lead," ",button);
note.append(" ",action,".");
return action;
}
export function buildModeNoteForget(document){
const note=(
document.querySelector(".mode-note")
);
const action=note?.querySelector(".mode-note__action");
if(!note||!action||note.querySelector(".mode-note__forget")){
return null;
}
const{forgetLead,forgetWord}=note.dataset;
if(!forgetLead||!forgetWord){
return null;
}
const lead=document.createElement("span");
lead.id="mode-note-forget-lead";
lead.setAttribute("aria-hidden","true");
lead.textContent=forgetLead;
const button=part(document,"button","mode-note__forget-button");
button.setAttribute("type","button");
button.id="mode-note-forget-button";
button.setAttribute(
"aria-labelledby",
"mode-note-forget-lead mode-note-forget-button",
);
button.append(worded(document,"mode-note__forget-word",forgetWord));
const clause=part(document,"span","mode-note__forget");
clause.id="mode-note-forget";
clause.append(", ",lead," ",button);
action.after(clause);
return clause;
}
function initModeNoteForget(window){
const clause=buildModeNoteForget(window.document);
if(!clause){
return;
}
const document=window.document;
const button=(
clause.querySelector("button")
);
button.addEventListener("click",function(){
const focused=document.activeElement===button;
forgetMode(window);
if(focused){
(
document.getElementById("mode-note-switch")
).focus();
}
});
}
function initModeNote(window){
const action=buildModeNoteAction(window.document);
if(!action){
return;
}
const button=(
action.querySelector("button")
);
button.addEventListener("click",function(){
setMode(window,activeMode(window)==="dark"?"light":"dark");
});
initModeNoteForget(window);
}
export const PRINT_DARK_ATTRIBUTE="data-print-dark";
function saveButton(document,mode,word){
const button=part(document,"button","save-note__save");
button.setAttribute("type","button");
button.id=`save-note-${mode}`;
button.setAttribute("aria-labelledby",`save-note-lead ${button.id}`);
button.append(worded(document,"save-note__word",word));
return button;
}
export function buildSaveNote(document){
const note=(
document.querySelector(".save-note")
);
if(!note||note.hasChildNodes()){
return null;
}
const{saveLead,saveLight,saveDark,saveJoiner}=note.dataset;
if(!saveLead||!saveLight||!saveDark||!saveJoiner){
return null;
}
const lead=document.createElement("span");
lead.id="save-note-lead";
lead.setAttribute("aria-hidden","true");
lead.textContent=saveLead;
const joiner=worded(document,"save-note__joiner",saveJoiner);
joiner.setAttribute("aria-hidden","true");
const pair=part(document,"span","save-note__pair");
pair.append(
saveButton(document,"light",saveLight),
joiner,
saveButton(document,"dark",saveDark),
);
note.append(lead," ",pair);
return note;
}
function initSaveNote(window){
const note=buildSaveNote(window.document);
if(!note){
return;
}
const root=window.document.documentElement;
const[light,dark]=note.querySelectorAll("button");
light.addEventListener("click",function(){
root.removeAttribute(PRINT_DARK_ATTRIBUTE);
window.print();
});
dark.addEventListener("click",function(){
root.setAttribute(PRINT_DARK_ATTRIBUTE,"");
window.print();
});
window.addEventListener("afterprint",function(){
root.removeAttribute(PRINT_DARK_ATTRIBUTE);
});
}
export function initMode(window){
initModeNote(window);
initSaveNote(window);
paintChrome(window);
window.addEventListener("pageshow",function(event){
if(event.persisted){
restoreStoredMode(window);
}
});
}
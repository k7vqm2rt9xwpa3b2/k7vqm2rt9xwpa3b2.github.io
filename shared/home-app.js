const SAVE_ID="save-note-app";
const LEAD_ID="save-note-app-lead";
const MARK_ID="save-note-app-mark";
const TAIL_ID="save-note-app-tail";
const FIRST_SPACE=/\s|$/;
function namingRun(document,id,words){
const span=document.createElement("span");
span.id=id;
span.setAttribute("aria-hidden","true");
span.textContent=words;
return span;
}
function saveButton(document,word){
const button=document.createElement("button");
button.className="save-note__save";
button.setAttribute("type","button");
button.id=SAVE_ID;
button.setAttribute(
"aria-labelledby",
`${LEAD_ID} ${SAVE_ID} ${MARK_ID} ${TAIL_ID}`,
);
const span=document.createElement("span");
span.className="save-note__word";
span.textContent=word;
button.append(span);
return button;
}
export function buildAppLine(document){
const note=(
document.querySelector(".save-note")
);
if(!note||note.hasChildNodes()){
return null;
}
const{appLead,appWord,appTail}=note.dataset;
if(!appLead||!appWord||!appTail){
return null;
}
const cut=appTail.search(FIRST_SPACE);
const kept=document.createElement("span");
kept.className="save-note__pair";
kept.append(
saveButton(document,appWord),
namingRun(document,MARK_ID,appTail.slice(0,cut)),
);
note.append(
namingRun(document,LEAD_ID,appLead),
" ",
kept,
namingRun(document,TAIL_ID,appTail.slice(cut)),
);
return note;
}
export function shareAddress(navigator,url){
return navigator.share({url}).catch(function(error){
if(error.name!=="AbortError"){
throw error;
}
});
}
function shareOnClick(window,element,addressOf){
element.addEventListener("click",function(event){
if(!("share"in window.navigator)){
return;
}
event.preventDefault();
shareAddress(window.navigator,addressOf());
});
}
function pageAddress(window,anchor){
const address=new URL(window.location.href);
address.hash=anchor;
return address.href;
}
export function initHomeApp(window){
const note=buildAppLine(window.document);
if(note){
const save=(
note.querySelector("button")
);
shareOnClick(window,save,()=>pageAddress(window,note.id));
}
const feeds=(
window.document.querySelectorAll('a[href="feed.xml"]')
);
feeds.forEach((link)=>shareOnClick(window,link,()=>link.href));
}
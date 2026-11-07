import{FIRST_SPACE,namingRun}from"./dom-words.js";
const SAVE_ID="save-note-app";
const LEAD_ID="save-note-app-lead";
const MARK_ID="save-note-app-mark";
const TAIL_ID="save-note-app-tail";
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
function appWords(note){
const{appLead,appWord,appTail}=note.dataset;
if(!appLead||!appWord||!appTail){
return null;
}
return{lead:appLead,word:appWord,tail:appTail};
}
export function buildAppLine(document){
const note=(
document.querySelector(".save-note")
);
const words=note&&!note.hasChildNodes()?appWords(note):null;
if(!note||!words){
return null;
}
const cut=words.tail.search(FIRST_SPACE);
const kept=document.createElement("span");
kept.className="save-note__pair";
kept.append(
saveButton(document,words.word),
namingRun(document,MARK_ID,words.tail.slice(0,cut)),
);
note.append(
namingRun(document,LEAD_ID,words.lead),
" ",
kept,
namingRun(document,TAIL_ID,words.tail.slice(cut)),
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
function initAppLine(window){
const note=buildAppLine(window.document);
if(!note){
return null;
}
const save=(note.querySelector("button"));
shareOnClick(window,save,()=>pageAddress(window,note.id));
return save;
}
export function takeOverSaveLine(window){
const note=(
window.document.querySelector(".save-note")
);
if(appWords(note)){
const hadFocus=note.contains(window.document.activeElement);
note.replaceChildren();
const save=(initAppLine(window));
if(hadFocus){
save.focus();
}
}
return shareAddress(window.navigator,pageAddress(window,note.id));
}
export function initHomeApp(window){
initAppLine(window);
const feeds=(
window.document.querySelectorAll('a[href="now/feed.xml"]')
);
feeds.forEach((link)=>shareOnClick(window,link,()=>link.href));
}
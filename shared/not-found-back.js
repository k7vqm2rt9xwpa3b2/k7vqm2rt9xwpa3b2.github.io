const WORDS=Object.freeze({
lead:"data-back-lead",
word:"data-back-word",
tail:"data-back-tail",
});
const BUTTON_ID="not-found-back-button";
const LEAD_ID="not-found-back-lead";
const MARK_ID="not-found-back-mark";
const TAIL_ID="not-found-back-tail";
const FIRST_SPACE=/\s|$/;
function wordOn(carrier,name){
const word=carrier.getAttribute(name);
if(word===null){
throw new Error(`not-found-back.js: the carrier has no ${name}`);
}
return word;
}
function backWordsOn(carrier){
return{
lead:wordOn(carrier,WORDS.lead),
word:wordOn(carrier,WORDS.word),
tail:wordOn(carrier,WORDS.tail),
};
}
function namingRun(document,id,words){
const span=document.createElement("span");
span.id=id;
span.setAttribute("aria-hidden","true");
span.textContent=words;
return span;
}
function backButton(view,word){
const document=view.document;
const button=document.createElement("button");
button.className="not-found__back-button";
button.setAttribute("type","button");
button.id=BUTTON_ID;
button.setAttribute(
"aria-labelledby",
`${LEAD_ID} ${BUTTON_ID} ${MARK_ID} ${TAIL_ID}`,
);
const span=document.createElement("span");
span.className="not-found__back-word";
span.textContent=word;
button.append(span);
button.addEventListener("click",function(){
view.history.back();
});
return button;
}
function buildWayBack(view,line,words){
const document=view.document;
const cut=words.tail.search(FIRST_SPACE);
const kept=document.createElement("span");
kept.className="not-found__back-kept";
kept.append(
backButton(view,words.word),
namingRun(document,MARK_ID,words.tail.slice(0,cut)),
);
line.replaceChildren(
namingRun(document,LEAD_ID,words.lead),
" ",
kept,
namingRun(document,TAIL_ID,words.tail.slice(cut)),
);
}
export function offerWayBack(view){
if(view.navigation?.canGoBack!==true){
return;
}
const document=view.document;
const words=backWordsOn(
(document.getElementById("not-found-words")),
);
buildWayBack(
view,
(document.getElementById("not-found-back")),
words,
);
}
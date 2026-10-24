const HEADING="h1, h2, h3, h4, h5, h6";
function headingOf(panel){
let node=panel.previousElementSibling;
while(node&&!node.matches(HEADING)){
node=node.previousElementSibling;
}
if(!node){
throw new Error(
`disclosure.js: the panel #${panel.id} has no heading before it`,
);
}
return node;
}
function createControl(doc,panel){
const control=doc.createElement("button");
control.type="button";
control.className="reveal__more disclosure__more";
control.setAttribute("aria-controls",panel.id);
control.setAttribute("aria-expanded","false");
return control;
}
function buildBesideControl(doc,panel,heading){
const control=createControl(doc,panel);
control.textContent=`\n ${panel.dataset.disclosureLabel}\n`;
const link=heading.querySelector(":scope > a");
for(const node of[
doc.createTextNode(" "),
control,
doc.createTextNode(" "),
]){
heading.insertBefore(node,link);
}
return control;
}
function buildNameControl(doc,panel,heading){
if(heading.querySelector("a, button")){
throw new Error(
`disclosure.js: the panel #${panel.id} names a heading that holds a link or button`,
);
}
const name=doc.createElement("span");
name.className="disclosure__name";
name.append(...heading.childNodes);
const word=doc.createElement("span");
word.className="disclosure__word";
word.textContent=String(panel.dataset.disclosureLabel);
const control=createControl(doc,panel);
control.append(name,"\n ",word,"\n");
heading.append(control);
return control;
}
function buildControl(doc,panel){
const heading=headingOf(panel);
return panel.hasAttribute("data-disclosure-name")
?buildNameControl(doc,panel,heading)
:buildBesideControl(doc,panel,heading);
}
export function initDisclosures(doc){
for(const panel of(
doc.querySelectorAll(".disclosure__panel[data-disclosure-label]")
)){
const control=buildControl(doc,panel);
control.addEventListener("click",()=>{
const opening=panel.hidden;
panel.hidden=!opening;
control.setAttribute("aria-expanded",String(opening));
});
}
}
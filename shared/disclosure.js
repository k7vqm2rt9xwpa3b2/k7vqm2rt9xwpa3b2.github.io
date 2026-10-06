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
function buildControl(doc,panel){
const control=doc.createElement("button");
control.type="button";
control.className="reveal__more disclosure__more";
control.setAttribute("aria-controls",panel.id);
control.setAttribute("aria-expanded","false");
control.textContent=`\n ${panel.dataset.disclosureLabel}\n`;
const heading=headingOf(panel);
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
export const PAPER_ID_SUFFIX="-paper";
export const PAPER_SRC="data-paper-src";
export function buildPaperCopy(doc,dialog){
const copy=doc.createElement("div");
copy.className="magic-word-paper";
copy.hidden=true;
copy.append(...[...dialog.children].map((child)=>child.cloneNode(true)));
for(const element of copy.querySelectorAll(`[${PAPER_SRC}]`)){
element.setAttribute(
"src",
(element.getAttribute(PAPER_SRC)),
);
}
renameIdsWithin(copy,PAPER_ID_SUFFIX);
return copy;
}
export function renameIdsWithin(root,suffix){
const renamed=new Set();
for(const element of root.querySelectorAll("[id]")){
renamed.add(element.id);
element.id+=suffix;
}
for(const element of root.querySelectorAll("*")){
for(const attribute of element.attributes){
const repointed=repointValue(attribute.value,renamed,suffix);
if(repointed!==attribute.value){
attribute.value=repointed;
}
}
}
}
function repointValue(value,renamed,suffix){
if(value.startsWith("#")&&renamed.has(value.slice(1))){
return`${value}${suffix}`;
}
let repointed=value;
for(const id of renamed){
repointed=repointed.replaceAll(`url(#${id})`,`url(#${id}${suffix})`);
}
return repointed;
}
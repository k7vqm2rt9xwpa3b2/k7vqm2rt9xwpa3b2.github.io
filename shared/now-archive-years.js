import{buildChevron}from"./now-pager-controls.js";
const MIN_YEARS=2;
const ROW_CLASS="archive__years";
const PLACEHOLDER_TEXT="Year";
function buildPicker(doc,links,withPlaceholder){
const wrapper=doc.createElement("nav");
wrapper.className=ROW_CLASS;
const field=doc.createElement("span");
field.className="archive__year-field";
const select=doc.createElement("select");
select.className="archive__year-picker";
select.setAttribute("aria-label","Year");
if(withPlaceholder){
const placeholder=doc.createElement("option");
placeholder.textContent=PLACEHOLDER_TEXT;
placeholder.disabled=true;
select.append(placeholder);
}
links.forEach((link)=>{
const option=doc.createElement("option");
option.textContent=link.textContent;
select.append(option);
});
const glyph=buildChevron(doc,"prev");
glyph.classList.add("archive__year-glyph");
field.append(select,glyph);
wrapper.append(field);
return{wrapper,select};
}
function currentIndexOf(links){
return links.findIndex(
(link)=>link.getAttribute("aria-current")==="page",
);
}
export function initArchiveYears(window){
const doc=window.document;
const row=doc.querySelector(`.${ROW_CLASS}`);
if(row===null){
return;
}
const links=[...row.querySelectorAll("a")];
if(links.length<MIN_YEARS){
return;
}
const current=currentIndexOf(links);
const withPlaceholder=current===-1;
const{wrapper,select}=buildPicker(doc,links,withPlaceholder);
const offset=withPlaceholder?1:0;
const opening=current+offset;
select.selectedIndex=opening;
window.addEventListener("pageshow",(event)=>{
if(event.persisted){
select.selectedIndex=opening;
}
});
select.addEventListener("change",()=>{
window.location.href=links[select.selectedIndex-offset].href;
});
row.replaceWith(wrapper);
}
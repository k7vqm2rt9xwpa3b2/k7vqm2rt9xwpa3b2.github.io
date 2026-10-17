const MIN_YEARS=2;
const ROW_CLASS="archive__years";
function buildPicker(doc,links){
const wrapper=doc.createElement("nav");
wrapper.className=ROW_CLASS;
const select=doc.createElement("select");
select.className="archive__year-picker";
select.setAttribute("aria-label","Year");
links.forEach((link)=>{
const option=doc.createElement("option");
option.textContent=link.textContent;
select.append(option);
});
wrapper.append(select);
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
const{wrapper,select}=buildPicker(doc,links);
const current=currentIndexOf(links);
const opening=current===-1?0:current;
select.selectedIndex=opening;
window.addEventListener("pageshow",(event)=>{
if(event.persisted){
select.selectedIndex=opening;
}
});
select.addEventListener("change",()=>{
window.location.href=links[select.selectedIndex].href;
});
row.replaceWith(wrapper);
}
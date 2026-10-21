import{readVisits,visitAddress,visitHref}from"./visit-list.js";
const HISTORY_NUMBER_WIDTH=5;
const HISTORY_GAP="  ";
function panelCarriers(document){
const box=document.getElementById("visit-box");
const list=document.getElementById("visit-list");
const blocked=document.getElementById("visit-blocked");
const empty=document.getElementById("visit-empty");
const site=document.getElementById("visit-site");
if(!box||!list||!blocked||!empty||!site){
return null;
}
const emptyWords=empty.dataset.words;
const siteWords=site.dataset.words;
if(!emptyWords||!siteWords){
return null;
}
return{box,list,blocked,empty,emptyWords,site,siteWords};
}
export const VISIT_ROW_TEXT_MAX=40;
const CUT_MARK="...";
function rowText(visit){
const address=visitAddress(visit);
const text=address==="/"?address:address.slice(1);
return text.length>VISIT_ROW_TEXT_MAX
?`${text.slice(0,VISIT_ROW_TEXT_MAX)}${CUT_MARK}`
:text;
}
function visitRow(document,visit){
const n=(visit.n);
const number=document.createElement("span");
number.className="visit-number";
number.textContent=String(n).padStart(HISTORY_NUMBER_WIDTH);
const link=document.createElement("a");
link.href=visitHref(visit);
link.textContent=rowText(visit);
const row=document.createElement("li");
row.value=n;
row.append(number,HISTORY_GAP,link);
return row;
}
function scrollToNewestOnOpen(document,panel){
const view=document.defaultView;
if(!view){
return;
}
const observer=new view.MutationObserver(()=>{
if(!panel.box.hidden){
panel.list.scrollTop=panel.list.scrollHeight;
}
});
observer.observe(panel.box,{
attributes:true,
attributeFilter:["hidden"],
});
}
export function initVisitPanel(document,storageWindow,now){
const panel=panelCarriers(document);
if(!panel){
return;
}
const visits=readVisits(storageWindow,now);
if(visits===null){
return;
}
panel.list.replaceChildren(
...visits.map((visit)=>visitRow(document,visit)),
);
panel.blocked.hidden=true;
if(visits.length===0){
panel.empty.textContent=panel.emptyWords;
}else{
panel.site.textContent=panel.siteWords;
scrollToNewestOnOpen(document,panel);
}
}
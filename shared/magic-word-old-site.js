import{svgElement}from"./svg.js";
export const OLD_PAGE_WINDOW=640;
export const TITLE_CENTER_X=320;
export const TITLE_BASELINE_Y=261;
const NO_BREAK=String.fromCharCode(0xa0);
const OLD_GAP=NO_BREAK+" "+NO_BREAK;
export function drawOldSite(doc,name,status){
const svg=(
svgElement(doc,"svg",{
class:"old-site",
viewBox:`0 0 ${OLD_PAGE_WINDOW} ${OLD_PAGE_WINDOW}`,
role:"img",
"aria-label":`${name} ${status}`,
})
);
const page=svgElement(doc,"rect",{
class:"old-site__page",
width:OLD_PAGE_WINDOW,
height:OLD_PAGE_WINDOW,
});
const title=svgElement(doc,"text",{
class:"old-site__title",
x:TITLE_CENTER_X,
y:TITLE_BASELINE_Y,
"text-anchor":"middle",
});
const first=svgElement(doc,"tspan",{class:"old-site__name"});
first.textContent=name;
const second=svgElement(doc,"tspan",{class:"old-site__status"});
second.textContent=status;
title.append(first,OLD_GAP,second);
const frame=svgElement(doc,"rect",{
class:"old-site__frame",
x:0,
y:0,
width:OLD_PAGE_WINDOW,
height:OLD_PAGE_WINDOW,
});
svg.append(page,title,frame);
return svg;
}
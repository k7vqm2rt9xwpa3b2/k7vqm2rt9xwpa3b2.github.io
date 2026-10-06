const SVG_NS="http://www.w3.org/2000/svg";
export const ARROW_TRACED_AT=23.385;
export const ARROW_WIDTH=12.4;
export const ARROW_HEIGHT=11.81;
export const ARROW_CENTER_X=6.56;
export const ARROW_CENTER_Y=5.97;
export const ARROW_OUTER_RADIUS=5.84;
export const ARROW_ARC_FROM=-45;
export const ARROW_ARC_TO=225;
export const ARROW_HEAD_X=5.625;
export const ARROW_HEAD_Y=0;
export const ARROW_HEAD_ARM_END=5.625;
export const ARROW_STROKE=1.56;
const PLACES=3;
function figure(value){
return value.toFixed(PLACES);
}
function ringPoint(degrees){
const radius=ARROW_OUTER_RADIUS-ARROW_STROKE/2;
const angle=(degrees*Math.PI)/180;
return(
figure(ARROW_CENTER_X+radius*Math.cos(angle))+
" "+
figure(ARROW_CENTER_Y+radius*Math.sin(angle))
);
}
function arrowPaths(){
const radius=figure(ARROW_OUTER_RADIUS-ARROW_STROKE/2);
const cornerX=figure(ARROW_HEAD_X-ARROW_STROKE/2);
const cornerY=figure(ARROW_HEAD_Y+ARROW_STROKE/2);
const corner=cornerX+" "+cornerY;
const ring=
`M${ringPoint(ARROW_ARC_FROM)} `+
`A${radius} ${radius} 0 1 1 ${ringPoint(ARROW_ARC_TO)} `+
`L${corner}`;
const head=`M0 ${cornerY} L${corner} L${cornerX} ${figure(ARROW_HEAD_ARM_END)}`;
return[ring,head];
}
function inEm(px){
return figure(px/ARROW_TRACED_AT)+"em";
}
export function drawRefreshArrow(doc,button){
if(!button||button.querySelector("svg.crossword__arrow")){
return;
}
const svg=doc.createElementNS(SVG_NS,"svg");
svg.setAttribute("class","crossword__arrow");
svg.setAttribute("aria-hidden","true");
svg.setAttribute("viewBox",`0 0 ${ARROW_WIDTH} ${ARROW_HEIGHT}`);
svg.setAttribute("width",inEm(ARROW_WIDTH));
svg.setAttribute("height",inEm(ARROW_HEIGHT));
for(const d of arrowPaths()){
const path=doc.createElementNS(SVG_NS,"path");
path.setAttribute("d",d);
path.setAttribute("fill","none");
path.setAttribute("stroke","currentColor");
path.setAttribute("stroke-width",String(ARROW_STROKE));
path.setAttribute("stroke-linejoin","miter");
path.setAttribute("stroke-linecap","butt");
svg.append(path);
}
button.append(svg);
}
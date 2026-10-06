export const CELL=10;
export const NUMBER_INSET=0.5;
export const NUMBER_BASELINE=2.5;
export const NUMBER_FONT_SIZE=3;
const DIGIT_ADVANCE_EM=0.5;
const INK_LEFT_EM=0.045;
const INK_RIGHT_EM=0.032;
const INK_CAP_EM=0.66;
const INK_DESCENT_EM=0.014;
export const RING_INSET=0.25;
export const RING_CLEARANCE=0.5;
export function numberPlace(x0,y0){
return{x:x0+NUMBER_INSET,y:y0+NUMBER_BASELINE};
}
export function numberInk(x0,y0,digits){
const{x:start,y:baseline}=numberPlace(x0,y0);
return{
left:start+INK_LEFT_EM*NUMBER_FONT_SIZE,
top:baseline-INK_CAP_EM*NUMBER_FONT_SIZE,
right:
start+(digits*DIGIT_ADVANCE_EM-INK_RIGHT_EM)*NUMBER_FONT_SIZE,
bottom:baseline+INK_DESCENT_EM*NUMBER_FONT_SIZE,
};
}
export function ringPath(x0,y0,cell,digits){
const cx=x0+cell/2;
const cy=y0+cell/2;
const r=cell/2-RING_INSET;
const arc=`A ${r} ${r} 0 1 1`;
if(digits===0){
return`M ${cx-r} ${cy} ${arc} ${cx+r} ${cy} ${arc} ${cx-r} ${cy} Z`;
}
const ink=numberInk(x0,y0,digits);
const[upperX,upperY]=upperEnd(cx,cy,r,ink);
const[lowerX,lowerY]=lowerEnd(cx,cy,r,ink);
return`M ${upperX} ${upperY} ${arc} ${lowerX} ${lowerY}`;
}
function lowerEnd(cx,cy,r,ink){
const y=ink.bottom+RING_CLEARANCE;
return[cx-Math.sqrt(r*r-(cy-y)**2),y];
}
const TOO_WIDE=
"crossword-ring.js: a clue number too wide to break the ring around";
function upperEnd(cx,cy,r,ink){
const x=ink.right+RING_CLEARANCE;
const reach=r*r-(cx-x)**2;
if(reach<0){
throw new Error(TOO_WIDE);
}
const y=cy-Math.sqrt(reach);
if(y>=ink.top){
return[x,y];
}
return aroundCorner(cx,cy,r,ink.right,ink.top);
}
function aroundCorner(cx,cy,r,px,py){
const dx=px-cx;
const dy=py-cy;
const d=Math.hypot(dx,dy);
const q=RING_CLEARANCE;
if(d<r-q){
throw new Error(TOO_WIDE);
}
const along=(r*r-q*q+d*d)/(2*d);
const across=Math.sqrt(r*r-along*along);
return[
cx+(along*dx-across*dy)/d,
cy+(along*dy+across*dx)/d,
];
}
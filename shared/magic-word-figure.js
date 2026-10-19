import{
BADGE,
BADGE_DEFINITIONS,
PAPER,
scaledAbout,
}from"./magic-word-badge.js";
import{FACE}from"./magic-word-face.js";
import{svgElement}from"./svg.js";
export const ELBOW=Object.freeze({x:146,y:142});
const CHIN=Object.freeze({x:68,y:104});
const HEAD_SCALE=1.07;
const WRIST=Object.freeze({x:147,y:112});
const HAND_SCALE=0.92;
const TORSO=
"M2 164 C2 128 16 106 46 100 L68 110 L90 100 C110 104 120 114 124 130 L128 164";
const SHIRT_FRONT=
"M46 100 L68 110 L90 100 C95 120 97 142 98 164 L38 164 C40 142 42 120 46 100 Z";
const PRINT=Object.freeze({
top:106,
bottom:166,
row:9,
left:36,
right:102,
column:10,
halfDrop:5,
});
function diamondPrint(){
const diamonds=[];
for(let row=0;PRINT.top+row*PRINT.row<PRINT.bottom;row+=1){
const y=PRINT.top+row*PRINT.row;
const drop=row%2===1?PRINT.halfDrop:0;
for(let x=PRINT.left;x<PRINT.right;x+=PRINT.column){
diamonds.push([
"use",
{
href:"#magic-word-diamond",
transform:`translate(${x+drop} ${y})`,
},
]);
}
}
return diamonds;
}
const BODY=[
["path",{class:"magic-word__jacket",stroke:"none",d:`${TORSO} Z`}],
["path",{class:"magic-word__shirt",stroke:"none",d:SHIRT_FRONT}],
[
"g",
{
"clip-path":"url(#magic-word-front)",
class:"magic-word__print",
stroke:"none",
},
diamondPrint(),
],
["path",{d:TORSO}],
[
"path",
{
d:"M46 100 C42 118 40 140 38 164 M90 100 C95 120 97 142 98 164",
"stroke-width":2,
},
],
[
"path",
{
class:"magic-word__jacket",
d:"M46 100 L36 106 L44 128 L47 112 Z M90 100 L100 106 L93 128 L89 112 Z",
"stroke-width":1.8,
},
],
[
"path",
{
class:"magic-word__shirt",
d:"M50 101 L56 116 L68 110 L80 116 L86 101",
"stroke-width":1.8,
},
],
...BADGE,
];
const CAN_HAND=[
[
"rect",
{
class:"magic-word__can",
x:23.5,
y:130,
width:14,
height:25,
rx:2.5,
"stroke-width":2,
},
],
["path",{d:"M24 134 H37","stroke-width":1.2}],
[
"path",
{
class:"magic-word__jacket",
d:"M3 138 C9 133 17 131 22 133 C25 139 26 147 24.5 153 C18 156 10 158 6 158 Z",
"stroke-width":2,
},
],
[
"path",
{
class:PAPER,
"stroke-width":1.8,
d:"M20 140 C17.5 146 18.5 153 24 155.8 L34.5 155.8 C37.5 155.8 39 153.5 37.8 151.5 C39.4 149.6 38.8 147 36.8 146.3 C38.6 144.6 38 141.6 35.4 141 L25 139.8 Z",
},
],
[
"path",
{
d:"M26 146.2 C29.5 146.8 33 146.8 36.8 146.3 M26 151.2 C29.5 151.8 33 151.8 37.8 151.5",
"stroke-width":1.1,
},
],
];
const UPPER_ARM=
"M106 110 C118 106 128 110 136 118 C143 125 150 131 154 137 C157 143 153 149 146.5 149 C140 149 130 143.5 120 137.5 C114 134 110 130 108 124 Z";
const HAND=[
[
"path",
{
class:PAPER,
d:"M129.5 97 C128.5 88 133 83.5 139.5 83.5 L155.5 83.5 C162 83.5 165 88.5 165 95 L165 102 C165 109 160.5 113.5 154 113.5 L139.5 113.5 C133.5 113.5 129.5 108.5 129.5 97 Z",
},
],
[
"path",
{
"stroke-width":1.6,
d:"M144.5 91.5 C150.5 90.5 157.5 90.5 164.9 91.8 M144.5 98.5 C150.5 97.5 157.5 97.5 164.9 98.6 M144.5 105.5 C150.5 104.5 157 104.5 163.5 105.6",
},
],
[
"path",
{
class:PAPER,
"stroke-width":1.8,
d:"M130.5 99.5 C135 94.5 142.5 94.5 147.5 98 C150.5 100.5 149 104.5 144.5 104.5 L135.5 105.5",
},
],
[
"path",
{class:PAPER,d:"M133 89 L133 61 C133 53.5 144 53.5 144 61 L144 86"},
],
[
"path",
{d:"M135.3 62.5 C135.8 58.2 141.2 58.2 141.7 62.5","stroke-width":1.2},
],
[
"path",
{d:"M133.5 73.5 C137 74.6 140 74.6 143.5 73.5","stroke-width":1.1},
],
];
const FOREARM=[
[
"path",
{
class:"magic-word__jacket",
d:`M${ELBOW.x} ${ELBOW.y} C138.5 142 137 137.5 137.6 132 C138.4 124 139 117 139 110 L155 110 C155.5 117 157.5 124 156 132 C155 138 153 142 ${ELBOW.x} ${ELBOW.y} Z`,
},
],
[
"path",
{d:"M139.2 114.5 C145 116 150 116 155.3 114.5","stroke-width":1.4},
],
["g",{transform:scaledAbout(WRIST,HAND_SCALE)},HAND],
];
const DEFINITIONS=[
["clipPath",{id:"magic-word-front"},[["path",{d:SHIRT_FRONT}]]],
["path",{id:"magic-word-diamond",d:"M0 -2.6 L2.4 0 L0 2.6 L-2.4 0 Z"}],
...BADGE_DEFINITIONS,
];
export function drawFigure(doc){
const svg=(
build(doc,[
"svg",
{
class:"magic-word__figure",
viewBox:"0 0 176 164",
"aria-hidden":"true",
},
[
["defs",{},DEFINITIONS],
[
"g",
{
fill:"none",
stroke:"currentColor",
"stroke-width":2.4,
"stroke-linecap":"round",
"stroke-linejoin":"round",
},
[
...BODY,
...CAN_HAND,
[
"g",
{
class:"magic-word__head",
transform:scaledAbout(CHIN,HEAD_SCALE),
},
FACE,
],
["path",{class:"magic-word__jacket",d:UPPER_ARM}],
["g",{class:"magic-word__arm"},FOREARM],
],
],
],
])
);
const arm=(
svg.querySelector(".magic-word__arm")
);
arm.style.transformOrigin=`${ELBOW.x}px ${ELBOW.y}px`;
return svg;
}
function build(doc,[tag,attributes,parts=[]]){
const element=svgElement(doc,tag,attributes);
element.append(...parts.map((part)=>build(doc,part)));
return element;
}
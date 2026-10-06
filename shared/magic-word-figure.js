const SVG_NS="http://www.w3.org/2000/svg";
export const ELBOW=Object.freeze({x:146,y:142});
const TORSO=
"M8 164 C10 128 26 108 54 102 L68 116 L82 102 C100 105 112 112 118 124 L122 164";
const PAPER="magic-word__paper";
const LEAVES=[
[18,132,-20],
[88,124,15],
[34,156,10],
[96,152,-35],
[58,142,160],
[104,120,60],
];
const FLOWERS=[
[30,120,1],
[100,136,1],
[52,156,1],
[80,154,0.8],
[18,152,0.8],
[44,134,0.7],
];
const SHIRT=[
["path",{class:"magic-word__shirt",stroke:"none",d:`${TORSO} Z`}],
[
"g",
{"clip-path":"url(#magic-word-torso)","stroke-width":1.4},
[
[
"g",
{class:"magic-word__leaf"},
LEAVES.map(([x,y,turn])=>[
"use",
{
href:"#magic-word-leaf",
transform:`translate(${x} ${y}) rotate(${turn})`,
},
]),
],
[
"g",
{class:"magic-word__flower"},
FLOWERS.map(([x,y,scale])=>[
"use",
{
href:"#magic-word-flower",
transform:`translate(${x} ${y})${scale===1?"":` scale(${scale})`}`,
},
]),
],
],
],
["path",{d:TORSO}],
["path",{class:PAPER,d:"M54 102 L60 122 L68 116 L76 122 L82 102"}],
["path",{d:"M68 116 V164","stroke-width":1.6}],
["circle",{cx:68,cy:130,r:1.4}],
["circle",{cx:68,cy:146,r:1.4}],
];
const HEAD=[
["path",{d:"M59 102 V95 M77 102 V95"}],
[
"path",
{
class:PAPER,
d:"M42 66 C42 48 54 40 68 40 C82 40 94 48 94 66 C94 84 84 96 68 96 C52 96 42 84 42 66 Z",
},
],
["path",{d:"M59 99 C64 102 72 102 77 99","stroke-width":1.8}],
[
"path",
{
d:"M42 66 C38 66 37 74 42 76 M94 66 C98 66 99 74 94 76",
"stroke-width":2,
},
],
[
"path",
{
class:"magic-word__hair",
"stroke-width":1.6,
d:"M41 66 C38 46 50 34 68 33 C88 32 99 44 96 64 C94 57 91 52 86 49 C80 52 71 52 63 49 C57 47 55 44 55 44 C51 50 46 56 44 66 Z",
},
],
["rect",{class:PAPER,x:50,y:61,width:15,height:11,rx:3}],
["rect",{class:PAPER,x:71,y:61,width:15,height:11,rx:3}],
["path",{d:"M65 66 H71 M50 64 L44 63 M86 64 L92 63"}],
["circle",{cx:58,cy:67,r:1.5,fill:"currentColor",stroke:"none"}],
["circle",{cx:79,cy:67,r:1.5,fill:"currentColor",stroke:"none"}],
[
"path",
{
class:PAPER,
"stroke-width":2,
d:"M56 80 C62 82 74 82 82 78 C80 87 74 91 68 91 C61 91 57 86 56 80 Z",
},
],
["path",{d:"M57 82.5 C63 84 73 84 81 80.5","stroke-width":1.2}],
[
"path",
{d:"M63 81.6 V84.3 M69 81.8 V84.4 M75 81 V83.8","stroke-width":1},
],
];
const FOREARM=[
["path",{d:`M${ELBOW.x} ${ELBOW.y} L148 108`}],
[
"path",
{
class:PAPER,
d:"M136 98 C135 90 138 86 144 86 L158 86 C163 86 165 90 165 95 L165 102 C165 107 161 110 156 110 L144 110 C139 110 136 106 136 98 Z",
},
],
[
"path",
{
"stroke-width":1.6,
d:"M147 92 C152 91 158 91 165 92 M147 98 C152 97 158 97 165 98 M147 104 C152 103 158 103 164 104",
},
],
[
"path",
{
class:PAPER,
"stroke-width":1.8,
d:"M137 99 C141 95 147 95 151 98 C153 100 152 103 148 103 L140 104",
},
],
[
"path",
{class:PAPER,d:"M138 90 L138 62 C138 57 146 57 146 62 L146 87"},
],
["path",{d:"M139.6 64 C140 60.6 144 60.6 144.4 64","stroke-width":1.2}],
["path",{d:"M138 74 H146","stroke-width":1.1}],
];
const DEFINITIONS=[
["clipPath",{id:"magic-word-torso"},[["path",{d:`${TORSO} Z`}]]],
[
"g",
{id:"magic-word-flower"},
[
[0,-4.2],
[4,-1.3],
[2.5,3.4],
[-2.5,3.4],
[-4,-1.3],
].map(([cx,cy])=>["circle",{cx,cy,r:3}]),
],
[
"path",
{id:"magic-word-leaf",d:"M0 0 C4 -6 12 -7 16 -4 C12 0 5 2 0 0 Z"},
],
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
...SHIRT,
...HEAD,
[
"path",
{
class:"magic-word__shirt",
d:"M110 114 L128 110 L134 128 L118 134 Z",
},
],
["path",{d:`M130 130 L${ELBOW.x} ${ELBOW.y}`}],
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
const element=doc.createElementNS(SVG_NS,tag);
for(const[name,value]of Object.entries(attributes)){
element.setAttribute(name,String(value));
}
element.append(...parts.map((part)=>build(doc,part)));
return(element);
}
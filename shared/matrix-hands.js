import{
besideSpine,
limbRing,
smoothPath,
spinePoint,
widthAt,
}from"./matrix-hands-outline.js";
import{
CREASES,
CUFF,
FINGERS,
FINGER_JOINTS,
FINGER_SAMPLES,
FOLD,
HOLLOW,
PAD,
PALM_EDGE,
PALM_RING,
SLEEVE,
SLEEVE_FOLD,
THUMB,
THUMB_INNER,
THUMB_JOINTS,
THUMB_OUTER,
THUMB_SAMPLES,
THUMB_SPINE,
WEB,
fingerProfile,
fingerSpine,
}from"./matrix-hands-shape.js";
import{SQUARE}from"./not-found-screen.js";
import{svgElement}from"./svg.js";
export const MATRIX_HANDS_SHEET="/shared/matrix-hands.css";
export const MIRROR=`matrix(-1 0 0 1 ${SQUARE} 0)`;
export{CUFF,DIGITS,WRIST_CREASE}from"./matrix-hands-shape.js";
const FINGER_ORDER=Object.freeze([3,0,2,1]);
const FADE_DEPTH=CUFF-6;
export const FADE_FILL="url(#matrix-hands-fade)";
const FADE_GRADIENT=[
"linearGradient",
{id:"matrix-hands-fade",x1:0,y1:0,x2:0,y2:1},
[
[
"stop",
{class:"matrix-hands__fade-stop",offset:0,"stop-opacity":1},
],
[
"stop",
{class:"matrix-hands__fade-stop",offset:1,"stop-opacity":0},
],
],
];
const PILL=Object.freeze({
x:59,
y:94,
length:24,
radius:5.2,
angle:16,
shadow:Object.freeze({x:1.2,y:3.4}),
shine:0.45,
});
const CREASE_SPAN=0.5;
const CREASE_BOW=0.012;
const ROUND_END=1.33;
function creasesAcross(spine,profile,joints){
return joints
.map((along)=>{
const half=widthAt(profile,along)*CREASE_SPAN;
return smoothPath(
[
besideSpine(spine,along,half),
spinePoint(spine,along+CREASE_BOW),
besideSpine(spine,along,-half),
],
false,
);
})
.join(" ");
}
function fingerPart(finger){
const spine=fingerSpine(finger);
const profile=fingerProfile(finger);
const ring=limbRing({
spine,
near:profile,
far:profile,
samples:FINGER_SAMPLES,
end:PAD,
});
return[
"g",
{"data-digit":finger.name},
[
["path",{class:"matrix-hands__skin",d:smoothPath(ring,true)}],
[
"path",
{
class:"matrix-hands__crease",
d:creasesAcross(spine,profile,FINGER_JOINTS),
},
],
],
];
}
function thumbPart(){
const ring=limbRing({
spine:THUMB_SPINE,
near:THUMB_OUTER,
far:THUMB_INNER,
samples:THUMB_SAMPLES,
end:PAD,
});
const hidden=THUMB_SAMPLES.filter((at)=>at<WEB).length;
const folded=THUMB_SAMPLES.filter((at)=>at<FOLD).length;
return[
"g",
{"data-digit":THUMB.name},
[
[
"path",
{
class:"matrix-hands__skin",
stroke:"none",
d:smoothPath(ring,true),
},
],
["path",{d:smoothPath(ring.slice(0,ring.length-hidden),false)}],
[
"path",
{
class:"matrix-hands__crease",
d:smoothPath(
ring.slice(ring.length-hidden-1,ring.length-folded),
false,
),
},
],
[
"path",
{
class:"matrix-hands__crease",
d:creasesAcross(THUMB_SPINE,THUMB_INNER,THUMB_JOINTS),
},
],
],
];
}
function pillPart(color){
const run=PILL.length/2-PILL.radius;
const r=PILL.radius;
const handle=r*ROUND_END;
const capsule=`M${-run} ${-r} L${run} ${-r} C${run+handle} ${-r} ${run+handle} ${r} ${run} ${r} L${-run} ${r} C${-run-handle} ${r} ${-run-handle} ${-r} ${-run} ${-r} Z`;
const shine=-r*PILL.shine;
return[
"g",
{
class:`matrix-hands__pill matrix-hands__pill--${color}`,
transform:`translate(${PILL.x} ${PILL.y}) rotate(${PILL.angle})`,
},
[
[
"path",
{
class:"matrix-hands__shadow",
stroke:"none",
transform:`translate(${PILL.shadow.x} ${PILL.shadow.y})`,
d:capsule,
},
],
["path",{class:"matrix-hands__capsule",d:capsule}],
[
"path",
{
class:"matrix-hands__shine",
d:`M${-run+1} ${shine} C${-run/3} ${shine-1.2} ${run/3} ${shine-1.2} ${run-1} ${shine}`,
},
],
],
];
}
function handPart(side,pill){
const mirrored=side==="right"?{transform:MIRROR}:{};
return[
"g",
{class:"matrix-hands__hand","data-hand":side,...mirrored},
[
...FINGER_ORDER.map((at)=>fingerPart(FINGERS[at])),
[
"path",
{
class:"matrix-hands__skin",
stroke:"none",
d:smoothPath(PALM_RING,true),
},
],
["path",{d:smoothPath(PALM_EDGE,false)}],
thumbPart(),
[
"path",
{
class:"matrix-hands__hollow",
stroke:"none",
d:smoothPath(HOLLOW,true),
},
],
[
"path",
{
class:"matrix-hands__crease",
d:CREASES.map((line)=>smoothPath(line,false)).join(" "),
},
],
pillPart(pill),
["path",{class:"matrix-hands__sleeve",d:SLEEVE}],
["path",{class:"matrix-hands__sleeve-fold",d:SLEEVE_FOLD}],
],
];
}
export function drawMatrixHands(doc){
return(
build(doc,[
"svg",
{class:"matrix-hands",viewBox:`0 0 ${SQUARE} ${SQUARE}`},
[
[
"rect",
{class:"matrix-hands__panel",width:SQUARE,height:SQUARE},
],
[
"g",
{
fill:"none",
stroke:"currentColor",
"stroke-width":2,
"stroke-linecap":"round",
"stroke-linejoin":"round",
},
[handPart("left","red"),handPart("right","blue")],
],
["defs",{},[FADE_GRADIENT]],
["rect",{fill:FADE_FILL,width:SQUARE,height:FADE_DEPTH}],
],
])
);
}
function build(doc,[tag,attributes,parts=[]]){
const element=svgElement(doc,tag,attributes);
element.append(...parts.map((part)=>build(doc,part)));
return element;
}
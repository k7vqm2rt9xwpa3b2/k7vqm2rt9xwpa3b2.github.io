import{widthAt}from"./matrix-hands-outline.js";
export const CUFF=34;
export const WRIST_CREASE=56;
export const FINGERS=Object.freeze([
{
name:"index",
base:{x:38,y:119},
tip:{x:36.5,y:167},
width:17,
bow:0.8,
},
{
name:"middle",
base:{x:52,y:122},
tip:{x:51.5,y:176},
width:17.5,
bow:-1,
},
{
name:"ring",
base:{x:66,y:120},
tip:{x:66.3,y:170},
width:16.5,
bow:1.2,
},
{
name:"little",
base:{x:79.5,y:115},
tip:{x:77.2,y:155.9},
width:14.5,
bow:-0.3,
},
]);
export const THUMB_OUTER=Object.freeze(
([
[0,7.5],
[0.35,10.5],
[0.55,12],
[0.72,10.6],
[0.86,9.4],
[1,8.4],
]),
);
export const THUMB_INNER=Object.freeze(
([
[0,9.5],
[0.55,9.8],
[0.8,8.8],
[1,8.4],
]),
);
export const THUMB=Object.freeze({
name:"thumb",
base:{x:46,y:24},
tip:{x:24,y:142},
width:Math.max(
...[...THUMB_OUTER,...THUMB_INNER].map(
([at])=>widthAt(THUMB_OUTER,at)+widthAt(THUMB_INNER,at),
),
),
bow:0,
});
export const THUMB_SPINE=Object.freeze([
THUMB.base,
{x:42,y:62},
{x:13,y:92},
THUMB.tip,
]);
export const THUMB_SAMPLES=Object.freeze([
0,0.15,0.3,0.4,0.52,0.62,0.72,0.84,1,
]);
export const WEB=0.62;
export const FOLD=0.4;
export const THUMB_JOINTS=Object.freeze([0.86]);
const FINGER_PROFILE=Object.freeze(
([
[0,1],
[0.2,1],
[0.42,0.94],
[0.56,0.94],
[0.72,0.9],
[0.86,0.92],
[1,0.86],
]),
);
const ROOT_HIDDEN=-0.1;
export const FINGER_SAMPLES=Object.freeze([
ROOT_HIDDEN,
...FINGER_PROFILE.map(([at])=>at),
]);
export const PAD=1.15;
export const FINGER_JOINTS=Object.freeze([0.1,0.42,0.72]);
export const PALM_RING=Object.freeze([
{x:39,y:20},
{x:38,y:44},
{x:30,y:76},
{x:30,y:104},
{x:34,y:121},
{x:44,y:126.5},
{x:59,y:126.5},
{x:72,y:123},
{x:82,y:119},
{x:87,y:112},
{x:90.5,y:96},
{x:88.5,y:76},
{x:81,y:58},
{x:75,y:44},
{x:74.5,y:20},
]);
export const PALM_EDGE=Object.freeze([
{x:86.4,y:121},
...PALM_RING.slice(9),
]);
export const CREASES=Object.freeze([
[
{x:88,y:103},
{x:75,y:104},
{x:62,y:108},
{x:51,y:115},
],
[
{x:33,y:99},
{x:45,y:95},
{x:60,y:94},
{x:76,y:97},
],
[
{x:44,y:WRIST_CREASE+1},
{x:57,y:WRIST_CREASE-1},
{x:70,y:WRIST_CREASE+1.5},
],
]);
export const HOLLOW=Object.freeze([
{x:40,y:92},
{x:56,y:76},
{x:78,y:82},
{x:80,y:102},
{x:60,y:113},
{x:42,y:106},
]);
export const SLEEVE=`M20 -4 L21 ${CUFF} C38 ${CUFF+7} 72 ${CUFF+7} 92 ${CUFF-2} L94 -4 Z`;
export const SLEEVE_FOLD=`M30 ${CUFF-9} C46 ${CUFF-4} 66 ${CUFF-4} 84 ${CUFF-11}`;
export const DIGITS=Object.freeze([THUMB,...FINGERS]);
export function fingerSpine({base,tip,bow}){
const length=Math.hypot(tip.x-base.x,tip.y-base.y);
const aside={
x:(-(tip.y-base.y)/length)*bow,
y:((tip.x-base.x)/length)*bow,
};
const along=(share)=>({
x:base.x+(tip.x-base.x)*share+aside.x,
y:base.y+(tip.y-base.y)*share+aside.y,
});
return[base,along(1/3),along(2/3),tip];
}
export function fingerProfile({width}){
return FINGER_PROFILE.map(([at,share])=>[at,(share*width)/2]);
}
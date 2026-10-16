export const PAPER="magic-word__paper";
export const INK=Object.freeze({fill:"currentColor",stroke:"none"});
const BADGE_CENTER=Object.freeze({x:68,y:123.5});
const BADGE_SCALE=0.75;
const WINDOW=Object.freeze({x:54.5,y:126.5,width:27,height:19});
const WINDOW_CLIP="magic-word-badge-window";
export function scaledAbout(point,scale){
return`translate(${point.x} ${point.y}) scale(${scale}) translate(${-point.x} ${-point.y})`;
}
const SKELETON=[
[
"path",
{
d:"M0.48 20.49 L2.17 17.13 L3.9 14.24 L5.98 11.78 L8.42 9.71 L11.32 8.17 L10.28 6.23 L7.18 7.89 L4.42 10.22 L2.1 12.96 L0.23 16.07 L-1.48 19.51 Z",
},
],
[
"path",
{
d:"M0.33 19.79 L3.5 20.95 L1.34 17.77 Z M2.04 16.46 L5.09 17.9 L3.08 14.73 Z M3.86 13.58 L6.63 15.5 L5.11 12.1 Z M6.05 11.12 L8.46 13.47 L7.52 9.88 Z M8.64 9.08 L10.5 11.89 L10.38 8.16 Z M-0.82 19.19 L-2.84 17.75 L0.21 17.13 Z M0.9 15.84 L-1.01 14.26 L2.02 13.97 Z M2.8 12.84 L1.16 10.98 L4.19 11.2 Z M5.13 10.22 L3.82 8.11 L6.78 8.82 Z M7.86 8.04 L7.01 5.71 L9.72 7.04 Z",
},
],
[
"g",
{transform:"translate(0 -1.2) rotate(14 12 7)"},
[
[
"path",
{
"fill-rule":"evenodd",
d:"M10.4 5 C11.6 2.2 15 0.8 18.2 1.4 C21 1.9 23.8 4.2 25.6 7.4 C26.4 8.8 26.1 10.2 24.9 10.8 C21.4 9.9 17.6 8.8 15 8.6 C13.8 8.6 13 9.2 12.4 10.2 L10.9 9.2 C10 7.9 9.9 6.4 10.4 5 Z M15.2 3.3 C16.5 3.1 17.3 4 17 5 C16.6 6 15.1 6 14.6 5.2 C14.1 4.4 14.4 3.5 15.2 3.3 Z M19.4 4.6 C20.8 4.2 22.6 5 22.9 6 C23 6.9 21.7 7.2 20.5 6.9 C19.2 6.5 18.6 5 19.4 4.6 Z",
},
],
[
"path",
{
d:"M15.46 8.66 L15.14 11.45 L15.98 8.77 Z M16.51 8.88 L16.18 11.67 L17.03 8.99 Z M17.55 9.1 L17.23 11.89 L18.07 9.21 Z M18.59 9.32 L18.27 12.12 L19.12 9.43 Z M19.64 9.54 L19.32 12.34 L20.16 9.66 Z M20.68 9.77 L20.36 12.56 L21.21 9.88 Z M21.73 9.99 L21.41 12.78 L22.25 10.1 Z M22.77 10.21 L22.45 13.01 L23.29 10.32 Z M23.82 10.43 L23.5 13.23 L24.34 10.54 Z",
},
],
[
"g",
{transform:"rotate(-12 12.6 10.6)"},
[
[
"path",
{
d:"M12.6 10 C15.4 11.8 18.4 14.1 21 16.4 C21.8 17.1 21.5 18.1 20.6 18.1 C17.8 17.6 14.4 15.1 12 12.6 C11.4 11.6 11.7 10.6 12.6 10 Z",
},
],
[
"path",
{
d:"M14.04 11.28 L15.83 9.36 L14.53 11.64 Z M15.01 11.99 L16.8 10.08 L15.5 12.35 Z M15.99 12.71 L17.77 10.79 L16.47 13.06 Z M16.96 13.42 L18.74 11.51 L17.44 13.78 Z M17.93 14.14 L19.71 12.22 L18.41 14.49 Z M18.9 14.85 L20.68 12.93 L19.39 15.21 Z M19.87 15.56 L21.65 13.65 L20.36 15.92 Z",
},
],
],
],
],
],
[
"path",
{
fill:"none",
stroke:"currentColor",
"stroke-width":0.85,
d:"M5.6 12.6 L8.6 12.2 L11 13.6 M11 13.6 C12 13.2 12.8 13.8 12.5 14.8 M11 13.6 C11.4 14.4 11.2 15.3 10.5 15.7 M4.8 15 L7.8 15.2 L10 17 M10 17 C11 16.8 11.6 17.5 11.2 18.4 M10 17 C10.2 17.8 9.8 18.6 9.1 18.9",
},
],
];
function windowRect(attributes={}){
return["rect",{...WINDOW,...attributes}];
}
export const BADGE_DEFINITIONS=[
["clipPath",{id:WINDOW_CLIP},[windowRect()]],
];
export const BADGE=[
["path",{d:"M58 104 L61 124 M78 104 L75 124","stroke-width":1.1}],
[
"g",
{
class:"magic-word__badge",
transform:scaledAbout(BADGE_CENTER,BADGE_SCALE),
},
[
[
"rect",
{
class:PAPER,
x:52,
y:123.5,
width:32,
height:34,
rx:2,
"stroke-width":1.6,
},
],
windowRect({class:"magic-word__jacket","stroke-width":1}),
[
"g",
{"clip-path":`url(#${WINDOW_CLIP})`},
[
[
"g",
{
class:"magic-word__skeleton",
transform:"translate(55.5 126.5)",
...INK,
},
SKELETON,
],
],
],
windowRect({"stroke-width":1}),
["path",{d:"M54.5 149.5 H81.5 M54.5 153.5 H72","stroke-width":1}],
],
],
];
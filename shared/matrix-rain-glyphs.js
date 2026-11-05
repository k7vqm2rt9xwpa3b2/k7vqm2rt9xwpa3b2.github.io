import{svgElement}from"./svg.js";
export const GLYPH_WIDTH=8;
export const GLYPH_HEIGHT=10;
const KATAKANA=Object.freeze([
"M1 1.5 H7 Q 6.5 3.5 5 4.5 M4 3 Q 4 7.5 1.5 9.5",
"M6.5 1 Q 4.5 4 1 6 M4.5 3.8 V9.5",
"M4 0.5 V2 M1.5 2.5 V4.5 M1.5 2.5 H6.5 Q 6.5 7 3 9.5",
"M1 3 H7 M5 0.5 V9.5 Q 4.2 9.6 3.5 9 M5 3.5 Q 3.5 6.5 1 8",
"M1 3 H6.5 Q 6.8 8 5 9.5 Q 4.2 9.5 3.6 9 M3.8 0.8 Q 3.6 6 1 9.3",
"M1.5 3 H6.5 M1 6 H7 M3.5 0.8 L4.8 9.5",
"M1.5 2 H6.5 V8.5 H1.5",
"M1 3.5 H7 M2.5 1 V6 M5.5 1 V5.5 Q 5.5 8 3 9.5",
"M1.5 1.5 L3 2.5 M1 4.5 L2.5 5.5 M1.5 9 Q 5 7.5 7 2",
"M1.5 2 L2.8 4.5 M6.5 1.5 Q 6 6.5 2 9.5",
"M3.5 0.8 Q 2.5 3 1 4 M3 2.5 H6.5 Q 6 7 2 9.5 M2.5 5 L5.8 6.8",
"M1 2 L2 4 M3.5 1.5 L4.5 3.5 M7 1.5 Q 6.5 6.5 2.5 9.5",
"M2 1.5 H6 M1 4 H7 M4 4 Q 4 7.5 2 9.5",
"M3 0.8 V9.5 M3 4 L6.5 6",
"M1 3 H7 M4 0.8 V9.5 Q 3.5 9.5 3 9 M2.2 5 L1 7.5 M5.8 5 L7 7.5",
"M2 1.5 L6 2.5 M2 4.5 L6 5.5 M1.5 7.5 L6.5 9",
"M6.5 1 Q 5 6 1.5 9.5 M2 3.5 L6.5 8.5",
"M1.5 1.5 H6.5 V9 H1.5 M1.5 5.2 H6.5",
"M2 1.5 V6 M6 1 V5.5 Q 6 8.5 3 9.5",
"M1.5 4 V1.8 H6.5 Q 6.5 7 2.5 9.5",
]);
const UNMIRRORED=Object.freeze([
"M4 1 Q 7 1 7 5 Q 7 9.5 4 9.5 Q 1 9.5 1 5 Q 1 1 4 1 Z",
"M2.5 2.5 L4.5 1 V9.5 M2.5 9.5 H6.5",
"M1.5 3 Q 1.8 1 4 1 Q 6.5 1 6.5 3.2 Q 6.5 5 1.5 9.5 H7",
"M6.5 1 H2 L1.6 4.8 Q 3 4 4.5 4.2 Q 7 4.6 6.8 7 Q 6.5 9.5 3.8 9.5 Q 2 9.5 1.2 8.3",
"M1.5 1.2 H6.8 Q 4 5 3.5 9.5",
"M6.5 4 Q 6.5 1 4 1 Q 1.5 1 1.5 3.5 Q 1.5 6 4 6 Q 6 6 6.5 4 Q 6.5 8.5 3 9.5",
"M1.5 1.5 H6.5 L1.5 9 H6.5",
]);
export const GLYPHS=Object.freeze([
...KATAKANA.map((path)=>Object.freeze({path,mirrored:true})),
...UNMIRRORED.map((path)=>Object.freeze({path,mirrored:false})),
]);
const MIRROR=`matrix(-1 0 0 1 ${GLYPH_WIDTH} 0)`;
function glyphId(index){
return`matrix-rain-glyph-${index}`;
}
export function glyphAddress(index){
return`#${glyphId(index)}`;
}
export function drawGlyphs(doc){
const defs=svgElement(doc,"defs");
GLYPHS.forEach(({path,mirrored},index)=>{
const shape=svgElement(doc,"path",{id:glyphId(index),d:path});
if(mirrored){
shape.setAttribute("transform",MIRROR);
}
defs.append(shape);
});
return defs;
}
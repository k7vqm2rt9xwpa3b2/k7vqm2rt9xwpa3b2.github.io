const SVG_NS="http://www.w3.org/2000/svg";
const CAP=24;
const GAP=2.2;
const MARGIN=3.5;
const LAYERS=Object.freeze([
Object.freeze({name:"magic-word__letter-ink",width:5.6,inline:false}),
Object.freeze({
name:"magic-word__letter-inline",
width:0.8,
inline:true,
}),
]);
function glyph(width,d,inline=d){
return Object.freeze({width,d,inline});
}
export const GLYPHS=Object.freeze({
A:glyph(
19,
"M2 24 L8 1.2 H11 L17 24 M5.3 16.5 H13.7",
"M2.55 21.9 L8 1.2 H11 L16.45 21.9 M5.3 16.5 H13.7",
),
H:glyph(
15,
"M2.5 9 V24 M12.5 9 V24 M2.5 16 H12.5",
"M2.5 11.2 V21.8 M12.5 11.2 V21.8 M2.5 16 H12.5",
),
"!":glyph(
7,
"M3.5 1.2 V16.8 M3.5 19.8 V24",
"M3.5 3.4 V14.6 M3.5 21.2 V22.6",
),
" ":glyph(7,""),
});
function placeGlyphs(glyphs){
let pen=0;
const placed=glyphs.map((glyph)=>{
const at=pen;
pen+=glyph.width+GAP;
return{glyph,at};
});
return{placed,end:pen};
}
function drawLayer(doc,layer,placed){
const group=(doc.createElementNS(SVG_NS,"g"));
group.setAttribute("class",layer.name);
group.setAttribute("fill","none");
group.setAttribute("stroke-width",String(layer.width));
group.setAttribute("stroke-linejoin","miter");
for(const{glyph,at}of placed){
if(glyph.d===""){
continue;
}
const path=doc.createElementNS(SVG_NS,"path");
path.setAttribute("d",layer.inline?glyph.inline:glyph.d);
path.setAttribute("transform",`translate(${at} 0)`);
group.append(path);
}
return group;
}
export function drawLettering(doc,words){
const chars=[...words.toUpperCase()];
if(
chars.length===0||
!chars.every((char)=>Object.hasOwn(GLYPHS,char))
){
return null;
}
const{placed,end}=placeGlyphs(chars.map((char)=>GLYPHS[char]));
const width=end-GAP;
const svg=(doc.createElementNS(SVG_NS,"svg"));
svg.setAttribute("class","magic-word__lettering");
svg.setAttribute(
"viewBox",
`${-MARGIN} ${-MARGIN} ${width+2*MARGIN} ${CAP+2*MARGIN}`,
);
svg.setAttribute("aria-hidden","true");
svg.append(...LAYERS.map((layer)=>drawLayer(doc,layer,placed)));
return svg;
}
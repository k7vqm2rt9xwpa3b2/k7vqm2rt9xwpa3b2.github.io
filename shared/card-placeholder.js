const SVG_NS="http://www.w3.org/2000/svg";
const inkLine=(width)=>({
fill:"none",
stroke:"var(--ink-muted)",
"stroke-width":width,
});
const hairLine=(width)=>({
fill:"none",
stroke:"var(--hairline)",
"stroke-width":width,
});
export const ALBUM_MARK=[
["circle",{cx:50,cy:50,r:36,...inkLine(1.6)}],
["circle",{cx:50,cy:50,r:32.5,...hairLine(0.8)}],
["circle",{cx:50,cy:50,r:29.5,...hairLine(0.8)}],
["circle",{cx:50,cy:50,r:26.5,...hairLine(0.8)}],
["circle",{cx:50,cy:50,r:23.5,...hairLine(0.8)}],
["circle",{cx:50,cy:50,r:13,...inkLine(1.6)}],
["circle",{cx:50,cy:50,r:2.6,fill:"var(--ink-muted)"}],
];
export const FILM_MARK=[
["rect",{x:18,y:20,width:64,height:60,...inkLine(1.5)}],
["line",{x1:30,y1:20,x2:30,y2:80,...hairLine(1)}],
["line",{x1:70,y1:20,x2:70,y2:80,...hairLine(1)}],
["rect",{x:21.5,y:26,width:5,height:7,...hairLine(1)}],
["rect",{x:21.5,y:46.5,width:5,height:7,...hairLine(1)}],
["rect",{x:21.5,y:67,width:5,height:7,...hairLine(1)}],
["rect",{x:73.5,y:26,width:5,height:7,...hairLine(1)}],
["rect",{x:73.5,y:46.5,width:5,height:7,...hairLine(1)}],
["rect",{x:73.5,y:67,width:5,height:7,...hairLine(1)}],
];
const BOOK_COVER=
"M50 30 C 42 25, 28 24, 20 26 L20 74 C28 72, 42 73, 50 78 "+
"C58 73, 72 72, 80 74 L80 26 C72 24, 58 25, 50 30 Z";
export const BOOK_MARK=[
["path",{d:BOOK_COVER,...inkLine(1.5),"stroke-linejoin":"round"}],
["line",{x1:50,y1:30,x2:50,y2:78,...inkLine(1.5)}],
["line",{x1:25,y1:38,x2:45,y2:38,...hairLine(0.8)}],
["line",{x1:25,y1:48,x2:45,y2:48,...hairLine(0.8)}],
["line",{x1:55,y1:39,x2:75,y2:39,...hairLine(0.8)}],
["line",{x1:55,y1:49,x2:75,y2:49,...hairLine(0.8)}],
];
function buildMark(doc,mark,label){
const svg=doc.createElementNS(SVG_NS,"svg");
svg.setAttribute("viewBox","0 0 100 100");
svg.setAttribute("class","card__cover");
svg.setAttribute("role","img");
svg.setAttribute("aria-label",label);
mark.forEach(function([tag,attributes]){
const shape=doc.createElementNS(SVG_NS,tag);
Object.entries(attributes).forEach(function([name,value]){
shape.setAttribute(name,String(value));
});
svg.appendChild(shape);
});
return svg;
}
export function buildPlaceholderCard(doc,source){
const li=doc.createElement("li");
li.className="card";
li.id=source.id;
const label=doc.createElement("p");
label.className="card__label";
label.textContent=source.label;
li.appendChild(label);
li.appendChild(buildMark(doc,source.mark,source.markLabel));
const title=doc.createElement("p");
title.className="card__title";
title.textContent="Coming soon";
li.appendChild(title);
return li;
}
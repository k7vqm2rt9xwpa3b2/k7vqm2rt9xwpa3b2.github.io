export const SVG_NS="http://www.w3.org/2000/svg";
export function svgElement(doc,name,attributes={}){
const element=doc.createElementNS(SVG_NS,name);
for(const[key,value]of Object.entries(attributes)){
element.setAttribute(key,String(value));
}
return element;
}
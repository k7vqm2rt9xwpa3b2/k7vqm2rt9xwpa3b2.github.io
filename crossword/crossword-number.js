import{CELL,NUMBER_FONT_SIZE,numberPlace}from"./crossword-ring.js";
import{elementFor}from"./crossword-settings.js";
const SVG_NS="http://www.w3.org/2000/svg";
function cornerText(doc,button){
const drawn=button.querySelector("svg.crossword__number > text");
if(drawn){
return drawn;
}
const svg=doc.createElementNS(SVG_NS,"svg");
svg.setAttribute("class","crossword__number");
svg.setAttribute("aria-hidden","true");
svg.setAttribute("viewBox",[0,0,CELL,CELL].join(" "));
const text=doc.createElementNS(SVG_NS,"text");
const{x,y}=numberPlace(0,0);
text.setAttribute("class","cw-number");
text.setAttribute("x",String(x));
text.setAttribute("y",String(y));
text.setAttribute("font-size",String(NUMBER_FONT_SIZE));
svg.append(text);
button.append(svg);
return text;
}
export function settlePuzzleNumber(doc,button,index){
const digits=index===null?"":String(index+1);
if(button){
cornerText(doc,button).textContent=digits;
}
const status=elementFor(doc,"status");
if(status){
const words=status.dataset.words;
status.hidden=false;
status.textContent=digits&&words?words+" "+digits:digits;
}
}
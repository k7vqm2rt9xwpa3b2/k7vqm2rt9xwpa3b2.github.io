import{svgElement}from"./svg.js";
export const DIALOG_WIDTH=320;
export const DIALOG_HEIGHT=168;
export const TEXT_SIZE=12;
export const LABEL_SIZE=11;
export const AVERAGE_ADVANCE=0.6;
const BAR_INSET=6;
const BAR_HEIGHT=26;
const TITLE_MARGIN=8;
const BUTTON_WIDTH=120;
const BUTTON_HEIGHT=32;
const BUTTON_TOP=118;
const LABEL_MARGIN=8;
const MESSAGE_MARGIN=16;
const MESSAGE_LINE_SPACING=TEXT_SIZE*1.5;
const MESSAGE_MIDDLE=(BAR_INSET+BAR_HEIGHT+BUTTON_TOP)/2;
const ENTER="Enter";
const SPACE=" ";
const BEVEL_INSET=1;
export function drawHintedDialog(doc,words){
const{title,message,button}=words;
const svg=(
svgElement(doc,"svg",{
class:"hinted-dialog",
viewBox:`0 0 ${DIALOG_WIDTH} ${DIALOG_HEIGHT}`,
role:"img",
"aria-label":[title,message,button].join(" "),
})
);
const box={x:0,y:0,width:DIALOG_WIDTH,height:DIALOG_HEIGHT};
svg.append(
svgElement(doc,"rect",{class:"hinted-dialog__box",...box}),
...drawBevel(doc,box),
...drawTitleBar(doc,title),
...drawMessage(doc,message),
drawButton(doc,button),
);
for(const part of svg.children){
part.setAttribute("aria-hidden","true");
}
return svg;
}
export function offerClose(drawing,close){
drawing.setAttribute("role","button");
drawing.setAttribute("tabindex","0");
let spaceArmed=false;
drawing.addEventListener("click",close);
drawing.addEventListener("keydown",(event)=>{
if(event.key!==ENTER&&event.key!==SPACE){
return;
}
event.preventDefault();
if(event.repeat){
return;
}
if(event.key===ENTER){
close(event);
}else{
spaceArmed=true;
}
});
drawing.addEventListener("keyup",(event)=>{
if(event.key===SPACE&&spaceArmed){
spaceArmed=false;
close(event);
}
});
drawing.addEventListener("blur",()=>{
spaceArmed=false;
});
}
function drawTitleBar(doc,title){
const width=DIALOG_WIDTH-2*BAR_INSET;
const bar=svgElement(doc,"rect",{
class:"hinted-dialog__bar",
x:BAR_INSET,
y:BAR_INSET,
width,
height:BAR_HEIGHT,
});
const words=drawLine(doc,title,{
class:"hinted-dialog__title",
x:DIALOG_WIDTH/2,
y:BAR_INSET+BAR_HEIGHT/2,
room:width-2*TITLE_MARGIN,
size:TEXT_SIZE,
anchor:"middle",
});
return[bar,words];
}
function drawMessage(doc,message){
const room=DIALOG_WIDTH-2*MESSAGE_MARGIN;
const lines=breakIntoLines(message,room,TEXT_SIZE);
const first=
MESSAGE_MIDDLE-((lines.length-1)*MESSAGE_LINE_SPACING)/2;
return lines.map((line,index)=>
drawLine(doc,line,{
class:"hinted-dialog__message",
x:DIALOG_WIDTH/2,
y:first+index*MESSAGE_LINE_SPACING,
room,
size:TEXT_SIZE,
anchor:"middle",
}),
);
}
export function breakIntoLines(words,room,size){
if(estimatedWidth(words,size)<=room){
return[words];
}
const parts=words.split(" ");
let best=[words];
let bestLongest=Infinity;
for(let at=1;at<parts.length;at+=1){
const lines=[parts.slice(0,at),parts.slice(at)].map((part)=>
part.join(" "),
);
const longest=Math.max(...lines.map((line)=>[...line].length));
if(longest<bestLongest){
best=lines;
bestLongest=longest;
}
}
return best;
}
function estimatedWidth(words,size){
return[...words].length*size*AVERAGE_ADVANCE;
}
function drawButton(doc,label){
const face={
x:(DIALOG_WIDTH-BUTTON_WIDTH)/2,
y:BUTTON_TOP,
width:BUTTON_WIDTH,
height:BUTTON_HEIGHT,
};
const group=svgElement(doc,"g",{class:"hinted-dialog__push"});
group.append(
svgElement(doc,"rect",{class:"hinted-dialog__button",...face}),
...drawBevel(doc,face),
drawLine(doc,label,{
class:"hinted-dialog__label",
x:face.x+BUTTON_WIDTH/2,
y:face.y+BUTTON_HEIGHT/2,
room:BUTTON_WIDTH-2*LABEL_MARGIN,
size:LABEL_SIZE,
anchor:"middle",
}),
);
return group;
}
function drawBevel(doc,{x,y,width,height}){
const left=x+BEVEL_INSET;
const top=y+BEVEL_INSET;
const right=x+width-BEVEL_INSET;
const bottom=y+height-BEVEL_INSET;
return[
svgElement(doc,"polyline",{
class:"hinted-dialog__lit",
points:`${left},${bottom} ${left},${top} ${right},${top}`,
}),
svgElement(doc,"polyline",{
class:"hinted-dialog__shade",
points:`${right},${top} ${right},${bottom} ${left},${bottom}`,
}),
];
}
function drawLine(doc,words,place){
const text=svgElement(doc,"text",{
class:place.class,
x:place.x,
y:place.y,
"text-anchor":place.anchor,
"dominant-baseline":"central",
});
text.textContent=words;
if(estimatedWidth(words,place.size)>place.room){
text.setAttribute("textLength",String(place.room));
text.setAttribute("lengthAdjust","spacingAndGlyphs");
}
return text;
}
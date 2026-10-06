const SVG_NS="http://www.w3.org/2000/svg";
export const SQUARE=212;
export const FRAME=2;
export const CLIP_ID="nf-screen-clip";
export const LAYOUT=Object.freeze({
bar:Object.freeze({x:46,y:30,width:120,height:14}),
titleBaseline:40,
lineX:14,
lineBaselines:Object.freeze([70,84,98,128]),
promptBaseline:170,
});
const CURSOR="_";
const CURSOR_GAP=" ";
export function drawCrashScreen(doc,words){
const places=LAYOUT.lineBaselines.length;
if(words.lines.length!==places){
throw new Error(
`not-found-screen.js: the screen draws ${places} lines, not ${words.lines.length}`,
);
}
const screen=(
svgElement(doc,"g",{
class:"nf-screen",
"clip-path":`url(#${CLIP_ID})`,
})
);
screen.append(
drawClip(doc),
svgElement(doc,"rect",{
class:"nf-screen__field",
...squareAt(),
}),
svgElement(doc,"rect",{class:"nf-screen__bar",...LAYOUT.bar}),
textOf(doc,words.title,{
class:"nf-screen__title",
x:SQUARE/2,
y:LAYOUT.titleBaseline,
"text-anchor":"middle",
}),
...words.lines.map((line,index)=>
textOf(doc,line,{
class:"nf-screen__line",
x:LAYOUT.lineX,
y:LAYOUT.lineBaselines[index],
}),
),
drawPrompt(doc,words.prompt),
svgElement(doc,"rect",{class:"nf-screen__frame",...frameAt()}),
);
return screen;
}
function squareAt(){
return{x:0,y:0,width:SQUARE,height:SQUARE};
}
function frameAt(){
return{
x:FRAME/2,
y:FRAME/2,
width:SQUARE-FRAME,
height:SQUARE-FRAME,
};
}
function drawClip(doc){
const clip=svgElement(doc,"clipPath",{id:CLIP_ID});
clip.append(svgElement(doc,"rect",squareAt()));
return clip;
}
function drawPrompt(doc,prompt){
const line=textOf(doc,prompt,{
class:"nf-screen__prompt",
x:SQUARE/2,
y:LAYOUT.promptBaseline,
"text-anchor":"middle",
});
const cursor=svgElement(doc,"tspan",{class:"nf-screen__cursor"});
cursor.textContent=CURSOR;
line.append(CURSOR_GAP,cursor);
return line;
}
function textOf(doc,words,attributes){
const text=svgElement(doc,"text",attributes);
text.textContent=words;
return text;
}
function svgElement(doc,name,attributes){
const element=(doc.createElementNS(SVG_NS,name));
for(const[key,value]of Object.entries(attributes)){
element.setAttribute(key,String(value));
}
return element;
}
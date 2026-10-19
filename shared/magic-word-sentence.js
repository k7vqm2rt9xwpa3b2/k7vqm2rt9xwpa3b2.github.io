import{CELL}from"../crossword/crossword-ring.js";
import{svgElement}from"./svg.js";
export const SENTENCE_COLUMNS=9;
const NOT_A_LETTER=/\P{L}/gu;
export function sentenceCells(words){
const cells=[];
for(const word of words.toUpperCase().split(/\s+/)){
const letters=word.replace(NOT_A_LETTER,"");
if(letters){
cells.push(...letters,null);
}
}
if(cells.length===0){
throw new Error("magic-word-sentence.js: the sentence has no letter in it");
}
return cells;
}
function greatestCommonDivisor(a,b){
return b===0?a:greatestCommonDivisor(b,a%b);
}
export function drawSentence(doc,words){
const cells=sentenceCells(words);
const period=
cells.length/greatestCommonDivisor(cells.length,SENTENCE_COLUMNS);
const side=SENTENCE_COLUMNS*CELL;
const svg=(
svgElement(doc,"svg",{
class:"magic-sentence",
viewBox:`0 0 ${side} ${side}`,
role:"img",
"aria-label":words,
})
);
svg.style.setProperty("--magic-rows",String(period));
svg.style.setProperty("--magic-travel",`${-period*CELL}px`);
const rows=svgElement(doc,"g",{class:"magic-sentence__rows"});
for(let row=0;row<period+SENTENCE_COLUMNS;row+=1){
for(let column=0;column<SENTENCE_COLUMNS;column+=1){
const square=cells[(row*SENTENCE_COLUMNS+column)%cells.length];
rows.append(...drawSquare(doc,square,column,row));
}
}
const frame=svgElement(doc,"rect",{
class:"magic-sentence__frame",
x:0,
y:0,
width:side,
height:side,
});
svg.append(rows,frame);
return svg;
}
function drawSquare(doc,letter,column,row){
const at={x:column*CELL,y:row*CELL,width:CELL,height:CELL};
if(letter===null){
return[svgElement(doc,"rect",{class:"magic-sentence__block",...at})];
}
const text=svgElement(doc,"text",{
class:"magic-sentence__letter",
x:at.x+CELL/2,
y:at.y+CELL/2,
});
text.textContent=letter;
return[
svgElement(doc,"rect",{class:"magic-sentence__cell",...at}),
text,
];
}
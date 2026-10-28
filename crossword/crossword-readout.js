import{elementFor}from"./crossword-settings.js";
function restingText(readout){
return readout.dataset.resting??"";
}
export function themeText(key,data){
const theme=data.themes[key];
if(
!theme||
typeof theme.label!=="string"||
typeof theme.summary!=="string"
){
throw new Error("crossword-readout.js: unknown entry theme "+key);
}
return theme.label+": "+theme.summary;
}
export function readoutLines(entry,data){
const lines=[];
const summary=entry.theme?themeText(entry.theme,data):null;
if(entry.clue){
lines.push(clueLine(entry.clue));
}
if(summary){
lines.push(summaryLine(summary));
}
return lines;
}
function clueLine(text){
return{className:"crossword__readout-clue",text:text};
}
function summaryLine(text){
return{className:"crossword__readout-summary",text:text};
}
export function writeReadout(doc,lines){
const readout=elementFor(doc,"readout");
if(!readout){
return;
}
const resting=restingText(readout);
if(lines.length===0){
readout.replaceChildren(doc.createTextNode(resting));
return;
}
readout.replaceChildren(
...lines.map(function(line){
const span=doc.createElement("span");
span.className=line.className;
span.textContent=line.text;
if(line.label){
const label=doc.createElement("strong");
label.className="crossword__theme-label";
label.textContent=line.label;
span.prepend(label);
}
return span;
}),
);
}
export function resetReadout(doc){
writeReadout(doc,[]);
}
export function linkedEntries(block){
return block.entries.filter((entry)=>entry.answer===block.linked);
}
export function spotlightLines(data){
if(!data.circled_clue){
return[];
}
const[linked]=linkedEntries(data);
const lines=[clueLine(data.circled_clue)];
if(linked&&linked.theme){
lines.push(summaryLine(themeText(linked.theme,data)));
}
return lines;
}
const LABEL_END=": ";
export function themeLine(sentence){
const className="crossword__readout-theme";
const end=sentence.indexOf(LABEL_END);
if(end<=0||end+LABEL_END.length===sentence.length){
return{className,text:sentence};
}
return{
className,
label:sentence.slice(0,end+1),
text:sentence.slice(end+1),
};
}
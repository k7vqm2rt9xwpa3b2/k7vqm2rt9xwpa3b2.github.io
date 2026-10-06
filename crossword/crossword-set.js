import{addressReaction,addressedPuzzle}from"./crossword-address.js";
import{drawRefreshArrow}from"./crossword-arrow.js";
import{drawFromDeck}from"./crossword-deck.js";
import{resetReadout,wireDismissal}from"./crossword-interact.js";
import{settlePuzzleNumber}from"./crossword-number.js";
import{
drawnGridStart,
settleExit,
showDrawnGrid,
wayBack,
wireOpener,
}from"./crossword-opener.js";
import{renderGrid}from"./crossword-render.js";
import{
DEFAULT_SETTINGS,
applySettings,
elementFor,
settingsFor,
}from"./crossword-settings.js";
import{initThemeControl}from"./crossword-theme.js";
export async function loadPuzzles(
fetchImpl,
url=DEFAULT_SETTINGS.puzzlesUrl,
){
try{
const response=await fetchImpl(url);
if(!response.ok){
return null;
}
const body=await response.json();
return Array.isArray(body.puzzles)&&body.puzzles.length>0
?body.puzzles
:null;
}catch{
return null;
}
}
export function reopenedPuzzle(
count,
search,
remembered,
queryKey=DEFAULT_SETTINGS.queryKey,
){
const addressed=addressedPuzzle(count,search,queryKey);
if(typeof addressed==="number"){
return addressed;
}
return typeof remembered==="number"&&
Number.isInteger(remembered)&&
remembered>=0&&
remembered<count
?remembered
:null;
}
function rolledPuzzle(count,random){
return Math.floor(random()*count)%count;
}
export function openingPuzzle(
count,
search,
random,
remembered,
queryKey=DEFAULT_SETTINGS.queryKey,
){
const reopened=reopenedPuzzle(count,search,remembered,queryKey);
return reopened===null?rolledPuzzle(count,random):reopened;
}
function show(doc,puzzles,index,showTheme){
const data=renderGrid(doc,puzzles[index]);
resetReadout(doc);
const drawn=data!==null;
showTheme(drawn?puzzles[index].theme:"",drawn);
return data;
}
function stampPuzzleNumber(doc,index){
const{queryKey}=settingsFor(doc);
if(queryKey===null){
return;
}
const view=doc.defaultView;
const url=new URL(view.location.href);
url.searchParams.set(queryKey,String(index+1));
view.history.replaceState(null,"",url.href);
}
function settleStepButton(hero,data){
const{doc,puzzles,button,showTheme,remember}=hero;
const steppable=puzzles.length>1&&data!==null;
button.hidden=data===null;
button.disabled=!steppable;
if(steppable&&!hero.stepWired){
hero.stepWired=true;
button.addEventListener("click",function(){
if(hero.onScreen===null){
return;
}
const dealt=drawFromDeck(
hero.deck,
puzzles.length,
hero.onScreen,
hero.random,
);
hero.deck=dealt.deck;
hero.onScreen=dealt.card;
show(doc,puzzles,hero.onScreen,showTheme);
settlePuzzleNumber(doc,button,hero.onScreen);
remember(hero.onScreen);
stampPuzzleNumber(doc,hero.onScreen);
});
}
}
function drawFirstPuzzle(hero,index){
const{doc,puzzles,button,showTheme,remember}=hero;
const data=show(doc,puzzles,index,showTheme);
hero.onScreen=data===null?null:index;
settlePuzzleNumber(doc,button,hero.onScreen);
hero.deck=null;
remember(index);
const readout=elementFor(doc,"readout");
if(readout){
readout.hidden=data===null;
}
settleExit(hero,data!==null);
if(data!==null&&!hero.dismissalWired){
hero.dismissalWired=true;
wireDismissal(doc);
}
if(button){
settleStepButton(hero,data);
}
return data;
}
function startPuzzle(hero){
const{doc,puzzles,button}=hero;
const index=rolledPuzzle(puzzles.length,hero.random);
drawFirstPuzzle(hero,index);
stampPuzzleNumber(doc,index);
if(button&&!button.disabled){
button.focus();
}
}
export async function renderCrossword(doc,fetchImpl,options){
applySettings(doc,options.settings);
const{puzzlesUrl,queryKey}=settingsFor(doc);
const button=(
elementFor(doc,"next")
);
drawRefreshArrow(doc,button);
const showTheme=initThemeControl(doc);
const puzzles=await loadPuzzles(fetchImpl,puzzlesUrl);
if(!puzzles){
console.warn("crossword-set.js: could not render -- missing "+puzzlesUrl);
if(button){
button.hidden=false;
button.disabled=true;
}
showTheme("",true);
return null;
}
const start=drawnGridStart(doc);
const hero={
doc,
puzzles,
button,
showTheme,
remember:options.remember,
exit:start&&elementFor(doc,"exit"),
random:options.random,
onScreen:null,
deck:null,
stepWired:false,
dismissalWired:false,
};
if(start){
wireOpener(hero,start,function(){
startPuzzle(hero);
});
}
const count=puzzles.length;
const heard=addressReaction(count,options.search,queryKey,options);
const arrival=heard?{search:"",remembered:null}:options;
let data=null;
if(
start&&
reopenedPuzzle(count,arrival.search,arrival.remembered,queryKey)===null
){
showDrawnGrid(hero,start);
}else{
data=drawFirstPuzzle(
hero,
openingPuzzle(
count,
arrival.search,
options.random,
arrival.remembered,
queryKey,
),
);
}
if(heard){
heard(wayBack(hero,start));
}
return data;
}
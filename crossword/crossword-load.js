import{DEFAULT_SETTINGS}from"./crossword-settings.js";
export const PUZZLES_FETCH_TIMEOUT_MS=10000;
function fetchInit(){
if(typeof globalThis.AbortSignal?.timeout!=="function"){
return[];
}
return[{signal:AbortSignal.timeout(PUZZLES_FETCH_TIMEOUT_MS)}];
}
export async function loadPuzzles(
fetchImpl,
url=DEFAULT_SETTINGS.puzzlesUrl,
){
try{
const response=await fetchImpl(url,...fetchInit());
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
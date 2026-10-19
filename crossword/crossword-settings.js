export const DEFAULT_SETTINGS=Object.freeze({
puzzlesUrl:"data/puzzles.json",
queryKey:"puzzle",
ids:Object.freeze({
mount:"crossword-mount",
start:"crossword-start",
exit:"crossword-exit",
next:"crossword-next",
theme:"crossword-theme",
readout:"clue-readout",
status:"crossword-status",
}),
});
const settingsByDocument=new WeakMap();
function record(given,what){
if(given===undefined||given===null){
return{};
}
if(typeof given!=="object"||Array.isArray(given)){
throw new Error("crossword-settings.js: "+what+" must be a record");
}
return{...given};
}
const NULLABLE=Object.freeze(["queryKey"]);
function checkLeaf(fallback,value,name){
const fallbackIsRecord=
fallback!==null&&
typeof fallback==="object"&&
!Array.isArray(fallback);
if(fallbackIsRecord||typeof value===typeof fallback){
return;
}
const nullable=NULLABLE.includes(name);
if(nullable&&value===null){
return;
}
throw new Error(
"crossword-settings.js: setting "+
name+
" must be a "+
typeof fallback+
(nullable?" or null":""),
);
}
function over(defaults,given,prefix){
const merged={...defaults};
for(const[key,value]of Object.entries(given)){
if(!Object.hasOwn(defaults,key)){
throw new Error("crossword-settings.js: unknown setting "+prefix+key);
}
if(value!==undefined){
checkLeaf(defaults[key],value,prefix+key);
merged[key]=value;
}
}
return merged;
}
export function mergeSettings(settings){
const given=record(settings,"settings");
const merged=over(DEFAULT_SETTINGS,given,"");
return Object.freeze({
...merged,
ids:Object.freeze(
over(DEFAULT_SETTINGS.ids,record(given.ids,"ids"),"ids."),
),
});
}
export function applySettings(doc,settings){
settingsByDocument.set(doc,mergeSettings(settings));
}
export function settingsFor(doc){
return settingsByDocument.get(doc)??DEFAULT_SETTINGS;
}
export function elementFor(doc,name){
return doc.getElementById(settingsFor(doc).ids[name]);
}
const STORAGE_KEY="mode";
const OS_DARK="(prefers-color-scheme: dark)";
const SOURCE_ATTRIBUTE="data-mode-source";
const SHIPPED_COLOR_SCHEME="light dark";
function remember(window,mode){
try{
window.localStorage.setItem(STORAGE_KEY,mode);
}catch{
return;
}
}
function unremember(window){
try{
window.localStorage.removeItem(STORAGE_KEY);
}catch{
return;
}
}
function storedMode(window){
let saved;
try{
saved=window.localStorage.getItem(STORAGE_KEY);
}catch{
return null;
}
return saved==="light"||saved==="dark"?saved:null;
}
export function activeMode(window){
const chosen=window.document.documentElement.getAttribute("data-mode");
if(chosen){
return chosen;
}
return window.matchMedia(OS_DARK).matches?"dark":"light";
}
export function paintChrome(window){
const document=window.document;
const chosen=document.documentElement.getAttribute("data-mode");
if(chosen!=="light"&&chosen!=="dark"){
return;
}
const source=document.querySelector(
`meta[name="theme-color"][media="(prefers-color-scheme: ${chosen})"]`,
);
if(!source){
return;
}
let override=document.querySelector(
'meta[name="theme-color"]:not([media])',
);
if(!override){
override=document.createElement("meta");
override.setAttribute("name","theme-color");
document.head.insertBefore(
override,
document.querySelector('meta[name="theme-color"]'),
);
}
override.setAttribute("content",source.getAttribute("content"));
}
function showChoice(window,mode){
const document=window.document;
document.documentElement.setAttribute("data-mode",mode);
document.documentElement.removeAttribute(SOURCE_ATTRIBUTE);
document
.querySelector('meta[name="color-scheme"]')
?.setAttribute("content",mode);
paintChrome(window);
}
export function setMode(window,mode){
remember(window,mode);
showChoice(window,mode);
}
function followDevice(window){
const document=window.document;
if(document.querySelector('meta[name="darkreader-lock"]')){
showChoice(window,"dark");
document.documentElement.setAttribute(SOURCE_ATTRIBUTE,"extension");
return;
}
document.documentElement.removeAttribute("data-mode");
document.documentElement.removeAttribute(SOURCE_ATTRIBUTE);
document
.querySelector('meta[name="color-scheme"]')
?.setAttribute("content",SHIPPED_COLOR_SCHEME);
document.querySelector('meta[name="theme-color"]:not([media])')?.remove();
}
export function forgetMode(window){
unremember(window);
followDevice(window);
}
export function restoreStoredMode(window){
const saved=storedMode(window);
if(!saved){
if(!window.document.documentElement.hasAttribute(SOURCE_ATTRIBUTE)){
followDevice(window);
}
return;
}
showChoice(window,saved);
}
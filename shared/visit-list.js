const STORAGE_KEY="visits";
function emptyLog(){
return{next:1,visits:[]};
}
export const VISIT_LIMIT=50;
export const VISIT_LIFETIME_MS=30*24*60*60*1000;
export const VISIT_NUMBER_MAX=2**31-1;
const PUZZLE_MAX=9999;
const YEAR_MIN=1000;
const YEAR_MAX=9999;
function isIntegerIn(n,min,max){
return Number.isInteger(n)&&n>=min&&n<=max;
}
const PAGES=new Map([
[
"home",
{
accepts:(n)=>n===undefined||isIntegerIn(n,1,PUZZLE_MAX),
address:(n)=>(n===undefined?"/":`/?puzzle=${n}`),
},
],
[
"projects",
{accepts:(n)=>n===undefined,address:()=>"/projects/"},
],
[
"then",
{
accepts:(n)=>isIntegerIn(n,YEAR_MIN,YEAR_MAX),
address:(n)=>`/then/${n}/`,
},
],
[
"not-found",
{accepts:(n)=>n===undefined,address:()=>"/404.html"},
],
]);
function acceptedVisit(candidate){
if(typeof candidate!=="object"||candidate===null){
return null;
}
const page=Object.hasOwn(candidate,"page")?candidate.page:undefined;
const number=Object.hasOwn(candidate,"number")
?candidate.number
:undefined;
const rule=PAGES.get(page);
if(!rule||!rule.accepts(number)){
return null;
}
return number===undefined?{page}:{page,number};
}
function isKept(time,now){
return(
Number.isInteger(time)&&time<=now&&now-time<=VISIT_LIFETIME_MS
);
}
function normalized(visits){
const seen=new Set();
return visits
.filter(({n})=>{
if(seen.has(n)){
return false;
}
seen.add(n);
return true;
})
.sort((a,b)=>a.n-b.n)
.slice(-VISIT_LIMIT);
}
function isCounter(next){
return Number.isInteger(next)&&next>=1&&next<=VISIT_NUMBER_MAX;
}
export function visitAddress(visit){
const rule=PAGES.get(visit.page);
if(!rule){
throw new TypeError("not a recorded page");
}
return rule.address(visit.number);
}
export function visitHref(visit){
return`..${visitAddress(visit)}`;
}
const STATED_YEAR=/^\d{4}$/;
export function yearPageVisit(doc){
const year=
doc.querySelector("main[data-year]")?.getAttribute("data-year")??"";
return STATED_YEAR.test(year)?{page:"then",number:Number(year)}:null;
}
function keptVisit(entry,next,now){
const visit=acceptedVisit(entry);
const time=visit&&Object.hasOwn(entry,"time")?entry.time:undefined;
const n=visit&&Object.hasOwn(entry,"n")?entry.n:undefined;
if(!visit||!isKept(time,now)||!isIntegerIn(n,1,next-1)){
return null;
}
return{...visit,time,n};
}
function parsedJson(raw){
if(typeof raw!=="string"){
return undefined;
}
try{
return JSON.parse(raw);
}catch{
return undefined;
}
}
export function parseVisitLog(raw,now){
const parsed=parsedJson(raw);
if(typeof parsed!=="object"||parsed===null){
return emptyLog();
}
const next=Object.hasOwn(parsed,"next")?parsed.next:undefined;
const entries=Object.hasOwn(parsed,"visits")?parsed.visits:undefined;
if(!isCounter(next)){
return emptyLog();
}
const kept=(Array.isArray(entries)?entries:[])
.map((entry)=>keptVisit(entry,next,now))
.filter((visit)=>visit!==null);
return{next,visits:normalized(kept)};
}
export function withVisit(log,visit,now){
const next=log.next+1;
if(!isCounter(next)){
return null;
}
const fresh={...visit,time:now,n:log.next};
const kept=log.visits.filter((v)=>isKept(v.time,now));
return{next,visits:normalized([...kept,fresh])};
}
export function recordVisit(window,visit,now){
const accepted=acceptedVisit(visit);
if(!accepted){
return false;
}
try{
const storage=window.localStorage;
const log=withVisit(
parseVisitLog(storage.getItem(STORAGE_KEY),now),
accepted,
now,
);
if(!log){
return false;
}
storage.setItem(STORAGE_KEY,JSON.stringify(log));
return true;
}catch{
return false;
}
}
export function readVisits(window,now){
let raw;
try{
raw=window.localStorage.getItem(STORAGE_KEY);
}catch{
return null;
}
return parseVisitLog(raw,now).visits;
}
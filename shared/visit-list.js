const STORAGE_KEY="visits";
function emptyLog(){
return{next:1,visits:[]};
}
export const VISIT_LIMIT=50;
export const VISIT_LIFETIME_MS=30*24*60*60*1000;
export const VISIT_ADDRESS_MAX=200;
const MISSED_PAGE="not-found";
const UNIT=String.raw`(?:[A-Za-z0-9._-]|%[0-9A-Fa-f]{2})`;
const PLAIN_PATH=new RegExp(`^/(?:${UNIT}+/)*${UNIT}*$`);
const DOTS_ONLY_SEGMENT=/(?:^|\/)(?:\.|%2e)+(?:\/|$)/i;
const PLAIN_QUERY=new RegExp(`^(?:\\?(?:${UNIT}|[=&])*)?$`);
const PLAIN_FRAGMENT=new RegExp(`^#(?:${UNIT}|[=&])*$`);
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
const visit=number===undefined?{page}:{page,number};
const fragment=ownField(candidate,"fragment");
return page===MISSED_PAGE
?withPlainMiss(visit,ownField(candidate,"missed"),fragment)
:withPlainFragment(visit,fragment);
}
function ownField(candidate,name){
return Object.hasOwn(candidate,name)?candidate[name]:undefined;
}
function isPlainMissed(missed){
if(typeof missed!=="string"||missed.length>VISIT_ADDRESS_MAX){
return false;
}
const cut=missed.indexOf("?");
const path=cut===-1?missed:missed.slice(0,cut);
const query=cut===-1?"":missed.slice(cut);
return(
PLAIN_PATH.test(path)&&
!DOTS_ONLY_SEGMENT.test(path)&&
PLAIN_QUERY.test(query)
);
}
function isPlainFragment(fragment){
return(
typeof fragment==="string"&&
fragment.length<=VISIT_ADDRESS_MAX&&
PLAIN_FRAGMENT.test(fragment)
);
}
function withPlainMiss(visit,missed,fragment){
const plain=
isPlainMissed(missed)&&
(fragment===undefined||isPlainFragment(fragment))&&
missed.length+(fragment?.length??0)<=VISIT_ADDRESS_MAX;
if(!plain){
return visit;
}
return fragment===undefined
?{...visit,missed}
:{...visit,missed,fragment};
}
function withPlainFragment(visit,fragment){
const fits=
isPlainFragment(fragment)&&
visitAddress(visit).length+fragment.length<=VISIT_ADDRESS_MAX;
return fits?{...visit,fragment}:visit;
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
const base=visit.missed??rule.address(visit.number);
return base+(visit.fragment??"");
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
function addressedVisit(location,visit){
const missed=
visit.page===MISSED_PAGE
?{missed:location.pathname+location.search}
:{};
const fragment=location.hash===""?{}:{fragment:location.hash};
return{...visit,...missed,...fragment};
}
export function recordVisit(window,visit,now){
const named=acceptedVisit(visit);
if(!named){
return false;
}
const accepted=(
acceptedVisit(addressedVisit(window.location,named))
);
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
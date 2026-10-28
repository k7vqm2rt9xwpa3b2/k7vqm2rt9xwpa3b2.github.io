import{OLD_PAGE_WINDOW}from"./magic-word-old-site.js";
export const CASCADE_WINDOW=OLD_PAGE_WINDOW;
export const CARD_WIDTH=64;
export const CARD_HEIGHT=88;
export const PILE_COUNT=4;
export const RANK_COUNT=13;
export const PILE_TOP=24;
export const FLOOR=CASCADE_WINDOW-CARD_HEIGHT;
export const GRAVITY=0.6;
export const BOUNCE=0.8;
const MIN_DRIFT=3;
const MAX_DRIFT=8;
const MAX_TOSS=5;
const SEED=364;
export function pileLeft(pile){
const quarter=CASCADE_WINDOW/PILE_COUNT;
return quarter*pile+(quarter-CARD_WIDTH)/2;
}
export function launchOrder(){
const order=[];
for(let rank=RANK_COUNT-1;rank>=0;rank-=1){
for(let suit=0;suit<PILE_COUNT;suit+=1){
order.push(Object.freeze({rank,suit}));
}
}
return order;
}
export function seededRandom(seed){
let state=seed>>>0;
return()=>{
state=(state+0x6d2b79f5)>>>0;
let mixed=Math.imul(state^(state>>>15),state|1);
mixed^=mixed+Math.imul(mixed^(mixed>>>7),mixed|61);
return((mixed^(mixed>>>14))>>>0)/2**32;
};
}
function toTenth(value){
return Math.round(value*10)/10;
}
function*flightOf({suit},random){
const direction=random()<0.5?-1:1;
const drift=direction*(MIN_DRIFT+random()*(MAX_DRIFT-MIN_DRIFT));
let fall=-random()*MAX_TOSS;
let x=pileLeft(suit);
let y=PILE_TOP;
let launch=true;
while(toTenth(x)>-CARD_WIDTH&&toTenth(x)<CASCADE_WINDOW){
yield{x:toTenth(x),y:toTenth(y),launch};
launch=false;
x+=drift;
fall+=GRAVITY;
y+=fall;
if(y>FLOOR){
y=FLOOR;
fall=-fall*BOUNCE;
}
}
}
export function cascadeStamps(limit){
const random=seededRandom(SEED);
const stamps=[];
for(const card of launchOrder()){
for(const place of flightOf(card,random)){
if(stamps.length>=limit){
return stamps;
}
stamps.push(Object.freeze({...card,...place}));
}
}
return stamps;
}
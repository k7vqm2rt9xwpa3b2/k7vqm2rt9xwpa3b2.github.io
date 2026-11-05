export const COLUMNS=18;
export const ROWS=16;
export const FADES=5;
export const DARK=-1;
export const LEAD=0;
export const LONGEST_STEP=0.1;
const SPEED=Object.freeze({least:5,most:14});
const LENGTH=Object.freeze({least:5,most:13});
const LONGEST_WAIT=0.6;
const MS_PER_SECOND=1000;
export function spawnDrop(random,anywhere){
const length=
LENGTH.least+Math.floor(random()*(LENGTH.most-LENGTH.least+1));
const speed=SPEED.least+random()*(SPEED.most-SPEED.least);
const wait=ROWS*LONGEST_WAIT;
const head=anywhere
?random()*(wait+ROWS+length)-wait
:-random()*wait;
return Object.freeze({head,speed,length});
}
export function fallDrop(drop,seconds,random){
const head=drop.head+drop.speed*seconds;
if(head-drop.length>=ROWS){
return spawnDrop(random,false);
}
return Object.freeze({...drop,head});
}
export function shadeAt(drop,row){
const behind=Math.floor(drop.head)-row;
if(behind<0||behind>=drop.length){
return DARK;
}
if(behind===LEAD){
return LEAD;
}
return 1+Math.floor(((behind-1)*FADES)/(drop.length-1));
}
export function stepSeconds(then,now){
return Math.min(LONGEST_STEP,Math.max(0,(now-then)/MS_PER_SECOND));
}
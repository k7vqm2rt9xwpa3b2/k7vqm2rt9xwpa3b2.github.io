const MIN_CAPPED_SLOTS=3;
const CAP_COUNT=2;
function clamp(value,low,high){
return Math.min(Math.max(value,low),high);
}
function dot(cap,active){
return{cap,active};
}
export function dotCapacity(spare,unit,total){
if(!(unit>0)){
return total;
}
return clamp(Math.floor(spare/unit),1,total);
}
function everyPage(at,total,caps){
return Array.from({length:total},(unused,index)=>
dot(caps&&(index===0||index===total-1),index===at),
);
}
function travelingMiddle(at,total,slots,caps){
const midCount=caps?slots-CAP_COUNT:slots;
const low=caps?1:0;
const high=caps?total-2:total-1;
const marked=clamp(
Math.round(((at-low)/(high-low))*(midCount-1)),
0,
midCount-1,
);
const inMiddle=at>=low&&at<=high;
return Array.from({length:midCount},(unused,index)=>
dot(false,inMiddle&&index===marked),
);
}
export function placeDots(at,total,shown){
const slots=clamp(shown,1,total);
const windowed=slots<total;
const caps=!windowed||slots>=MIN_CAPPED_SLOTS;
if(!windowed){
return everyPage(at,total,caps);
}
const middle=travelingMiddle(at,total,slots,caps);
if(!caps){
return middle;
}
return[dot(true,at===0),...middle,dot(true,at===total-1)];
}
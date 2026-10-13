const MAX_RATING=5;
export function present(value){
return value!==undefined&&value!==null;
}
function clampRating(rating,max){
if(rating<0){
return 0;
}
if(rating>max){
return max;
}
return rating;
}
function bookStars(rating){
const clamped=clampRating(rating,MAX_RATING);
return"★".repeat(clamped)+"☆".repeat(MAX_RATING-clamped);
}
function filmStars(rating){
const clamped=clampRating(rating,MAX_RATING);
const full=Math.trunc(clamped);
const half=clamped-full===0.5?1:0;
return(
"★".repeat(full)+(half?"½":"")+"☆".repeat(MAX_RATING-full-half)
);
}
const FAVORITED_GLYPH="♥";
const PENDING_LABEL="(pending)";
const PENDING_DAYS=7;
const MS_PER_DAY=24*60*60*1000;
function isWithinPendingWindow(added,now){
if(now===null){
return false;
}
const addedAt=Date.parse(added);
if(Number.isNaN(addedAt)){
return false;
}
return now.getTime()-addedAt<PENDING_DAYS*MS_PER_DAY;
}
export function favoritedSignal(record,now){
if(!present(record.tracks)||!present(record.favorited)){
return null;
}
if(record.favorited===0&&isWithinPendingWindow(record.added,now)){
return FAVORITED_GLYPH+" "+PENDING_LABEL;
}
return FAVORITED_GLYPH+" "+record.favorited+"/"+record.tracks;
}
export function favoritedClockInputs(record){
if(record.favorited!==0){
return null;
}
return{added:String(record.added),tracks:String(record.tracks)};
}
export function favoritedGloss(record,now){
if(!present(record.tracks)||!present(record.favorited)){
return null;
}
if(record.favorited===0&&isWithinPendingWindow(record.added,now)){
return"No tracks favorited yet: added within the last week";
}
return record.favorited+" of "+record.tracks+" tracks favorited";
}
function ratedGloss(rating){
const clamped=clampRating(rating,MAX_RATING);
const full=Math.trunc(clamped);
const half=clamped-full===0.5?"½":"";
return"Rated "+full+half+" of "+MAX_RATING;
}
export function filmSignal(record){
return present(record.rating)?filmStars(record.rating):null;
}
export function filmGloss(record){
return present(record.rating)?ratedGloss(record.rating):null;
}
export function bookSignal(record){
return present(record.rating)?bookStars(record.rating):null;
}
export function bookGloss(record){
return present(record.rating)?ratedGloss(record.rating):null;
}
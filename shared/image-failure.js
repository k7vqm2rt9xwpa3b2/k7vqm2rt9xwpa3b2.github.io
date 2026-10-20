export function hasFailed(img){
return img.complete&&img.naturalWidth===0&&img.currentSrc!=="";
}
export function whenImageFails(img,onFail){
if(hasFailed(img)){
onFail();
return;
}
img.addEventListener("error",onFail,{once:true});
}
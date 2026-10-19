export const FIRST_SPACE=/\s|$/;
export function wordOn(carrier,name,carrierName){
const word=carrier.getAttribute(name);
if(word===null){
throw new Error(`${carrierName} has no ${name}`);
}
return word;
}
export function namingRun(document,id,words){
const span=document.createElement("span");
span.id=id;
span.setAttribute("aria-hidden","true");
span.textContent=words;
return span;
}
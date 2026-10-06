const HOST_WORD=/^[a-z]+$/;
const ASCII_LETTERS=/^[A-Za-z]+$/;
export function addressedPuzzle(count,search,queryKey,words=[]){
const misspelled=words.findIndex(
(word)=>typeof word!=="string"||!HOST_WORD.test(word),
);
if(misspelled!==-1){
const word=words[misspelled];
throw new TypeError(
"crossword-address.js: a host's word is lowercase ASCII letters, not "+
(typeof word==="string"?JSON.stringify(word):String(word)),
);
}
if(queryKey===null){
return null;
}
const raw=new URLSearchParams(search).get(queryKey);
if(raw===null||raw===""){
return null;
}
if(/^[1-9][0-9]*$/.test(raw)){
const n=Number(raw);
return n<=count?n-1:"too-large";
}
if(/^-?0+$/.test(raw)){
return"zero";
}
if(/^-[0-9]+$/.test(raw)){
return"negative";
}
return ASCII_LETTERS.test(raw)&&words.includes(raw.toLowerCase())
?"magic-word"
:"not-a-number";
}
export function addressReaction(count,search,queryKey,hooks){
const{magicWords=[],onMagicWord,onMalformedAddress}=hooks;
const addressed=addressedPuzzle(
count,
search,
queryKey,
onMagicWord?magicWords:[],
);
if(onMagicWord&&addressed==="magic-word"){
return onMagicWord;
}
if(typeof addressed==="string"&&onMalformedAddress){
const kind=(addressed);
return(back)=>onMalformedAddress(kind,back);
}
return null;
}
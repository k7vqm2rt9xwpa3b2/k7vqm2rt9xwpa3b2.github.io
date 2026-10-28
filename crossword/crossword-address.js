const HOST_DIGEST=/^[0-9a-f]{64}$/;
const DIGEST_BITS=256;
const HOST_SALT=/^[0-9a-f]{32}$/;
const MAX_ITERATIONS=10_000_000;
const ASCII_LETTERS=/^[A-Za-z]+$/;
const NO_WORD=-1;
function addressValue(search,queryKey){
if(queryKey===null){
return null;
}
const raw=new URLSearchParams(search).get(queryKey);
return raw===""?null:raw;
}
export function addressedPuzzle(count,search,queryKey){
const raw=addressValue(search,queryKey);
if(raw===null){
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
return"not-a-number";
}
function namedValue(value){
return typeof value==="string"?JSON.stringify(value):String(value);
}
function assertHostKey(digests,salt,iterations){
const misspelled=digests.findIndex(
(digest)=>typeof digest!=="string"||!HOST_DIGEST.test(digest),
);
if(misspelled!==-1){
throw new TypeError(
"crossword-address.js: a host's word digest is 64 lowercase hex digits, not "+
namedValue(digests[misspelled]),
);
}
const repeated=digests.findIndex(
(digest,index)=>digests.indexOf(digest)!==index,
);
if(repeated!==-1){
throw new TypeError(
"crossword-address.js: a host's word digests are distinct, not "+
`${namedValue(digests[repeated])} twice`,
);
}
if(typeof salt!=="string"||!HOST_SALT.test(salt)){
throw new TypeError(
"crossword-address.js: a host's word salt is 32 lowercase hex digits, not "+
namedValue(salt),
);
}
if(
!Number.isInteger(iterations)||
(iterations)<1||
(iterations)>MAX_ITERATIONS
){
throw new TypeError(
`crossword-address.js: a host's word iteration count is a whole number from 1 to ${MAX_ITERATIONS}, not `+
namedValue(iterations),
);
}
}
function bytesOfHex(hex){
const bytes=new Uint8Array(hex.length/2);
for(let at=0;at<bytes.length;at+=1){
bytes[at]=Number.parseInt(hex.slice(2*at,2*at+2),16);
}
return bytes;
}
async function hostWordIndex(raw,{digests,salt,iterations},subtle){
if(!ASCII_LETTERS.test(raw)||digests.length===0||!subtle){
return NO_WORD;
}
try{
const word=await subtle.importKey(
"raw",
new TextEncoder().encode(raw.toLowerCase()),
"PBKDF2",
false,
["deriveBits"],
);
const bytes=await subtle.deriveBits(
{name:"PBKDF2",hash:"SHA-256",salt:bytesOfHex(salt),iterations},
word,
DIGEST_BITS,
);
const hex=Array.from(new Uint8Array(bytes),(byte)=>
byte.toString(16).padStart(2,"0"),
).join("");
return digests.indexOf(hex);
}catch{
return NO_WORD;
}
}
export async function addressReaction(
count,
search,
queryKey,
hooks,
subtle=globalThis.crypto?.subtle,
){
const{
magicWordDigests=[],
magicWordSalt,
magicWordIterations,
onMagicWord,
onMalformedAddress,
}=hooks;
if(onMagicWord){
assertHostKey(magicWordDigests,magicWordSalt,magicWordIterations);
}
const addressed=addressedPuzzle(count,search,queryKey);
const index=
onMagicWord&&addressed==="not-a-number"
?await hostWordIndex(
(addressValue(search,queryKey)),
{
digests:magicWordDigests,
salt:(magicWordSalt),
iterations:(magicWordIterations),
},
subtle,
)
:NO_WORD;
if(onMagicWord&&index!==NO_WORD){
return(back)=>onMagicWord(back,index);
}
if(typeof addressed==="string"&&onMalformedAddress){
const kind=addressed;
return(back)=>onMalformedAddress(kind,back);
}
return null;
}
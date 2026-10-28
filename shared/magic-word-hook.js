export const MAGIC_WORD_DIGESTS=Object.freeze([
"84e0c390537323c743cb0ed287d88ce35db122f0a113bd02796e9a75cdff4afc",
"b61e0bf4c8c89cb059807bc1bcdb7b090f049aa4459c97ba9463b30f43f8861c",
]);
export const REWARD_WORD=0;
export const HINTED_WORD=1;
export const MAGIC_WORD_SALT="ec9f044c9c76e3b0c5eb7123a48a34a5";
export const MAGIC_WORD_ITERATIONS=300_000;
export function magicWordHook(win){
let opened=Promise.resolve();
return{
magicWordDigests:MAGIC_WORD_DIGESTS,
magicWordSalt:MAGIC_WORD_SALT,
magicWordIterations:MAGIC_WORD_ITERATIONS,
onMalformedAddress:(_kind,back)=>{
opened=import("./magic-word.js").then(({sayTheMagicWord})=>
sayTheMagicWord(win,back),
);
},
onMagicWord:(back,index)=>{
opened=import("./magic-word.js").then(
({rewardTheMagicWord,rewardTheHintedWord})=>
index===HINTED_WORD
?rewardTheHintedWord(win,back)
:rewardTheMagicWord(win,back),
);
},
opened:()=>opened,
};
}
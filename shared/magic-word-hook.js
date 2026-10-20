export const MAGIC_WORD_DIGESTS=Object.freeze([
"84e0c390537323c743cb0ed287d88ce35db122f0a113bd02796e9a75cdff4afc",
"64f14f0cf437bd860ef2518389872b1af94929e2d49b7b7cdcf4ecb75132fa91",
]);
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
onMagicWord:(back)=>{
opened=import("./magic-word.js").then(({rewardTheMagicWord})=>
rewardTheMagicWord(win,back),
);
},
opened:()=>opened,
};
}
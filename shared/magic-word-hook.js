export const MAGIC_WORDS=Object.freeze(["please","original"]);
export function magicWordHook(win){
let opened=Promise.resolve();
return{
magicWords:MAGIC_WORDS,
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
function shuffled(cards,random){
const deck=[...cards];
for(let i=deck.length-1;i>0;i--){
const j=Math.floor(random()*(i+1))%(i+1);
[deck[i],deck[j]]=[deck[j],deck[i]];
}
return deck;
}
function freshLap(count,onScreen,random){
const deck=shuffled([...Array(count).keys()],random);
if(deck[0]===onScreen){
const later=1+(Math.floor(random()*(count-1))%(count-1));
[deck[0],deck[later]]=[deck[later],deck[0]];
}
return deck;
}
export function drawFromDeck(deck,count,onScreen,random){
let cards=deck;
if(cards===null){
const others=[...Array(count).keys()].filter((i)=>i!==onScreen);
cards=shuffled(others,random);
}else if(cards.length===0){
cards=freshLap(count,onScreen,random);
}
return{card:cards[0],deck:cards.slice(1)};
}
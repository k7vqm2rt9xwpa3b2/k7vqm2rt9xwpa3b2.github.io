import{ALBUM_MARK,BOOK_MARK,FILM_MARK}from"./card-placeholder.js";
import{
bookGloss,
bookSignal,
favoritedClockInputs,
favoritedGloss,
favoritedSignal,
filmGloss,
filmSignal,
present,
}from"./card-signals.js";
function cardLine(value){
if(!present(value)){
return null;
}
return String(value);
}
export const CARD_SOURCES=[
{
file:"data/album.json",
id:"album-card",
label:"Listened",
unit:"album",
required:["artist","album","added"],
cover:function(r){
return r.artwork;
},
alt:function(r){
return r.album+" by "+r.artist;
},
title:function(r){
return r.album;
},
maker:function(r){
return cardLine(r.artist);
},
year:function(r){
return cardLine(r.year);
},
signal:favoritedSignal,
gloss:favoritedGloss,
clockInputs:favoritedClockInputs,
mark:ALBUM_MARK,
markLabel:"No album yet",
coverHosts:[
"is1-ssl.mzstatic.com",
"is2-ssl.mzstatic.com",
"is3-ssl.mzstatic.com",
"is4-ssl.mzstatic.com",
"is5-ssl.mzstatic.com",
],
coverClass:"card__cover",
width:600,
height:600,
},
{
file:"data/films.json",
id:"film-card",
label:"Watched",
unit:"film",
required:["title","watched","rewatch"],
cover:function(r){
return r.poster;
},
alt:function(r){
return r.title+" poster";
},
title:function(r){
return r.title;
},
maker:function(r){
return cardLine(r.director);
},
year:function(r){
return cardLine(r.year);
},
signal:filmSignal,
gloss:filmGloss,
mark:FILM_MARK,
markLabel:"No film yet",
coverHosts:["a.ltrbxd.com"],
coverClass:"card__cover card__cover--poster",
width:600,
height:900,
},
{
file:"data/books.json",
id:"book-card",
label:"Read",
unit:"book",
required:["title","author","read"],
cover:function(r){
return r.cover;
},
alt:function(r){
return"Cover of "+r.title+" by "+r.author;
},
title:function(r){
return r.title;
},
maker:function(r){
return cardLine(r.author);
},
year:function(r){
return cardLine(r.year);
},
signal:bookSignal,
gloss:bookGloss,
mark:BOOK_MARK,
markLabel:"No book yet",
coverHosts:["i.gr-assets.com"],
coverClass:"card__cover card__cover--poster",
width:318,
height:477,
},
];
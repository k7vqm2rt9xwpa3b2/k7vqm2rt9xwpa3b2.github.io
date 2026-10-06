import{wrapLine}from"./text-reveal.js";
function coverUrl(raw,hosts){
let parsed;
try{
parsed=new URL(raw);
}catch{
return null;
}
if(parsed.protocol!=="https:"){
return null;
}
if(parsed.username!==""||parsed.password!==""||parsed.port!==""){
return null;
}
return hosts.includes(parsed.hostname)?parsed.href:null;
}
function buildCover(doc,source,record,showing){
const url=coverUrl(source.cover(record),source.coverHosts);
if(!url){
return null;
}
const img=doc.createElement("img");
img.setAttribute("class",source.coverClass);
img.setAttribute("alt",source.alt(record));
img.setAttribute("width",String(source.width));
img.setAttribute("height",String(source.height));
if(!showing){
img.setAttribute("loading","lazy");
}
img.setAttribute("referrerpolicy","no-referrer");
img.addEventListener("error",function(){
img.remove();
});
img.setAttribute("src",url);
return img;
}
function buildSlide(doc,source,record,now,showing){
const slide=doc.createElement("div");
slide.className="card__slide";
const cover=buildCover(doc,source,record,showing);
if(cover){
slide.appendChild(cover);
}
const title=doc.createElement("p");
title.className="card__title";
title.textContent=source.title(record);
slide.appendChild(title);
wrapLine(doc,title);
[source.maker(record),source.year(record)].forEach(function(text,index){
if(text===null){
return;
}
const meta=doc.createElement("p");
meta.className="card__meta";
meta.textContent=text;
slide.appendChild(meta);
if(index===0){
meta.classList.add("card__meta--maker");
wrapLine(doc,meta);
}
});
const signal=source.signal(record,now);
if(signal){
const row=doc.createElement("p");
row.className="card__signal";
const glyphs=doc.createElement("span");
glyphs.setAttribute("role","img");
const gloss=source.gloss(record,now);
glyphs.setAttribute("aria-label",gloss);
glyphs.setAttribute("title",gloss);
glyphs.textContent=signal;
row.appendChild(glyphs);
slide.appendChild(row);
}
return slide;
}
export function moveAnnouncement(source,slides,index,total){
const title=slides[index].querySelector(".card__title").textContent;
return`${source.label} ${index+1} of ${total}: ${title}`;
}
export function buildSlides(doc,source,records,now,frame){
const slides=[];
records.forEach(function(record){
let slide;
try{
slide=buildSlide(doc,source,record,now,slides.length===0);
}catch{
return;
}
frame.appendChild(slide);
slides.push(slide);
});
return slides;
}
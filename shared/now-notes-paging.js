export function paginate(heights,gap,room){
const pages=[];
let current=[];
let used=0;
heights.forEach((height,index)=>{
const needs=height+(current.length>0?gap:0);
if(current.length>0&&used+needs>room){
pages.push(current);
current=[];
used=height;
}else{
used+=needs;
}
current.push(index);
});
if(current.length>0){
pages.push(current);
}
return pages;
}
export function pageHeight(heights,gap,page){
const notes=page.reduce((total,index)=>total+heights[index],0);
return notes+gap*Math.max(page.length-1,0);
}
export function tallestPage(heights,gap,pages){
return pages.reduce(
(tallest,page)=>Math.max(tallest,pageHeight(heights,gap,page)),
0,
);
}
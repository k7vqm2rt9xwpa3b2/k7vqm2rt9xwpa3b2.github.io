export function paginate(heights,gap,room){
const pages=[];
let current=[];
let notes=0;
heights.forEach((height,index)=>{
const grown=notes+height+gap*current.length;
if(current.length>0&&grown>room){
pages.push(current);
current=[];
notes=0;
}
notes+=height;
current.push(index);
});
if(current.length>0){
pages.push(current);
}
return pages;
}
export function paginateEvenly(heights,gap,room,{boxFromPages}){
const greedy=paginate(heights,gap,room);
if(greedy.length<=1){
return greedy;
}
const span=spanMeasurer(heights,gap,room);
const count=heights.length;
const ceilingOf=(box)=>(boxFromPages?box:Number.MAX_VALUE);
const boxes=boxFromPages?pageHeightsPossible(span,count):[room];
let best=greedyCandidate(span,greedy,{
room:boxFromPages?null:room,
ceilingOf,
});
[greedy.length,greedy.length+1].forEach((pages)=>{
best=bestForPageCount({span,count,pages,boxes,ceilingOf},best);
});
return earliestSplit(span,count,best);
}
function greedyCandidate(span,greedy,{room,ceilingOf}){
const tall=greedy.map((page)=>span(page[0],page[page.length-1]+1));
const box=room??Math.max(...tall);
const floor=Math.min(...tall.slice(0,-1));
const pages=greedy.length;
return{
rank:[box-floor,pages,box],
pages,
floor,
ceiling:ceilingOf(box),
};
}
function bestForPageCount({span,count,pages,boxes,ceilingOf},best){
const floorAt=(box)=>fullestShortPage(span,count,pages,ceilingOf(box));
const loosest=fullestShortPage(span,count,pages,Number.MAX_VALUE);
let winner=best;
for(
let at=firstFeasible(boxes,floorAt);
at<boxes.length&&
outranks([boxes[at]-loosest,pages,boxes[at]],winner.rank);
at+=1
){
const box=boxes[at];
const floor=floorAt(box);
const rank=[box-floor,pages,box];
if(outranks(rank,winner.rank)){
winner={rank,pages,floor,ceiling:ceilingOf(box)};
}
}
return winner;
}
function firstFeasible(boxes,floorAt){
let low=0;
let high=boxes.length;
while(low<high){
const middle=(low+high)>>1;
if(floorAt(boxes[middle])>-Infinity){
high=middle;
}else{
low=middle+1;
}
}
return low;
}
function spanMeasurer(heights,gap,room){
const rows=heights.map((_,start)=>{
const row=new Float64Array(heights.length+1);
let notes=0;
for(let end=start+1;end<=heights.length;end+=1){
notes+=heights[end-1];
const height=notes+gap*(end-start-1);
row[end]=end-start>1&&height>room?Infinity:height;
}
return row;
});
return(start,end)=>rows[start][end];
}
function pageHeightsPossible(span,count){
const heights=new Set();
for(let start=0;start<count;start+=1){
for(let end=start+1;end<=count;end+=1){
const height=span(start,end);
if(height===Infinity){
break;
}
heights.add(height);
}
}
return[...heights].sort((a,b)=>a-b);
}
function fullestShortPage(span,count,pages,ceiling){
let reach=new Float64Array(count+1).fill(-Infinity);
reach[0]=Infinity;
for(let placed=1;placed<pages;placed+=1){
const next=new Float64Array(count+1).fill(-Infinity);
for(let start=0;start<count;start+=1){
if(reach[start]===-Infinity){
continue;
}
for(let end=start+1;end<count;end+=1){
const height=span(start,end);
if(height>ceiling){
break;
}
next[end]=Math.max(next[end],Math.min(reach[start],height));
}
}
reach=next;
}
let best=-Infinity;
for(let start=0;start<count;start+=1){
if(span(start,count)<=ceiling){
best=Math.max(best,reach[start]);
}
}
return best;
}
function outranks(a,b){
const at=a.findIndex((value,index)=>value!==b[index]);
return at>=0&&a[at]<b[at];
}
function earliestSplit(span,count,{pages,floor,ceiling}){
const fits=(start,end)=>{
const height=span(start,end);
return height>=floor&&height<=ceiling;
};
const opens=(start,left)=>{
for(
let end=start+1;
end<count&&span(start,end)<=ceiling;
end+=1
){
if(fits(start,end)&&finishes[left-1][end]){
return true;
}
}
return false;
};
const finishes=[
[],
range(0,count).map((start)=>span(start,count)<=ceiling),
];
for(let left=2;left<pages;left+=1){
finishes.push(range(0,count).map((start)=>opens(start,left)));
}
const split=[];
let start=0;
for(let left=pages;left>1;left-=1){
let end=start+1;
while(!(fits(start,end)&&finishes[left-1][end])){
end+=1;
}
split.push(range(start,end));
start=end;
}
split.push(range(start,count));
return split;
}
function range(start,end){
return Array.from({length:end-start},(_,at)=>start+at);
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
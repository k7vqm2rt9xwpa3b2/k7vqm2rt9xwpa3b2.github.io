const END_ANGLES=Object.freeze([Math.PI/4,Math.PI/2,(3*Math.PI)/4]);
const HANDLE=1/6;
export function spinePoint([a,b,c,d],t){
const s=1-t;
const weights=[s*s*s,3*s*s*t,3*s*t*t,t*t*t];
return{
x:
weights[0]*a.x+weights[1]*b.x+weights[2]*c.x+weights[3]*d.x,
y:
weights[0]*a.y+weights[1]*b.y+weights[2]*c.y+weights[3]*d.y,
};
}
function spineTangent([a,b,c,d],t){
const s=1-t;
const weights=[3*s*s,6*s*t,3*t*t];
const x=
weights[0]*(b.x-a.x)+
weights[1]*(c.x-b.x)+
weights[2]*(d.x-c.x);
const y=
weights[0]*(b.y-a.y)+
weights[1]*(c.y-b.y)+
weights[2]*(d.y-c.y);
const length=Math.hypot(x,y);
return{x:x/length,y:y/length};
}
export function spineNormal(spine,t){
const tangent=spineTangent(spine,t);
return{x:-tangent.y,y:tangent.x};
}
export function widthAt(profile,t){
const next=profile.findIndex(([at])=>at>=t);
if(next===0){
return profile[0][1];
}
if(next===-1){
return profile[profile.length-1][1];
}
const[from,wide]=profile[next-1];
const[to,narrow]=profile[next];
return wide+((narrow-wide)*(t-from))/(to-from);
}
export function besideSpine(spine,t,across){
const point=spinePoint(spine,t);
const normal=spineNormal(spine,t);
return{x:point.x+normal.x*across,y:point.y+normal.y*across};
}
export function limbRing({spine,near,far,samples,end}){
const nearEnd=widthAt(near,1);
const farEnd=widthAt(far,1);
const tip=spinePoint(spine,1);
const across=spineNormal(spine,1);
const reach=(end*(nearEnd+farEnd))/2;
const rounded=END_ANGLES.map((angle)=>{
const cos=Math.cos(angle);
const side=cos*(cos>0?nearEnd:farEnd);
const out=Math.sin(angle)*reach;
return{
x:tip.x+across.x*side+across.y*out,
y:tip.y+across.y*side-across.x*out,
};
});
return[
...samples.map((t)=>besideSpine(spine,t,widthAt(near,t))),
...rounded,
...[...samples]
.reverse()
.map((t)=>besideSpine(spine,t,-widthAt(far,t))),
];
}
function round(value){
return Math.round(value*10)/10;
}
function written({x,y}){
return`${round(x)} ${round(y)}`;
}
export function smoothPath(points,closed){
const count=points.length;
const pick=(at)=>
closed
?points[(at+count)%count]
:points[Math.min(Math.max(at,0),count-1)];
const curves=[];
for(let at=0;at<(closed?count:count-1);at+=1){
const[before,from,to,after]=[-1,0,1,2].map((step)=>
pick(at+step),
);
const out={
x:from.x+(to.x-before.x)*HANDLE,
y:from.y+(to.y-before.y)*HANDLE,
};
const back={
x:to.x-(after.x-from.x)*HANDLE,
y:to.y-(after.y-from.y)*HANDLE,
};
curves.push(`C${written(out)} ${written(back)} ${written(to)}`);
}
return[`M${written(points[0])}`,...curves,...(closed?["Z"]:[])].join(
" ",
);
}
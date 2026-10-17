const REFUSED_ANYWHERE=/[\s\\\p{Cc}\p{Cf}\p{Cs}]/u;
const ANOTHER_HOST="//";
const PLACEHOLDER_BASE="https://invalid.invalid/";
const PAGE_EXTENSION="html";
const FIELD_ATTRIBUTES=Object.freeze({
type:"text",
maxlength:"2048",
autocapitalize:"off",
autocomplete:"off",
autocorrect:"off",
spellcheck:"false",
inputmode:"url",
enterkeyhint:"go",
"aria-labelledby":"location-heading",
});
function resolvesToAnotherHost(path){
return new URL(path,PLACEHOLDER_BASE).pathname.startsWith(ANOTHER_HOST);
}
function decodedSegment(segment){
try{
return decodeURIComponent(segment);
}catch{
return segment;
}
}
function namesRawResource(path){
const{pathname}=new URL(path,PLACEHOLDER_BASE);
const name=decodedSegment(pathname.slice(pathname.lastIndexOf("/")+1));
const dot=name.lastIndexOf(".");
return dot!==-1&&name.slice(dot+1).toLowerCase()!==PAGE_EXTENSION;
}
export function sitePathFor(typed,{standalone=false}={}){
if(typed===""){
return null;
}
if(typed.startsWith(ANOTHER_HOST)||REFUSED_ANYWHERE.test(typed)){
return{refused:true};
}
const path=typed.startsWith("/")?typed:`/${typed}`;
if(resolvesToAnotherHost(path)||(standalone&&namesRawResource(path))){
return{refused:true};
}
return{go:path};
}
export function followLink(doc,path){
const link=doc.createElement("a");
link.setAttribute("href",path);
link.click();
}
function buildField(doc){
const field=doc.createElement("input");
field.className="location-field__input";
for(const[name,value]of Object.entries(FIELD_ATTRIBUTES)){
field.setAttribute(name,value);
}
return field;
}
function worded(doc,tag,className,words){
const element=doc.createElement(tag);
element.className=className;
element.textContent=words;
return element;
}
export function initLocationField(doc,navigate=followLink){
const carrier=doc.getElementById("location-field");
const status=doc.getElementById("location-status");
if(!carrier||carrier.childElementCount>0||!status){
return null;
}
const{prefix,go}=carrier.dataset;
const refusal=status.dataset.words;
if(!prefix||!go||!refusal){
return null;
}
const view=doc.defaultView;
const standalone=
view!==null&&Reflect.get(view.navigator,"standalone")===true;
const field=buildField(doc);
const button=worded(doc,"button","reveal__more location-field__go",go);
button.setAttribute("type","button");
carrier.append(
worded(doc,"span","location-field__prefix",prefix),
field,
button,
);
const follow=()=>{
const path=sitePathFor(field.value,{standalone});
if(path===null){
return;
}
if("refused"in path){
status.textContent=refusal;
return;
}
navigate(doc,path.go);
};
button.addEventListener("click",follow);
field.addEventListener("keydown",(event)=>{
if(event.key==="Enter"&&!event.isComposing){
follow();
}
});
field.addEventListener("input",()=>{
status.textContent="";
});
return carrier;
}
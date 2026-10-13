const REFUSED_ANYWHERE=/[\s\\]/;
const ANOTHER_HOST="//";
const PLACEHOLDER_BASE="https://invalid.invalid/";
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
export function sitePathFor(typed){
if(typed===""){
return null;
}
if(typed.startsWith(ANOTHER_HOST)||REFUSED_ANYWHERE.test(typed)){
return{refused:true};
}
const path=typed.startsWith("/")?typed:`/${typed}`;
return resolvesToAnotherHost(path)?{refused:true}:{go:path};
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
const field=buildField(doc);
const button=worded(doc,"button","reveal__more location-field__go",go);
button.setAttribute("type","button");
carrier.append(
worded(doc,"span","location-field__prefix",prefix),
field,
button,
);
const follow=()=>{
const path=sitePathFor(field.value);
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
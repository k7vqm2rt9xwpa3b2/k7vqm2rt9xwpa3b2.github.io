import{timedFetch}from"./timed-fetch.js";
export const CONNECT_SOURCE="data/connect.json";
export const MAIL_SUBJECT="Best site ever!";
const SENTINEL=String.fromCharCode(1);
const MIN_CODES=4;
const BYTE_MASK=0xff;
const MAX_BYTE=255;
const MAILTO_SYNTAX="?&#%/:";
function carriesMailtoSyntax(address){
return[...address].some(function(character){
const code=character.codePointAt(0);
return(
code<=0x20||
(code>=0x7f&&code<=0x9f)||
MAILTO_SYNTAX.includes(character)
);
});
}
const STATUS_TEXT="Opening your mail app — not working? ";
const FALLBACK_LABEL="Show the address";
function failureNoticeNaming(sectionName){
return`The address could not be loaded. Try the LinkedIn link in ${sectionName} above.`;
}
function whereaboutsHeading(document){
const heading=(
document.getElementById("whereabouts")
);
return heading.textContent.trim();
}
export function decodePayload(codeString){
if(!/^\d+(,\d+)*$/.test(codeString)){
throw new Error("the connect payload is not a list of character codes");
}
const values=codeString.split(",").map(Number);
if(values.length<MIN_CODES){
throw new Error(
`the connect payload needs at least ${MIN_CODES} values, got ${values.length}`,
);
}
if(values.some((value)=>value>MAX_BYTE)){
throw new Error("the connect payload holds a value wider than one byte");
}
const key=values[0];
const plaintext=values
.slice(1)
.map((value,offset)=>
String.fromCharCode(value^((key+offset)&BYTE_MASK)),
)
.join("");
const parts=plaintext.split(SENTINEL);
if(parts.length!==3){
throw new Error(
`the connect payload must hold exactly two sentinels, found ${parts.length-1}`,
);
}
if(!parts[1].includes("@")){
throw new Error("the connect payload does not decode to an address");
}
if(carriesMailtoSyntax(parts[1])){
throw new Error(
"the connect payload decodes to an address carrying mailto syntax",
);
}
return parts[1];
}
export function navigateTo(view,url){
view.location.href=url;
}
function mailtoFor(address){
return`mailto:${address}?subject=${encodeURIComponent(MAIL_SUBJECT)}`;
}
function buildAddressLink(document,address){
const link=document.createElement("a");
link.href=mailtoFor(address);
link.textContent=address;
return link;
}
function showStatus(document,button,address){
const status=document.createElement("span");
status.className="connect__status";
status.setAttribute("role","status");
status.textContent=STATUS_TEXT;
const fallback=document.createElement("button");
fallback.type="button";
fallback.className="connect__fallback";
fallback.textContent=FALLBACK_LABEL;
fallback.addEventListener("click",function(){
const link=buildAddressLink(document,address);
status.replaceWith(link);
link.focus();
});
status.append(fallback);
button.replaceWith(status);
fallback.focus();
}
function showFailure(document,button,failureNotice){
if(document.querySelector("#connect-mail .connect__error")){
return;
}
const notice=document.createElement("span");
notice.className="connect__error";
notice.setAttribute("role","status");
notice.textContent=failureNotice;
button.insertAdjacentElement("afterend",notice);
}
function loadPayload(fetchImpl){
return fetchImpl(CONNECT_SOURCE).then(function(response){
if(!response.ok){
throw new Error(`${CONNECT_SOURCE} answered ${response.status}`);
}
return response.json().then(function(data){
return data.p;
});
});
}
export function revealEmail(document,options={},failureNotice){
const button=document.getElementById("connect-reveal");
if(!button||button.disabled){
return Promise.resolve();
}
const view=document.defaultView;
const fetchOrDefault=options.fetchImpl||((url)=>timedFetch(view,url));
const navigateOrDefault=
options.navigate||((url)=>navigateTo(view,url));
const reportOrDefault=
options.onError||((error)=>view.console.error(error));
button.disabled=true;
return loadPayload(fetchOrDefault)
.then(function(codeString){
const address=decodePayload(codeString);
navigateOrDefault(mailtoFor(address));
showStatus(document,button,address);
})
.catch(function(error){
button.disabled=false;
showFailure(document,button,failureNotice);
reportOrDefault(error);
});
}
export function initConnect(document,options={}){
const button=document.getElementById("connect-reveal");
if(button){
const failureNotice=failureNoticeNaming(whereaboutsHeading(document));
button.addEventListener("click",function(){
revealEmail(document,options,failureNotice);
});
}
}
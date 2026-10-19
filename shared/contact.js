import{timedFetch}from"./timed-fetch.js";
export const CONTACT_SOURCE="data/contact.json";
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
function professionalHeading(document){
const heading=(
document.querySelector("#professional h2")
);
return heading.textContent.trim();
}
export function decodePayload(codeString){
if(!/^\d+(,\d+)*$/.test(codeString)){
throw new Error("the contact payload is not a list of character codes");
}
const values=codeString.split(",").map(Number);
if(values.length<MIN_CODES){
throw new Error(
`the contact payload needs at least ${MIN_CODES} values, got ${values.length}`,
);
}
if(values.some((value)=>value>MAX_BYTE)){
throw new Error("the contact payload holds a value wider than one byte");
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
`the contact payload must hold exactly two sentinels, found ${parts.length-1}`,
);
}
if(!parts[1].includes("@")){
throw new Error("the contact payload does not decode to an address");
}
if(carriesMailtoSyntax(parts[1])){
throw new Error(
"the contact payload decodes to an address carrying mailto syntax",
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
status.className="contact__status";
status.setAttribute("role","status");
status.textContent=STATUS_TEXT;
const fallback=document.createElement("button");
fallback.type="button";
fallback.className="contact__fallback";
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
if(document.querySelector("#contact-mail .contact__error")){
return;
}
const notice=document.createElement("span");
notice.className="contact__error";
notice.setAttribute("role","status");
notice.textContent=failureNotice;
button.insertAdjacentElement("afterend",notice);
}
function loadPayload(fetchImpl){
return fetchImpl(CONTACT_SOURCE).then(function(response){
if(!response.ok){
throw new Error(`${CONTACT_SOURCE} answered ${response.status}`);
}
return response.json().then(function(data){
return data.p;
});
});
}
export function revealEmail(document,options={},failureNotice){
const button=document.getElementById("contact-reveal");
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
export function initContact(document,options={}){
const button=document.getElementById("contact-reveal");
if(button){
const failureNotice=failureNoticeNaming(professionalHeading(document));
button.addEventListener("click",function(){
revealEmail(document,options,failureNotice);
});
}
}
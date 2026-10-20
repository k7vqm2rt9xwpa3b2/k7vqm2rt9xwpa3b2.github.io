function sourceIn(response){
if(!response.ok){
throw new Error(`the source responded ${response.status}`);
}
return response.text();
}
function sayFailed(doc){
const status=doc.querySelector("#source-status[data-words]");
if(status){
status.textContent=status.getAttribute("data-words");
}
}
export function showPageSource(doc,fetchImpl,address){
const box=doc.querySelector("#page-source .debug-box__text");
if(!box){
return Promise.resolve();
}
return fetchImpl(address)
.then(sourceIn)
.then(
(source)=>{
box.textContent=source;
},
()=>sayFailed(doc),
);
}
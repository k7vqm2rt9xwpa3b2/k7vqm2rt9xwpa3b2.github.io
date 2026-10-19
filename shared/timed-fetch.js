export const FETCH_TIMEOUT_MS=10000;
export function fetchInit(view){
const timeout=view.AbortSignal?.timeout;
if(typeof timeout!=="function"){
return{};
}
return{signal:timeout.call(view.AbortSignal,FETCH_TIMEOUT_MS)};
}
export function timedFetch(view,address,init){
if(init?.signal){
return view.fetch(address,init);
}
return view.fetch(address,{...init,...fetchInit(view)});
}
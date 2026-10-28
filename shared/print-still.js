export const PRINTING_ATTRIBUTE="data-printing";
export function stillOnPrint(view,settle=settleNothing){
const root=view.document.documentElement;
const mark=()=>{
settle();
root.setAttribute(PRINTING_ATTRIBUTE,"");
view.document.getAnimations?.();
};
const unmark=()=>{
root.removeAttribute(PRINTING_ATTRIBUTE);
};
view.addEventListener("beforeprint",mark);
view.addEventListener("afterprint",unmark);
return()=>{
view.removeEventListener("beforeprint",mark);
view.removeEventListener("afterprint",unmark);
unmark();
};
}
function settleNothing(){}
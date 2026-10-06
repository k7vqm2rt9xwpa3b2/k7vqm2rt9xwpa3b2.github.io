export const POP_UP_GAP=16;
export function fitsLeftOf(grid,popUp){
return grid.left>=popUp.width+2*POP_UP_GAP;
}
export function leftOfGrid(grid,popUp,viewport){
return{
left:grid.left-popUp.width-POP_UP_GAP,
top:insideViewport(
grid.top+(grid.height-popUp.height)/2,
popUp,
viewport,
),
};
}
export function scrollToFitAbove(grid,popUp){
return grid.top-(popUp.height+2*POP_UP_GAP);
}
export function aboveGrid(grid,popUp,viewport){
return{
left:(viewport.width-popUp.width)/2,
top:insideViewport(grid.top-popUp.height-POP_UP_GAP,popUp,viewport),
};
}
function insideViewport(top,popUp,viewport){
const lowest=viewport.height-popUp.height-POP_UP_GAP;
return Math.max(POP_UP_GAP,Math.min(top,lowest));
}
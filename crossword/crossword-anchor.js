export function entryId(entry){
return entry.number+entry.direction;
}
export function entryIdsValue(ids){
return ids.join(" ");
}
export function entryIdsIn(value){
return(value||"").split(" ");
}
export function squareKey(row,col){
return row+","+col;
}
export function entryCellsFromMap(cellEntryMap){
const result=new Map();
cellEntryMap.forEach(function(ids,cellKey){
ids.forEach(function(id){
const cells=result.get(id)||[];
cells.push(cellKey);
result.set(id,cells);
});
});
return result;
}
function orderCandidatesUncontestedFirst(candidates,cellEntryMap){
const uncontested=[];
const contested=[];
candidates.forEach(function(cellKey){
const coverers=cellEntryMap.get(cellKey)||[];
if(coverers.length===1){
uncontested.push(cellKey);
}else{
contested.push(cellKey);
}
});
return uncontested.concat(contested);
}
export function computeAnchorCells(entries,entryCells,cellEntryMap){
const orderedEntryCells=new Map();
entryCells.forEach(function(candidates,id){
orderedEntryCells.set(
id,
orderCandidatesUncontestedFirst(candidates,cellEntryMap),
);
});
const cellOwner=new Map();
function tryAssign(id,visited){
const candidates=orderedEntryCells.get(id)||[];
for(const cellKey of candidates){
if(visited.has(cellKey)){
continue;
}
visited.add(cellKey);
const currentOwner=cellOwner.get(cellKey);
if(currentOwner===undefined||tryAssign(currentOwner,visited)){
cellOwner.set(cellKey,id);
return true;
}
}
return false;
}
entries.forEach(function(entry){
tryAssign(entryId(entry),new Set());
});
const anchorCell=new Map();
cellOwner.forEach(function(id,cellKey){
anchorCell.set(id,cellKey);
});
return anchorCell;
}
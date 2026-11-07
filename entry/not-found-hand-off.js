{
const queries=({
matrix:"?egg=matrix",
"red-pill":"?egg=red-pill",
"blue-pill":"",
});
const egg=/^\/(matrix|red-pill|blue-pill)\/?$/i.exec(location.pathname);
if(egg!==null){
const home=(
document.querySelector("script[data-home]")
).getAttribute("data-home");
document.documentElement.hidden=true;
location.replace(`${home}${queries[egg[1].toLowerCase()]}`);
}
}
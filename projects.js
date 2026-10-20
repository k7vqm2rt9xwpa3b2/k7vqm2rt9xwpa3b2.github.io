import{initMode}from"./shared/mode.js";
import{recordVisit}from"./shared/visit-list.js";
initMode(window);
recordVisit(window,{page:"projects"},Date.now());
export const ready=import("./shared/masthead-menu.js").then(
({initMastheadMenu})=>initMastheadMenu(window.document),
);
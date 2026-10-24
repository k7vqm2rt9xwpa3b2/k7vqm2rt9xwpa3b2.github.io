import{initDisclosures}from"./shared/disclosure.js";
import{initMode}from"./shared/mode.js";
import{recordVisit}from"./shared/visit-list.js";
initMode(window);
initDisclosures(document);
recordVisit(window,{page:"projects"},Date.now());
export const ready=import("./shared/masthead-menu.js").then(
({initMastheadMenu})=>initMastheadMenu(window.document),
);
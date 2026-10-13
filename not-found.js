import{initMode}from"./shared/mode.js";
import{offerWayBack}from"./shared/not-found-back.js";
import{reactToAddress}from"./shared/not-found-future.js";
import{stillOnPrint}from"./shared/print-still.js";
initMode(window);
stillOnPrint(window);
export const ready=import("./shared/masthead-menu.js").then(
({initMastheadMenu})=>initMastheadMenu(window.document),
);
offerWayBack(window);
reactToAddress(window,window.location.pathname);
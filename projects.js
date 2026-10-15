import{initMode}from"./shared/mode.js";
initMode(window);
export const ready=import("./shared/masthead-menu.js").then(
({initMastheadMenu})=>initMastheadMenu(window.document),
);
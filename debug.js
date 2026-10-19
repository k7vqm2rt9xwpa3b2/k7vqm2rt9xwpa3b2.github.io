import{initDisclosures}from"./shared/disclosure.js";
import{initLocationField}from"./shared/location-field.js";
import{initMode}from"./shared/mode.js";
import{showPageSource}from"./shared/page-source.js";
import{timedFetch}from"./shared/timed-fetch.js";
initMode(window);
export const ready=import("./shared/masthead-menu.js").then(
({initMastheadMenu})=>initMastheadMenu(window.document),
);
initDisclosures(document);
initLocationField(document);
showPageSource(document,(address)=>timedFetch(window,address),"../");
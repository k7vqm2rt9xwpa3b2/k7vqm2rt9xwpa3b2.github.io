import{initDisclosures}from"./shared/disclosure.js";
import{initFileList}from"./shared/file-list.js";
import{initLocationField}from"./shared/location-field.js";
import{initMode}from"./shared/mode.js";
import{showPageSource}from"./shared/page-source.js";
import{timedFetch}from"./shared/timed-fetch.js";
import{initVisitPanel}from"./shared/visit-panel.js";
initMode(window);
export const ready=import("./shared/masthead-menu.js").then(
({initMastheadMenu})=>initMastheadMenu(window.document),
);
initDisclosures(document);
initLocationField(document);
initVisitPanel(document,window,Date.now());
const fetchFromPage=(address)=>timedFetch(window,address);
showPageSource(document,fetchFromPage,"../");
initFileList(document,fetchFromPage);
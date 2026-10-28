import{initArchiveYears}from"./shared/now-archive-years.js";
import{initNoteCarousel}from"./shared/now-notes.js";
import{initPhotoCarousel}from"./shared/now-photo.js";
import{initMode}from"./shared/mode.js";
initMode(window);
initPhotoCarousel(window,window.IntersectionObserver);
initNoteCarousel(window,window.IntersectionObserver);
initArchiveYears(window);
export const ready=import("./shared/masthead-menu.js").then(
({initMastheadMenu})=>initMastheadMenu(window.document),
);
export const recorded=import("./shared/visit-list.js").then(
({recordVisit,yearPageVisit})=>
recordVisit(window,yearPageVisit(window.document),Date.now()),
);
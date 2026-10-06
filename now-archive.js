import{initArchiveYears}from"./shared/now-archive-years.js";
import{initNoteCarousel}from"./shared/now-notes.js";
import{initPhotoCarousel}from"./shared/now-photo.js";
import{initMode}from"./shared/mode.js";
initMode(window);
initPhotoCarousel(window,window.IntersectionObserver);
initNoteCarousel(window);
initArchiveYears(window);
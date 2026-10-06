import{initMode}from"./shared/mode.js";
import{reactToAddress}from"./shared/not-found-future.js";
import{stillOnPrint}from"./shared/print-still.js";
initMode(window);
stillOnPrint(window);
reactToAddress(window,window.location.pathname);
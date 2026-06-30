// Live window now lives in config.json (loaded by config.js, included before this file).
const WINDOW_START = window.APP_CONFIG.WINDOW_START;
const WINDOW_END = window.APP_CONFIG.WINDOW_END;

function isWithinLiveWindow(){
  const now = new Date();
  const minutes = now.getHours() * 60 + now.getMinutes();
  return minutes >= WINDOW_START && minutes <= WINDOW_END;
}

function updateLiveState(){
  const live = isWithinLiveWindow();
  const liveBadge = document.getElementById("liveBadge");
  const offlineBadge = document.getElementById("offlineBadge");
  if(liveBadge) liveBadge.style.display = live ? "inline-flex" : "none";
  if(offlineBadge) offlineBadge.style.display = live ? "none" : "inline-flex";
}

updateLiveState();
setInterval(updateLiveState, window.APP_CONFIG.refresh.liveStateCheckSeconds * 1000);


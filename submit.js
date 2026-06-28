// Live window: 6:30 PM to 8:30 PM (in minutes from midnight)
const WINDOW_START = 18 * 60 + 30;
const WINDOW_END   = 20 * 60 + 30;

function isWithinLiveWindow(){
  const now = new Date();
  const minutes = now.getHours() * 60 + now.getMinutes();
  return minutes >= WINDOW_START && minutes <= WINDOW_END;
}

function updateLiveState(){
  const live = isWithinLiveWindow();
  const liveBadge = document.getElementById("liveBadge");
  const offlineBadge = document.getElementById("offlineBadge");
  const liveSection = document.getElementById("liveSection");
  const offlineSection = document.getElementById("offlineSection");
  if(liveBadge) liveBadge.style.display = live ? "inline-flex" : "none";
  if(offlineBadge) offlineBadge.style.display = live ? "none" : "inline-flex";
  if(liveSection) liveSection.style.display = live ? "block" : "none";
  if(offlineSection) offlineSection.style.display = live ? "none" : "block";
}

updateLiveState();
setInterval(updateLiveState, 30000); // re-check every 30 seconds


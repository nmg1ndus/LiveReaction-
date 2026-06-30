// CSV export link of the published Google Sheet (auto-derived from the pubhtml link)
const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTuGfBisFb70c8P1S5IpcFo8xDySUCz7Ep9sqzar9isRGiDdcu8mdIzDvgB-rl_ZehybfEvkfjvsJrC/pub?output=csv";

// Live window: 24x7 (always active)
const WINDOW_START = 0; // 12:00 AM
const WINDOW_END   = 24 * 60; // 11:59 PM

// Basic safety blocklist - domains/keywords we never show
const BLOCKED_PATTERNS = [
  "porn", "xvideos", "xnxx", "xxx", "onlyfans", "redtube", "xhamster",
  "sex", "nsfw", "leak", "hack", "phish", "malware", "crack",
  "bit.ly/free", "torrent"
];

// State for date picker
let selectedDate = null;
let currentPickerMonth = new Date();

function maskEmail(email){
  if(!email) return "";
  const parts = email.split("@");
  if(parts.length !== 2) return email;
  const [user, domain] = parts;
  const visible = user.slice(0, 2);
  const masked = visible + "*".repeat(Math.max(user.length - 2, 1));
  return masked + "@" + domain;
}

function getYoutubeThumbnail(url){
  try{
    const u = new URL(url);
    if(!/youtube\.com|youtu\.be/i.test(u.hostname)) return null;
    let videoId = null;
    if(u.hostname.includes("youtu.be")){
      videoId = u.pathname.slice(1).split("/")[0];
    } else if(u.pathname.startsWith("/shorts/")){
      videoId = u.pathname.split("/shorts/")[1].split("/")[0];
    } else {
      videoId = u.searchParams.get("v");
    }
    if(!videoId) return null;
    return "https://img.youtube.com/vi/" + videoId + "/hqdefault.jpg";
  } catch(e){ return null; }
}

function getClickedKey(date){
  return "clickedMemes_" + date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
}

function getClickedSet(date){
  try{
    const raw = localStorage.getItem(getClickedKey(date));
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch(e){ return new Set(); }
}

function markClicked(link, date){
  try{
    const set = getClickedSet(date);
    set.add(link);
    localStorage.setItem(getClickedKey(date), JSON.stringify([...set]));
  } catch(e){}
}

function isSafeLink(url){
  if(!url) return false;
  const lower = url.toLowerCase();
  if(!lower.startsWith("http")) return false;
  return !BLOCKED_PATTERNS.some(p => lower.includes(p));
}

function parseCSVLine(line){
  // Handles quoted fields that may contain commas
  const result = [];
  let cur = "", inQuotes = false;
  for(let i = 0; i < line.length; i++){
    const ch = line[i];
    if(ch === '"'){
      if(inQuotes && line[i+1] === '"'){ cur += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if(ch === ',' && !inQuotes){
      result.push(cur); cur = "";
    } else cur += ch;
  }
  result.push(cur);
  return result;
}

function isSameDateAsTarget(timestampStr, targetDate){
  const ts = new Date(timestampStr);
  if(isNaN(ts.getTime())) return false;
  return ts.getFullYear() === targetDate.getFullYear()
      && ts.getMonth() === targetDate.getMonth()
      && ts.getDate() === targetDate.getDate();
}

function isWithinTodayAndWindow(timestampStr){
  const ts = new Date(timestampStr);
  if(isNaN(ts.getTime())) return false;
  const now = new Date();
  const sameDay = ts.getFullYear() === now.getFullYear()
               && ts.getMonth() === now.getMonth()
               && ts.getDate() === now.getDate();
  if(!sameDay) return false;
  const minutes = ts.getHours() * 60 + ts.getMinutes();
  return minutes >= WINDOW_START && minutes <= WINDOW_END;
}

async function loadMemes(filterDate = null){
  const statusEl = document.getElementById("status");
  const listEl = document.getElementById("memeList");
  if(!statusEl || !listEl) return;
  try{
    const res = await fetch(CSV_URL + "&_=" + Date.now());
    if(!res.ok) throw new Error("fetch failed");
    const text = await res.text();
    const lines = text.split("\n").filter(l => l.trim().length > 0);
    const rows = lines.slice(1).map(parseCSVLine); // skip header row

    const targetDate = filterDate || new Date();
    const clicked = getClickedSet(targetDate);
    const items = rows
      .map(r => ({
        timestamp: r[0],
        link: (r.find(v => v && v.trim().toLowerCase().startsWith("http")) || "").trim(),
        email: (r.find(v => v && /\S+@\S+\.\S+/.test(v)) || "").trim()
      }))
      .filter(r => isSameDateAsTarget(r.timestamp, targetDate))
      .filter(r => isSafeLink(r.link))
      .filter(r => !clicked.has(r.link));

    listEl.innerHTML = "";
    if(items.length === 0){
      if(filterDate){
        statusEl.textContent = "Is date ko koi meme nahi mil.";
      } else {
        statusEl.textContent = "Abhi tak koi meme nahi aaya.";
      }
    } else {
      statusEl.textContent = items.length + " meme(s) mile.";
      items.reverse().forEach(item => {
        const li = document.createElement("li");

        const thumbUrl = getYoutubeThumbnail(item.link);
        if(thumbUrl){
          const img = document.createElement("img");
          img.src = thumbUrl;
          img.alt = "preview";
          img.className = "meme-thumb";
          li.appendChild(img);
        }

        const info = document.createElement("div");
        info.className = "meme-info";

        const a = document.createElement("a");
        a.href = item.link;
        a.textContent = item.link;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.addEventListener("click", () => {
          markClicked(item.link, targetDate);
          li.remove();
        });
        info.appendChild(a);

        if(item.email){
          const emailEl = document.createElement("div");
          emailEl.className = "meme-email";
          emailEl.textContent = maskEmail(item.email);
          info.appendChild(emailEl);
        }

        li.appendChild(info);
        listEl.appendChild(li);
      });
    }
  } catch(err){
    statusEl.textContent = "List load nahi ho payi, thodi der baad try karo.";
  }
}

function renderCalendarGrid(){
  const grid = document.getElementById("calendarGrid");
  const monthDisplay = document.getElementById("monthYearDisplay");
  
  // Update month/year display
  const monthNames = ["January", "February", "March", "April", "May", "June",
                      "July", "August", "September", "October", "November", "December"];
  monthDisplay.textContent = monthNames[currentPickerMonth.getMonth()] + " " + currentPickerMonth.getFullYear();
  
  // Clear grid
  grid.innerHTML = "";
  
  // Add day headers (Sun-Sat)
  const dayHeaders = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  dayHeaders.forEach(day => {
    const header = document.createElement("div");
    header.className = "calendar-day-header";
    header.textContent = day;
    grid.appendChild(header);
  });
  
  // Get first day of month and number of days
  const firstDay = new Date(currentPickerMonth.getFullYear(), currentPickerMonth.getMonth(), 1);
  const lastDay = new Date(currentPickerMonth.getFullYear(), currentPickerMonth.getMonth() + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Add empty cells for days before month starts
  for(let i = 0; i < startingDayOfWeek; i++){
    const empty = document.createElement("div");
    empty.className = "calendar-empty";
    grid.appendChild(empty);
  }
  
  // Add day cells
  for(let day = 1; day <= daysInMonth; day++){
    const dayCell = document.createElement("button");
    dayCell.className = "calendar-day";
    dayCell.textContent = day;
    
    const cellDate = new Date(currentPickerMonth.getFullYear(), currentPickerMonth.getMonth(), day);
    cellDate.setHours(0, 0, 0, 0);
    
    // Disable future dates
    if(cellDate > today){
      dayCell.disabled = true;
      dayCell.classList.add("calendar-future");
    } else {
      dayCell.addEventListener("click", () => {
        selectedDate = cellDate;
        closeDatePicker();
        loadMemes(selectedDate);
      });
    }
    
    // Highlight selected date
    if(selectedDate && cellDate.getTime() === selectedDate.getTime()){
      dayCell.classList.add("calendar-selected");
    }
    
    grid.appendChild(dayCell);
  }
}

function openDatePicker(){
  const popup = document.getElementById("datePickerPopup");
  popup.style.display = "block";
  currentPickerMonth = new Date(selectedDate || new Date());
  renderCalendarGrid();
}

function closeDatePicker(){
  const popup = document.getElementById("datePickerPopup");
  popup.style.display = "none";
}

function initDatePicker(){
  const calendarBtn = document.getElementById("calendarBtn");
  const prevMonthBtn = document.getElementById("prevMonth");
  const nextMonthBtn = document.getElementById("nextMonth");
  
  calendarBtn.addEventListener("click", () => {
    const popup = document.getElementById("datePickerPopup");
    if(popup.style.display === "none"){
      openDatePicker();
    } else {
      closeDatePicker();
    }
  });
  
  prevMonthBtn.addEventListener("click", () => {
    currentPickerMonth.setMonth(currentPickerMonth.getMonth() - 1);
    renderCalendarGrid();
  });
  
  nextMonthBtn.addEventListener("click", () => {
    currentPickerMonth.setMonth(currentPickerMonth.getMonth() + 1);
    renderCalendarGrid();
  });
  
  // Close popup when clicking outside
  document.addEventListener("click", (e) => {
    const popup = document.getElementById("datePickerPopup");
    const calendarBtn = document.getElementById("calendarBtn");
    if(!popup.contains(e.target) && !calendarBtn.contains(e.target)){
      closeDatePicker();
    }
  });
}

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
  if(live && !selectedDate) loadMemes();
}

updateLiveState();
initDatePicker();
setInterval(updateLiveState, 30000); // re-check every 30 seconds
setInterval(() => { if(isWithinLiveWindow() && !selectedDate) loadMemes(); }, 10000); // refresh list every 10s while live

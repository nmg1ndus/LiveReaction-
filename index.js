// CSV export link of the published Google Sheet (auto-derived from the pubhtml link)
const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTuGfBisFb70c8P1S5IpcFo8xDySUCz7Ep9sqzar9isRGiDdcu8mdIzDvgB-rl_ZehybfEvkfjvsJrC/pub?output=csv";

// Live window: 6:30 PM to 8:30 PM (in minutes from midnight)
const WINDOW_START = 18 * 60 + 30;
const WINDOW_END   = 20 * 60 + 30;

// Basic safety blocklist - domains/keywords we never show
const BLOCKED_PATTERNS = [
  "porn", "xvideos", "xnxx", "xxx", "onlyfans", "redtube", "xhamster",
  "sex", "nsfw", "leak", "hack", "phish", "malware", "crack",
  "bit.ly/free", "torrent"
];

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

async function loadMemes(){
  const statusEl = document.getElementById("status");
  const listEl = document.getElementById("memeList");
  if(!statusEl || !listEl) return;
  try{
    const res = await fetch(CSV_URL + "&_=" + Date.now());
    if(!res.ok) throw new Error("fetch failed");
    const text = await res.text();
    const lines = text.split("\n").filter(l => l.trim().length > 0);
    const rows = lines.slice(1).map(parseCSVLine); // skip header row

    const items = rows
      .map(r => ({
        timestamp: r[0],
        link: (r.find(v => v && v.trim().toLowerCase().startsWith("http")) || "").trim(),
        email: (r.find(v => v && /\S+@\S+\.\S+/.test(v)) || "").trim()
      }))
      .filter(r => isWithinTodayAndWindow(r.timestamp))
      .filter(r => isSafeLink(r.link));

    listEl.innerHTML = "";
    if(items.length === 0){
      statusEl.textContent = "Abhi tak koi meme nahi aaya (6:30-8:30 window mein).";
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
  if(live) loadMemes();
}

updateLiveState();
setInterval(updateLiveState, 30000); // re-check every 30 seconds
setInterval(() => { if(isWithinLiveWindow()) loadMemes(); }, 10000); // refresh list every 10s while live

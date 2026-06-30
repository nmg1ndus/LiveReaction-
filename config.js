// config.js
// Loads config.json synchronously (so it's ready before index.js/submit.js/qr.html run)
// and exposes it as window.APP_CONFIG, plus a few derived helpers.
//
// To change any link, time, or setting on the site, just edit config.json —
// you never need to touch this file.

(function () {
  var DEFAULTS = {
    googleSheet: { csvUrl: "", editLink: "" },
    googleForm: { viewLink: "", embedLink: "" },
    liveWindow: { enabled: true, onlineTime: "18:30", endLiveTime: "20:30" },
    refresh: { memeListRefreshSeconds: 10, liveStateCheckSeconds: 30 },
    qrPage: { targetUrl: "" },
    site: { name: "Nondescript MG", hashtag: "#LiveReaction" },
    safety: { blockedPatterns: [] }
  };

  function toMinutes(hhmm) {
    if (!hhmm || hhmm.indexOf(":") === -1) return 0;
    var parts = hhmm.split(":");
    return (parseInt(parts[0], 10) || 0) * 60 + (parseInt(parts[1], 10) || 0);
  }

  var config = DEFAULTS;

  try {
    var xhr = new XMLHttpRequest();
    // synchronous request (3rd arg = false) so config is ready before later
    // inline scripts / index.js / submit.js execute on the page.
    xhr.open("GET", "config.json?_=" + Date.now(), false);
    xhr.send(null);
    if (xhr.status === 200 || xhr.status === 0) {
      var loaded = JSON.parse(xhr.responseText);
      config = Object.assign({}, DEFAULTS, loaded);
    }
  } catch (e) {
    console.warn("config.js: could not load config.json, using defaults.", e);
  }

  // Derived convenience values used across pages
  config.WINDOW_START = config.liveWindow.enabled ? toMinutes(config.liveWindow.onlineTime) : 0;
  config.WINDOW_END = config.liveWindow.enabled ? toMinutes(config.liveWindow.endLiveTime) : 24 * 60;
  config.CSV_URL = config.googleSheet.csvUrl;
  config.BLOCKED_PATTERNS = config.safety.blockedPatterns || [];

  window.APP_CONFIG = config;
})();

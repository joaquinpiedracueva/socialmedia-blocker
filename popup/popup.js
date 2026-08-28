const toggle = document.getElementById("toggle");
const status = document.getElementById("status");

const DAILY_BUDGET_MS = 2 * 60 * 60 * 1000;

let countdownInterval = null;

function todayKey() {
  return new Date().toDateString();
}

function formatRemaining(ms) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor(totalSeconds / 60) % 60;
  const s = totalSeconds % 60;
  // Past an hour, read as h:mm:ss rather than a minute count in the hundreds.
  const minutes = h ? String(m).padStart(2, "0") : String(m);
  return (h ? h + ":" : "") + minutes + ":" + String(s).padStart(2, "0");
}

function render({ enabled, offUntil, remainingMs, dayKey }) {
  clearInterval(countdownInterval);
  const now = Date.now();

  // Budget resets on a new day; unset means it hasn't been touched yet.
  const remaining =
    dayKey !== todayKey() || remainingMs === undefined ? DAILY_BUDGET_MS : remainingMs;

  if (enabled === false && offUntil !== undefined && offUntil > now) {
    toggle.disabled = false;
    toggle.checked = false;
    const update = () => {
      const left = offUntil - Date.now();
      if (left <= 0) {
        clearInterval(countdownInterval);
        return;
      }
      status.textContent = "Blocking resumes in " + formatRemaining(left);
    };
    update();
    countdownInterval = setInterval(update, 1000);
    return;
  }

  toggle.checked = true;
  if (remaining <= 0) {
    toggle.disabled = true;
    status.textContent = "No time left — resets tomorrow";
  } else {
    toggle.disabled = false;
    status.textContent =
      remaining < DAILY_BUDGET_MS ? formatRemaining(remaining) + " left today" : "";
  }
}

function refresh() {
  chrome.storage.local.get(["enabled", "offUntil", "remainingMs", "dayKey"], render);
}

refresh();

toggle.addEventListener("change", () => {
  chrome.storage.local.set({ enabled: toggle.checked });
});

// The background worker owns the budget state and may flip `enabled` back
// on — re-render whenever any of it changes.
chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "local") return;
  if (changes.enabled || changes.offUntil || changes.remainingMs) refresh();
});

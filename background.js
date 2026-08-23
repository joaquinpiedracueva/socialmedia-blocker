// Enforces a daily off-budget: the blocker can be off for a total of one
// hour per day. Toggling back on pauses the budget; toggling off resumes
// it. When the hour is used up, blocking turns back on and the toggle is
// locked until the next day, when the budget resets.
//
// Storage keys:
//   enabled     — blocking on/off (defaults to on when unset)
//   offUntil    — while off: timestamp when today's budget runs out
//   remainingMs — while on: budget left today (unset = full budget)
//   dayKey      — local date the stored budget belongs to

const DAILY_BUDGET_MS = 60 * 60 * 1000;
const ALARM_NAME = "budget-exhausted";

function todayKey() {
  return new Date().toDateString();
}

// Remaining budget for today, resetting to the full hour on a new day.
function getRemaining(cb) {
  chrome.storage.local.get(["remainingMs", "dayKey"], ({ remainingMs, dayKey }) => {
    if (dayKey !== todayKey() || remainingMs === undefined) {
      cb(DAILY_BUDGET_MS);
    } else {
      cb(remainingMs);
    }
  });
}

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "local" || !changes.enabled) return;

  if (changes.enabled.newValue === false) {
    getRemaining((remaining) => {
      if (remaining <= 0) {
        // Budget spent — revert any attempt to turn blocking off today.
        chrome.storage.local.set({ enabled: true });
        return;
      }
      const offUntil = Date.now() + remaining;
      chrome.storage.local.set({ offUntil, remainingMs: remaining, dayKey: todayKey() });
      chrome.alarms.create(ALARM_NAME, { when: offUntil });
    });
  } else {
    // Toggled back on: pause the budget, banking whatever time is left.
    chrome.alarms.clear(ALARM_NAME);
    chrome.storage.local.get("offUntil", ({ offUntil }) => {
      if (offUntil === undefined) return;
      chrome.storage.local.set({ remainingMs: Math.max(0, offUntil - Date.now()) });
      chrome.storage.local.remove("offUntil");
    });
  }
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_NAME) {
    chrome.storage.local.set({ enabled: true, remainingMs: 0 });
    chrome.storage.local.remove("offUntil");
  }
});

// Alarms don't survive the browser being closed past their fire time, so
// re-check a pending timer whenever the worker starts.
function recoverTimer() {
  chrome.storage.local.get(["enabled", "offUntil"], ({ enabled, offUntil }) => {
    if (enabled === false && offUntil !== undefined) {
      if (offUntil <= Date.now()) {
        chrome.storage.local.set({ enabled: true, remainingMs: 0 });
        chrome.storage.local.remove("offUntil");
      } else {
        chrome.alarms.create(ALARM_NAME, { when: offUntil });
      }
    }
  });
}

chrome.runtime.onStartup.addListener(recoverTimer);
chrome.runtime.onInstalled.addListener(recoverTimer);

const toggle = document.getElementById("toggle");
const status = document.getElementById("status");

function render(enabled) {
  toggle.checked = enabled !== false;
  status.textContent = toggle.checked ? "Blocking on" : "Blocking off";
}

chrome.storage.local.get("enabled", ({ enabled }) => render(enabled));

// Clear state left behind by the old daily off-budget.
chrome.storage.local.remove(["offUntil", "remainingMs", "dayKey"]);

toggle.addEventListener("change", () => {
  chrome.storage.local.set({ enabled: toggle.checked });
});

// Keep in sync if the toggle is flipped from another window.
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.enabled) render(changes.enabled.newValue);
});

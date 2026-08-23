// Fully blocks the sites listed in manifest.json (Instagram, X/Twitter,
// Twitch, Kick, TikTok, Facebook, Netflix, HBO Max, Disney+, Prime Video).
// Runs at document_start so the page is stopped before it renders. Styles
// are set via the CSSOM so strict site CSPs can't strip them.
function showBlockedPage() {
  window.stop();
  document.documentElement.innerHTML = "<head><title>Blocked</title></head><body></body>";

  const body = document.body;
  body.style.cssText =
    "margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;" +
    "background:#0f0f0f;color:#fff;font-family:system-ui,-apple-system,sans-serif;text-align:center;";

  const box = document.createElement("div");

  const title = document.createElement("h1");
  title.textContent = location.hostname + " is blocked";
  title.style.cssText = "font-size:1.5rem;margin:0 0 0.5rem;";

  const hint = document.createElement("p");
  hint.textContent = "Turn off the extension in its popup to visit this site.";
  hint.style.cssText = "margin:0;color:#aaa;";

  box.appendChild(title);
  box.appendChild(hint);
  body.appendChild(box);
}

chrome.storage.local.get("enabled", (data) => {
  if (data.enabled !== false) showBlockedPage();
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes.enabled) {
    // Reload on disable so the real site loads again.
    changes.enabled.newValue !== false ? showBlockedPage() : location.reload();
  }
});

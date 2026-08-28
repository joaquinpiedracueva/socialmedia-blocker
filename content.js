let enabled = true;

// Selectors that hide YouTube Shorts everywhere they appear.
const shortsSelectors = [
  // Shorts shelves on the homepage, search results, subscriptions, etc.
  "ytd-rich-shelf-renderer[is-shorts]",
  "ytd-reel-shelf-renderer",
  "ytm-shorts-lockup-view-model",
  // Individual Shorts items that slip into the recommendation grid
  "ytd-rich-item-renderer:has(a[href^='/shorts/'])",
  "ytd-video-renderer:has(a[href^='/shorts/'])",
  "ytd-grid-video-renderer:has(a[href^='/shorts/'])",
  // Shorts entry in the left sidebar / guide and the mini guide
  "ytd-guide-entry-renderer:has(a[title='Shorts'])",
  "ytd-mini-guide-entry-renderer[aria-label='Shorts']",
  // Shorts tab on channel pages
  "yt-tab-shape[tab-title='Shorts']",
  "tp-yt-paper-tab:has(> .tab-content[title='Shorts'])",
];

// Recommendation surfaces on the watch page. The related list is targeted
// directly instead of the whole #secondary column so playlist panels and
// live chat stay usable.
const recommendationSelectors = [
  // "Up next" / related videos alongside the player.
  "ytd-watch-next-secondary-results-renderer",
  // Suggestion grid at the end of a video, the endcards leading into it,
  // and the tiles overlaid whenever playback is paused.
  ".ytp-endscreen-content",
  ".ytp-ce-element",
  ".ytp-pause-overlay",
];

function applyBlock() {
  removeBlock();

  const youtubeNavTags = "#chips-content";
  const youtubeNavVoiceSearch = "#voice-search-button";
  const youtubeNavSidebarItems = " #items";
  const youtubeNavNotificationsButton = "#button";
  const youtubeNavCreateButton = "ytd-masthead #end #buttons ytd-button-renderer:first-of-type"
  const youtubeHomeGuideSection = "#guide-inner-content";
  const youtubeVideoOptionsMenu = "#menu";
  const youtubeVideoNotificationsButton = "#notification-preference-button";
  const youtubeVideoSponsorButton = "#sponsor-button";
  // Suggested-videos feed on the homepage. Scoped to the home page-subtype so
  // grids on subscriptions, channel pages, etc. stay visible.
  const youtubeHomeSuggestions = "ytd-browse[page-subtype='home'] ytd-rich-grid-renderer";

  const youtubeStyle = document.createElement("style");
  youtubeStyle.id = "site-blocker-style";

  const selectors = [youtubeNavTags, youtubeNavVoiceSearch, youtubeNavSidebarItems, youtubeNavNotificationsButton, youtubeNavCreateButton, youtubeHomeGuideSection, youtubeHomeSuggestions, youtubeVideoOptionsMenu, youtubeVideoNotificationsButton, youtubeVideoSponsorButton, ...shortsSelectors, ...recommendationSelectors];

  youtubeStyle.textContent = selectors.join(", ") + " { display: none !important; }";

  document.head.appendChild(youtubeStyle);
}

// Disable the Shorts player entirely by redirecting /shorts/ URLs to the
// regular watch page so videos open in the normal player instead.
function redirectShorts() {
  const match = location.pathname.match(/^\/shorts\/([\w-]+)/);
  if (match) {
    location.replace("https://www.youtube.com/watch?v=" + match[1]);
  }
}

// Autoplay is what turns one video into a session, so switch it off. The
// player mounts asynchronously after navigation, so retry briefly until the
// toggle shows up. Note this flips YouTube's own setting: it stays off when
// the blocker is toggled off.
let autoplayTimer = null;

function disableAutoplay() {
  clearTimeout(autoplayTimer);
  if (!location.pathname.startsWith("/watch")) return;

  let attempts = 0;
  const tryToggle = () => {
    const toggle = document.querySelector(".ytp-autonav-toggle-button");
    if (toggle) {
      if (toggle.getAttribute("aria-checked") === "true") toggle.click();
      return;
    }
    if (++attempts < 20) autoplayTimer = setTimeout(tryToggle, 500);
  };
  tryToggle();
}

function removeBlock() {
  const style = document.getElementById("site-blocker-style");
  if (style) style.remove();
}

// Detect YouTube SPA navigation
let lastUrl = location.href;
new MutationObserver(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    if (enabled) {
      redirectShorts();
      applyBlock();
      disableAutoplay();
    }
  }
}).observe(document, { subtree: true, childList: true });

chrome.storage.local.get("enabled", (data) => {
  enabled = data.enabled !== false;
  if (enabled) {
    redirectShorts();
    applyBlock();
    disableAutoplay();
  }
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes.enabled) {
    enabled = changes.enabled.newValue !== false;
    if (enabled) {
      applyBlock();
      disableAutoplay();
    } else {
      removeBlock();
    }
  }
});
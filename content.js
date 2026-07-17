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

  const youtubeStyle = document.createElement("style");
  youtubeStyle.id = "site-blocker-style";

  // Instagram Reels entry in the left sidebar. Exact href match so feed posts
  // that link to /reels/<id> are left alone.
  const instagramReelsSidebar = 'a[href="/reels/"]';

  const selectors = [youtubeNavTags, youtubeNavVoiceSearch, youtubeNavSidebarItems, youtubeNavNotificationsButton, youtubeNavCreateButton, youtubeHomeGuideSection, youtubeVideoOptionsMenu, youtubeVideoNotificationsButton, youtubeVideoSponsorButton, instagramReelsSidebar, ...shortsSelectors];

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
    }
  }
}).observe(document, { subtree: true, childList: true });

chrome.storage.local.get("enabled", (data) => {
  enabled = data.enabled !== false;
  if (enabled) {
    redirectShorts();
    applyBlock();
  }
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes.enabled) {
    enabled = changes.enabled.newValue !== false;
    enabled ? applyBlock() : removeBlock();
  }
});
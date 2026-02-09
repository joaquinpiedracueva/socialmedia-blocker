let enabled = true;

function applyBlock() {
  removeBlock();

  const youtubeNavTags = "#chips-content";
  const youtubeNavVoiceSearch = "#voice-search-button";
  const youtubeNavSidebarItems = " #items";
  const youtubeNavNotificationsButton = "#button";
  const youtubeNavCreateButton = "ytd-masthead #end #buttons ytd-button-renderer:first-of-type"
  const youtubeHomeRecommendationsSection = ".style-scope ytd-rich-grid-renderer";
  const youtubeHomeGuideSection = "#guide-inner-content";
  const youtubeVideoOptionsMenu = "#menu";
  const youtubeVideoNotificationsButton = "#notification-preference-button";
  const youtubeVideoSponsorButton = "#sponsor-button";

  const youtubeStyle = document.createElement("style");
  youtubeStyle.id = "site-blocker-style";

  const isChannelPage = window.location.pathname.includes("@");

  const selectors = [youtubeNavTags, youtubeNavVoiceSearch, youtubeNavSidebarItems, youtubeNavNotificationsButton, youtubeNavCreateButton, youtubeHomeGuideSection, youtubeVideoOptionsMenu, youtubeVideoNotificationsButton, youtubeVideoSponsorButton];
  if (!isChannelPage) selectors.push(youtubeHomeRecommendationsSection);

  youtubeStyle.textContent = selectors.join(", ") + " { display: none !important; }";

  document.head.appendChild(youtubeStyle);
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
    if (enabled) applyBlock();
  }
}).observe(document, { subtree: true, childList: true });

chrome.storage.local.get("enabled", (data) => {
  enabled = data.enabled !== false;
  if (enabled) applyBlock();
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes.enabled) {
    enabled = changes.enabled.newValue !== false;
    enabled ? applyBlock() : removeBlock();
  }
});
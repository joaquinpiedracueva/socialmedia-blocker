

switch (window.location.hostname) {
    case "www.youtube.com":
      const youtubeRecommendations = ".style-scope ytd-rich-grid-renderer";
      const youtubeTags = "#chips-content";
      const youtubeVoiceSearch = "#voice-search-button";
      const youtubeSidebarItems = " #items";
      const youtubeNotifications = "#button";
      const youtubeGuide = "#guide-inner-content"
      const youtubeStyle = document.createElement("style");

      youtubeStyle.textContent = `${youtubeRecommendations}, ${youtubeTags}, ${youtubeVoiceSearch}, ${youtubeSidebarItems}, ${youtubeNotifications}, ${youtubeGuide} { display: none !important; }`;

      document.head.appendChild(youtubeStyle);
      break;
    case "www.reddit.com":
      const redditStyle = document.createElement("style");
      redditStyle.textContent = "#right-sidebar-container, #left-sidebar { display: none !important; }";
      document.head.appendChild(redditStyle);
      break;
    case "www.instagram.com":
      document.body.innerText = "This site is blocked";
      break;
  }

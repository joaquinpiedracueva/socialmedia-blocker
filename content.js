switch (window.location.hostname) {
    case "www.youtube.com":
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

      youtubeStyle.textContent = `${youtubeNavTags}, ${youtubeNavVoiceSearch}, ${youtubeNavSidebarItems}, ${youtubeNavNotificationsButton}, ${youtubeNavCreateButton}, ${youtubeHomeRecommendationsSection}, ${youtubeHomeGuideSection}, ${youtubeVideoOptionsMenu}, ${youtubeVideoNotificationsButton}, ${youtubeVideoSponsorButton} { display: none !important; }`;

      document.head.appendChild(youtubeStyle);
      break;
    case "www.reddit.com":
      const redditRightSidebar = "#right-sidebar-container";
      const redditLeftSidebar = "#left-sidebar";

      const redditStyle = document.createElement("style");

      redditStyle.textContent = `${redditRightSidebar}, ${redditLeftSidebar} { display: none !important; }`;

      document.head.appendChild(redditStyle);
      break;
    case "www.instagram.com":
      document.body.innerText = "This site is blocked";
      break;
  }

switch (window.location.hostname) {
    case "www.youtube.com":
      const youtubeStyle = document.createElement("style");
      youtubeStyle.textContent = "#contents, #guide-inner-content, #alert-banner, #button, #chips-content, #voice-search-button, #items { display: none !important; }";
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
    case "www.netflix.com":
      document.body.innerText = "This site is blocked";
      break;
  }

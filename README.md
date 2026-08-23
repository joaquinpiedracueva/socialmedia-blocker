<p align="center">
  <img src="image.png" alt="Social Media Blocker" />
</p>

## Project Overview

**socialmedia-blocker** — Chrome Manifest V3 extension that removes distractions: it hides the addictive parts of YouTube and blocks other social media sites entirely. No build step, no dependencies, no tests — plain HTML/CSS/JS loaded directly into Chrome.

## Features

### YouTube — distraction-free, still usable

- Hides the homepage suggested-videos feed (subscriptions, channel pages, and search results keep their grids).
- Removes Shorts everywhere: shelves, grid items, the sidebar/guide entries, and channel-page Shorts tabs.
- Opening a `/shorts/` URL redirects to the regular watch page, so the Shorts player never loads.
- Hides masthead and watch-page clutter: category chips, voice search, notifications, the Create button, the guide sidebar, and video menu/notification/sponsor buttons.

### Fully blocked sites

Instagram, X/Twitter, Twitch, Kick, TikTok, Facebook, Netflix, HBO Max, Disney+, and Prime Video never load — the page is stopped before it renders and replaced with a "blocked" screen.

### Toggle with a one-hour daily budget

A popup toggle turns everything on or off at once. The blocker can be off for a total of **one hour per day**: turning it off runs the timer down (a countdown shows in the popup), turning it back on pauses it, and the leftover time is kept for later that day. When the hour is used up, blocking turns back on automatically and the toggle is locked; the budget resets the next day. State persists across sessions; disabling on a blocked site reloads the real page.

## Installation

1. Clone the repository
   ```bash
   git clone https://github.com/joaquinpiedracueva/socialmedia-blocker.git
   ```
2. Open Chrome and go to `chrome://extensions`
3. Enable **Developer mode** (toggle in the top-right corner)
4. Click **Load unpacked**
5. Select the cloned `socialmedia-blocker` folder
6. The extension is now active — visit YouTube and enjoy a distraction-free experience

## Architecture

- **manifest.json** — Manifest V3 config. Injects `content.js` on `*.youtube.com` and `block.js` (at `document_start`) on fully blocked sites. Uses `storage` permission for the enable/disable toggle state and `alarms` for the off-timer.
- **background.js** — Service worker that owns the daily off-budget. When `enabled` flips to `false`, it stores `offUntil` (now + remaining budget) and sets a `chrome.alarms` alarm; toggling back on banks the unused time in `remainingMs`. When the alarm fires it re-enables blocking and zeroes the budget, after which any attempt to disable is reverted. `dayKey` (a local date string) marks which day the budget belongs to — a new day resets it to the full hour. Pending timers are recovered on browser startup in case the alarm fire time passed while the browser was closed.
- **content.js** — Injected into YouTube pages. `applyBlock()` injects a `<style>` tag (id `site-blocker-style`) that hides distracting elements via CSS selectors. A `MutationObserver` detects YouTube's SPA navigation and re-applies blocking with correct selectors for the new URL. Listens to `chrome.storage.onChanged` for real-time toggle updates.
- **block.js** — Injected into the fully blocked sites. Stops the page load at `document_start` and replaces it with a "blocked" screen. Respects the same `enabled` toggle; disabling reloads the real site.
- **popup/** — Browser action popup with a toggle switch and a status line. `popup.js` reads/writes the `enabled` key in `chrome.storage.local`, shows a live countdown while the blocker is off, shows the banked time left while it's on, and disables the toggle once today's budget is spent. `popup.css` uses CSS custom properties in `:root` for theming.

## Key Patterns

- YouTube is a SPA — URL changes don't trigger page reloads, so `content.js` uses a `MutationObserver` comparing `location.href` to detect navigation and re-apply rules (including the `/shorts/` → `/watch` redirect).
- Hiding uses CSS `display: none !important` via an injected `<style>` element, not DOM removal. The style element has id `site-blocker-style` for easy removal on toggle-off.
- `block.js` sets its blocked-screen styles through the CSSOM (`element.style`) rather than a stylesheet, so strict site CSPs can't strip them.
- Toggle defaults to **on** (`enabled !== false`). State persists in `chrome.storage.local` under the `enabled` key.
- Manifest V3 CSP forbids inline scripts — all JS must be in external files.

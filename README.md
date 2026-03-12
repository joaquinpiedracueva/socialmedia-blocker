<p align="center">
  <img src="image.png" alt="YouTube Distraction Blocker" />
</p>

## Project Overview

Chrome Manifest V3 extension that hides distracting YouTube UI elements. No build step, no dependencies, no tests — plain HTML/CSS/JS loaded directly into Chrome.

## Installation

1. Clone the repository
   ```bash
   git clone https://github.com/joaquinpiedracueva/chrome-extension-youtube.git
   ```
2. Open Chrome and go to `chrome://extensions`
3. Enable **Developer mode** (toggle in the top-right corner)
4. Click **Load unpacked**
5. Select the cloned `chrome-extension-youtube` folder
6. The extension is now active — visit YouTube and enjoy a distraction-free experience

## Architecture

- **manifest.json** — Manifest V3 config. Injects `content.js` on `*.youtube.com`. Uses `storage` permission for the enable/disable toggle state.
- **content.js** — Injected into YouTube pages. `applyBlock()` injects a `<style>` tag (id `site-blocker-style`) that hides distracting elements via CSS selectors. A `MutationObserver` detects YouTube's SPA navigation and re-applies blocking with correct selectors for the new URL. Listens to `chrome.storage.onChanged` for real-time toggle updates.
- **popup/** — Browser action popup with a single toggle switch. `popup.js` reads/writes `enabled` key in `chrome.storage.local`. `popup.css` uses CSS custom properties in `:root` for theming.

## Key Patterns

- YouTube is a SPA — URL changes don't trigger page reloads, so `content.js` uses a `MutationObserver` comparing `location.href` to detect navigation and re-apply rules.
- Channel pages (URLs containing `@`) keep the recommendations section visible; all other pages hide it.
- Blocking uses CSS `display: none !important` via an injected `<style>` element, not DOM removal. The style element has id `site-blocker-style` for easy removal on toggle-off.
- Toggle defaults to **on** (`enabled !== false`). State persists in `chrome.storage.local` under the `enabled` key.
- Manifest V3 CSP forbids inline scripts — all JS must be in external files.

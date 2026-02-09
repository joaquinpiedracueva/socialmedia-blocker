# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Chrome Manifest V3 extension that hides distracting YouTube UI elements. No build step, no dependencies, no tests — plain HTML/CSS/JS loaded directly into Chrome.

## Development

Load in Chrome: `chrome://extensions` → Enable Developer mode → Load unpacked → select repo root. After code changes, click the reload button on the extension card.

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

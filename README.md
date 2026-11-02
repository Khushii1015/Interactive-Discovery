# CASE 017 — The Last Login

An original, dark mystery website for **The Curious Case** assignment.

## How to run

Unzip the folder, keep the `assets` directory alongside `index.html`, and open `index.html` in a modern browser. No build tools or server required. To publish, push all files to a GitHub repository and enable GitHub Pages (root folder, main branch).

## How to play

1. Select **Begin Investigation**.
2. Explore the recovered workstation in any order.
3. Examine the basement door security image and inspect its metadata.
4. Return to the access logs after finding the image. A new event decrypts after 2.6 seconds.
5. Read the messages to infer the bird's name and combine it with the door identifier.
6. Save the three required clues and decrypt the drive.
7. Decide what to do with the evidence. Finding the optional facility map changes the outcome of publishing it.
8. Return to the evidence board to track discovered endings. Replay decisions to find all three.

## Scenes and state

Seven navigable interface states are implemented: introduction, desktop, access logs, security stills (with metadata inspection), messages, facility map, evidence board, encrypted drive, and final recording. The six primary exploration modules are desktop, logs, stills, messages, map, and vault/final; auxiliary intro/evidence views provide orientation and tracking. JavaScript swaps the interface content within a modal, and the underlying desktop remains navigable.

**Persistent state:** `photo`, `messages`, `log`, `map`, `unlocked`, `endings` and `started` are stored in `localStorage` with error handling. The encrypted drive requires three clues and a key assembled from two separate sources. The map is optional but changes the publication ending. Three endings can be discovered and tracked. A delayed access-log reveal rewards revisiting a scene.

## Project files

- `index.html` — semantic desktop, intro, panel, status bar and audio element
- `style.css` — dark terminal styling, desktop/mobile layouts, keyboard focus states
- `script.js` — navigation, story content, state persistence, timed reveal and branching
- `assets/camera04.jpg` — original generated basement-door still
- `assets/camera02.jpg` — original generated corridor still
- `assets/blueprint.jpg` — original generated facility diagram
- `assets/signal.wav` — original synthesized signal audio

## Credits and attribution

All three images were created specifically for this project using Python/Pillow drawing and texture processing. The ambient audio was synthesized specifically for this project using Python's standard-library `wave` module. No third-party images, stock media, Google Fonts, or copyrighted sound recordings are used. Typography uses system fonts (Consolas, Courier New, Arial, with fallbacks).

## Accessibility and technical notes

- Keyboard navigation: Tab, Shift+Tab, Escape to close panel
- Focus management and focus trapping within the open panel
- Alternative text on all images
- Responsive CSS at 700px; readable text sizes
- Reduced-motion support and no autoplay audio
- Safe fallback for invalid saved progress
- Uses no dependencies and works offline

## Testing checklist

- [ ] Open intro and enter desktop
- [ ] Visit messages and map in either order
- [ ] Inspect door image and collect door identifier
- [ ] Revisit logs, wait ~3 seconds, collect recovered event
- [ ] Try incorrect key; then solve the combined key
- [ ] Publish without map; restart the decision and publish with map
- [ ] Choose to keep evidence secret; check ending tracker
- [ ] Refresh page and verify progress persists
- [ ] Test on narrow mobile viewport and with keyboard only

Additional original illustration: assets/mara.jpg (fictional researcher portrait).

## Supplied visual assets
The four JPEGs in `assets/` were provided by the project creator and integrated into the game: `mara.jpg`, `blueprint.jpg`, `camera02.jpg`, `camera04.jpg`. `signal.wav` is the locally generated audio asset.

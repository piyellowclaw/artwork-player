# Offline Artwork Player (macOS)

Node + Electron exhibition player. Each artwork remains an independently editable folder under `artworks/`. The player never writes artwork originals, changes random seeds, or patches source files on disk. The local server injects an **external** bridge into HTML responses and temporarily makes original script elements inert; only a start message at the crossfade boundary activates them in order. Hidden preloaded art therefore cannot finish before becoming visible. This adapter changes execution timing, not RNG algorithms.

## Install / launch

Use a local Node 22+ installation with `node` and `npm` on PATH, then run from this folder (no global install):

```sh
npm ci
npm test
npm run test:electron       # isolated synthetic artworks; small window, auto-closes
npm run smoke               # bounded launch check; windowed, closes after 15 seconds
npx electron player/test/real-artworks.js # all 8 real artworks; screenshots + completion evidence
npm run list-displays
npm start -- --windowed     # safe editing preview
npm start -- --display 123  # exhibition launch ONLY when desired
```

Without `--windowed`, the borderless window fills the selected display's **bounds** (not work area). An unavailable ID falls back to the first external display, then primary. This does not change macOS display configuration or open a fullscreen Space. Escape closes the app. Right arrow / Space skips a generation; Enter manually confirms completion. A new iframe/document generates a fresh artwork using its original RNG setup on each repetition.

## Manifest contract

`artworks/manifest.json` accepts an array or an object:

```json
{
  "config": {"repetitions": 3, "holdMs": 10000, "fadeMs": 600,
             "readyTimeoutMs": 30000, "watchdogMs": 180000},
  "artworks": [
    {"id": "example", "title": "Example", "path": "artworks/example/index.html",
     "completion": "noLoop", "completionDelayMs": 0}
  ]
}
```

All **eight** imported artworks use the audited `setup` adapter: after original scripts execute, the bridge wraps the existing global `setup`, preserves its arguments/return value, observes successful async settlement, and waits two animation frames before signaling completion. Each source was inspected for drawing work that might escape setup; see [completion audit](audit/completion.md). Rejected setup or script errors do not count as completion.

Other completion adapters: `fxpreview` hooks window.fxpreview / $fx.preview; `noLoop` hooks p5.prototype.noLoop; `either` accepts either. **Choose after inspecting the specific artwork**: fxpreview often means an early preview, not drawing completion. Unspecified completion defaults to `manual` rather than guessing. `timeout` requires `durationMs` and is visibly labeled a configured duration, never a genuine completion signal. Per-art `holdMs` / `watchdogMs` / `completionDelayMs` override the defaults. A completion delay is useful only if an inspected source has a known short post-signal tail.

The hold starts on the accepted completion event, not iframe loading. Default sequence is A1,A2,A3,B1,B2,B3,… looping. Two iframes overlap for the fade; the old one is removed afterward, disposing its timers/graphics. Source-window + origin + unique generation-token checks discard stale frame messages. Ready timeout and watchdog are visible warnings; **neither silently counts as finished**. Use → to skip or Enter to confirm manually after inspecting the image.

## Offline / safety

The server binds an ephemeral port on 127.0.0.1, serves only player/ and artworks/, rejects path/symlink escapes, and never exposes arbitrary project files. Electron allows network requests only to that exact loopback origin (plus in-memory data/blob/about URLs); remote HTTP(S), WebSocket and file requests are blocked. Assets must be local. Permissions/popups are denied. Browser settings: nodeIntegration=false, contextIsolation=true, sandbox=true, webSecurity=true. Iframes are same-origin trusted local artwork, not a hostile-content isolation boundary. Do not put untrusted code in artworks/.

The bridge supports ordinary classic/module script artwork pages. Arbitrary document.write, strict CSP, dynamically replaced HTML, or libraries requiring parser-blocking script semantics require per-art validation/adaptation; do not declare those verified merely because an iframe loads. All eight imported works passed offline visual/completion checks in a normal window. The response transform removes only the known analytics script/initialization and Human Flow’s audited unused missing `colorSetting.js` include; original files and RNG snippets remain intact. Source/asset provenance is documented separately in [ARTWORKS.md](ARTWORKS.md).

## Verification

`npm test` exercises config validation, source-preserving injection, server confinement and repetition ordering. `npm run test:electron` opens a small isolated test window, checks hidden-preload suspension, completion-relative holding, stale messages, fxpreview/noLoop, repetition/next progression, frame cleanup, actual network denial, watchdog non-completion, and ready-timeout reporting. `npm run smoke` is a bounded real-manifest launch check, not proof that all eight artworks finished or that the external-display layout is correct. No automatic test takes over an external screen.

`npx electron player/test/real-artworks.js` runs all eight actual artworks to genuine setup completion (15-minute bound per work), records network failures and canvas statistics, and saves screenshots in `audit/real-artworks/`. Latest evidence: **23/23 unit tests, Electron integration, and 8/8 real artworks passed**; all screenshots visually inspected, with no HTTP/network/rendering errors. See [audit/completion.md](audit/completion.md) for timings and limitations. External-display placement has not been automatically verified.

Full eight-artwork verification: `npx electron player/test/real-artworks.js` (windowed; can take minutes). Chinese launch guide: [QUICKSTART.zh-TW.md](QUICKSTART.zh-TW.md). Third-party licenses and complete p5 source archives: [THIRD-PARTY.md](THIRD-PARTY.md).

Exhibition launch hides the cursor, routine status and help overlays; failures/watchdog warnings remain visible. Windowed preview retains debug status and keyboard hints.

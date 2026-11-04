# Offline Artwork Player (macOS)

Node + Electron exhibition player. Each artwork remains an independently editable folder under `artworks/`. The player never writes artwork originals, changes random seeds, or patches source files on disk. The local server injects an **external** bridge into HTML responses and temporarily makes original script elements inert; only a start message after the outgoing document is removed activates them in order. Hidden preloaded art is inert. The incoming generation starts behind black and becomes visible after its first canvas paint, while generation continues in realtime. This adapter changes execution timing, not RNG algorithms.

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
npm start -- --display 0    # first listed display; exhibition ONLY when desired
```

`npm run list-displays` prints zero-based **index**, OS ID and name. `--display 0` selects the first listed screen; `--display-index 1` is an alias selecting the second. Advanced compatibility: `--display-id OS_ID` selects an explicit OS ID. An invalid explicit selection fails rather than opening on another screen. Without a selection, the first external display is preferred, then primary. Without `--windowed`, the opaque, square-cornered, shadowless borderless window fills the selected display's **bounds** (not work area), without changing macOS display configuration or opening a fullscreen Space. Escape closes the app. Right arrow / Space skips a generation; Enter manually confirms completion. A new iframe/document generates a fresh artwork using its original RNG setup on each repetition.

## Manifest contract

`artworks/manifest.json` accepts an array or an object:

```json
{
  "config": {"shuffle": true, "repetitions": 3, "holdMs": 10000, "fadeMs": 600,
             "readyTimeoutMs": 30000, "watchdogMs": 180000},
  "artworks": [
    {"id": "example", "title": "Example", "path": "artworks/example/index.html",
     "completion": "noLoop", "completionDelayMs": 0}
  ]
}
```

All **eight** imported artworks use the audited `setup` adapter: after original scripts execute, the bridge wraps the existing global `setup`, preserves its arguments/return value, observes successful async settlement, and waits two animation frames before signaling completion. Each source was inspected for drawing work that might escape setup; see [completion audit](audit/completion.md). Rejected setup or script errors do not count as completion.

Other completion adapters: `fxpreview` hooks window.fxpreview / $fx.preview; `noLoop` hooks p5.prototype.noLoop; `either` accepts either. **Choose after inspecting the specific artwork**: fxpreview often means an early preview, not drawing completion. Unspecified completion defaults to `manual` rather than guessing. `timeout` requires `durationMs` and is visibly labeled a configured duration, never a genuine completion signal. Per-art `holdMs` / `watchdogMs` / `completionDelayMs` override the defaults. A completion delay is useful only if an inspected source has a known short post-signal tail.

The hold starts on the genuine accepted completion event, not loading or the first frame: default **completion + 10 seconds**. Default order is a fresh Fisher–Yates shuffle bag per round: every artwork appears exactly once, retaining configurable three consecutive generations (e.g. C1,C2,C3,A1,A2,A3,…). All works are visited before reshuffling. With multiple works the next round never starts with the previous round's last work. Playlist RNG runs in the parent, independent of artwork RNG. Set config.shuffle=false for manifest order; default true. Manual skips/failures consume the scheduled generation rather than restarting a round; failures require operator skip, as before.

### Serial fade through black (not a crossfade)

1. Fade the outgoing artwork to black for `fadeMs` (default **600 ms**).
2. Remove its iframe, stopping that generation **before** activating the next one. A second preloaded iframe may exist, but its original scripts remain inert.
3. While black, await local-script readiness, execute incoming scripts in order, then await a genuine canvas submission and two animation-frame boundaries (or an explicit custom-renderer start signal).
4. Fade in the incoming artwork for another `fadeMs` (**600 ms**). **Do not wait for generation to finish**: viewers see realtime drawing.

Total fade time is 1.2 seconds by default, plus any readiness/activation delay behind black. Canvas observation covers connected 2D, WebGL and bitmap canvases; custom/non-canvas renderers must dispatch `window.dispatchEvent(new Event('artwork-player-started'))` when genuinely starting, not merely on document load. First paint/start readiness and completion are independent handshakes. A completion that arrives before fade-in still starts its hold, but cannot advance a retired generation or interrupt the serialized transition.

`readyTimeoutMs` bounds each readiness and activation phase separately (default 30 seconds). Load/script/start errors or activation timeouts keep the display black and remove the failed generation; → / Space manually skips and recovers. These failures never count as completion. The completion watchdog warns without auto-finishing; Enter can confirm a healthy active generation manually. Source-window + origin + unique generation-token checks reject stale messages; retiring the outgoing frame immediately disables its completion/hold callbacks.

## Offline / safety

The server binds an ephemeral port on 127.0.0.1, serves only player/ and artworks/, rejects path/symlink escapes, and never exposes arbitrary project files. Electron allows network requests only to that exact loopback origin (plus in-memory data/blob/about URLs); remote HTTP(S), WebSocket and file requests are blocked. Assets must be local. Permissions/popups are denied. Browser settings: nodeIntegration=false, contextIsolation=true, sandbox=true, webSecurity=true. Iframes are same-origin trusted local artwork, not a hostile-content isolation boundary. Do not put untrusted code in artworks/.

The bridge supports ordinary classic/module script artwork pages. Arbitrary document.write, strict CSP, dynamically replaced HTML, or libraries requiring parser-blocking script semantics require per-art validation/adaptation; do not declare those verified merely because an iframe loads. All eight imported works passed offline visual/completion checks in a normal window. The response transform removes only the known analytics script/initialization and Human Flow’s audited unused missing `colorSetting.js` include; original files and RNG snippets remain intact. Source/asset provenance is documented separately in [ARTWORKS.md](ARTWORKS.md).

## Verification

`npm test` exercises config validation, source-preserving injection, server confinement and repetition ordering. `npm run test:electron` opens a small isolated test window, uses condition-based waits to check inert preload, serial removal-before-activation, black during delayed first paint, realtime visibility before completion, activation timeout/error blackouts, manual recovery, completion-relative holding, stale/retired messages, fxpreview/noLoop, three repetitions, network denial and watchdog/ready timeouts. Deterministic transition unit tests also cover early completion holds and cancellation. `npm run smoke` is a bounded real-manifest launch check, not proof that all eight artworks finished or that the external-display layout is correct. No automatic test takes over an external screen.

`npx electron player/test/real-artworks.js` runs all eight actual artworks to genuine setup completion (15-minute bound per work), records network failures and canvas statistics, and saves screenshots in `audit/real-artworks/`. Latest evidence: **39/39 unit tests, Electron integration, and 8/8 real artworks passed**; all screenshots visually inspected, with no HTTP/network/rendering errors. See [audit/completion.md](audit/completion.md) for timings and limitations. External-display placement has not been automatically verified.

Full eight-artwork verification: `npx electron player/test/real-artworks.js` (windowed; can take minutes). Chinese launch guide: [QUICKSTART.zh-TW.md](QUICKSTART.zh-TW.md). Third-party licenses and complete p5 source archives: [THIRD-PARTY.md](THIRD-PARTY.md).

Exhibition launch hides the cursor, routine status and help overlays; failures/watchdog warnings remain visible. Windowed preview retains debug status and keyboard hints.

Exhibition mode raises only the selected player window above the macOS menu bar using Electron's screen-saver always-on-top level. The window is configured before it is shown, and can cover other windows on that screen; Esc still exits. --windowed preview stays at normal level. No system menu-bar preferences, kiosk mode, global shortcuts or display settings are changed. Physical multi-display/Spaces behavior should be checked on the exhibition Mac.

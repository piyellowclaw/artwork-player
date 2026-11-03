# Genuine completion audit

All eight manifest entries use `setup`: the response-only bridge wraps the existing window.setup **after** all original classic scripts execute and before p5's delayed load bootstrap. It invokes the original with unchanged this/arguments, returns its original result, and observes successful Promise settlement. Completion is posted after two requestAnimationFrame callbacks (final composite/paint boundary). No elapsed-time guess or watchdog is treated as completion. Watchdog is 15 minutes, visible/manual skip only.

## Source inspection

- Generative Succulent: setup awaits bowl rendering, starts concurrent drawPlant jobs, then explicitly polls every bowl.isPlantDrawn before returning. plantObj.js sets that flag after awaiting drawPlantB (empty bowls start finished). Empty draw() adds nothing later.
- Folding: async init() has only synchronous assignments (no await), so its unawaited call does not escape setup. setup completes sprite generation and awaits each sequential 30ms folding step; last composite is inside the final iteration. No later draw loop.
- Human Flow: setup awaits every human drawing iteration; async draw() is empty. NYColor is defined in object.js, NYLerpColor in helper.js; all color use resolves locally. No GetColorSet or colorSetting symbols are referenced. Missing upstream colorSetting.js is therefore an unused stale HTML reference, removed **only for this artwork's response**.
- Refractions: setup awaits refractor drawing and every beam tracing loop, returning only after all beam terminal segments. No later rendering task.
- Sketching Clouds: setup awaits path/circle generation and each cloud paint loop, ending after the final white-cloud shading. draw() is empty.
- Wire City: setup awaits sequential building rows/connections and finishes with drawFrame(). draw() is empty.
- Zen Pots: setup awaits each drawPot; drawer.js awaits segment/dot/stick jobs, then setup calls final UpdateLayers().
- Recursive and Blocks: setup awaits startDraw(), marks drawFinished, optionally calls fxpreview, then noLoop. Using setup settlement rather than early noLoop allows the same final-frame fence. Parent's requested removal of ONLY await NYRandomTextureLines() was observed on disk before validation. The existing draw() composites mainCanvas; noLoop behavior and final canvas are checked by actual smoke.

## Offline response transform

Source files on disk are not rewritten. Remove the explicit googletagmanager.com/gtag/js analytics include and its known G-D3VYKTX0TN initialization block, and only Human Flow's audited unused colorSetting.js include. All arbitrary missing resources and JS failures remain visible errors and prevent completion. Original inline RNG snippets, global lexical declarations, script order, seeds, and artwork algorithms remain intact.

## Verification

Executable real-artwork smoke: player/test/real-artworks.js. Uses a normal 800x600 window, exact-origin offline interception, 15-minute per-work bound, real p5 rendering, screenshots and canvas pixel statistics. Results: audit/real-artworks/results.json; console log: audit/real-artworks.log. Detailed timings to be appended after completion.

Unit tests: audit/unit-tests.log. Electron synthetic integration: audit/electron-integration.log (hidden preload inertness, 3 repetitions, old frame cleanup, fxpreview/noLoop, keyboard skip, offline denial, visible watchdog/ready timeout, successful async setup and rejected setup).

## Actual offline windowed run — 2026-11-04 Asia/Taipei

All 8/8 passed genuine setup completion. Each screenshot visually inspected: distinct completed artwork, no blank/error screen. Canvas 800×568 in normal decorated 800×600 window; exactly two frames (visible + inert preload). One randomized generation per artwork, hashes recorded in JSON; timings include loading and ≤250ms observation polling, not performance guarantees.

| Artwork | Seconds | RGB colors | Screenshot |
|---|---:|---:|---|
| 2023-Generative-Succulent | 1.781 | 126618 | real-artworks/2023-Generative-Succulent.png |
| 2023-Folding | 1.035 | 149099 | real-artworks/2023-Folding.png |
| 2023-Human-Flow | 4.391 | 166589 | real-artworks/2023-Human-Flow.png |
| 2023-Refractions | 3.613 | 84299 | real-artworks/2023-Refractions.png |
| 2023-Sketching-Clouds | 37.905 | 1572 | real-artworks/2023-Sketching-Clouds.png |
| 2023-Wire-City | 0.781 | 154843 | real-artworks/2023-Wire-City.png |
| 2023-Zen-Pots | 8.510 | 231 | real-artworks/2023-Zen-Pots.png |
| 2022-Recursive-and-Blocks | 5.157 | 63505 | real-artworks/2022-Recursive-and-Blocks.png |

All eight: zero blocked requests, zero HTTP failures, zero network failures. Live global setup/fxrand bindings recorded. Standard Electron allow-scripts/allow-same-origin iframe warning remains: trusted local artwork is not an untrusted-content isolation boundary.

23/23 Node tests passed; expanded fixture Electron integration ended ELECTRON_INTEGRATION_PASS; actual-art executable ended REAL_ARTWORKS_PASS. No artwork sources/importer modified by this work.

## Independent review follow-up

Reviewer found a retired-frame completion race during manual skip while the next iframe is not ready. Fixed by retiring current.active at advance initiation and binding hold callbacks to the exact active frame. A real Electron regression delays the next asset by 500ms, skips the outgoing generation before completion, then verifies the incoming manual generation remains active and unfinished. Final fixture integration passed. p5 licensing gate resolved with version-specific LGPL texts, readable distributions and complete tagged source archives; see THIRD-PARTY.md. README updated for eight setup-completion adapters.

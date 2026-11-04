# Recursive viewport with original internal padding — PASS

Restored original padding: 100 * scaler, default 50 on the 2000-pixel long-edge drawing buffer. Canvas still fills the viewport aspect ratio; fixed-orientation letterboxing is not restored.

Actual offline p5 rendering passed for 800x450, 450x800 and 600x600. Genuine setup completion, stable final frames, exact final pixel match to completed mainCanvas. All four internal paper-colored padding bands are uniform; no transparent pixels or black letterbox edges. Results and screenshots refreshed after padding correction; wide screenshot visually inspected. Earlier no-margin evidence is superseded.

52 unit tests pass, including restored 50-pixel inset grid bounds. Core drawing/RNG algorithms unchanged. Upstream original and authorized local checksum verified. See results.json for hashes, dimensions and measured margin bands. Ordinary window only, no exhibition takeover.

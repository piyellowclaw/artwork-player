# Local playback modification
Removed the setup call to NYRandomTextureLines() to skip the expensive background texture pass, as requested. The texture function remains available for future editing, but is not invoked during generation. Background color and all block/triangle drawing remain.
SOURCE.json records the original upstream file checksums; sketch.js intentionally differs after this modification. Removing the pass also skips its random-number consumption, so the same fxhash can produce a different block composition than the original textured version.

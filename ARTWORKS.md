# Artwork sources and editing
Each artwork is self-contained in artworks/<year-title>/. Edit its sketch.js and helper files independently. SOURCE.json records original URLs, import time, SHA-256 and byte sizes. RNG/fxhash source is retained.

Sources: https://sketch.newyellow.xyz/ (Newyellow). Vendored p5.js retains its upstream version banner. Complete LGPL notices, readable builds, upstream source archives and third-party attribution are provided under third-party/; see THIRD-PARTY.md. Public repository access does not imply a new license grant for the artwork; no blanket software/artwork license has been added.

2022-Recursive-and-Blocks: expensive background texture call disabled; composition now fills the viewport aspect ratio with no fixed paper margin or letterbox. Original sketch archived under its upstream/ folder, authorized local checksum in LOCAL-CHANGES.json; see LOCAL-CHANGES.md. This intentionally changes subsequent RNG state compared to the original texture pass.

2023-Human-Flow upstream references colorSetting.js, which returned HTTP 404 at import. No replacement code has been invented. The integration audit documents whether this unused reference is omitted by the serving adapter.

The initial importer is scripts/import-artworks.mjs. It refuses to overwrite any existing artwork folder, protecting subsequent edits. SOURCE.json describes upstream bytes rather than declaring all local files unchanged.

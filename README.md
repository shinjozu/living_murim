# Living Murim v25.0.0

A local-first Murim life RPG. Create a character, choose an origin, and describe your actions in the story input. Suggested approaches are optional. The local game owns combat, costs, rewards, relationships and progression; optional AI narrates settled outcomes.

## Play

Upload the complete playable ZIP contents to a GitHub Pages publishing folder or another HTTPS static host. Keep the folders intact. No server, account or API key is required for offline narration and gameplay.

For a local preview, extract the ZIP first and install Node.js 22 or newer. On Windows, double-click `Play-Living-Murim.cmd`; on other systems, run `npm start` in the extracted game folder. Keep that terminal open and visit `http://127.0.0.1:4177` in your browser. Close the terminal to stop the server. This server starts with paid services disabled. Alternatively, serve the folder with any static web server. Opening index.html directly does not provide PWA support.

On iPhone, open the HTTPS site in Safari and use Share → Add to Home Screen. Allow the first online load to finish before using offline mode. Portrait and landscape retain the same controls; normal vertical scrolling is supported. Physical iPhone/Safari testing has not been performed in this environment.

Music and effects start after interaction. Settings includes volume, motion, text size, orientation preference and optional narration settings. Device/browser support determines whether orientation can be locked.

## Saves

This is the v25 schema-4 build. Start a new journey when moving from incompatible earlier releases. Compatible v25 saves receive defaults for newer equipment, pet and appearance fields. Export your save before changing hosts or clearing browser data. Save files remain local; do not publish them with the game.

## Optional AI

Offline narration is the default. The optional server can connect to a local model or a configured hosted narrator. See `server/config.example.env` for configuration; no credentials are included. Hosted narration requires explicit budget and model configuration. Keys belong only on the server, never in browser files or GitHub Pages.

Encounter image generation is separately disabled by default. It requires explicit server configuration, its own budget and the player's settings toggle. A portrait request is made only when the player presses its button. Failure preserves local character art. Generated artwork cannot change gameplay. Live paid-provider quality and availability were not tested.

## Development

The source workspace contains validation tools and detailed reports separately from the game-only ZIP. In the full source workspace only, run `npm test` for project checks and `npm run build:cache` after changing runtime files. Those development commands are not included in the playable ZIP; its only npm command is `npm start`. Run browser fixtures sequentially because they share an isolated QA save namespace.

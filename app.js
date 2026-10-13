// ── Hostinger / Passenger entry point ────────────────────────────────────────
// The application itself lives in the esbuild bundle at dist/server.cjs.
// Hostinger's Node.js panel asks for an "Application startup file": you may use
// this file (app.js) or point it directly at dist/server.cjs — both work.
// Build the bundle first with:  npm run build
import './dist/server.cjs';

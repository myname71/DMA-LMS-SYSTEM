/**
 * /api/auth  —  modular Express router
 *
 * Endpoint map (matches App.tsx calls):
 *   POST  /api/auth/register
 *   POST  /api/auth/login
 *   POST  /api/auth/logout
 *   GET   /api/auth/me          ← was missing from the old Prisma-based router
 *   POST  /api/auth/change-password
 *
 * This router is a stub — auth logic stays in server.ts for now because it
 * needs access to bcrypt, JWT signing, email, and the invite system that are
 * all wired together there.  This file exists to document the intended modular
 * shape and will receive the extracted logic in a follow-up refactor.
 *
 * Mount in server.ts with:
 *   import authRouter from './routes/auth';
 *   app.use('/api/auth', authRouter);
 *
 * Once mounted, remove the inline /api/auth/* blocks from server.ts.
 */

// ── MIGRATION NOTE ────────────────────────────────────────────────────────────
//
// The previous version of this file:
//   • imported from @prisma/client (now dead code — server uses in-memory state)
//   • imported from ../controllers/authController (uses Prisma, not state)
//   • did NOT register GET /me, so /api/auth/me returned 404 for App.tsx
//
// The current server.ts has all auth routes inline and working correctly:
//   app.post("/api/auth/register", ...)
//   app.post("/api/auth/login", ...)
//   app.post("/api/auth/logout", ...)
//   app.get("/api/auth/me", ...)          ← now present
//   app.post("/api/auth/change-password", ...)
//
// Until the logic is extracted here, do NOT import/mount this file in server.ts.
// ─────────────────────────────────────────────────────────────────────────────

export {};

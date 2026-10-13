/**
 * /api/enrollments & /api/my  —  modular Express router
 *
 * Endpoint map:
 *   GET /api/my/enrollments              authenticated student's own enrollments
 *   GET /api/my/certificates             authenticated student's own certificates
 *   GET /api/enrollments/:userId         legacy — prefer /api/my/enrollments
 *
 * Mount in server.ts with:
 *   import enrollmentsRouter from './routes/enrollments';
 *   app.use('/api', enrollmentsRouter);       // note: /api, not /api/enrollments
 */

import { Router, Request, Response } from "express";
import { state } from "../lib/appState";
import jwt from "jsonwebtoken";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET!;
const COOKIE_NAME = "dma_token";

function getSession(req: Request): { userId: string; email: string; role: string } | null {
  const raw =
    req.cookies?.[COOKIE_NAME] ||
    (req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.slice(7)
      : null);
  if (!raw) return null;
  try {
    const d = jwt.verify(raw, JWT_SECRET) as any;
    return { userId: d.id, email: d.email, role: d.role };
  } catch {
    return null;
  }
}

function requireSession(req: Request, res: Response) {
  const s = getSession(req);
  if (!s) { res.status(401).json({ error: "Authentication required" }); return null; }
  return s;
}

/** GET /api/my/enrollments — preferred; no userId in URL */
router.get("/my/enrollments", (req: Request, res: Response) => {
  const session = requireSession(req, res);
  if (!session) return;
  const enrollments = state.enrollments.filter((e: any) => e.userId === session.userId);
  res.json({ enrollments });
});

/** GET /api/my/certificates — preferred; no userId in URL */
router.get("/my/certificates", (req: Request, res: Response) => {
  const session = requireSession(req, res);
  if (!session) return;
  const certs = (state.certificates || []).filter((c: any) => c.userId === session.userId);
  res.json({ certificates: certs });
});

/**
 * GET /api/enrollments/:userId — legacy path.
 * Prefer GET /api/my/enrollments.  Kept for backward compatibility.
 */
router.get("/enrollments/:userId", (req: Request, res: Response) => {
  const session = getSession(req);
  const { userId } = req.params;
  if (
    !session ||
    (session.userId !== userId &&
      session.role !== "admin" &&
      session.role !== "super_admin")
  ) {
    res.status(403).json({ error: "Access denied" });
    return;
  }
  const enrollments = state.enrollments.filter((e: any) => e.userId === userId);
  res.json({ enrollments });
});

export default router;

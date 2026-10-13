/**
 * Reusable authorization middleware for the DMA Express backend.
 *
 * Roles (from src/types.ts / AppUser.role):
 *   super_admin | admin | instructor | student
 *
 * Additional flags on users:
 *   isApproved  — instructors must be approved before creating/publishing courses
 *   suspended   — suspended accounts cannot perform privileged actions
 *
 * Usage:
 *   import {
 *     requireAuth,
 *     requireRoles,
 *     requireApprovedInstructor,
 *     attachUser,
 *   } from "./middleware/authorize";
 *
 *   // Prefer a getter so the latest state is used (server.ts reassigns `state` on load)
 *   const getState = () => state;
 *
 *   app.post("/api/courses/create", requireApprovedInstructor(getState), handler);
 *   app.get("/api/admin/users", requireAuth, requireRoles("admin", "super_admin"), handler);
 *
 * Attaches `req.session` and (when attachUser / requireApprovedInstructor runs)
 * `req.user` so handlers do not need to re-parse the JWT.
 */

import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "";
const COOKIE_NAME = process.env.COOKIE_NAME || "dma_token";

export type UserRole = "super_admin" | "admin" | "instructor" | "student";

export interface SessionPayload {
  userId: string;
  email: string;
  role: UserRole | string;
}

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  name?: string;
  suspended?: boolean;
  isApproved?: boolean;
  [key: string]: unknown;
}

type StateLike = { users: AuthUser[] };
type StateSource = StateLike | (() => StateLike);

declare global {
  namespace Express {
    interface Request {
      session?: SessionPayload | null;
      user?: AuthUser;
    }
  }
}

function resolveState(source: StateSource): StateLike {
  return typeof source === "function" ? source() : source;
}

/** Low-level JWT / cookie extraction (no response side-effects). */
export function getSession(req: Request): SessionPayload | null {
  if (!JWT_SECRET) return null;

  const cookieToken =
    req.cookies && typeof req.cookies === "object"
      ? (req.cookies as Record<string, string>)[COOKIE_NAME]
      : undefined;

  const header = req.headers?.authorization;
  const bearerToken =
    typeof header === "string" && header.startsWith("Bearer ")
      ? header.slice(7)
      : null;

  const raw = cookieToken || bearerToken;
  if (!raw) return null;

  try {
    const d = jwt.verify(raw, JWT_SECRET) as Record<string, unknown>;
    // Tokens are signed as { id, email, role } — accept userId as alias
    const userId = (d.id ?? d.userId) as string | undefined;
    const email = d.email as string | undefined;
    const role = d.role as string | undefined;
    if (!userId || !email || !role) return null;
    return { userId, email, role };
  } catch {
    return null;
  }
}

/**
 * Require a valid session. Sets `req.session`.
 * Responds 401 and ends the request when unauthenticated.
 */
export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const s = getSession(req);
  if (!s) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  req.session = s;
  next();
}

/**
 * Require the session role to be one of the allowed roles.
 * Can be used alone or after `requireAuth`.
 */
export function requireRoles(
  ...allowed: (UserRole | string)[]
): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    const s = req.session ?? getSession(req);
    if (!s) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }
    req.session = s;
    if (!allowed.includes(s.role)) {
      res.status(403).json({
        error: `Access denied. Required role: ${allowed.join(" or ")}`,
      });
      return;
    }
    next();
  };
}

/** Shortcut: admin or super_admin. */
export const requireAdmin: RequestHandler = requireRoles(
  "admin",
  "super_admin"
);

/** Shortcut: super_admin only. */
export const requireSuperAdmin: RequestHandler = requireRoles("super_admin");

/**
 * Load the full user record and attach it as `req.user`.
 * Rejects missing and suspended accounts.
 *
 * Pass either the state object or a getter `() => state` so the latest
 * users array is always used (server.ts reassigns `state` on load).
 */
export function attachUser(stateSource: StateSource): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    const s = req.session ?? getSession(req);
    if (!s) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }
    req.session = s;

    const { users } = resolveState(stateSource);
    const user = users.find((u) => u.id === s.userId);
    if (!user) {
      res.status(401).json({ error: "User not found" });
      return;
    }
    if (user.suspended) {
      res.status(403).json({ error: "Account is suspended" });
      return;
    }
    req.user = user;
    next();
  };
}

/**
 * Instructor (or admin/super_admin) who is approved.
 * Rejects unapproved instructors, non-instructor roles, and suspended accounts.
 *
 * Pass either the state object or a getter `() => state`.
 */
export function requireApprovedInstructor(
  stateSource: StateSource
): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    const s = req.session ?? getSession(req);
    if (!s) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }
    req.session = s;

    const { users } = resolveState(stateSource);
    const user = users.find((u) => u.id === s.userId);

    // Admins / super_admins always allowed
    if (s.role === "admin" || s.role === "super_admin") {
      if (user) {
        if (user.suspended) {
          res.status(403).json({ error: "Account is suspended" });
          return;
        }
        req.user = user;
      }
      next();
      return;
    }

    if (s.role !== "instructor") {
      res.status(403).json({
        error: "Only instructors (or admins) can perform this action",
      });
      return;
    }

    if (!user) {
      res.status(401).json({ error: "User not found" });
      return;
    }
    if (user.suspended) {
      res.status(403).json({ error: "Account is suspended" });
      return;
    }
    // Explicit false only — undefined/true both treated as approved for legacy rows
    if (user.isApproved === false) {
      res.status(403).json({
        error:
          "Instructor account is pending approval. You cannot create or publish courses until an admin approves your account.",
      });
      return;
    }
    req.user = user;
    next();
  };
}

/**
 * Backward-compatible helpers matching the original server.ts signatures.
 * Prefer the Express middleware forms above for new code.
 */
export function requireSession(
  req: Request,
  res: Response
): SessionPayload | null {
  const s = getSession(req);
  if (!s) {
    res.status(401).json({ error: "Authentication required" });
    return null;
  }
  req.session = s;
  return s;
}

export function requireAdminSession(
  req: Request,
  res: Response
): SessionPayload | null {
  const s = getSession(req);
  if (!s) {
    res.status(401).json({ error: "Authentication required" });
    return null;
  }
  if (s.role !== "admin" && s.role !== "super_admin") {
    res.status(403).json({ error: "Admin access required" });
    return null;
  }
  req.session = s;
  return s;
}
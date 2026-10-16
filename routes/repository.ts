import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import jwt from "jsonwebtoken";
import { state, saveState, addLog } from "../lib/appState";

const router = Router();
const UPLOAD_DIR = path.resolve(process.cwd(), "private_uploads", "repository");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const safe = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${path.extname(file.originalname)}`;
    cb(null, safe);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
});

function getSession(req: Request): { userId: string; email: string; role: string } | null {
  const raw =
    req.cookies?.dma_token ||
    (req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.slice(7)
      : null);

  if (!raw) return null;

  try {
    const d = jwt.verify(raw, process.env.JWT_SECRET || "") as any;
    return {
      userId: d.id || d.userId,
      email: d.email,
      role: d.role,
    };
  } catch {
    return null;
  }
}

router.post("/upload", upload.single("file"), (req: Request, res: Response) => {
  const session = getSession(req);
  if (!session) return res.status(401).json({ error: "Authentication required" });

  if (!["instructor", "admin", "super_admin"].includes(session.role)) {
    return res.status(403).json({ error: "Only instructors or admins can upload" });
  }

  const file = req.file;
  if (!file) return res.status(400).json({ error: "File required (field name: file)" });

  const { courseId, title, description } = req.body;
  const meta = {
    id: `repo_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    filename: file.filename,
    originalName: file.originalname,
    size: file.size,
    mime: file.mimetype,
    uploaderId: session.userId,
    courseId: courseId || null,
    title: title || file.originalname,
    description: description || "",
    createdAt: new Date().toISOString(),
    path: path.relative(process.cwd(), file.path),
  };

  state.mediaLibrary.push(meta as any);
  saveState?.();
  addLog?.(`Repository upload: ${meta.originalName}`, "repository_upload", session.userId);

  res.json({ status: "success", file: meta });
});

router.get("/list", (req: Request, res: Response) => {
  const session = getSession(req);
  if (!session) return res.status(401).json({ error: "Authentication required" });

  const { courseId } = req.query;
  let items = state.mediaLibrary || [];
  if (courseId) {
    items = items.filter((i: any) => i.courseId === String(courseId));
  }
  items = items.slice().sort((a: any, b: any) => (b.createdAt > a.createdAt ? 1 : -1));
  res.json({ items });
});

router.get("/:id/download", (req: Request, res: Response) => {
  const session = getSession(req);
  if (!session) return res.status(401).json({ error: "Authentication required" });

  const id = req.params.id;
  const item = (state.mediaLibrary || []).find((m: any) => m.id === id);
  if (!item) return res.status(404).json({ error: "Resource not found" });

  if (session.role === "admin" || session.role === "super_admin" || session.userId === item.uploaderId) {
    const absolute = path.resolve(process.cwd(), item.path);
    if (!fs.existsSync(absolute)) return res.status(404).json({ error: "File missing" });

    res.setHeader("Content-Disposition", `attachment; filename="${item.originalName.replace(/"/g, "")}"`);
    res.setHeader("Content-Type", item.mime || "application/octet-stream");

    const stream = fs.createReadStream(absolute);
    stream.on("error", () => res.status(500).json({ error: "Error streaming file" }));
    stream.pipe(res);

    addLog?.(`Repository download (admin/uploader) ${item.originalName}`, "repository_download", session.userId);
    return;
  }

  if (session.role !== "student") {
    return res.status(403).json({ error: "Only registered students can download materials" });
  }

  if (item.courseId) {
    const enrolled = state.enrollments?.find(
      (e: any) => e.userId === session.userId && e.courseId === item.courseId
    );
    if (!enrolled) {
      return res.status(403).json({ error: "You must be enrolled in the course to download this file" });
    }
  }

  const absolute = path.resolve(process.cwd(), item.path);
  if (!fs.existsSync(absolute)) return res.status(404).json({ error: "File missing" });

  res.setHeader("Content-Disposition", `attachment; filename="${item.originalName.replace(/"/g, "")}"`);
  res.setHeader("Content-Type", item.mime || "application/octet-stream");

  const stream = fs.createReadStream(absolute);
  stream.on("error", () => res.status(500).json({ error: "Error streaming file" }));
  stream.pipe(res);

  addLog?.(`Repository download ${item.originalName}`, "repository_download", session.userId);
});

export default router;
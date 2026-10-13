/**
 * /api/courses  —  modular Express router
 *
 * Endpoint map (matches what App.tsx actually calls):
 *   GET    /api/courses                       public course list
 *   GET    /api/courses/:id                   single course
 *   POST   /api/courses/create                create (instructor/admin)
 *   POST   /api/courses/update                update (owner or admin)
 *   POST   /api/courses/submit-for-review     submit (owner)
 *   POST   /api/courses/enroll                legacy enroll (App.tsx)
 *   POST   /api/courses/sync-progress         legacy progress sync (App.tsx)
 *   POST   /api/courses/:id/enroll            canonical enroll
 *   POST   /api/courses/:id/progress          mark lesson complete
 *   POST   /api/courses/:id/quiz              submit quiz answers
 *   GET    /api/courses/enrollments/:userId   user enrollments (legacy)
 *
 * All routes use the shared in-memory state from lib/appState.ts.
 * No Prisma dependency — this file replaces the old Prisma-based courses.ts.
 *
 * Mount in server.ts with:
 *   import coursesRouter from './routes/courses';
 *   app.use('/api/courses', coursesRouter);
 *
 * NOTE: When mounting, remove the equivalent inline blocks from server.ts
 *       to avoid duplicate route registrations.
 */

import { Router, Request, Response } from "express";
import { state, saveState, addLog } from "../lib/appState";
import jwt from "jsonwebtoken";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET!;
const COOKIE_NAME = "dma_token";

// ── Helpers ──────────────────────────────────────────────────────────────────

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

/**
 * Strip correctAnswer from quiz questions before sending to a non-privileged
 * caller.  Server-side grading reads directly from state.courses so this never
 * breaks quiz evaluation.
 */
function safeCourse(course: any, privileged = false): any {
  if (privileged) return course;
  const quizzes = (course.quizzes || []).map((quiz: any) => ({
    ...quiz,
    questions: (quiz.questions || []).map((q: any) => {
      const { correctAnswer: _ca, ...safe } = q;
      return safe;
    }),
  }));
  return { ...course, quizzes };
}

// ── Public routes ─────────────────────────────────────────────────────────────

/** GET /api/courses — published course list, answers stripped */
router.get("/", (_req: Request, res: Response) => {
  const published = state.courses
    .filter((c: any) => c.isPublished !== false)
    .map((c: any) => safeCourse(c, false));
  res.json(published);
});

/** GET /api/courses/enrollments/:userId — user's enrollments (legacy path) */
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

/** GET /api/courses/:id — single course; correctAnswer visible only to owner/admin */
router.get("/:id", (req: Request, res: Response) => {
  const course = state.courses.find((c: any) => c.id === req.params.id);
  if (!course) { res.status(404).json({ error: "Course not found" }); return; }
  const session = getSession(req);
  const privileged =
    session &&
    (session.role === "admin" ||
      session.role === "super_admin" ||
      (session.role === "instructor" && course.instructorId === session.userId));
  res.json(safeCourse(course, !!privileged));
});

// ── Authenticated routes ──────────────────────────────────────────────────────

/** POST /api/courses/create */
router.post("/create", async (req: Request, res: Response) => {
  const session = requireSession(req, res);
  if (!session) return;
  const { title, headline, description, category, level, duration, price, image, isFree } = req.body;
  if (!title || !category) { res.status(400).json({ error: "title and category required" }); return; }
  const user = state.users.find((u: any) => u.id === session.userId);
  const course: any = {
    id: `c_${Date.now()}`, title,
    headline: headline || "", description: description || "",
    category, level: level || "Beginner", duration: duration || "TBD",
    instructorId: session.userId, instructorName: user?.name || "Instructor",
    price: isFree ? 0 : (price || 0), isFree: !!isFree, image: image || "",
    isPublished: false, approvalStatus: "draft", enrollmentCount: 0,
    lessons: [], quizzes: [], createdAt: new Date().toISOString(),
  };
  state.courses.push(course);
  addLog(`Course created: ${title}`, "course_create", session.userId);
  saveState();
  res.json({ status: "success", course });
});

/** POST /api/courses/update */
router.post("/update", (req: Request, res: Response) => {
  const session = requireSession(req, res);
  if (!session) return;
  const { courseId, updates } = req.body;
  const idx = state.courses.findIndex((c: any) => c.id === courseId);
  if (idx === -1) { res.status(404).json({ error: "Course not found" }); return; }
  const course = state.courses[idx];
  if (
    course.instructorId !== session.userId &&
    session.role !== "admin" &&
    session.role !== "super_admin"
  ) {
    res.status(403).json({ error: "Unauthorized" }); return;
  }
  state.courses[idx] = { ...course, ...updates };
  saveState();
  res.json({ status: "success", course: state.courses[idx] });
});

/** POST /api/courses/submit-for-review */
router.post("/submit-for-review", (req: Request, res: Response) => {
  const session = requireSession(req, res);
  if (!session) return;
  const { courseId } = req.body;
  const course = state.courses.find(
    (c: any) => c.id === courseId && c.instructorId === session.userId
  );
  if (!course) { res.status(404).json({ error: "Course not found" }); return; }
  course.approvalStatus = "pending";
  course.isPublished = false;
  addLog(`Course "${course.title}" submitted for review`, "course_review", session.userId);
  saveState();
  res.json({ status: "success" });
});

/** POST /api/courses/enroll  — legacy path used by App.tsx */
router.post("/enroll", (req: Request, res: Response) => {
  const session = requireSession(req, res);
  if (!session) return;
  const { courseId } = req.body;
  if (!courseId) { res.status(400).json({ error: "courseId required" }); return; }

  const courseIdx = state.courses.findIndex((c: any) => c.id === courseId);
  if (courseIdx === -1) { res.status(404).json({ error: "Course not found" }); return; }
  const course = state.courses[courseIdx];

  const existing = state.enrollments.find(
    (e: any) => e.userId === session.userId && e.courseId === courseId
  );
  if (existing) { res.json({ status: "already_enrolled", enrollment: existing }); return; }

  const enrollment: any = {
    id: `enr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    userId: session.userId, courseId,
    progress: 0, completedLessons: [], quizAttempts: {},
    enrolledAt: new Date().toISOString(), completedAt: null,
  };
  state.enrollments.push(enrollment);
  state.courses[courseIdx] = { ...course, enrollmentCount: (course.enrollmentCount || 0) + 1 };
  addLog(`User enrolled in: ${course.title}`, "enrollment", session.userId);
  saveState();
  res.json({ status: "success", enrollment });
});

/** POST /api/courses/sync-progress  — legacy path used by App.tsx */
router.post("/sync-progress", (req: Request, res: Response) => {
  const session = requireSession(req, res);
  if (!session) return;
  const { userId, courseId, lessonId, quizId, score, passed } = req.body;
  const uid = userId || session.userId;
  const enrollment = state.enrollments.find(
    (e: any) => e.userId === uid && e.courseId === courseId
  );
  if (!enrollment) { res.status(404).json({ error: "Not enrolled" }); return; }

  if (lessonId) {
    if (!enrollment.completedLessons) enrollment.completedLessons = [];
    if (!enrollment.completedLessons.includes(lessonId))
      enrollment.completedLessons.push(lessonId);
    const course = state.courses.find((c: any) => c.id === courseId);
    const lessons = (course?.lessons || []).filter((l: any) => l.isRequired !== false);
    enrollment.progress =
      lessons.length > 0
        ? Math.round((enrollment.completedLessons.length / lessons.length) * 100)
        : 0;
    if (enrollment.progress >= 100) enrollment.completedAt = new Date().toISOString();
  }
  if (quizId) {
    if (!enrollment.quizAttempts) enrollment.quizAttempts = {};
    enrollment.quizAttempts[quizId] = {
      score: score || 0, passed: !!passed, attemptedAt: new Date().toISOString(),
    };
  }
  saveState();
  res.json({ status: "success", enrollment });
});

/** POST /api/courses/:id/enroll  — canonical REST enroll */
router.post("/:id/enroll", (req: Request, res: Response) => {
  const session = requireSession(req, res);
  if (!session) return;
  const { id } = req.params;

  const courseIdx = state.courses.findIndex((c: any) => c.id === id);
  if (courseIdx === -1) { res.status(404).json({ error: "Course not found" }); return; }
  const course = state.courses[courseIdx];

  const existing = state.enrollments.find(
    (e: any) => e.userId === session.userId && e.courseId === id
  );
  if (existing) { res.json({ status: "already_enrolled", enrollment: existing }); return; }

  const enrollment: any = {
    id: `enr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    userId: session.userId, courseId: id,
    progress: 0, completedLessons: [], quizAttempts: {},
    enrolledAt: new Date().toISOString(), completedAt: null,
  };
  state.enrollments.push(enrollment);
  state.courses[courseIdx] = { ...course, enrollmentCount: (course.enrollmentCount || 0) + 1 };
  addLog(`User enrolled in: ${course.title}`, "enrollment", session.userId);
  saveState();
  res.json({ status: "success", enrollment });
});

/** POST /api/courses/:id/progress */
router.post("/:id/progress", (req: Request, res: Response) => {
  const session = requireSession(req, res);
  if (!session) return;
  const { id } = req.params;
  const { lessonId } = req.body;

  const enrollment = state.enrollments.find(
    (e: any) => e.userId === session.userId && e.courseId === id
  );
  if (!enrollment) { res.status(404).json({ error: "Not enrolled" }); return; }

  if (!enrollment.completedLessons) enrollment.completedLessons = [];
  if (!enrollment.completedLessons.includes(lessonId))
    enrollment.completedLessons.push(lessonId);

  const course = state.courses.find((c: any) => c.id === id);
  const lessons = (course?.lessons || []).filter((l: any) => l.isRequired !== false);
  enrollment.progress =
    lessons.length > 0
      ? Math.round((enrollment.completedLessons.length / lessons.length) * 100)
      : 0;
  if (enrollment.progress >= 100) enrollment.completedAt = new Date().toISOString();
  saveState();
  res.json({ status: "success", enrollment });
});

/**
 * POST /api/courses/:id/quiz
 * Server-side grading: correctAnswer is read from state.courses (never sent
 * to the client). The returned breakdown intentionally omits correctAnswer.
 */
router.post("/:id/quiz", (req: Request, res: Response) => {
  const session = requireSession(req, res);
  if (!session) return;
  const { id } = req.params;
  const { quizId, answers } = req.body;

  const enrollment = state.enrollments.find(
    (e: any) => e.userId === session.userId && e.courseId === id
  );
  if (!enrollment) { res.status(404).json({ error: "Not enrolled" }); return; }

  const course = state.courses.find((c: any) => c.id === id);
  const quiz = (course?.quizzes || []).find((q: any) => q.id === quizId);
  if (!quiz) { res.status(404).json({ error: "Quiz not found" }); return; }

  let correct = 0;
  for (let i = 0; i < quiz.questions.length; i++) {
    if (answers[i] === quiz.questions[i].correctAnswer) correct++;
  }
  const score = Math.round((correct / quiz.questions.length) * 100);
  const passed = score >= (quiz.passingScore || 80);

  if (!enrollment.quizAttempts) enrollment.quizAttempts = {};
  enrollment.quizAttempts[quizId] = { score, passed, attemptedAt: new Date().toISOString() };
  saveState();

  // correctAnswer deliberately NOT included in the response
  res.json({ status: "success", score, passed, correct, total: quiz.questions.length });
});

export default router;

/**
 * Shared in-memory application state.
 *
 * This module is the single source of truth for all runtime data.
 * server.ts imports this module and owns the lifecycle (load / save / init).
 * Route modules import `state`, `saveState`, and `addLog` from here so
 * that logic can live in proper modular files instead of the monolithic
 * server.ts, without changing the underlying storage strategy.
 *
 * IMPORTANT — mutation rules:
 *   - Always mutate the *properties* of `state` (e.g. state.users.push(…))
 *     rather than replacing the object reference (state = { … }).
 *     Route files hold a reference to this object, so reassigning would
 *     leave them with a stale copy.
 *   - Call saveState() after every write so PostgreSQL / db_state.json stay in sync.
 */

export interface AppState {
  users: any[];
  courses: any[];
  enrollments: any[];
  subscriptions: any[];
  certificates: any[];
  logs: any[];
  learningPaths: any[];
  events: any[];
  messages: any[];
  assignmentSubmissions: any[];
  withdrawalRequests: any[];
  bankAccounts: any[];
  cmsContent: any;
  customRoles: any[];
  mediaLibrary: any[];
  invites: any[];
  themeSettings: any;
  webinarPosts: any[];
  quizAttempts: any[];
  exams: any[];
  examAttempts: any[];
  certTemplates: any[];
  certDownloadHistory: any[];
  siteNotice: any;
}

export const state: AppState = {
  users: [], courses: [], enrollments: [], subscriptions: [],
  certificates: [], logs: [], learningPaths: [], events: [],
  messages: [], assignmentSubmissions: [], withdrawalRequests: [],
  bankAccounts: [], cmsContent: null, customRoles: [], mediaLibrary: [],
  invites: [], themeSettings: null, webinarPosts: [],
  quizAttempts: [], exams: [], examAttempts: [],
  certTemplates: [], certDownloadHistory: [], siteNotice: null,
};

// These are overridden by server.ts after it wires up PostgreSQL/file I/O.
// Route files call these without needing to know the storage backend.
export let saveState: () => void = () => {};
export let addLog: (text: string, type?: string, userId?: string) => void = () => {};

export function bindStorage(
  save: () => void,
  log: (text: string, type?: string, userId?: string) => void
): void {
  saveState = save;
  addLog = log;
}

/**
 * DMA API integration tests (auth-focused).
 *
 * Boots the real server (tsx server.ts) on a random port inside a temp working
 * directory — fallback JSON store, no MySQL, no SMTP — and drives it over HTTP.
 *
 * Run:  npm test      (= tsx --test tests/*.test.ts)
 */
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { spawn, ChildProcess } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import net from "node:net";

import { fileURLToPath } from "node:url";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ADMIN_EMAIL = "seed.admin@example.test";
const ADMIN_PW = "Seed-Admin-Pw-1!";

let proc: ChildProcess;
let base = "";
let log = "";
let tmp = "";

function freePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const s = net.createServer();
    s.listen(0, () => { const p = (s.address() as net.AddressInfo).port; s.close(() => resolve(p)); });
    s.on("error", reject);
  });
}

async function api(method: string, url: string, body?: unknown, cookie?: string) {
  const res = await fetch(base + url, {
    method,
    headers: { "Content-Type": "application/json", ...(cookie ? { Cookie: cookie } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  let json: any = null;
  try { json = JSON.parse(text); } catch { /* non-JSON */ }
  const setCookie = res.headers.get("set-cookie") || "";
  return { status: res.status, body: json, cookie: setCookie.split(";")[0] };
}

async function waitFor(fn: () => boolean, ms = 15000) {
  const t0 = Date.now();
  while (!fn()) {
    if (Date.now() - t0 > ms) throw new Error("timeout waiting for server:\n" + log);
    await new Promise(r => setTimeout(r, 100));
  }
}

const lastResetToken = (email: string): string | null => {
  const re = new RegExp(`Password reset link for ${email.replace(/[.+]/g, "\\$&")}: \\S+token=([a-f0-9]+)`, "g");
  let m, t: string | null = null;
  while ((m = re.exec(log))) t = m[1];
  return t;
};

before(async () => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), "dma-test-"));
  const port = await freePort();
  base = `http://127.0.0.1:${port}`;
  proc = spawn(path.join(ROOT, "node_modules/.bin/tsx"), [path.join(ROOT, "server.ts")], {
    cwd: tmp,
    env: {
      PATH: process.env.PATH,
      NODE_ENV: "development",
      PORT: String(port),
      JWT_SECRET: "test-secret-test-secret-test-secret-123456",
      SEED_ADMIN_EMAIL: ADMIN_EMAIL,
      SEED_ADMIN_PASSWORD: ADMIN_PW,
    } as NodeJS.ProcessEnv,
  });
  proc.stdout!.on("data", d => (log += d));
  proc.stderr!.on("data", d => (log += d));
  await waitFor(() => log.includes("Academy running"));
});

after(() => {
  proc?.kill();
  fs.rmSync(tmp, { recursive: true, force: true });
});

test("health endpoint responds ok", async () => {
  const r = await api("GET", "/api/health");
  assert.equal(r.status, 200);
  assert.equal(r.body.status, "ok");
});

test("register → /me → login round trip, password never exposed", async () => {
  const email = "student1@example.test";
  const reg = await api("POST", "/api/auth/register", { name: "Stu Dent", email, password: "Student-Pw-123" });
  assert.equal(reg.status, 201);
  assert.equal(reg.body.user.role, "student");
  assert.equal(reg.body.user.password, undefined);

  const dup = await api("POST", "/api/auth/register", { name: "Dup", email: email.toUpperCase(), password: "Student-Pw-123" });
  assert.equal(dup.status, 409);

  const login = await api("POST", "/api/auth/login", { email: email.toUpperCase(), password: "Student-Pw-123" });
  assert.equal(login.status, 200);
  assert.ok(login.cookie.startsWith("dma_token="));

  const me = await api("GET", "/api/auth/me", undefined, login.cookie);
  assert.equal(me.status, 200);
  assert.equal(me.body.user.email, email);
  assert.equal(me.body.user.password, undefined);
});

test("login rejects wrong/empty credentials with a generic error", async () => {
  assert.equal((await api("POST", "/api/auth/login", { email: "student1@example.test", password: "demo" })).status, 401);
  assert.equal((await api("POST", "/api/auth/login", { email: "ghost@example.test", password: "x" })).status, 401);
  assert.equal((await api("POST", "/api/auth/login", { email: "student1@example.test" })).status, 400);
});

test("non-admins cannot read the user list", async () => {
  const login = await api("POST", "/api/auth/login", { email: "student1@example.test", password: "Student-Pw-123" });
  const state = await api("GET", "/api/db-state", undefined, login.cookie);
  assert.deepEqual(state.body.users, []);
  assert.equal((await api("GET", "/api/admin/users", undefined, login.cookie)).status, 403);
});

test("forgot-password: identical response for known and unknown emails", async () => {
  const known = await api("POST", "/api/auth/forgot-password", { email: "student1@example.test" });
  const unknown = await api("POST", "/api/auth/forgot-password", { email: "nobody@example.test" });
  assert.equal(known.status, 200);
  assert.deepEqual(known.body, unknown.body);
  assert.equal((await api("POST", "/api/auth/forgot-password", { email: "not-an-email" })).status, 400);
});

test("reset-password: full flow, single use, old password dies", async () => {
  const email = "student1@example.test";
  await api("POST", "/api/auth/forgot-password", { email });
  await waitFor(() => !!lastResetToken(email));
  const token = lastResetToken(email)!;

  assert.equal((await api("GET", `/api/auth/reset-password/validate?token=${token}`)).body.valid, true);
  assert.equal((await api("GET", "/api/auth/reset-password/validate?token=nope")).body.valid, false);

  assert.equal((await api("POST", "/api/auth/reset-password", { token, newPassword: "short" })).status, 400);
  assert.equal((await api("POST", "/api/auth/reset-password", { token: "0".repeat(64), newPassword: "Whatever-123" })).status, 400);

  const ok = await api("POST", "/api/auth/reset-password", { token, newPassword: "Brand-New-Pw-9" });
  assert.equal(ok.status, 200);
  assert.equal((await api("POST", "/api/auth/reset-password", { token, newPassword: "Another-Pw-99" })).status, 400);

  assert.equal((await api("POST", "/api/auth/login", { email, password: "Student-Pw-123" })).status, 401);
  assert.equal((await api("POST", "/api/auth/login", { email, password: "Brand-New-Pw-9" })).status, 200);
});

test("reset tokens are stored hashed, not in plaintext", async () => {
  const email = "student1@example.test";
  await api("POST", "/api/auth/forgot-password", { email: "student1@example.test" }).catch(() => {});
  const token = lastResetToken(email)!;
  const state = fs.readFileSync(path.join(tmp, "db_state.json"), "utf8");
  assert.ok(!state.includes(token), "plaintext token found in db_state.json");
});

test("seeded admin must change password before using the API", async () => {
  const login = await api("POST", "/api/auth/login", { email: ADMIN_EMAIL, password: ADMIN_PW });
  assert.equal(login.status, 200);
  assert.equal(login.body.user.mustChangePassword, true);

  // Gated: admin endpoints and bulk state are refused until the password changes
  const gated = await api("GET", "/api/admin/users", undefined, login.cookie);
  assert.equal(gated.status, 403);
  assert.equal(gated.body.code, "PASSWORD_CHANGE_REQUIRED");
  assert.equal((await api("GET", "/api/db-state", undefined, login.cookie)).status, 403);

  // Auth endpoints stay reachable
  assert.equal((await api("GET", "/api/auth/me", undefined, login.cookie)).status, 200);

  // Validation on the change itself
  const cp = (cur: string, nw: string) => api("POST", "/api/auth/change-password", { currentPassword: cur, newPassword: nw }, login.cookie);
  assert.equal((await cp("wrong-current", "Fresh-Admin-Pw-2!")).status, 400);
  assert.equal((await cp(ADMIN_PW, ADMIN_PW)).status, 400);
  assert.equal((await cp(ADMIN_PW, "short")).status, 400);

  assert.equal((await cp(ADMIN_PW, "Fresh-Admin-Pw-2!")).status, 200);

  // Gate lifted
  assert.equal((await api("GET", "/api/admin/users", undefined, login.cookie)).status, 200);
  const again = await api("POST", "/api/auth/login", { email: ADMIN_EMAIL, password: "Fresh-Admin-Pw-2!" });
  assert.equal(again.body.user.mustChangePassword, false);
});

test("login is rate limited per IP+email", async () => {
  let last = 0;
  for (let i = 0; i < 12; i++) {
    last = (await api("POST", "/api/auth/login", { email: "spray@example.test", password: "x" })).status;
  }
  assert.equal(last, 429);
});

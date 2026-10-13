var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_config2 = require("dotenv/config");
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_cookie_parser = __toESM(require("cookie-parser"), 1);
var import_bcryptjs = __toESM(require("bcryptjs"), 1);
var import_jsonwebtoken = __toESM(require("jsonwebtoken"), 1);
var import_crypto = __toESM(require("crypto"), 1);
var import_genai = require("@google/genai");

// db.ts
var import_config = require("dotenv/config");
var import_client = require("@prisma/client");
var prisma = new import_client.PrismaClient();
var connected = false;
var pendingWrite = Promise.resolve();
async function connectDatabase() {
  if (!process.env.DATABASE_URL) {
    console.info("[DB] DATABASE_URL is not configured");
    return false;
  }
  try {
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    connected = true;
    console.info("[DB] PostgreSQL connection established");
    return true;
  } catch (error) {
    connected = false;
    console.error("[DB] PostgreSQL connection failed", error);
    throw new Error("DATABASE_URL is configured but PostgreSQL is unavailable", { cause: error });
  }
}
function isDatabaseAvailable() {
  return connected;
}
async function getStateFromDatabase() {
  if (!connected) return null;
  const snapshot = await prisma.appStateSnapshot.findUnique({ where: { id: "main" } });
  return snapshot?.data && typeof snapshot.data === "object" && !Array.isArray(snapshot.data) ? snapshot.data : null;
}
function saveStateToDatabase(state2) {
  if (!connected) return Promise.resolve();
  const snapshot = JSON.parse(JSON.stringify(state2));
  const write = pendingWrite.then(async () => {
    await prisma.appStateSnapshot.upsert({
      where: { id: "main" },
      create: { id: "main", data: snapshot },
      update: { data: snapshot }
    });
  });
  pendingWrite = write.catch(() => {
  });
  return write;
}

// lib/mailer.ts
var import_nodemailer = __toESM(require("nodemailer"), 1);
var SMTP_HOST = process.env.SMTP_HOST || "smtp.hostinger.com";
var SMTP_PORT = parseInt(process.env.SMTP_PORT || "465");
var SMTP_SECURE = SMTP_PORT === 465;
var SMTP_USER = process.env.SMTP_USER || "info@digitalmanufacturing.academy";
var SMTP_PASS = process.env.SMTP_PASS || "";
var FROM_NAME = process.env.EMAIL_FROM_NAME || "DMA Academy";
var FROM_ADDRESS = SMTP_USER;
var FROM = `"${FROM_NAME}" <${FROM_ADDRESS}>`;
var isConfigured = !!SMTP_PASS;
var transporter = import_nodemailer.default.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_SECURE,
  auth: { user: SMTP_USER, pass: SMTP_PASS }
});
if (isConfigured) {
  transporter.verify().then(() => {
    console.log("[MAILER] \u2705 SMTP connection verified \u2014", SMTP_HOST + ":" + SMTP_PORT);
  }).catch((err) => {
    console.warn("[MAILER] \u26A0\uFE0F  SMTP verify failed:", err.message);
  });
} else {
  console.log("[MAILER] \u2139\uFE0F  SMTP_PASS not set \u2014 emails will be logged to console only");
}
async function send(to, subject, html) {
  if (!isConfigured) {
    console.log(`[MAILER] [MOCK] To: ${to} | Subject: ${subject}`);
    return;
  }
  try {
    await transporter.sendMail({ from: FROM, to, subject, html });
    console.log(`[MAILER] \u2709\uFE0F  Sent "${subject}" \u2192 ${to}`);
  } catch (err) {
    console.error(`[MAILER] \u274C Failed to send to ${to}:`, err.message);
  }
}
function layout(body) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>DMA Academy</title>
</head>
<body style="margin:0;padding:0;background:#020617;font-family:Arial,Helvetica,sans-serif;color:#e2e8f0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#0d1526;border-radius:16px;border:1px solid #1e293b;overflow:hidden;max-width:560px;width:100%;">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#0f1f3d 0%,#0d1526 100%);padding:32px 36px;border-bottom:1px solid #1e293b;">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding-right:12px;">
                  <div style="width:36px;height:36px;background:#00aaff22;border-radius:8px;display:inline-block;text-align:center;line-height:36px;font-size:18px;">\u{1F393}</div>
                </td>
                <td>
                  <span style="font-size:16px;font-weight:900;color:#ffffff;letter-spacing:1px;">DMA ACADEMY</span><br/>
                  <span style="font-size:10px;color:#00aaff;letter-spacing:2px;text-transform:uppercase;">Digital Manufacturing Academy</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- Body -->
        <tr><td style="padding:36px;">${body}</td></tr>
        <!-- Footer -->
        <tr>
          <td style="background:#060f1e;padding:24px 36px;border-top:1px solid #1e293b;text-align:center;">
            <p style="margin:0 0 6px;font-size:11px;color:#64748b;">
              British Council Funded \xB7 BCU &amp; AIUB Partnership
            </p>
            <p style="margin:0;font-size:11px;color:#475569;">
              <a href="https://digitalmanufacturing.academy" style="color:#00aaff;text-decoration:none;">digitalmanufacturing.academy</a>
              &nbsp;\xB7&nbsp;
              <a href="mailto:info@digitalmanufacturing.academy" style="color:#00aaff;text-decoration:none;">info@digitalmanufacturing.academy</a>
            </p>
            <p style="margin:12px 0 0;font-size:10px;color:#334155;">
              \xA9 2026 Digital Manufacturing Academy. All rights reserved.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
async function sendWelcomeEmail(to, name, role) {
  const roleLabel = role === "instructor" ? "Instructor" : role === "admin" ? "Admin" : "Student";
  const dashLink = "https://digitalmanufacturing.academy";
  const isPending = role === "instructor";
  const body = `
    <h2 style="margin:0 0 8px;font-size:22px;font-weight:900;color:#ffffff;">
      Welcome to DMA Academy${name ? `, ${name.split(" ")[0]}` : ""}! \u{1F44B}
    </h2>
    <p style="margin:0 0 20px;font-size:13px;color:#94a3b8;line-height:1.6;">
      Your <strong style="color:#00aaff;">${roleLabel}</strong> account has been created.
      ${isPending ? "It is currently <strong style='color:#f59e0b;'>pending admin approval</strong> \u2014 you'll receive a confirmation email once approved." : "You can sign in and start learning right away."}
    </p>
    <table cellpadding="0" cellspacing="0" style="margin:0 0 28px;background:#0f1f3d;border-radius:10px;padding:20px;width:100%;border:1px solid #1e293b;">
      <tr><td><p style="margin:0 0 6px;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Your Account</p></td></tr>
      <tr><td><p style="margin:0;font-size:13px;color:#e2e8f0;">\u{1F4E7} <strong>${to}</strong></p></td></tr>
      <tr><td><p style="margin:4px 0 0;font-size:13px;color:#e2e8f0;">\u{1F3F7}\uFE0F Role: <strong style="color:#00ddff;">${roleLabel}</strong></p></td></tr>
    </table>
    ${!isPending ? `
    <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr>
        <td style="border-radius:10px;background:linear-gradient(135deg,#1d4ed8,#2563eb);">
          <a href="${dashLink}" style="display:inline-block;padding:14px 32px;font-size:13px;font-weight:900;color:#ffffff;text-decoration:none;letter-spacing:0.5px;">
            Start Learning \u2192
          </a>
        </td>
      </tr>
    </table>` : ""}
    <p style="margin:0;font-size:12px;color:#475569;line-height:1.6;">
      Questions? Reply to this email or visit <a href="https://digitalmanufacturing.academy" style="color:#00aaff;">our website</a>.
    </p>`;
  await send(to, "Welcome to DMA Academy \u2014 Your account is ready", layout(body));
}
async function sendTempPasswordEmail(to, name, tempPassword) {
  const body = `
    <h2 style="margin:0 0 8px;font-size:22px;font-weight:900;color:#ffffff;">Password Reset \u{1F511}</h2>
    <p style="margin:0 0 20px;font-size:13px;color:#94a3b8;line-height:1.6;">
      Hi${name ? ` ${name.split(" ")[0]}` : ""},<br/>
      Your DMA Academy password has been reset by an administrator. Use the temporary password below to sign in, then change it immediately.
    </p>
    <table cellpadding="0" cellspacing="0" style="margin:0 0 28px;background:#0f1f3d;border-radius:10px;padding:24px;width:100%;border:1px solid #1e293b;text-align:center;">
      <tr><td>
        <p style="margin:0 0 8px;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Temporary Password</p>
        <p style="margin:0;font-size:24px;font-weight:900;color:#00ddff;font-family:monospace;letter-spacing:3px;">${tempPassword}</p>
      </td></tr>
    </table>
    <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr>
        <td style="border-radius:10px;background:linear-gradient(135deg,#1d4ed8,#2563eb);">
          <a href="https://digitalmanufacturing.academy" style="display:inline-block;padding:14px 32px;font-size:13px;font-weight:900;color:#ffffff;text-decoration:none;">
            Sign In Now \u2192
          </a>
        </td>
      </tr>
    </table>
    <p style="margin:0;font-size:12px;color:#475569;line-height:1.6;">
      If you did not request this reset, contact <a href="mailto:info@digitalmanufacturing.academy" style="color:#00aaff;">info@digitalmanufacturing.academy</a> immediately.
    </p>`;
  await send(to, "DMA Academy \u2014 Your temporary password", layout(body));
}
async function sendInstructorApprovalEmail(to, name) {
  const body = `
    <h2 style="margin:0 0 8px;font-size:22px;font-weight:900;color:#ffffff;">You're approved as an Instructor! \u2705</h2>
    <p style="margin:0 0 20px;font-size:13px;color:#94a3b8;line-height:1.6;">
      Hi${name ? ` ${name.split(" ")[0]}` : ""},<br/>
      Your instructor account on DMA Academy has been approved. You can now sign in, create courses, manage learners, and publish content.
    </p>
    <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr>
        <td style="border-radius:10px;background:linear-gradient(135deg,#1d4ed8,#2563eb);">
          <a href="https://digitalmanufacturing.academy" style="display:inline-block;padding:14px 32px;font-size:13px;font-weight:900;color:#ffffff;text-decoration:none;">
            Go to Instructor Dashboard \u2192
          </a>
        </td>
      </tr>
    </table>
    <p style="margin:0;font-size:12px;color:#475569;">Questions? Email <a href="mailto:info@digitalmanufacturing.academy" style="color:#00aaff;">info@digitalmanufacturing.academy</a></p>`;
  await send(to, "DMA Academy \u2014 Instructor account approved", layout(body));
}
async function sendContactAckEmail(to, name, message) {
  const body = `
    <h2 style="margin:0 0 8px;font-size:22px;font-weight:900;color:#ffffff;">We received your message \u{1F4EC}</h2>
    <p style="margin:0 0 20px;font-size:13px;color:#94a3b8;line-height:1.6;">
      Hi${name ? ` ${name}` : ""},<br/>
      Thank you for contacting DMA Academy. Our team will respond within 1\u20132 working days.
    </p>
    <table cellpadding="0" cellspacing="0" style="margin:0 0 28px;background:#0f1f3d;border-radius:10px;padding:20px;width:100%;border:1px solid #1e293b;">
      <tr><td>
        <p style="margin:0 0 8px;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Your Message</p>
        <p style="margin:0;font-size:13px;color:#cbd5e1;line-height:1.6;font-style:italic;">"${message.substring(0, 400)}${message.length > 400 ? "\u2026" : ""}"</p>
      </td></tr>
    </table>
    <p style="margin:0;font-size:12px;color:#475569;">
      Alternatively, email us directly: <a href="mailto:info@digitalmanufacturing.academy" style="color:#00aaff;">info@digitalmanufacturing.academy</a>
    </p>`;
  await send(to, "DMA Academy \u2014 We received your enquiry", layout(body));
}
async function sendInviteEmail(to, role, inviteUrl) {
  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);
  const body = `
    <h2 style="margin:0 0 8px;font-size:22px;font-weight:900;color:#ffffff;">You've been invited to DMA Academy \u{1F393}</h2>
    <p style="margin:0 0 20px;font-size:13px;color:#94a3b8;line-height:1.6;">
      You have been invited to join the Digital Manufacturing Academy as a <strong style="color:#00aaff;">${roleLabel}</strong>.<br/>
      Click the button below to complete your registration.
    </p>
    <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr>
        <td style="border-radius:10px;background:linear-gradient(135deg,#1d4ed8,#2563eb);">
          <a href="${inviteUrl}" style="display:inline-block;padding:14px 32px;font-size:13px;font-weight:900;color:#ffffff;text-decoration:none;">
            Accept Invitation \u2192
          </a>
        </td>
      </tr>
    </table>
    <p style="margin:0;font-size:11px;color:#475569;">This invitation link expires in 7 days. If you did not expect this email, ignore it safely.</p>`;
  await send(to, `DMA Academy \u2014 You're invited as ${roleLabel}`, layout(body));
}
async function sendPasswordResetEmail(to, name, resetUrl) {
  const body = `
    <h2 style="margin:0 0 8px;font-size:22px;font-weight:900;color:#ffffff;">Reset Your Password \u{1F511}</h2>
    <p style="margin:0 0 6px;font-size:13px;color:#94a3b8;">Hi ${name},</p>
    <p style="margin:0 0 20px;font-size:13px;color:#94a3b8;line-height:1.6;">
      We received a request to reset your DMA Academy password. Click the button below to choose a new password.
      This link expires in <strong style="color:#ffffff;">1 hour</strong>.
    </p>
    <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr>
        <td style="border-radius:10px;background:linear-gradient(135deg,#1d4ed8,#2563eb);">
          <a href="${resetUrl}" style="display:inline-block;padding:14px 32px;font-size:13px;font-weight:900;color:#ffffff;text-decoration:none;">
            Reset Password \u2192
          </a>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 8px;font-size:12px;color:#64748b;">
      If the button doesn't work, copy and paste this link into your browser:
    </p>
    <p style="margin:0 0 20px;font-size:11px;color:#00aaff;word-break:break-all;">${resetUrl}</p>
    <p style="margin:0;font-size:11px;color:#475569;">
      If you did not request a password reset, you can safely ignore this email \u2014 your password will not change.
    </p>`;
  await send(to, "DMA Academy \u2014 Reset your password", layout(body));
}

// server.ts
var JWT_SECRET = process.env.JWT_SECRET;
var COOKIE_NAME = "dma_token";
var isProd = process.env.NODE_ENV === "production";
var STATE_FILE = import_path.default.join(process.cwd(), "db_state.json");
var PORT = process.env.PORT ? parseInt(process.env.PORT) : 5e3;
if (!JWT_SECRET) {
  console.error("[FATAL] JWT_SECRET is required");
  process.exit(1);
}
var state = {
  users: [],
  courses: [],
  enrollments: [],
  subscriptions: [],
  certificates: [],
  logs: [],
  learningPaths: [],
  events: [],
  messages: [],
  assignmentSubmissions: [],
  withdrawalRequests: [],
  bankAccounts: [],
  cmsContent: null,
  customRoles: [],
  mediaLibrary: [],
  invites: [],
  themeSettings: null,
  webinarPosts: [],
  quizAttempts: [],
  exams: [],
  examAttempts: [],
  certTemplates: [],
  certDownloadHistory: [],
  siteNotice: null
};
function saveState() {
  try {
    import_fs.default.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  } catch (error) {
    console.error("[DMA] Could not write db_state.json", error);
  }
  if (isDatabaseAvailable()) {
    saveStateToDatabase(state).catch((error) => console.error("[DB] Could not persist application state", error));
  }
}
function addLog(text, type = "general", userId) {
  state.logs.unshift({ id: `log_${Date.now()}`, text, type, userId: userId || null, time: (/* @__PURE__ */ new Date()).toISOString() });
  if (state.logs.length > 500) state.logs = state.logs.slice(0, 500);
  saveState();
}
async function initializeState() {
  if (import_fs.default.existsSync(STATE_FILE)) {
    try {
      const raw = JSON.parse(import_fs.default.readFileSync(STATE_FILE, "utf8"));
      state = { ...state, ...raw };
    } catch {
      console.error("[DMA] Could not parse db_state.json, using defaults");
    }
  }
  const databaseConnected = await connectDatabase();
  if (!databaseConnected && isProd) {
    throw new Error("DATABASE_URL is required in production; refusing to start with ephemeral file storage");
  }
  if (databaseConnected) {
    const databaseState = await getStateFromDatabase();
    if (databaseState) {
      state = { ...state, ...databaseState };
      console.log(`[DB] State loaded from PostgreSQL: ${state.users.length} users, ${state.courses.length} courses`);
    } else {
      console.log("[DB] No PostgreSQL state snapshot found; importing local baseline");
    }
  }
  if (!Array.isArray(state.users)) state.users = [];
  if (!Array.isArray(state.courses)) state.courses = [];
  if (!Array.isArray(state.enrollments)) state.enrollments = [];
  if (!Array.isArray(state.logs)) state.logs = [];
  if (!Array.isArray(state.learningPaths)) state.learningPaths = [];
  if (!Array.isArray(state.events)) state.events = [];
  if (!Array.isArray(state.messages)) state.messages = [];
  if (!Array.isArray(state.assignmentSubmissions)) state.assignmentSubmissions = [];
  if (!Array.isArray(state.withdrawalRequests)) state.withdrawalRequests = [];
  if (!Array.isArray(state.bankAccounts)) state.bankAccounts = [];
  if (!Array.isArray(state.customRoles)) state.customRoles = [];
  if (!Array.isArray(state.mediaLibrary)) state.mediaLibrary = [];
  if (!Array.isArray(state.invites)) state.invites = [];
  if (!Array.isArray(state.webinarPosts)) state.webinarPosts = [];
  if (!Array.isArray(state.quizAttempts)) state.quizAttempts = [];
  if (!Array.isArray(state.exams)) state.exams = [];
  if (!Array.isArray(state.examAttempts)) state.examAttempts = [];
  if (!Array.isArray(state.certTemplates)) state.certTemplates = [];
  if (!Array.isArray(state.certDownloadHistory)) state.certDownloadHistory = [];
  if (state.siteNotice !== null && typeof state.siteNotice !== "object") state.siteNotice = null;
  if (state.certTemplates.length === 0) {
    state.certTemplates = [
      { id: "tmpl_default", name: "Standard Completion Certificate", style: "classic", primaryColor: "#0066ff", accentColor: "#00aaff", headerText: "Digital Manufacturing Academy", footerText: "British Council Co-funded \xB7 AIUB\u2013BCU Partnership", signatureLabel: "Programme Director", logoEnabled: true, badgeEnabled: true, isDefault: true, createdAt: (/* @__PURE__ */ new Date()).toISOString() },
      { id: "tmpl_distinction", name: "Distinction Certificate", style: "premium", primaryColor: "#7c3aed", accentColor: "#a78bfa", headerText: "Digital Manufacturing Academy \u2014 With Distinction", footerText: "Awarded for Outstanding Academic Performance \xB7 AIUB\u2013BCU", signatureLabel: "Academic Dean", logoEnabled: true, badgeEnabled: true, isDefault: false, createdAt: (/* @__PURE__ */ new Date()).toISOString() }
    ];
  }
  if (state.webinarPosts.length === 0) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    state.webinarPosts = [
      {
        id: `wp_seed_1`,
        title: "Welcome to DMA Academy Platform!",
        content: "We are thrilled to announce the official launch of the Digital Manufacturing Academy learning portal \u2014 a joint initiative between AIUB and Birmingham City University, funded by the British Council.\n\nThis platform hosts industry-grade courses in Digital Twin Technology, Robotics & PLC Programming, Smart Factory & IoT, Additive Manufacturing, and much more. Start your Industry 4.0 journey today!",
        type: "announcement",
        authorId: "system",
        authorName: "DMA Academy Team",
        authorRole: "super_admin",
        tags: ["welcome", "launch", "industry-4.0"],
        createdAt: now,
        pinned: true,
        views: 0
      },
      {
        id: `wp_seed_2`,
        title: "Upcoming Live Webinar: Introduction to Digital Twins",
        content: "Join us for an exclusive live session with Dr. Majid Butt from Birmingham City University. We'll cover the fundamentals of Digital Twin technology, real-world deployment scenarios in manufacturing plants, and a hands-on Q&A session.\n\nAll enrolled students and registered users are welcome.",
        type: "webinar",
        authorId: "system",
        authorName: "DMA Academy Team",
        authorRole: "admin",
        scheduledAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3).toISOString(),
        meetLink: "https://meet.google.com/dma-webinar-001",
        tags: ["digital-twin", "live-session", "bcit"],
        createdAt: now,
        pinned: false,
        views: 0
      },
      {
        id: `wp_seed_3`,
        title: "New Course Released: Smart Factory & Cyber-Physical Systems",
        content: "We've just published a brand-new course module covering MQTT network brokers, sensory casing telemetry, and edge computing fundamentals for smart factory environments.\n\nThis module is available to all Basic, Pro, and Enterprise subscribers. Free learners can preview the first two lessons.",
        type: "release",
        authorId: "system",
        authorName: "Digital Mfg Admin",
        authorRole: "admin",
        tags: ["new-course", "smart-factory", "iot"],
        createdAt: now,
        pinned: false,
        views: 0
      }
    ];
  }
  const SEED_SUPER_ADMIN_EMAIL = process.env.SEED_SUPER_ADMIN_EMAIL?.toLowerCase().trim();
  const SEED_SUPER_ADMIN_PASSWORD = process.env.SEED_SUPER_ADMIN_PASSWORD?.trim();
  const SEED_ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL?.toLowerCase().trim();
  const SEED_ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD?.trim();
  const missingSeedVars = [];
  if (!SEED_SUPER_ADMIN_EMAIL) missingSeedVars.push("SEED_SUPER_ADMIN_EMAIL");
  if (!SEED_SUPER_ADMIN_PASSWORD) missingSeedVars.push("SEED_SUPER_ADMIN_PASSWORD");
  if (!SEED_ADMIN_EMAIL) missingSeedVars.push("SEED_ADMIN_EMAIL");
  if (!SEED_ADMIN_PASSWORD) missingSeedVars.push("SEED_ADMIN_PASSWORD");
  if (missingSeedVars.length > 0) {
    console.error(`[FATAL] Missing required environment variables: ${missingSeedVars.join(", ")}`);
    console.error("[FATAL] Set these in your .env file or host environment panel. Server will not start.");
    process.exit(1);
  }
  async function seedAdminUser(email, name, role, password) {
    const exists = state.users.find((u) => u.email === email);
    if (!exists) {
      const hashed = await import_bcryptjs.default.hash(password, 10);
      state.users.unshift({
        id: `u_${role}_${Date.now()}`,
        name,
        email,
        role,
        password: hashed,
        isApproved: true,
        suspended: false,
        subscriptionPlan: "premium",
        avatar: "",
        joinedAt: (/* @__PURE__ */ new Date()).toISOString(),
        customRoleId: null,
        mustChangePassword: false
      });
      console.log(`[seed] Created ${role} account: ${email}`);
    }
  }
  await seedAdminUser(SEED_SUPER_ADMIN_EMAIL, "DMA Super Admin", "super_admin", SEED_SUPER_ADMIN_PASSWORD);
  await seedAdminUser(SEED_ADMIN_EMAIL, "DMA Admin", "admin", SEED_ADMIN_PASSWORD);
  for (const u of state.users) {
    if (u.isApproved === void 0) u.isApproved = true;
    if (u.suspended === void 0) u.suspended = false;
  }
  const c101 = state.courses.find((c) => c.id === "c_101");
  if (c101) {
    c101.isFree = true;
    c101.price = 0;
  }
  if (!state.cmsContent) {
    state.cmsContent = { pages: [] };
  }
  state.cmsContent = ensureCmsPages(state.cmsContent);
  saveState();
  if (isDatabaseAvailable()) await saveStateToDatabase(state);
  console.log(`[DMA] State loaded: ${state.users.length} users, ${state.courses.length} courses`);
}
function issueToken(res, payload) {
  const token = import_jsonwebtoken.default.sign(payload, JWT_SECRET, { expiresIn: "7d" });
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "strict" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1e3,
    path: "/"
  });
  return token;
}
function getSession(req) {
  const raw = req.cookies?.[COOKIE_NAME] || (req.headers.authorization?.startsWith("Bearer ") ? req.headers.authorization.slice(7) : null);
  if (!raw) return null;
  try {
    const d = import_jsonwebtoken.default.verify(raw, JWT_SECRET);
    return { userId: d.id, email: d.email, role: d.role };
  } catch {
    return null;
  }
}
function requireSession(req, res) {
  const s = getSession(req);
  if (!s) {
    res.status(401).json({ error: "Authentication required" });
    return null;
  }
  return s;
}
function requireAdmin(req, res) {
  const s = getSession(req);
  if (!s) {
    res.status(401).json({ error: "Authentication required" });
    return null;
  }
  if (s.role !== "admin" && s.role !== "super_admin") {
    res.status(403).json({ error: "Admin access required" });
    return null;
  }
  return s;
}
function safeUser(u) {
  const { password: _pw, ...rest } = u;
  return rest;
}
function safeCourse(course, privileged = false) {
  if (privileged) return course;
  const quizzes = (course.quizzes || []).map((quiz) => ({
    ...quiz,
    questions: (quiz.questions || []).map((q) => {
      const { correctAnswer: _ca, ...safe } = q;
      return safe;
    })
  }));
  return { ...course, quizzes };
}
function safeExam(exam, privileged = false) {
  if (privileged) return exam;
  const questions = (exam.questions || []).map((q) => {
    const { correctAnswer: _ca, ...safe } = q;
    return safe;
  });
  return { ...exam, questions };
}
var app = (0, import_express.default)();
app.use(import_express.default.json({ limit: "10mb" }));
app.use((0, import_cookie_parser.default)());
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, role, password, inviteToken, bio, specialization, qualificationDoc, subscriptionPlan } = req.body;
    if (!name || !email) {
      res.status(400).json({ error: "name and email are required" });
      return;
    }
    const emailLower = email.toLowerCase();
    if (state.users.find((u) => u.email === emailLower)) {
      res.status(409).json({ error: "Email already registered" });
      return;
    }
    let assignedRole = "student";
    if (inviteToken) {
      const invite = state.invites.find((i) => i.token === inviteToken && i.status === "pending");
      if (invite && invite.email === emailLower) {
        assignedRole = invite.role;
        invite.status = "used";
      }
    } else if (role === "instructor") {
      assignedRole = "instructor";
    }
    const safePassword = password || `DMA-${Math.random().toString(36).slice(2, 10)}`;
    const hashed = await import_bcryptjs.default.hash(safePassword, 10);
    const user = {
      id: `u_${Date.now()}`,
      name,
      email: emailLower,
      role: assignedRole,
      password: hashed,
      isApproved: assignedRole !== "instructor",
      suspended: false,
      subscriptionPlan: subscriptionPlan || "free",
      avatar: "",
      joinedAt: (/* @__PURE__ */ new Date()).toISOString(),
      customRoleId: null,
      bio: bio || "",
      specialization: specialization || "",
      qualificationDoc: qualificationDoc || null
    };
    state.users.push(user);
    addLog(`User registered: ${name} (${assignedRole})${assignedRole === "instructor" ? " [pending approval]" : ""}`, "register", user.id);
    saveState();
    sendWelcomeEmail(user.email, user.name, user.role).catch(() => {
    });
    const token = issueToken(res, { id: user.id, email: user.email, role: user.role });
    res.status(201).json({ status: "success", user: safeUser(user), token });
  } catch (err) {
    console.error("[register]", err);
    res.status(500).json({ error: "Registration failed" });
  }
});
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "email and password are required" });
      return;
    }
    const user = state.users.find((u) => u.email === email.toLowerCase());
    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    if (user.suspended) {
      res.status(403).json({ error: "Account suspended. Contact your administrator." });
      return;
    }
    if (!user.isApproved) {
      res.status(403).json({ error: "Account pending approval. Contact your administrator." });
      return;
    }
    if (!user.password) {
      res.status(403).json({
        error: "No password is set for this account. Use the 'Forgot password' link to set one.",
        code: "NO_PASSWORD_SET"
      });
      return;
    }
    const valid = await import_bcryptjs.default.compare(password, user.password);
    if (!valid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    const token = issueToken(res, { id: user.id, email: user.email, role: user.role });
    addLog(`User logged in: ${user.name}`, "login", user.id);
    res.json({ status: "success", user: safeUser(user), token });
  } catch (err) {
    console.error("[login]", err);
    res.status(500).json({ error: "Login failed" });
  }
});
app.post("/api/auth/logout", (_req, res) => {
  res.clearCookie(COOKIE_NAME, { path: "/" });
  res.json({ status: "success" });
});
app.get("/api/auth/me", (req, res) => {
  const session = getSession(req);
  if (!session) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  const user = state.users.find((u) => u.id === session.userId);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json({ status: "success", user: safeUser(user) });
});
app.post("/api/auth/change-password", async (req, res) => {
  const session = requireSession(req, res);
  if (!session) return;
  const { currentPassword, newPassword } = req.body;
  const user = state.users.find((u) => u.id === session.userId);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  if (user.password) {
    const valid = await import_bcryptjs.default.compare(currentPassword, user.password);
    if (!valid) {
      res.status(400).json({ error: "Current password incorrect" });
      return;
    }
  }
  user.password = await import_bcryptjs.default.hash(newPassword, 10);
  saveState();
  res.json({ status: "success" });
});
app.post("/api/auth/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ error: "Email is required" });
      return;
    }
    const user = state.users.find((u) => u.email === email.toLowerCase().trim());
    if (!user) {
      res.json({ status: "success" });
      return;
    }
    const token = import_crypto.default.randomBytes(32).toString("hex");
    const expiry = Date.now() + 60 * 60 * 1e3;
    user.passwordResetToken = token;
    user.passwordResetExpiry = expiry;
    saveState();
    const resetUrl = `${process.env.APP_URL || "https://digitalmanufacturing.academy"}/?reset=${token}`;
    await sendPasswordResetEmail(user.email, user.name, resetUrl);
    addLog(`Password reset requested for: ${user.email}`, "password_reset_request", user.id);
    res.json({ status: "success" });
  } catch (err) {
    console.error("[forgot-password]", err);
    res.status(500).json({ error: "Request failed" });
  }
});
app.post("/api/auth/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      res.status(400).json({ error: "Token and new password are required" });
      return;
    }
    if (password.length < 6) {
      res.status(400).json({ error: "Password must be at least 6 characters" });
      return;
    }
    const user = state.users.find(
      (u) => u.passwordResetToken === token && u.passwordResetExpiry > Date.now()
    );
    if (!user) {
      res.status(400).json({ error: "This reset link is invalid or has expired. Please request a new one." });
      return;
    }
    user.password = await import_bcryptjs.default.hash(password, 10);
    user.passwordResetToken = null;
    user.passwordResetExpiry = null;
    saveState();
    addLog(`Password reset completed for: ${user.email}`, "password_reset", user.id);
    res.json({ status: "success" });
  } catch (err) {
    console.error("[reset-password]", err);
    res.status(500).json({ error: "Reset failed" });
  }
});
app.get("/api/leaderboard", (req, res) => {
  const { courseId } = req.query;
  const enrollments = courseId ? state.enrollments.filter((e) => e.courseId === courseId) : state.enrollments;
  const userMap = {};
  for (const e of enrollments) {
    const user = state.users.find((u) => u.id === e.userId);
    if (!user) continue;
    if (!userMap[e.userId]) {
      userMap[e.userId] = {
        userId: e.userId,
        name: user.name || "Unknown",
        avatar: user.avatar || "",
        totalProgress: 0,
        count: 0,
        quizScores: [],
        completedCourses: 0,
        badges: user.badges || []
      };
    }
    const entry = userMap[e.userId];
    entry.totalProgress += e.progress || 0;
    entry.count += 1;
    if (e.progress >= 100) entry.completedCourses += 1;
    if (e.quizAttempts && typeof e.quizAttempts === "object") {
      for (const qa of Object.values(e.quizAttempts)) {
        if (typeof qa.score === "number") entry.quizScores.push(qa.score);
      }
    }
  }
  for (const a of state.quizAttempts || []) {
    if (userMap[a.userId] && typeof a.score === "number") {
      userMap[a.userId].quizScores.push(a.score);
    }
  }
  const ranked = Object.values(userMap).map((u) => {
    const avgProgress = u.count > 0 ? Math.round(u.totalProgress / u.count) : 0;
    const allScores = u.quizScores;
    const avgQuiz = allScores.length > 0 ? Math.round(allScores.reduce((s, v) => s + v, 0) / allScores.length) : 0;
    const composite = Math.round(avgQuiz * 0.6 + avgProgress * 0.4);
    return {
      userId: u.userId,
      name: u.name,
      avatar: u.avatar,
      avgProgress,
      avgQuiz,
      composite,
      completedCourses: u.completedCourses,
      quizAttempts: allScores.length,
      badges: u.badges
    };
  }).sort((a, b) => b.composite - a.composite).map((u, i) => ({ ...u, rank: i + 1 }));
  res.json({ leaderboard: ranked, updatedAt: (/* @__PURE__ */ new Date()).toISOString() });
});
app.get("/api/courses", (_req, res) => {
  const published = state.courses.filter((c) => c.isPublished !== false).map((c) => safeCourse(c, false));
  res.json(published);
});
app.get("/api/courses/enrollments/:userId", (req, res) => {
  const session = getSession(req);
  const { userId } = req.params;
  if (!session || session.userId !== userId && session.role !== "admin" && session.role !== "super_admin") {
    res.status(403).json({ error: "Access denied" });
    return;
  }
  const enrollments = state.enrollments.filter((e) => e.userId === userId);
  res.json({ enrollments });
});
app.get("/api/courses/:id", (req, res) => {
  const course = state.courses.find((c) => c.id === req.params.id);
  if (!course) {
    res.status(404).json({ error: "Course not found" });
    return;
  }
  const session = getSession(req);
  const privileged = session && (session.role === "admin" || session.role === "super_admin" || session.role === "instructor" && course.instructorId === session.userId);
  res.json(safeCourse(course, !!privileged));
});
app.post("/api/courses/create", async (req, res) => {
  const session = requireSession(req, res);
  if (!session) return;
  const { title, headline, description, category, level, duration, price, image, isFree } = req.body;
  if (!title || !category) {
    res.status(400).json({ error: "title and category required" });
    return;
  }
  const user = state.users.find((u) => u.id === session.userId);
  const course = {
    id: `c_${Date.now()}`,
    title,
    headline: headline || "",
    description: description || "",
    category,
    level: level || "Beginner",
    duration: duration || "TBD",
    instructorId: session.userId,
    instructorName: user?.name || "Instructor",
    price: isFree ? 0 : price || 0,
    isFree: !!isFree,
    image: image || "",
    isPublished: false,
    approvalStatus: "draft",
    enrollmentCount: 0,
    lessons: [],
    quizzes: [],
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  state.courses.push(course);
  addLog(`Course created: ${title}`, "course_create", session.userId);
  saveState();
  res.json({ status: "success", course });
});
app.post("/api/courses/update", (req, res) => {
  const session = requireSession(req, res);
  if (!session) return;
  const { courseId, updates } = req.body;
  const idx = state.courses.findIndex((c) => c.id === courseId);
  if (idx === -1) {
    res.status(404).json({ error: "Course not found" });
    return;
  }
  const course = state.courses[idx];
  if (course.instructorId !== session.userId && session.role !== "admin" && session.role !== "super_admin") {
    res.status(403).json({ error: "Unauthorized" });
    return;
  }
  state.courses[idx] = { ...course, ...updates };
  saveState();
  res.json({ status: "success", course: state.courses[idx] });
});
app.post("/api/courses/submit-for-review", (req, res) => {
  const session = requireSession(req, res);
  if (!session) return;
  const { courseId } = req.body;
  const course = state.courses.find((c) => c.id === courseId && c.instructorId === session.userId);
  if (!course) {
    res.status(404).json({ error: "Course not found" });
    return;
  }
  course.approvalStatus = "pending";
  course.isPublished = false;
  addLog(`Course "${course.title}" submitted for review`, "course_review", session.userId);
  saveState();
  res.json({ status: "success" });
});
app.post("/api/courses/:id/enroll", (req, res) => {
  const session = requireSession(req, res);
  if (!session) return;
  const { id } = req.params;
  const courseIdx = state.courses.findIndex((c) => c.id === id);
  if (courseIdx === -1) {
    res.status(404).json({ error: "Course not found" });
    return;
  }
  const course = state.courses[courseIdx];
  const existing = state.enrollments.find(
    (e) => e.userId === session.userId && e.courseId === id
  );
  if (existing) {
    res.json({ status: "already_enrolled", enrollment: existing });
    return;
  }
  const enrollment = {
    id: `enr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    userId: session.userId,
    courseId: id,
    progress: 0,
    completedLessons: [],
    quizAttempts: {},
    enrolledAt: (/* @__PURE__ */ new Date()).toISOString(),
    completedAt: null
  };
  state.enrollments.push(enrollment);
  state.courses[courseIdx] = {
    ...course,
    enrollmentCount: (course.enrollmentCount || 0) + 1
  };
  addLog(`User enrolled in: ${course.title}`, "enrollment", session.userId);
  saveState();
  res.json({ status: "success", enrollment });
});
app.post("/api/courses/:id/progress", (req, res) => {
  const session = requireSession(req, res);
  if (!session) return;
  const { id } = req.params;
  const { lessonId } = req.body;
  const enrollment = state.enrollments.find((e) => e.userId === session.userId && e.courseId === id);
  if (!enrollment) {
    res.status(404).json({ error: "Not enrolled" });
    return;
  }
  if (!enrollment.completedLessons) enrollment.completedLessons = [];
  if (!enrollment.completedLessons.includes(lessonId)) enrollment.completedLessons.push(lessonId);
  const course = state.courses.find((c) => c.id === id);
  const lessons = (course?.lessons || []).filter((l) => l.isRequired !== false);
  enrollment.progress = lessons.length > 0 ? Math.round(enrollment.completedLessons.length / lessons.length * 100) : 0;
  if (enrollment.progress >= 100) enrollment.completedAt = (/* @__PURE__ */ new Date()).toISOString();
  saveState();
  res.json({ status: "success", enrollment });
});
app.post("/api/courses/:id/quiz", (req, res) => {
  const session = requireSession(req, res);
  if (!session) return;
  const { id } = req.params;
  const { quizId, answers } = req.body;
  const enrollment = state.enrollments.find((e) => e.userId === session.userId && e.courseId === id);
  if (!enrollment) {
    res.status(404).json({ error: "Not enrolled" });
    return;
  }
  const course = state.courses.find((c) => c.id === id);
  const quiz = (course?.quizzes || []).find((q) => q.id === quizId);
  if (!quiz) {
    res.status(404).json({ error: "Quiz not found" });
    return;
  }
  let correct = 0;
  for (let i = 0; i < quiz.questions.length; i++) {
    if (answers[i] === quiz.questions[i].correctAnswer) correct++;
  }
  const score = Math.round(correct / quiz.questions.length * 100);
  const passed = score >= (quiz.passingScore || 80);
  if (!enrollment.quizAttempts) enrollment.quizAttempts = {};
  enrollment.quizAttempts[quizId] = { score, passed, attemptedAt: (/* @__PURE__ */ new Date()).toISOString() };
  saveState();
  res.json({ status: "success", score, passed, correct, total: quiz.questions.length });
});
app.get("/api/db-state", (req, res) => {
  const session = getSession(req);
  const isAdmin = session && (session.role === "admin" || session.role === "super_admin");
  const isInstructor = session?.role === "instructor";
  res.json({
    users: isAdmin ? state.users.map(safeUser) : [],
    courses: state.courses.filter((c) => isAdmin || c.isPublished !== false).map((c) => safeCourse(c, isAdmin || isInstructor && c.instructorId === session?.userId)),
    enrollments: session ? state.enrollments.filter((e) => isAdmin || e.userId === session.userId) : [],
    certificates: state.certificates || [],
    learningPaths: state.learningPaths,
    events: state.events,
    logs: isAdmin ? state.logs : [],
    messages: session ? state.messages.filter((m) => isAdmin || m.toUserId === session.userId || m.fromUserId === session.userId) : []
  });
});
app.post("/api/courses/enroll", (req, res) => {
  const session = requireSession(req, res);
  if (!session) return;
  const { courseId } = req.body;
  if (!courseId) {
    res.status(400).json({ error: "courseId required" });
    return;
  }
  const courseIdx = state.courses.findIndex((c) => c.id === courseId);
  if (courseIdx === -1) {
    res.status(404).json({ error: "Course not found" });
    return;
  }
  const course = state.courses[courseIdx];
  const existing = state.enrollments.find((e) => e.userId === session.userId && e.courseId === courseId);
  if (existing) {
    res.json({ status: "already_enrolled", enrollment: existing });
    return;
  }
  const enrollment = {
    id: `enr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    userId: session.userId,
    courseId,
    progress: 0,
    completedLessons: [],
    quizAttempts: {},
    enrolledAt: (/* @__PURE__ */ new Date()).toISOString(),
    completedAt: null
  };
  state.enrollments.push(enrollment);
  state.courses[courseIdx] = { ...course, enrollmentCount: (course.enrollmentCount || 0) + 1 };
  addLog(`User enrolled in: ${course.title}`, "enrollment", session.userId);
  saveState();
  res.json({ status: "success", enrollment });
});
app.post("/api/courses/sync-progress", (req, res) => {
  const session = requireSession(req, res);
  if (!session) return;
  const { userId, courseId, lessonId, quizId, score, passed } = req.body;
  const uid = userId || session.userId;
  const enrollment = state.enrollments.find((e) => e.userId === uid && e.courseId === courseId);
  if (!enrollment) {
    res.status(404).json({ error: "Not enrolled" });
    return;
  }
  if (lessonId) {
    if (!enrollment.completedLessons) enrollment.completedLessons = [];
    if (!enrollment.completedLessons.includes(lessonId)) enrollment.completedLessons.push(lessonId);
    const course = state.courses.find((c) => c.id === courseId);
    const lessons = (course?.lessons || []).filter((l) => l.isRequired !== false);
    enrollment.progress = lessons.length > 0 ? Math.round(enrollment.completedLessons.length / lessons.length * 100) : 0;
    if (enrollment.progress >= 100) enrollment.completedAt = (/* @__PURE__ */ new Date()).toISOString();
  }
  if (quizId) {
    if (!enrollment.quizAttempts) enrollment.quizAttempts = {};
    enrollment.quizAttempts[quizId] = { score: score || 0, passed: !!passed, attemptedAt: (/* @__PURE__ */ new Date()).toISOString() };
  }
  saveState();
  res.json({ status: "success", enrollment });
});
app.get("/api/subscription/status", (req, res) => {
  const session = getSession(req);
  if (!session) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  const user = state.users.find((u) => u.id === session.userId);
  res.json({ plan: user?.subscriptionPlan || "free", status: "active" });
});
app.post("/api/subscription/upgrade", (req, res) => {
  const session = requireSession(req, res);
  if (!session) return;
  const { planId } = req.body;
  const user = state.users.find((u) => u.id === session.userId);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  user.subscriptionPlan = planId || "pro";
  saveState();
  res.json({ status: "success", transactionId: `txn_${Date.now()}`, plan: user.subscriptionPlan });
});
app.post("/api/subscription/cancel", (req, res) => {
  const session = requireSession(req, res);
  if (!session) return;
  const user = state.users.find((u) => u.id === session.userId);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  user.subscriptionPlan = "free";
  saveState();
  res.json({ status: "success" });
});
app.get("/api/webinars", (_req, res) => {
  res.json({ posts: Array.isArray(state.webinarPosts) ? state.webinarPosts : [] });
});
app.post("/api/webinars/create", (req, res) => {
  const session = requireSession(req, res);
  if (!session) return;
  if (!["admin", "super_admin", "instructor"].includes(session.role)) {
    res.status(403).json({ error: "Only admins and instructors can post" });
    return;
  }
  const user = state.users.find((u) => u.id === session.userId);
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }
  const { title, content, type, meetLink, scheduledAt, tags } = req.body;
  if (!title?.trim() || !content?.trim()) {
    res.status(400).json({ error: "title and content are required" });
    return;
  }
  const post = {
    id: `wp_${Date.now()}`,
    title: title.trim(),
    content: content.trim(),
    type: type || "announcement",
    authorId: session.userId,
    authorName: user.name,
    authorRole: session.role,
    meetLink: meetLink || null,
    scheduledAt: scheduledAt || null,
    tags: Array.isArray(tags) ? tags : [],
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    pinned: false,
    views: 0
  };
  if (!Array.isArray(state.webinarPosts)) state.webinarPosts = [];
  state.webinarPosts.unshift(post);
  addLog(`Webinar post created: "${title}" by ${user.name}`, "webinar", session.userId);
  saveState();
  res.json({ status: "success", post });
});
app.delete("/api/webinars/:id", (req, res) => {
  const session = requireAdmin(req, res);
  if (!session) return;
  if (!Array.isArray(state.webinarPosts)) {
    res.status(404).json({ error: "Post not found" });
    return;
  }
  const idx = state.webinarPosts.findIndex((p) => p.id === req.params.id);
  if (idx === -1) {
    res.status(404).json({ error: "Post not found" });
    return;
  }
  state.webinarPosts.splice(idx, 1);
  saveState();
  res.json({ status: "success" });
});
app.post("/api/webinars/:id/pin", (req, res) => {
  const session = requireAdmin(req, res);
  if (!session) return;
  if (!Array.isArray(state.webinarPosts)) {
    res.status(404).json({ error: "Post not found" });
    return;
  }
  const post = state.webinarPosts.find((p) => p.id === req.params.id);
  if (!post) {
    res.status(404).json({ error: "Post not found" });
    return;
  }
  post.pinned = !post.pinned;
  saveState();
  res.json({ status: "success", pinned: post.pinned });
});
app.get("/api/my/enrollments", (req, res) => {
  const session = requireSession(req, res);
  if (!session) return;
  const enrollments = state.enrollments.filter((e) => e.userId === session.userId);
  res.json({ enrollments });
});
app.get("/api/my/certificates", (req, res) => {
  const session = requireSession(req, res);
  if (!session) return;
  const certs = (state.certificates || []).filter((c) => c.userId === session.userId);
  res.json({ certificates: certs });
});
app.get("/api/enrollments/:userId", (req, res) => {
  const session = getSession(req);
  const { userId } = req.params;
  if (!session || session.userId !== userId && session.role !== "admin" && session.role !== "super_admin") {
    res.status(403).json({ error: "Access denied" });
    return;
  }
  const enrollments = state.enrollments.filter((e) => e.userId === userId);
  res.json({ enrollments });
});
app.get("/api/admin/users", (req, res) => {
  const session = requireAdmin(req, res);
  if (!session) return;
  res.json({ status: "success", users: state.users.map(safeUser) });
});
app.post("/api/admin/users/create", async (req, res) => {
  const session = requireAdmin(req, res);
  if (!session) return;
  const { name, email, role, avatar, password, customRoleId } = req.body;
  if (!name || !email || !role) {
    res.status(400).json({ error: "name, email, role required" });
    return;
  }
  if (!password) {
    res.status(400).json({ error: "password required" });
    return;
  }
  if (role === "super_admin" && session.role !== "super_admin") {
    res.status(403).json({ error: "Only super admin can create super admin accounts" });
    return;
  }
  if (state.users.find((u) => u.email === email.toLowerCase())) {
    res.status(400).json({ error: "Email already registered" });
    return;
  }
  const hashed = await import_bcryptjs.default.hash(password, 10);
  const user = {
    id: `u_${Date.now()}`,
    name,
    email: email.toLowerCase(),
    role,
    password: hashed,
    avatar: avatar || "",
    suspended: false,
    isApproved: role === "instructor" ? false : true,
    subscriptionPlan: "free",
    joinedAt: (/* @__PURE__ */ new Date()).toISOString(),
    customRoleId: customRoleId || null
  };
  state.users.push(user);
  addLog(`Admin created user: ${name} (${role})`, "user_create", session.userId);
  saveState();
  res.json({ status: "success", user: safeUser(user) });
});
app.put("/api/admin/users/:id", (req, res) => {
  const session = requireAdmin(req, res);
  if (!session) return;
  const { id } = req.params;
  const target = state.users.find((u) => u.id === id);
  if (!target) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  if (target.role === "super_admin" && session.role !== "super_admin") {
    res.status(403).json({ error: "Admin cannot modify super admin accounts" });
    return;
  }
  const { name, email, role, avatar, subscriptionPlan, customRoleId } = req.body;
  if (role === "super_admin" && session.role !== "super_admin") {
    res.status(403).json({ error: "Only super admin can promote to super admin" });
    return;
  }
  if (name) target.name = name;
  if (email) target.email = email.toLowerCase();
  if (role) target.role = role;
  if (avatar !== void 0) target.avatar = avatar;
  if (subscriptionPlan !== void 0) target.subscriptionPlan = subscriptionPlan;
  if (customRoleId !== void 0) target.customRoleId = customRoleId || null;
  addLog(`Admin updated user: ${target.name}`, "user_update", session.userId);
  saveState();
  res.json({ status: "success", user: safeUser(target) });
});
app.post("/api/admin/users/:id/suspend", (req, res) => {
  const session = requireAdmin(req, res);
  if (!session) return;
  const { id } = req.params;
  const { suspend } = req.body;
  if (id === session.userId) {
    res.status(400).json({ error: "Cannot suspend your own account" });
    return;
  }
  const target = state.users.find((u) => u.id === id);
  if (!target) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  if (target.role === "super_admin" && session.role !== "super_admin") {
    res.status(403).json({ error: "Admin cannot suspend super admin accounts" });
    return;
  }
  target.suspended = !!suspend;
  addLog(`Admin ${suspend ? "suspended" : "unsuspended"} user: ${target.name}`, "user_suspend", session.userId);
  saveState();
  res.json({ status: "success" });
});
app.delete("/api/admin/users/:id", (req, res) => {
  const session = requireAdmin(req, res);
  if (!session) return;
  const { id } = req.params;
  if (id === session.userId) {
    res.status(400).json({ error: "Cannot delete your own account" });
    return;
  }
  const idx = state.users.findIndex((u) => u.id === id);
  if (idx === -1) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  if (state.users[idx].role === "super_admin" && session.role !== "super_admin") {
    res.status(403).json({ error: "Admin cannot delete super admin accounts" });
    return;
  }
  const name = state.users[idx].name;
  state.users.splice(idx, 1);
  addLog(`Admin deleted user: ${name}`, "user_delete", session.userId);
  saveState();
  res.json({ status: "success" });
});
app.post("/api/admin/users/:id/reset-password", async (req, res) => {
  const session = requireAdmin(req, res);
  if (!session) return;
  const user = state.users.find((u) => u.id === req.params.id);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  const tempPassword = `DMA-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  user.password = await import_bcryptjs.default.hash(tempPassword, 10);
  addLog(`Admin reset password for: ${user.name}`, "password_reset", session.userId);
  saveState();
  sendTempPasswordEmail(user.email, user.name, tempPassword).catch(() => {
  });
  res.json({ status: "success", tempPassword });
});
app.post("/api/admin/users/invite", (req, res) => {
  const session = requireAdmin(req, res);
  if (!session) return;
  const { email, role } = req.body;
  if (!email || !role) {
    res.status(400).json({ error: "email and role required" });
    return;
  }
  const token = import_crypto.default.randomBytes(16).toString("hex");
  const invite = { id: `inv_${Date.now()}`, email, role, token, status: "pending", createdAt: (/* @__PURE__ */ new Date()).toISOString() };
  state.invites.push(invite);
  addLog(`Invite generated for: ${email} (${role})`, "invite", session.userId);
  saveState();
  const inviteUrl = `https://digitalmanufacturing.academy/register?invite=${token}`;
  sendInviteEmail(email, role, inviteUrl).catch(() => {
  });
  res.json({ status: "success", invite, inviteUrl: `/register?invite=${token}` });
});
app.get("/api/admin/invites", (req, res) => {
  const session = requireAdmin(req, res);
  if (!session) return;
  res.json({ status: "success", invites: [...state.invites].reverse() });
});
app.post("/api/admin/approve-instructor", (req, res) => {
  const session = requireAdmin(req, res);
  if (!session) return;
  const { instructorId } = req.body;
  const user = state.users.find((u) => u.id === instructorId);
  if (!user) {
    res.status(404).json({ error: "Instructor not found" });
    return;
  }
  user.isApproved = true;
  addLog(`Approved instructor: ${user.name}`, "instructor_approve", session.userId);
  saveState();
  sendInstructorApprovalEmail(user.email, user.name).catch(() => {
  });
  res.json({ status: "success" });
});
app.delete("/api/admin/courses/:id", (req, res) => {
  const session = requireAdmin(req, res);
  if (!session) return;
  const idx = state.courses.findIndex((c) => c.id === req.params.id);
  if (idx === -1) {
    res.status(404).json({ error: "Course not found" });
    return;
  }
  const title = state.courses[idx].title;
  state.courses.splice(idx, 1);
  addLog(`Admin removed course: ${title}`, "course_delete", session.userId);
  saveState();
  res.json({ status: "success" });
});
app.post("/api/admin/approve-course", (req, res) => {
  const session = requireAdmin(req, res);
  if (!session) return;
  const { courseId } = req.body;
  const course = state.courses.find((c) => c.id === courseId);
  if (!course) {
    res.status(404).json({ error: "Course not found" });
    return;
  }
  course.approvalStatus = "approved";
  course.isPublished = true;
  addLog(`Course "${course.title}" approved and published`, "course_approve", session.userId);
  saveState();
  res.json({ status: "success" });
});
app.post("/api/admin/reject-course", (req, res) => {
  const session = requireAdmin(req, res);
  if (!session) return;
  const { courseId, reason } = req.body;
  const course = state.courses.find((c) => c.id === courseId);
  if (!course) {
    res.status(404).json({ error: "Course not found" });
    return;
  }
  course.approvalStatus = "rejected";
  course.rejectionReason = reason || "Does not meet quality standards";
  saveState();
  res.json({ status: "success" });
});
app.get("/api/admin/logs", (req, res) => {
  const session = requireAdmin(req, res);
  if (!session) return;
  res.json({ logs: state.logs.slice(0, 200) });
});
app.post("/api/admin/clear-logs", (req, res) => {
  const session = requireAdmin(req, res);
  if (!session) return;
  state.logs = [{ id: `log_${Date.now()}`, text: "Activity logs cleared by admin.", type: "admin", time: (/* @__PURE__ */ new Date()).toISOString() }];
  saveState();
  res.json({ status: "success" });
});
app.get("/api/admin/stats", (req, res) => {
  const session = requireAdmin(req, res);
  if (!session) return;
  res.json({
    userCount: state.users.length,
    courseCount: state.courses.filter((c) => c.isPublished).length,
    enrollmentCount: state.enrollments.length
  });
});
app.get("/api/admin/enrollments", (req, res) => {
  const session = requireAdmin(req, res);
  if (!session) return;
  res.json({ enrollments: state.enrollments });
});
app.get("/api/admin/roles", (req, res) => {
  const session = requireAdmin(req, res);
  if (!session) return;
  res.json({ status: "success", roles: state.customRoles });
});
app.post("/api/admin/roles/create", (req, res) => {
  const session = requireAdmin(req, res);
  if (!session) return;
  const { name, description, permissions } = req.body;
  if (!name) {
    res.status(400).json({ error: "Role name required" });
    return;
  }
  const role = { id: `role_${Date.now()}`, name, description: description || "", permissions: permissions || [], createdAt: (/* @__PURE__ */ new Date()).toISOString() };
  state.customRoles.push(role);
  addLog(`Admin created custom role: ${name}`, "role_create", session.userId);
  saveState();
  res.json({ status: "success", role });
});
app.put("/api/admin/roles/:id", (req, res) => {
  const session = requireAdmin(req, res);
  if (!session) return;
  const role = state.customRoles.find((r) => r.id === req.params.id);
  if (!role) {
    res.status(404).json({ error: "Role not found" });
    return;
  }
  const { name, description, permissions } = req.body;
  if (name) role.name = name;
  if (description !== void 0) role.description = description;
  if (permissions) role.permissions = permissions;
  saveState();
  res.json({ status: "success", role });
});
app.delete("/api/admin/roles/:id", (req, res) => {
  const session = requireAdmin(req, res);
  if (!session) return;
  const idx = state.customRoles.findIndex((r) => r.id === req.params.id);
  if (idx === -1) {
    res.status(404).json({ error: "Role not found" });
    return;
  }
  const name = state.customRoles[idx].name;
  state.customRoles.splice(idx, 1);
  addLog(`Admin deleted custom role: ${name}`, "role_delete", session.userId);
  saveState();
  res.json({ status: "success" });
});
app.get("/api/admin/media", (req, res) => {
  const session = requireAdmin(req, res);
  if (!session) return;
  res.json({ status: "success", media: state.mediaLibrary });
});
app.post("/api/admin/media/upload", (req, res) => {
  const session = requireAdmin(req, res);
  if (!session) return;
  const { name, dataUrl, type } = req.body;
  if (!name || !dataUrl) {
    res.status(400).json({ error: "name and dataUrl required" });
    return;
  }
  const item = { id: `media_${Date.now()}`, name, dataUrl, type: type || "image", usedAs: null, uploadedAt: (/* @__PURE__ */ new Date()).toISOString() };
  state.mediaLibrary.push(item);
  addLog(`Media uploaded: ${name}`, "media_upload", session.userId);
  saveState();
  res.json({ status: "success", item });
});
app.delete("/api/admin/media/:id", (req, res) => {
  const session = requireAdmin(req, res);
  if (!session) return;
  const idx = state.mediaLibrary.findIndex((m) => m.id === req.params.id);
  if (idx === -1) {
    res.status(404).json({ error: "Media not found" });
    return;
  }
  state.mediaLibrary.splice(idx, 1);
  saveState();
  res.json({ status: "success" });
});
app.post("/api/admin/media/:id/set-banner", (req, res) => {
  const session = requireAdmin(req, res);
  if (!session) return;
  const { target } = req.body;
  state.mediaLibrary.forEach((m) => {
    if (m.usedAs === target) m.usedAs = null;
  });
  const item = state.mediaLibrary.find((m) => m.id === req.params.id);
  if (!item) {
    res.status(404).json({ error: "Media not found" });
    return;
  }
  item.usedAs = target;
  addLog(`Media '${item.name}' set as ${target} banner`, "media_banner", session.userId);
  saveState();
  res.json({ status: "success", item });
});
app.get("/api/learning-paths", (_req, res) => {
  res.json(state.learningPaths);
});
app.post("/api/learning-paths/create", (req, res) => {
  const session = requireAdmin(req, res);
  if (!session) return;
  const { title, description, courseIds, badgeIcon, estimatedDuration } = req.body;
  if (!title || !courseIds) {
    res.status(400).json({ error: "title and courseIds required" });
    return;
  }
  const lp = {
    id: `lp_${Date.now()}`,
    title,
    description: description || "",
    courseIds,
    badgeIcon: badgeIcon || "\u{1F393}",
    estimatedDuration: estimatedDuration || "TBD",
    enrolledCount: 0,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  state.learningPaths.push(lp);
  addLog(`Learning path created: ${title}`, "lp_create", session.userId);
  saveState();
  res.json({ status: "success", learningPath: lp });
});
app.post("/api/learning-paths/enroll", (req, res) => {
  const session = requireSession(req, res);
  if (!session) return;
  const { pathId } = req.body;
  const lp = state.learningPaths.find((p) => p.id === pathId);
  if (!lp) {
    res.status(404).json({ error: "Learning path not found" });
    return;
  }
  lp.enrolledCount = (lp.enrolledCount || 0) + 1;
  for (const courseId of lp.courseIds || []) {
    const alreadyEnrolled = state.enrollments.find((e) => e.userId === session.userId && e.courseId === courseId);
    if (!alreadyEnrolled) {
      state.enrollments.push({
        id: `enr_${Date.now()}_${courseId}`,
        userId: session.userId,
        courseId,
        progress: 0,
        completedLessons: [],
        quizAttempts: {},
        enrolledAt: (/* @__PURE__ */ new Date()).toISOString(),
        completedAt: null
      });
    }
  }
  saveState();
  res.json({ status: "success" });
});
app.get("/api/events", (_req, res) => {
  res.json(state.events);
});
app.post("/api/events/create", (req, res) => {
  const session = requireAdmin(req, res);
  if (!session) return;
  const { title, description, date, location, capacity, type } = req.body;
  if (!title || !date) {
    res.status(400).json({ error: "title and date required" });
    return;
  }
  const event = {
    id: `evt_${Date.now()}`,
    title,
    description: description || "",
    date,
    location: location || "Online",
    capacity: capacity || 100,
    type: type || "webinar",
    attendeeCount: 0,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  state.events.push(event);
  addLog(`Event created: ${title}`, "event_create", session.userId);
  saveState();
  res.json({ status: "success", event });
});
app.post("/api/events/:id/attend", (req, res) => {
  const session = requireSession(req, res);
  if (!session) return;
  const event = state.events.find((e) => e.id === req.params.id);
  if (!event) {
    res.status(404).json({ error: "Event not found" });
    return;
  }
  event.attendeeCount = (event.attendeeCount || 0) + 1;
  saveState();
  res.json({ status: "success" });
});
app.post("/api/messages/send", (req, res) => {
  const session = requireSession(req, res);
  if (!session) return;
  const { toUserId, content } = req.body;
  if (!toUserId || !content) {
    res.status(400).json({ error: "toUserId and content required" });
    return;
  }
  const msg = {
    id: `msg_${Date.now()}`,
    fromUserId: session.userId,
    toUserId,
    content,
    read: false,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  state.messages.push(msg);
  saveState();
  res.json({ status: "success", message: msg });
});
app.get("/api/messages/:userId", (req, res) => {
  const session = getSession(req);
  const { userId } = req.params;
  if (!session || session.userId !== userId && session.role !== "admin" && session.role !== "super_admin") {
    res.status(403).json({ error: "Access denied" });
    return;
  }
  const msgs = state.messages.filter((m) => m.toUserId === userId || m.fromUserId === userId);
  res.json({ messages: msgs });
});
app.post("/api/messages/:id/read", (req, res) => {
  const session = requireSession(req, res);
  if (!session) return;
  const msg = state.messages.find((m) => m.id === req.params.id && m.toUserId === session.userId);
  if (msg) {
    msg.read = true;
    saveState();
  }
  res.json({ status: "success" });
});
var DEFAULT_CMS_PAGES = [
  {
    id: "home",
    label: "Homepage",
    slug: "/",
    sections: [
      { id: "hero", type: "hero", title: "Hero Section", order: 0, visible: true, content: { badge: "British Council Funded \u2022 BCU & AIUB Partnership", headline: "Digital Manufacturing", headlineHighlight: "", subheadline: "", primaryCTA: "Start Free Learning", secondaryCTA: "Become Instructor", imageUrl: "" } },
      { id: "stats", type: "stats", title: "Statistics", order: 1, visible: true, content: { items: [{ num: "5,200+", label: "Registered Students" }, { num: "12+", label: "Industry 4.0 Courses" }, { num: "50+", label: "Expert Instructors" }, { num: "3.4K+", label: "Global Certifications" }], imageUrl: "" } },
      { id: "categories", type: "categories", title: "Learning Categories", order: 2, visible: true, content: { sectionTitle: "Explore Our Categories", sectionSubtitle: "Build practical Industry 4.0 capability.", items: [], imageUrl: "" } },
      { id: "faq", type: "faq", title: "Frequently Asked Questions", order: 3, visible: true, content: { sectionTitle: "Frequently Asked Questions", items: [], imageUrl: "" } }
    ]
  },
  {
    id: "about",
    label: "About",
    slug: "/about",
    sections: [
      { id: "about_hero", type: "about_hero", title: "About Hero", order: 0, visible: true, content: { badge: "", title: "", subtitle: "", description: "", imageUrl: "" } },
      { id: "about_outcomes", type: "outcomes", title: "Strategic Outcomes", order: 1, visible: true, content: { title: "Strategic Partnership Outcomes", items: [], imageUrl: "" } }
    ]
  },
  {
    id: "contact",
    label: "Contact",
    slug: "/contact",
    sections: [
      { id: "contact_hero", type: "contact_hero", title: "Contact Hero", order: 0, visible: true, content: { badge: "Reach Out", title: "Contact Us", description: "", imageUrl: "" } },
      { id: "contact_info", type: "contact_info", title: "Contact Information", order: 1, visible: true, content: { aiub_address: "", bcu_address: "", email: "", phone: "", phone2: "", imageUrl: "" } },
      { id: "contact_form", type: "contact_form", title: "Contact Form", order: 2, visible: true, content: { formTitle: "Send a Message", formDescription: "", submitLabel: "Send Message", imageUrl: "" } }
    ]
  }
];
function ensureCmsPages(cms) {
  const existingPages = Array.isArray(cms?.pages) ? cms.pages : [];
  const pages = DEFAULT_CMS_PAGES.map((defaultPage) => {
    const existing = existingPages.find((page) => page.id === defaultPage.id);
    if (!existing) return JSON.parse(JSON.stringify(defaultPage));
    const existingSections = Array.isArray(existing.sections) ? existing.sections : [];
    const sections = defaultPage.sections.map((defaultSection) => {
      const current = existingSections.find((section) => section.id === defaultSection.id);
      return current || JSON.parse(JSON.stringify(defaultSection));
    });
    const customSections = existingSections.filter((section) => !defaultPage.sections.some((item) => item.id === section.id));
    return { ...defaultPage, ...existing, sections: [...sections, ...customSections] };
  });
  const customPages = existingPages.filter((page) => !DEFAULT_CMS_PAGES.some((item) => item.id === page.id));
  return { ...cms || {}, pages: [...pages, ...customPages] };
}
app.get("/api/site-notice", (_req, res) => {
  res.json(state.siteNotice || null);
});
app.put("/api/site-notice", (req, res) => {
  const session = requireAdmin(req, res);
  if (!session) return;
  const title = String(req.body?.title || "Site Notice").trim().slice(0, 120);
  const message = String(req.body?.message || "").trim().slice(0, 500);
  const linkLabel = String(req.body?.linkLabel || "").trim().slice(0, 50);
  const linkUrl = String(req.body?.linkUrl || "").trim().slice(0, 500);
  const enabled = req.body?.enabled !== false;
  if (enabled && !message) {
    res.status(400).json({ error: "A bulletin message is required when the notice is enabled" });
    return;
  }
  const user = state.users.find((u) => u.id === session.userId);
  state.siteNotice = {
    id: "site_notice",
    title: title || "Site Notice",
    message,
    linkLabel,
    linkUrl,
    enabled,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedBy: session.userId,
    updatedByName: user?.name || session.email,
    updatedByRole: session.role
  };
  addLog(`${enabled ? "Site bulletin published" : "Site bulletin disabled"} by ${user?.name || session.email}`, "site_notice", session.userId);
  saveState();
  res.json({ status: "success", notice: state.siteNotice });
});
app.delete("/api/site-notice", (req, res) => {
  const session = requireAdmin(req, res);
  if (!session) return;
  state.siteNotice = null;
  addLog(`Site bulletin cleared by ${session.email}`, "site_notice", session.userId);
  saveState();
  res.json({ status: "success" });
});
app.get("/api/cms", (_req, res) => {
  res.json(ensureCmsPages(state.cmsContent || { pages: DEFAULT_CMS_PAGES }));
});
app.post("/api/cms/update", (req, res) => {
  const session = requireAdmin(req, res);
  if (!session) return;
  const pages = req.body?.pages || req.body?.cmsData?.pages;
  if (!Array.isArray(pages)) {
    res.status(400).json({ error: "pages array required" });
    return;
  }
  if (JSON.stringify(pages).length > 8e6) {
    res.status(413).json({ error: "CMS content is too large" });
    return;
  }
  state.cmsContent = ensureCmsPages({ pages });
  addLog("CMS content updated", "cms_update", session.userId);
  saveState();
  res.json({ status: "success", cmsContent: state.cmsContent });
});
app.get("/api/theme", (_req, res) => {
  res.json(state.themeSettings || null);
});
app.post("/api/theme", (req, res) => {
  const session = requireAdmin(req, res);
  if (!session) return;
  state.themeSettings = req.body;
  saveState();
  res.json({ status: "success" });
});
app.get("/api/revenue/:instructorId", (req, res) => {
  const session = requireSession(req, res);
  if (!session) return;
  const { instructorId } = req.params;
  const isAdmin = session.role === "admin" || session.role === "super_admin";
  if (!isAdmin && session.userId !== instructorId) {
    res.status(403).json({ error: "Access denied" });
    return;
  }
  const courses = state.courses.filter((c) => c.instructorId === instructorId);
  const totalRevenue = courses.reduce((sum, c) => sum + (c.enrollmentCount || 0) * (c.price || 0), 0);
  const withdrawals = state.withdrawalRequests.filter((w) => w.instructorId === instructorId);
  const totalWithdrawn = withdrawals.filter((w) => w.status === "approved").reduce((s, w) => s + w.amount, 0);
  const bank = state.bankAccounts.find((b) => b.instructorId === instructorId) || null;
  res.json({ totalRevenue, totalWithdrawn, bank, withdrawals, platformShare: 0.3, instructorShare: 0.7 });
});
app.post("/api/revenue/add-bank", (req, res) => {
  const session = requireSession(req, res);
  if (!session) return;
  const { instructorId, bankName, accountName, accountNumber, routingCode, country } = req.body;
  const isAdmin = session.role === "admin" || session.role === "super_admin";
  if (!isAdmin && session.userId !== instructorId) {
    res.status(403).json({ error: "Access denied" });
    return;
  }
  const masked = (accountNumber || "").replace(
    /./g,
    (c, i) => i < accountNumber.length - 4 ? "*" : c
  );
  const idx = state.bankAccounts.findIndex((b) => b.instructorId === instructorId);
  const bankData = { id: `bank_${Date.now()}`, instructorId, bankName, accountName, accountNumber: masked, routingCode, country };
  if (idx >= 0) state.bankAccounts[idx] = bankData;
  else state.bankAccounts.push(bankData);
  saveState();
  res.json({ status: "success" });
});
app.post("/api/revenue/withdraw", (req, res) => {
  const session = requireSession(req, res);
  if (!session) return;
  const { instructorId, instructorName, amount } = req.body;
  const isAdmin = session.role === "admin" || session.role === "super_admin";
  if (!isAdmin && session.userId !== instructorId) {
    res.status(403).json({ error: "Access denied" });
    return;
  }
  const courses = state.courses.filter((c) => c.instructorId === instructorId);
  const totalRevenue = courses.reduce((sum, c) => sum + (c.enrollmentCount || 0) * (c.price || 0), 0);
  const instructorBalance = totalRevenue * 0.7;
  const withdrawals = state.withdrawalRequests.filter((w) => w.instructorId === instructorId && w.status !== "rejected");
  const alreadyWithdrawn = withdrawals.reduce((s, w) => s + w.amount, 0);
  const available = instructorBalance - alreadyWithdrawn;
  if (amount > available) {
    res.status(400).json({ error: "Insufficient balance" });
    return;
  }
  const wr = { id: `wr_${Date.now()}`, instructorId, instructorName, amount, status: "pending", createdAt: (/* @__PURE__ */ new Date()).toISOString() };
  state.withdrawalRequests.push(wr);
  saveState();
  res.json({ status: "success" });
});
app.post("/api/revenue/approve-withdrawal", (req, res) => {
  const session = requireAdmin(req, res);
  if (!session) return;
  const { requestId } = req.body;
  const wr = state.withdrawalRequests.find((w) => w.id === requestId);
  if (!wr) {
    res.status(404).json({ error: "Request not found" });
    return;
  }
  wr.status = "approved";
  saveState();
  res.json({ status: "success" });
});
app.post("/api/assignments/submit", (req, res) => {
  const session = requireSession(req, res);
  if (!session) return;
  const { courseId, assignmentId, content } = req.body;
  const sub = {
    id: `sub_${Date.now()}`,
    studentId: session.userId,
    courseId,
    assignmentId,
    content,
    grade: null,
    feedback: null,
    submittedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  state.assignmentSubmissions.push(sub);
  saveState();
  res.json({ status: "success", submission: sub });
});
app.post("/api/assignments/grade", (req, res) => {
  const session = requireAdmin(req, res);
  if (!session) return;
  const { submissionId, grade, feedback } = req.body;
  const sub = state.assignmentSubmissions.find((s) => s.id === submissionId);
  if (!sub) {
    res.status(404).json({ error: "Submission not found" });
    return;
  }
  sub.grade = grade;
  sub.feedback = feedback || "";
  saveState();
  res.json({ status: "success" });
});
app.get("/api/assignments/instructor/:instructorId", (req, res) => {
  const session = requireSession(req, res);
  if (!session) return;
  const courses = state.courses.filter((c) => c.instructorId === req.params.instructorId).map((c) => c.id);
  const subs = state.assignmentSubmissions.filter((s) => courses.includes(s.courseId));
  res.json({ submissions: subs });
});
app.get("/api/assignments/student/:studentId", (req, res) => {
  const session = requireSession(req, res);
  if (!session) return;
  if (session.userId !== req.params.studentId && session.role !== "admin" && session.role !== "super_admin") {
    res.status(403).json({ error: "Access denied" });
    return;
  }
  const subs = state.assignmentSubmissions.filter((s) => s.studentId === req.params.studentId);
  res.json({ submissions: subs });
});
app.post("/api/gemini/tutor", async (req, res) => {
  const { message, courseName, userContext } = req.body;
  if (!message) {
    res.status(400).json({ error: "Message content required" });
    return;
  }
  const sysPrompt = `You are 'DMA AI Assistant', an elite AI instructor at the Digital Manufacturing Academy (inspired by BCU and AIUB researchers). Your expertise spans Industry 4.0, Industry 5.0, Cyber-Physical Systems, PLC Programming (Ladder Logic), Siemens S7-1200 setups, G-code Generation, MQTT protocols, Additive Manufacturing (3D Printing with metallic FDM, SLA, SLS), Digital Twins, and industrial circular economy.

The student is currently checking: "${courseName || "General Academy Catalog"}".
User details: "${userContext || "Visitor Student"}".

Provide instant, professional, direct answers with neat technical bullet points. Keep explanations clear and encourage sustainable smart engineering. Format output as Markdown.`;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    setTimeout(() => {
      res.json({
        status: "mock_success",
        reply: `### DMA AI Assistant

To enable live AI responses, set a valid \`GEMINI_API_KEY\` in your secrets panel.

Here's a quick overview about **"${message.substring(0, 50)}..."**:

* **Industry 4.0 Integration:** Real-world sensors communicate over **MQTT** to publish physical parameters to an IoT broker.
* **PLC Automation:** Siemens S7 controllers read telemetry and dispatch G-Code dynamically.
* **Digital Twins:** Real-time synchronization between physical assets and virtual models optimizes production.
* **Sustainability:** Diagnostic systems reduce idle factory power by up to 34%.

Would you like a detailed breakdown on any specific topic?`
      });
    }, 1200);
    return;
  }
  try {
    const ai = new import_genai.GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: `${sysPrompt}

Student asks: ${message}` }] }]
    });
    res.json({ status: "success", reply: response.text || "Unable to formulate a response. Please rephrase your question." });
  } catch (error) {
    console.error("Gemini API error:", error);
    res.status(500).json({ error: "AI engine error", details: error.message });
  }
});
app.get("/api/quiz/attempts/:userId", (req, res) => {
  const session = requireSession(req, res);
  if (!session) return;
  if (session.userId !== req.params.userId && session.role !== "admin" && session.role !== "super_admin") {
    res.status(403).json({ error: "Access denied" });
    return;
  }
  const attempts = state.quizAttempts.filter((a) => a.userId === req.params.userId);
  res.json({ attempts });
});
app.post("/api/quiz/attempt", (req, res) => {
  const session = requireSession(req, res);
  if (!session) return;
  const { courseId, quizId, answers, timeTaken } = req.body;
  const course = state.courses.find((c) => c.id === courseId);
  const quiz = (course?.quizzes || []).find((q) => q.id === quizId);
  if (!quiz) {
    res.status(404).json({ error: "Quiz not found" });
    return;
  }
  let correct = 0;
  const internalBreakdown = quiz.questions.map((q, i) => {
    const isCorrect = answers[i] === q.correctAnswer;
    if (isCorrect) correct++;
    return { questionId: q.id, selected: answers[i], correctAnswer: q.correctAnswer, isCorrect };
  });
  const publicBreakdown = internalBreakdown.map(({ correctAnswer: _ca, ...b }) => b);
  const score = Math.round(correct / quiz.questions.length * 100);
  const passed = score >= (quiz.passingScore || 80);
  const attempt = {
    id: `qa_${Date.now()}`,
    userId: session.userId,
    courseId,
    quizId,
    quizTitle: quiz.title,
    score,
    passed,
    correct,
    total: quiz.questions.length,
    breakdown: internalBreakdown,
    // full detail stored server-side
    timeTaken: timeTaken || 0,
    attemptedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  state.quizAttempts.push(attempt);
  const enrollment = state.enrollments.find((e) => e.userId === session.userId && e.courseId === courseId);
  if (enrollment) {
    if (!enrollment.quizAttempts) enrollment.quizAttempts = {};
    enrollment.quizAttempts[quizId] = { score, passed, attemptedAt: attempt.attemptedAt };
  }
  addLog(`Quiz attempt: ${quiz.title} \u2014 ${score}%`, "quiz", session.userId);
  saveState();
  res.json({ status: "success", attempt: { ...attempt, breakdown: publicBreakdown } });
});
app.get("/api/quiz/analytics", (req, res) => {
  const session = requireAdmin(req, res);
  if (!session) return;
  const totalAttempts = state.quizAttempts.length;
  const passed = state.quizAttempts.filter((a) => a.passed).length;
  const avgScore = totalAttempts > 0 ? Math.round(state.quizAttempts.reduce((s, a) => s + a.score, 0) / totalAttempts) : 0;
  const byQuiz = {};
  for (const a of state.quizAttempts) {
    if (!byQuiz[a.quizId]) byQuiz[a.quizId] = { title: a.quizTitle, attempts: 0, passed: 0, totalScore: 0 };
    byQuiz[a.quizId].attempts++;
    if (a.passed) byQuiz[a.quizId].passed++;
    byQuiz[a.quizId].totalScore += a.score;
  }
  const quizStats = Object.values(byQuiz).map((q) => ({ ...q, avgScore: Math.round(q.totalScore / q.attempts) }));
  res.json({ totalAttempts, passed, failed: totalAttempts - passed, avgScore, quizStats, recentAttempts: state.quizAttempts.slice(-20).reverse() });
});
app.get("/api/exams", (req, res) => {
  const session = getSession(req);
  const isAdmin = session && (session.role === "admin" || session.role === "super_admin");
  const isInstructor = session?.role === "instructor";
  const visible = isAdmin ? state.exams : state.exams.filter((e) => e.isPublished);
  const exams = visible.map(
    (e) => safeExam(e, !!(isAdmin || isInstructor && e.createdBy === session?.userId))
  );
  res.json({ exams });
});
app.post("/api/exams/create", (req, res) => {
  const session = requireSession(req, res);
  if (!session) return;
  if (session.role !== "admin" && session.role !== "super_admin" && session.role !== "instructor") {
    res.status(403).json({ error: "Instructors and admins only" });
    return;
  }
  const { title, description, courseId, questions, passingScore, durationMinutes, scheduledAt, isPublished } = req.body;
  if (!title || !questions?.length) {
    res.status(400).json({ error: "title and questions required" });
    return;
  }
  const user = state.users.find((u) => u.id === session.userId);
  const exam = {
    id: `exam_${Date.now()}`,
    title,
    description: description || "",
    courseId: courseId || null,
    questions,
    passingScore: passingScore || 70,
    durationMinutes: durationMinutes || 60,
    scheduledAt: scheduledAt || null,
    isPublished: !!isPublished,
    createdBy: session.userId,
    createdByName: user?.name || "Instructor",
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  state.exams.push(exam);
  addLog(`Exam created: ${title}`, "exam_create", session.userId);
  saveState();
  res.json({ status: "success", exam });
});
app.put("/api/exams/:id", (req, res) => {
  const session = requireSession(req, res);
  if (!session) return;
  const exam = state.exams.find((e) => e.id === req.params.id);
  if (!exam) {
    res.status(404).json({ error: "Exam not found" });
    return;
  }
  if (exam.createdBy !== session.userId && session.role !== "admin" && session.role !== "super_admin") {
    res.status(403).json({ error: "Access denied" });
    return;
  }
  const allowed = ["title", "description", "questions", "passingScore", "durationMinutes", "scheduledAt", "isPublished"];
  for (const key of allowed) {
    if (req.body[key] !== void 0) exam[key] = req.body[key];
  }
  saveState();
  res.json({ status: "success", exam });
});
app.delete("/api/exams/:id", (req, res) => {
  const session = requireAdmin(req, res);
  if (!session) return;
  const idx = state.exams.findIndex((e) => e.id === req.params.id);
  if (idx === -1) {
    res.status(404).json({ error: "Exam not found" });
    return;
  }
  state.exams.splice(idx, 1);
  saveState();
  res.json({ status: "success" });
});
app.post("/api/exams/:id/attempt", (req, res) => {
  const session = requireSession(req, res);
  if (!session) return;
  const exam = state.exams.find((e) => e.id === req.params.id);
  if (!exam) {
    res.status(404).json({ error: "Exam not found" });
    return;
  }
  const { answers, timeTaken } = req.body;
  let correct = 0;
  const internalBreakdown = (exam.questions || []).map((q, i) => {
    const isCorrect = answers[i] === q.correctAnswer;
    if (isCorrect) correct++;
    return { questionId: q.id || i, selected: answers[i], correctAnswer: q.correctAnswer, isCorrect };
  });
  const publicBreakdown = internalBreakdown.map(({ correctAnswer: _ca, ...b }) => b);
  const score = exam.questions.length > 0 ? Math.round(correct / exam.questions.length * 100) : 0;
  const passed = score >= (exam.passingScore || 70);
  const attempt = {
    id: `ea_${Date.now()}`,
    userId: session.userId,
    examId: exam.id,
    examTitle: exam.title,
    score,
    passed,
    correct,
    total: exam.questions.length,
    breakdown: internalBreakdown,
    timeTaken: timeTaken || 0,
    attemptedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  state.examAttempts.push(attempt);
  addLog(`Exam attempt: ${exam.title} \u2014 ${score}% (${passed ? "PASS" : "FAIL"})`, "exam", session.userId);
  saveState();
  res.json({ status: "success", attempt: { ...attempt, breakdown: publicBreakdown } });
});
app.get("/api/exams/results/:userId", (req, res) => {
  const session = requireSession(req, res);
  if (!session) return;
  if (session.userId !== req.params.userId && session.role !== "admin" && session.role !== "super_admin") {
    res.status(403).json({ error: "Access denied" });
    return;
  }
  const results = state.examAttempts.filter((a) => a.userId === req.params.userId);
  res.json({ results });
});
app.get("/api/exams/all-results", (req, res) => {
  const session = requireAdmin(req, res);
  if (!session) return;
  res.json({ results: state.examAttempts });
});
app.get("/api/certificates/user/:userId", (req, res) => {
  const session = requireSession(req, res);
  if (!session) return;
  if (session.userId !== req.params.userId && session.role !== "admin" && session.role !== "super_admin") {
    res.status(403).json({ error: "Access denied" });
    return;
  }
  const certs = state.certificates.filter((c) => c.userId === req.params.userId);
  res.json({ certificates: certs });
});
app.get("/api/certificates/all", (req, res) => {
  const session = requireAdmin(req, res);
  if (!session) return;
  res.json({ certificates: state.certificates });
});
app.post("/api/certificates/generate", (req, res) => {
  const session = requireSession(req, res);
  if (!session) return;
  const { courseId, templateId } = req.body;
  const enrollment = state.enrollments.find((e) => e.userId === session.userId && e.courseId === courseId);
  if (!enrollment) {
    res.status(400).json({ error: "Not enrolled in this course" });
    return;
  }
  if ((enrollment.progress || 0) < 100) {
    res.status(400).json({ error: "Course not completed yet" });
    return;
  }
  const existing = state.certificates.find((c) => c.userId === session.userId && c.courseId === courseId);
  if (existing) {
    res.json({ status: "already_exists", certificate: existing });
    return;
  }
  const user = state.users.find((u) => u.id === session.userId);
  const course = state.courses.find((c) => c.id === courseId);
  const template = state.certTemplates.find((t) => t.id === templateId) || state.certTemplates.find((t) => t.isDefault) || state.certTemplates[0];
  const certId = `cert_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const cert = {
    id: certId,
    userId: session.userId,
    userName: user?.name || "Student",
    courseId,
    courseTitle: course?.title || "Course",
    templateId: template?.id || "tmpl_default",
    templateName: template?.name || "Standard",
    credentialUrl: `/certificates/verify/${certId}`,
    issuedAt: (/* @__PURE__ */ new Date()).toISOString(),
    grade: enrollment.quizAttempts ? (() => {
      const scores = Object.values(enrollment.quizAttempts).map((a) => a.score);
      return scores.length > 0 ? Math.round(scores.reduce((s, v) => s + v, 0) / scores.length) : null;
    })() : null
  };
  state.certificates.push(cert);
  enrollment.certificateId = certId;
  addLog(`Certificate issued: ${course?.title} \u2192 ${user?.name}`, "certificate", session.userId);
  saveState();
  res.json({ status: "success", certificate: cert });
});
app.get("/api/certificates/verify/:certId", (req, res) => {
  const cert = state.certificates.find((c) => c.id === req.params.certId);
  if (!cert) {
    res.status(404).json({ error: "Certificate not found", valid: false });
    return;
  }
  const user = state.users.find((u) => u.id === cert.userId);
  const course = state.courses.find((c) => c.id === cert.courseId);
  res.json({ valid: true, certificate: { ...cert, userName: user?.name || cert.userName, courseTitle: course?.title || cert.courseTitle } });
});
app.get("/api/certificates/templates", (req, res) => {
  res.json({ templates: state.certTemplates });
});
app.post("/api/certificates/templates", (req, res) => {
  const session = requireAdmin(req, res);
  if (!session) return;
  const { name, style, primaryColor, accentColor, headerText, footerText, signatureLabel, logoEnabled, badgeEnabled } = req.body;
  if (!name) {
    res.status(400).json({ error: "name required" });
    return;
  }
  const tmpl = {
    id: `tmpl_${Date.now()}`,
    name,
    style: style || "classic",
    primaryColor: primaryColor || "#0066ff",
    accentColor: accentColor || "#00aaff",
    headerText: headerText || "Digital Manufacturing Academy",
    footerText: footerText || "AIUB\u2013BCU British Council Partnership",
    signatureLabel: signatureLabel || "Programme Director",
    logoEnabled: logoEnabled !== false,
    badgeEnabled: badgeEnabled !== false,
    isDefault: false,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  state.certTemplates.push(tmpl);
  addLog(`Certificate template created: ${name}`, "cert_template", session.userId);
  saveState();
  res.json({ status: "success", template: tmpl });
});
app.put("/api/certificates/templates/:id", (req, res) => {
  const session = requireAdmin(req, res);
  if (!session) return;
  const tmpl = state.certTemplates.find((t) => t.id === req.params.id);
  if (!tmpl) {
    res.status(404).json({ error: "Template not found" });
    return;
  }
  const allowed = ["name", "style", "primaryColor", "accentColor", "headerText", "footerText", "signatureLabel", "logoEnabled", "badgeEnabled", "isDefault"];
  if (req.body.isDefault) {
    state.certTemplates.forEach((t) => {
      t.isDefault = false;
    });
  }
  for (const key of allowed) {
    if (req.body[key] !== void 0) tmpl[key] = req.body[key];
  }
  saveState();
  res.json({ status: "success", template: tmpl });
});
app.delete("/api/certificates/templates/:id", (req, res) => {
  const session = requireAdmin(req, res);
  if (!session) return;
  const idx = state.certTemplates.findIndex((t) => t.id === req.params.id);
  if (idx === -1) {
    res.status(404).json({ error: "Template not found" });
    return;
  }
  if (state.certTemplates[idx].isDefault) {
    res.status(400).json({ error: "Cannot delete the default template" });
    return;
  }
  state.certTemplates.splice(idx, 1);
  saveState();
  res.json({ status: "success" });
});
app.post("/api/certificates/download/:certId", (req, res) => {
  const session = requireSession(req, res);
  if (!session) return;
  const cert = state.certificates.find((c) => c.id === req.params.certId);
  if (!cert) {
    res.status(404).json({ error: "Certificate not found" });
    return;
  }
  const record = { id: `dl_${Date.now()}`, certId: cert.id, userId: session.userId, userName: cert.userName, courseTitle: cert.courseTitle, downloadedAt: (/* @__PURE__ */ new Date()).toISOString() };
  state.certDownloadHistory.push(record);
  saveState();
  res.json({ status: "success", record });
});
app.get("/api/certificates/download-history/:userId", (req, res) => {
  const session = requireSession(req, res);
  if (!session) return;
  const isAdmin = session.role === "admin" || session.role === "super_admin";
  if (!isAdmin && session.userId !== req.params.userId) {
    res.status(403).json({ error: "Access denied" });
    return;
  }
  const history = isAdmin && req.params.userId === "all" ? state.certDownloadHistory : state.certDownloadHistory.filter((d) => d.userId === req.params.userId);
  res.json({ history });
});
app.post("/api/assignments/add-feedback", (req, res) => {
  const session = requireSession(req, res);
  if (!session) return;
  if (session.role !== "instructor" && session.role !== "admin" && session.role !== "super_admin") {
    res.status(403).json({ error: "Instructors and admins only" });
    return;
  }
  const { submissionId, grade, feedback } = req.body;
  const sub = state.assignmentSubmissions.find((s) => s.id === submissionId);
  if (!sub) {
    res.status(404).json({ error: "Submission not found" });
    return;
  }
  sub.grade = grade;
  sub.feedback = feedback || "";
  sub.gradedAt = (/* @__PURE__ */ new Date()).toISOString();
  sub.gradedBy = session.userId;
  addLog(`Assignment graded: submission ${submissionId}`, "assignment_grade", session.userId);
  saveState();
  res.json({ status: "success", submission: sub });
});
app.get("/api/assignments/submissions/course/:courseId", (req, res) => {
  const session = requireSession(req, res);
  if (!session) return;
  const subs = state.assignmentSubmissions.filter((s) => s.courseId === req.params.courseId);
  res.json({ submissions: subs });
});
app.get("/drive-callback", (_req, res) => {
  res.send(`<!DOCTYPE html><html><head><title>Google Drive Authorization</title>
  <style>body{font-family:-apple-system,sans-serif;background:#0f172a;color:#f8fafc;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center}.card{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.1);border-radius:16px;padding:32px;max-width:400px}.spinner{border:3px solid rgba(255,255,255,.1);border-top:3px solid #3b82f6;border-radius:50%;width:30px;height:30px;animation:spin 1s linear infinite;margin:0 auto 16px}@keyframes spin{to{transform:rotate(360deg)}}h3{margin:8px 0;color:#3b82f6}p{color:#94a3b8;font-size:14px}</style>
  </head><body><div class="card"><div class="spinner"></div><h3>Google Drive Authorized</h3><p>Transferring credentials back to Digital Manufacturing Academy...</p></div>
  <script>const h=window.location.hash;if(h){const p=new URLSearchParams(h.substring(1)),t=p.get('access_token');if(t){if(window.opener){window.opener.postMessage({type:'GOOGLE_DRIVE_AUTH_SUCCESS',token:t},'*');setTimeout(()=>window.close(),800);}else{localStorage.setItem('dma_gd_access_token',t);document.querySelector('p').innerHTML='Credentials saved! You can close this tab.';}}}
  </script></body></html>`);
});
async function startServer() {
  await initializeState();
  app.post("/api/contact", async (req, res) => {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      res.status(400).json({ error: "name, email and message are required" });
      return;
    }
    sendContactAckEmail(email, name, message).catch(() => {
    });
    sendContactAckEmail("info@digitalmanufacturing.academy", `[Contact from ${name}]`, message).catch(() => {
    });
    addLog(`Contact form submitted by: ${name} <${email}>`, "contact", "guest");
    res.json({ status: "success" });
  });
  const _startTime = Date.now();
  app.get("/api/health", (_req, res) => {
    const uptimeSec = Math.floor((Date.now() - _startTime) / 1e3);
    const uptimeStr = uptimeSec < 60 ? `${uptimeSec}s` : uptimeSec < 3600 ? `${Math.floor(uptimeSec / 60)}m ${uptimeSec % 60}s` : `${Math.floor(uptimeSec / 3600)}h ${Math.floor(uptimeSec % 3600 / 60)}m`;
    res.json({
      status: "ok",
      storage: isDatabaseAvailable() ? "postgresql" : "json",
      database: isDatabaseAvailable(),
      users: state.users.length,
      courses: state.courses.length,
      uptime: uptimeStr,
      env: process.env.NODE_ENV || "development",
      ts: (/* @__PURE__ */ new Date()).toISOString()
    });
  });
  const distPath = import_path.default.join(process.cwd(), "dist");
  app.use(import_express.default.static(distPath, { maxAge: 0 }));
  app.get("*", (_req, res) => {
    res.sendFile(import_path.default.join(distPath, "index.html"));
  });
  app.use((err, _req, res, _next) => {
    const ref = `err_${Date.now()}`;
    recordError(`express[${ref}]`, err);
    const detail = isProd ? void 0 : err.message;
    res.status(500).json({ error: "Internal server error", ref, ...detail ? { detail } : {} });
  });
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[DMA SERVER] Academy running on http://0.0.0.0:${PORT}`);
    console.log(`[DMA SERVER] Storage: ${isDatabaseAvailable() ? "PostgreSQL" : "local JSON (development only)"}`);
  });
}
var _errorCounts = {};
function recordError(label, err) {
  const msg = err instanceof Error ? err.message : String(err);
  const key = `${label}:${msg}`;
  _errorCounts[key] = (_errorCounts[key] || 0) + 1;
  if (_errorCounts[key] === 1 || _errorCounts[key] % 60 === 0) {
    console.error(`[DMA][${label}] (\xD7${_errorCounts[key]}) ${msg}`, err instanceof Error ? err.stack : "");
    addLog(`Server error [${label}]: ${msg}`, "server_error");
  }
}
process.on("uncaughtException", (err) => recordError("uncaughtException", err));
process.on("unhandledRejection", (reason) => recordError("unhandledRejection", reason));
startServer();
//# sourceMappingURL=server.cjs.map

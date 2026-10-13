import nodemailer from "nodemailer";

// ── Hostinger SMTP config ────────────────────────────────────────────────────
// Port 465 → SSL (secure: true)   [recommended for Hostinger]
// Port 587 → STARTTLS (secure: false, requireTLS: true)
const SMTP_HOST    = process.env.SMTP_HOST     || "smtp.hostinger.com";
const SMTP_PORT    = parseInt(process.env.SMTP_PORT || "465");
const SMTP_SECURE  = SMTP_PORT === 465;
const SMTP_USER    = process.env.SMTP_USER     || "info@digitalmanufacturing.academy";
const SMTP_PASS    = process.env.SMTP_PASS     || "";
const FROM_NAME    = process.env.EMAIL_FROM_NAME || "DMA Academy";
const FROM_ADDRESS = SMTP_USER;
const FROM         = `"${FROM_NAME}" <${FROM_ADDRESS}>`;

const isConfigured = !!SMTP_PASS;

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_SECURE,
  auth: { user: SMTP_USER, pass: SMTP_PASS },
});

// Verify connection once on startup (non-fatal)
if (isConfigured) {
  transporter.verify().then(() => {
    console.log("[MAILER] ✅ SMTP connection verified —", SMTP_HOST + ":" + SMTP_PORT);
  }).catch((err: any) => {
    console.warn("[MAILER] ⚠️  SMTP verify failed:", err.message);
  });
} else {
  console.log("[MAILER] ℹ️  SMTP_PASS not set — emails will be logged to console only");
}

// ── Generic send helper ──────────────────────────────────────────────────────
async function send(to: string, subject: string, html: string): Promise<void> {
  if (!isConfigured) {
    console.log(`[MAILER] [MOCK] To: ${to} | Subject: ${subject}`);
    return;
  }
  try {
    await transporter.sendMail({ from: FROM, to, subject, html });
    console.log(`[MAILER] ✉️  Sent "${subject}" → ${to}`);
  } catch (err: any) {
    console.error(`[MAILER] ❌ Failed to send to ${to}:`, err.message);
  }
}

// ── Shared HTML layout ───────────────────────────────────────────────────────
function layout(body: string): string {
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
                  <div style="width:36px;height:36px;background:#00aaff22;border-radius:8px;display:inline-block;text-align:center;line-height:36px;font-size:18px;">🎓</div>
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
              British Council Funded · BCU &amp; AIUB Partnership
            </p>
            <p style="margin:0;font-size:11px;color:#475569;">
              <a href="https://digitalmanufacturing.academy" style="color:#00aaff;text-decoration:none;">digitalmanufacturing.academy</a>
              &nbsp;·&nbsp;
              <a href="mailto:info@digitalmanufacturing.academy" style="color:#00aaff;text-decoration:none;">info@digitalmanufacturing.academy</a>
            </p>
            <p style="margin:12px 0 0;font-size:10px;color:#334155;">
              © 2026 Digital Manufacturing Academy. All rights reserved.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── Email templates ──────────────────────────────────────────────────────────

export async function sendWelcomeEmail(to: string, name: string, role: string): Promise<void> {
  const roleLabel = role === "instructor" ? "Instructor" : role === "admin" ? "Admin" : "Student";
  const dashLink  = "https://digitalmanufacturing.academy";
  const isPending = role === "instructor";

  const body = `
    <h2 style="margin:0 0 8px;font-size:22px;font-weight:900;color:#ffffff;">
      Welcome to DMA Academy${name ? `, ${name.split(" ")[0]}` : ""}! 👋
    </h2>
    <p style="margin:0 0 20px;font-size:13px;color:#94a3b8;line-height:1.6;">
      Your <strong style="color:#00aaff;">${roleLabel}</strong> account has been created.
      ${isPending ? "It is currently <strong style='color:#f59e0b;'>pending admin approval</strong> — you'll receive a confirmation email once approved." : "You can sign in and start learning right away."}
    </p>
    <table cellpadding="0" cellspacing="0" style="margin:0 0 28px;background:#0f1f3d;border-radius:10px;padding:20px;width:100%;border:1px solid #1e293b;">
      <tr><td><p style="margin:0 0 6px;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Your Account</p></td></tr>
      <tr><td><p style="margin:0;font-size:13px;color:#e2e8f0;">📧 <strong>${to}</strong></p></td></tr>
      <tr><td><p style="margin:4px 0 0;font-size:13px;color:#e2e8f0;">🏷️ Role: <strong style="color:#00ddff;">${roleLabel}</strong></p></td></tr>
    </table>
    ${!isPending ? `
    <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr>
        <td style="border-radius:10px;background:linear-gradient(135deg,#1d4ed8,#2563eb);">
          <a href="${dashLink}" style="display:inline-block;padding:14px 32px;font-size:13px;font-weight:900;color:#ffffff;text-decoration:none;letter-spacing:0.5px;">
            Start Learning →
          </a>
        </td>
      </tr>
    </table>` : ""}
    <p style="margin:0;font-size:12px;color:#475569;line-height:1.6;">
      Questions? Reply to this email or visit <a href="https://digitalmanufacturing.academy" style="color:#00aaff;">our website</a>.
    </p>`;

  await send(to, "Welcome to DMA Academy — Your account is ready", layout(body));
}

export async function sendTempPasswordEmail(to: string, name: string, tempPassword: string): Promise<void> {
  const body = `
    <h2 style="margin:0 0 8px;font-size:22px;font-weight:900;color:#ffffff;">Password Reset 🔑</h2>
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
            Sign In Now →
          </a>
        </td>
      </tr>
    </table>
    <p style="margin:0;font-size:12px;color:#475569;line-height:1.6;">
      If you did not request this reset, contact <a href="mailto:info@digitalmanufacturing.academy" style="color:#00aaff;">info@digitalmanufacturing.academy</a> immediately.
    </p>`;

  await send(to, "DMA Academy — Your temporary password", layout(body));
}

export async function sendInstructorApprovalEmail(to: string, name: string): Promise<void> {
  const body = `
    <h2 style="margin:0 0 8px;font-size:22px;font-weight:900;color:#ffffff;">You're approved as an Instructor! ✅</h2>
    <p style="margin:0 0 20px;font-size:13px;color:#94a3b8;line-height:1.6;">
      Hi${name ? ` ${name.split(" ")[0]}` : ""},<br/>
      Your instructor account on DMA Academy has been approved. You can now sign in, create courses, manage learners, and publish content.
    </p>
    <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr>
        <td style="border-radius:10px;background:linear-gradient(135deg,#1d4ed8,#2563eb);">
          <a href="https://digitalmanufacturing.academy" style="display:inline-block;padding:14px 32px;font-size:13px;font-weight:900;color:#ffffff;text-decoration:none;">
            Go to Instructor Dashboard →
          </a>
        </td>
      </tr>
    </table>
    <p style="margin:0;font-size:12px;color:#475569;">Questions? Email <a href="mailto:info@digitalmanufacturing.academy" style="color:#00aaff;">info@digitalmanufacturing.academy</a></p>`;

  await send(to, "DMA Academy — Instructor account approved", layout(body));
}

export async function sendContactAckEmail(to: string, name: string, message: string): Promise<void> {
  const body = `
    <h2 style="margin:0 0 8px;font-size:22px;font-weight:900;color:#ffffff;">We received your message 📬</h2>
    <p style="margin:0 0 20px;font-size:13px;color:#94a3b8;line-height:1.6;">
      Hi${name ? ` ${name}` : ""},<br/>
      Thank you for contacting DMA Academy. Our team will respond within 1–2 working days.
    </p>
    <table cellpadding="0" cellspacing="0" style="margin:0 0 28px;background:#0f1f3d;border-radius:10px;padding:20px;width:100%;border:1px solid #1e293b;">
      <tr><td>
        <p style="margin:0 0 8px;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Your Message</p>
        <p style="margin:0;font-size:13px;color:#cbd5e1;line-height:1.6;font-style:italic;">"${message.substring(0, 400)}${message.length > 400 ? "…" : ""}"</p>
      </td></tr>
    </table>
    <p style="margin:0;font-size:12px;color:#475569;">
      Alternatively, email us directly: <a href="mailto:info@digitalmanufacturing.academy" style="color:#00aaff;">info@digitalmanufacturing.academy</a>
    </p>`;

  await send(to, "DMA Academy — We received your enquiry", layout(body));
}

// Internal notification: unlike the acknowledgement above, this one is written
// for the academy inbox and includes the sender's reply-to address.
export async function sendContactNotificationEmail(
  to: string, name: string, email: string, message: string
): Promise<void> {
  const body = `
    <h2 style="margin:0 0 8px;font-size:22px;font-weight:900;color:#ffffff;">New contact enquiry 📥</h2>
    <p style="margin:0 0 20px;font-size:13px;color:#94a3b8;line-height:1.6;">
      A new message was submitted through the DMA Academy contact form.
    </p>
    <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;background:#0f1f3d;border-radius:10px;padding:20px;width:100%;border:1px solid #1e293b;">
      <tr><td><p style="margin:0 0 6px;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:1px;">From</p></td></tr>
      <tr><td><p style="margin:0;font-size:13px;color:#e2e8f0;">👤 <strong>${name}</strong></p></td></tr>
      <tr><td><p style="margin:4px 0 0;font-size:13px;color:#e2e8f0;">📧 <a href="mailto:${email}" style="color:#00aaff;">${email}</a></p></td></tr>
    </table>
    <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;background:#0f1f3d;border-radius:10px;padding:20px;width:100%;border:1px solid #1e293b;">
      <tr><td><p style="margin:0 0 8px;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Message</p></td></tr>
      <tr><td><p style="margin:0;font-size:13px;color:#cbd5e1;line-height:1.6;white-space:pre-wrap;">${message.substring(0, 2000)}${message.length > 2000 ? "…" : ""}</p></td></tr>
    </table>
    <p style="margin:0;font-size:12px;color:#475569;">Reply directly to this enquiry via the address above.</p>`;

  await send(to, `DMA Academy — New contact enquiry from ${name}`, layout(body));
}

export async function sendInviteEmail(to: string, role: string, inviteUrl: string): Promise<void> {
  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);
  const body = `
    <h2 style="margin:0 0 8px;font-size:22px;font-weight:900;color:#ffffff;">You've been invited to DMA Academy 🎓</h2>
    <p style="margin:0 0 20px;font-size:13px;color:#94a3b8;line-height:1.6;">
      You have been invited to join the Digital Manufacturing Academy as a <strong style="color:#00aaff;">${roleLabel}</strong>.<br/>
      Click the button below to complete your registration.
    </p>
    <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr>
        <td style="border-radius:10px;background:linear-gradient(135deg,#1d4ed8,#2563eb);">
          <a href="${inviteUrl}" style="display:inline-block;padding:14px 32px;font-size:13px;font-weight:900;color:#ffffff;text-decoration:none;">
            Accept Invitation →
          </a>
        </td>
      </tr>
    </table>
    <p style="margin:0;font-size:11px;color:#475569;">This invitation link expires in 7 days. If you did not expect this email, ignore it safely.</p>`;

  await send(to, `DMA Academy — You're invited as ${roleLabel}`, layout(body));
}

export async function sendPasswordResetEmail(to: string, name: string, resetUrl: string): Promise<void> {
  const body = `
    <h2 style="margin:0 0 8px;font-size:22px;font-weight:900;color:#ffffff;">Reset Your Password 🔑</h2>
    <p style="margin:0 0 6px;font-size:13px;color:#94a3b8;">Hi ${name},</p>
    <p style="margin:0 0 20px;font-size:13px;color:#94a3b8;line-height:1.6;">
      We received a request to reset your DMA Academy password. Click the button below to choose a new password.
      This link expires in <strong style="color:#ffffff;">1 hour</strong>.
    </p>
    <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr>
        <td style="border-radius:10px;background:linear-gradient(135deg,#1d4ed8,#2563eb);">
          <a href="${resetUrl}" style="display:inline-block;padding:14px 32px;font-size:13px;font-weight:900;color:#ffffff;text-decoration:none;">
            Reset Password →
          </a>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 8px;font-size:12px;color:#64748b;">
      If the button doesn't work, copy and paste this link into your browser:
    </p>
    <p style="margin:0 0 20px;font-size:11px;color:#00aaff;word-break:break-all;">${resetUrl}</p>
    <p style="margin:0;font-size:11px;color:#475569;">
      If you did not request a password reset, you can safely ignore this email — your password will not change.
    </p>`;

  await send(to, "DMA Academy — Reset your password", layout(body));
}

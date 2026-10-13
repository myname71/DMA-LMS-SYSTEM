import React, { useState } from 'react';
import { Shield, ChevronDown, ChevronUp } from 'lucide-react';

interface Section {
  title: string;
  content: string;
}

const SECTIONS: Section[] = [
  {
    title: '1. Information We Collect',
    content: `We collect information you provide directly when you register, enroll in courses, or contact us. This includes:

• Identity data: name, email address, role (student/instructor/admin)
• Account data: profile photo, password (hashed with bcrypt), subscription plan
• Usage data: course progress, quiz attempts, lesson completions, login timestamps
• Communication data: messages sent through the platform, contact form submissions

We do not sell, rent, or trade your personal information to third parties.`,
  },
  {
    title: '2. How We Use Your Information',
    content: `Digital Manufacturing Academy uses your information to:

• Authenticate your identity and maintain secure sessions using JWT tokens
• Track your learning progress and issue verified certificates of completion
• Send course updates, webinar invitations, and platform announcements
• Improve course content based on aggregated usage analytics
• Comply with our obligations under the British Council grant partnership agreement

Legal basis: legitimate interest (LMS delivery), contract performance (enrolment), and consent (communications).`,
  },
  {
    title: '3. Data Storage & Security',
    content: `All user data is stored on secured servers configured with industry-standard protections:

• Passwords are hashed using bcryptjs with a salt factor of 10 — we never store plaintext passwords
• Sessions are managed via HttpOnly, SameSite cookies using signed JWT tokens
• Database state is persisted in encrypted server storage at the Hostinger deployment tier
• HTTPS/TLS encryption is enforced for all data in transit via Hostinger's SSL certificate

We retain your account data for as long as your account is active. Upon account deletion, data is removed within 30 days.`,
  },
  {
    title: '4. Cookies',
    content: `We use a single first-party cookie named dma_token to maintain your authenticated session. This cookie:

• Is HttpOnly (not accessible by JavaScript)
• Expires after 7 days of inactivity
• Is not used for advertising or cross-site tracking

We do not use third-party advertising cookies. Functional localStorage may be used for theme preferences and the PWA install prompt.`,
  },
  {
    title: '5. Third-Party Services',
    content: `The platform integrates with the following third-party services:

• Google Gemini AI — for the AI Tutor assistant (DMA AI Assistant). Queries you submit are processed by Google's Gemini API. See Google's Privacy Policy at policies.google.com.
• Unsplash — for course cover images served via CDN. No personal data is sent.
• Google Fonts — typography loaded at page render. Standard CDN request.
• PWA Builder — optional APK generation. No data is shared unless you visit the service.

We are not responsible for the privacy practices of these external services.`,
  },
  {
    title: '6. Your Rights',
    content: `As a user of DMA Academy, you have the right to:

• Access — request a copy of the personal data we hold about you
• Correction — update incorrect information via your profile settings
• Deletion — request account deletion by emailing digitalmfg.2026@gmail.com
• Portability — request your learning data in a structured, machine-readable format
• Withdrawal — withdraw consent for optional communications at any time

To exercise these rights, contact: digitalmfg.2026@gmail.com. We will respond within 30 days.`,
  },
  {
    title: '7. Children\'s Privacy',
    content: `DMA Academy is designed for professionals, researchers, and adult learners in the manufacturing sector. We do not knowingly collect personal information from anyone under the age of 16.

If you believe a minor has submitted data to our platform, please contact us immediately at digitalmfg.2026@gmail.com so we can delete it promptly.`,
  },
  {
    title: '8. Changes to This Policy',
    content: `We may update this Privacy Policy periodically to reflect changes in our practices, technology, or legal requirements. When we make material changes, we will notify registered users via email or a prominent in-platform notice.

The date at the top of this page will always reflect the most recent revision. Continued use of the platform after changes constitutes your acceptance of the updated policy.`,
  },
];

export default function PrivacyPage() {
  const [openSection, setOpenSection] = useState<number | null>(0);

  const toggle = (idx: number) => setOpenSection(openSection === idx ? null : idx);

  return (
    <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-12 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
            <Shield className="w-5 h-5 text-blue-400" />
          </div>
          <span className="text-xs font-bold text-blue-400 uppercase tracking-widest font-mono">Legal Document</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Privacy Policy</h1>
        <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">
          Digital Manufacturing Academy is committed to protecting your privacy. This policy explains how we collect,
          use, and safeguard your personal information when you use our platform.
        </p>
        <div className="flex flex-wrap gap-4 text-xs text-slate-500 font-mono">
          <span>Last updated: June 2026</span>
          <span>•</span>
          <span>Effective: January 2025</span>
          <span>•</span>
          <span>BCU–AIUB British Council Partnership</span>
        </div>
      </div>

      {/* Intro box */}
      <div className="p-5 rounded-2xl border border-blue-500/20 bg-blue-600/5 mb-8">
        <p className="text-xs text-slate-300 leading-relaxed">
          <strong className="text-blue-400">Summary:</strong> We collect your name, email, and learning activity to run the LMS.
          We do not sell your data. Passwords are bcrypt-hashed. Sessions use HttpOnly JWT cookies.
          You can request data deletion at any time by emailing us.
        </p>
      </div>

      {/* Accordion sections */}
      <div className="space-y-3">
        {SECTIONS.map((section, idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden"
          >
            <button
              onClick={() => toggle(idx)}
              className="w-full flex items-center justify-between p-5 text-left cursor-pointer hover:bg-white/3 transition-colors"
            >
              <span className="text-sm font-bold text-white">{section.title}</span>
              {openSection === idx
                ? <ChevronUp className="w-4 h-4 text-blue-400 shrink-0" />
                : <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />}
            </button>
            {openSection === idx && (
              <div className="px-5 pb-5">
                <pre className="text-xs text-slate-400 leading-relaxed whitespace-pre-wrap font-sans">
                  {section.content}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Contact */}
      <div className="mt-10 p-6 rounded-2xl border border-slate-800 bg-slate-900/50 text-center">
        <p className="text-slate-400 text-xs">
          Questions about this policy? Contact our Data Protection point of contact at{' '}
          <a href="mailto:digitalmfg.2026@gmail.com" className="text-blue-400 hover:underline">
            digitalmfg.2026@gmail.com
          </a>
        </p>
      </div>
    </div>
  );
}

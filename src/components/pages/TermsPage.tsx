import React, { useState } from 'react';
import { FileText, ChevronDown, ChevronUp } from 'lucide-react';

const SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    content: `By accessing or using the Digital Manufacturing Academy (DMA) platform at digitalmanufacturing.academy, you agree to be bound by these Terms & Conditions and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this platform.

These terms apply to all users of the platform, including students, instructors, administrators, and visitors.`,
  },
  {
    title: '2. Platform Use & Eligibility',
    content: `You must be at least 16 years of age to register and use DMA Academy. By creating an account, you confirm that:

• The information you provide during registration is accurate and complete
• You will maintain the security of your account credentials
• You will not share your login credentials with any third party
• You will not use the platform for any unlawful or unauthorised purpose
• You will not attempt to gain unauthorised access to any part of the platform or its systems`,
  },
  {
    title: '3. Intellectual Property',
    content: `All course content, materials, videos, assessments, branding, and software on the DMA Academy platform are the intellectual property of AIUB, Birmingham City University, and/or the British Council, unless otherwise stated.

You are granted a limited, non-exclusive, non-transferable licence to access and use the content for personal, non-commercial educational purposes only. You may not:

• Reproduce, distribute, or publicly display course materials without written permission
• Reverse-engineer or extract source code from the platform
• Use DMA Academy content to create competing products or services`,
  },
  {
    title: '4. Enrolment & Certification',
    content: `Course enrolment grants you access to the specific modules listed at the time of enrolment. DMA Academy reserves the right to update, modify, or remove course content to reflect evolving Industry 4.0 research standards.

Certificates of completion are issued upon satisfying all module requirements and are subject to academic review. DMA Academy does not guarantee employment outcomes as a result of certification.

Certificates are verified through the platform and carry the academic endorsement of AIUB and Birmingham City University.`,
  },
  {
    title: '5. User-Generated Content',
    content: `When you submit content to the platform — including forum posts, assignment submissions, or instructor course materials — you grant DMA Academy a non-exclusive, royalty-free licence to use, display, and distribute that content within the platform.

You are solely responsible for any content you submit. Content must not:

• Infringe the intellectual property rights of others
• Contain offensive, discriminatory, or defamatory material
• Include personal data of third parties without consent
• Violate any applicable law or regulation

DMA Academy reserves the right to remove content that violates these guidelines.`,
  },
  {
    title: '6. Limitation of Liability',
    content: `To the fullest extent permitted by law, DMA Academy, AIUB, Birmingham City University, and the British Council shall not be liable for:

• Any indirect, incidental, or consequential damages arising from your use of the platform
• Loss of data, interruption of service, or technical failures beyond our reasonable control
• Decisions made by employers or institutions based on your DMA Academy credentials
• Content accuracy in third-party integrations (e.g., Google Gemini AI responses)

The platform is provided "as is" without warranties of any kind, express or implied.`,
  },
  {
    title: '7. Account Termination',
    content: `DMA Academy reserves the right to suspend or terminate your account at any time for:

• Violation of these Terms & Conditions
• Academic misconduct or dishonesty
• Abusive or harmful behaviour toward other users or staff
• Fraudulent activity or misrepresentation

Upon termination, your access to course materials will be revoked. Certificates already issued remain valid unless revoked for academic misconduct.`,
  },
  {
    title: '8. Modifications to Terms',
    content: `DMA Academy may update these Terms & Conditions from time to time. Material changes will be communicated to registered users via email or in-platform notification at least 14 days before taking effect.

Continued use of the platform after the effective date of changes constitutes acceptance of the revised terms. The date at the top of this page reflects the most recent revision.`,
  },
  {
    title: '9. Governing Law',
    content: `These Terms & Conditions are governed by and construed in accordance with the laws of Bangladesh, without regard to its conflict of law provisions.

For matters involving Birmingham City University's contribution to the programme, UK law may apply. Any disputes arising under these terms shall first be attempted to be resolved through mediation between the parties before escalating to formal legal proceedings.`,
  },
  {
    title: '10. Contact for Legal Queries',
    content: `If you have questions about these Terms & Conditions, please contact:

Digital Manufacturing Academy — Legal & Compliance
Email: digitalmfg.2026@gmail.com
Address: AIUB Campus, Bashundhara, Dhaka 1229, Bangladesh

We will respond to all legal queries within 10 business days.`,
  },
];

export default function TermsPage() {
  const [openSection, setOpenSection] = useState<number | null>(0);

  const toggle = (idx: number) => setOpenSection(openSection === idx ? null : idx);

  return (
    <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-12 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
            <FileText className="w-5 h-5 text-blue-400" />
          </div>
          <span className="text-xs font-bold text-blue-400 uppercase tracking-widest font-mono">Legal Document</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Terms &amp; Conditions</h1>
        <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">
          Please read these Terms &amp; Conditions carefully before using the Digital Manufacturing Academy platform. By accessing our services, you agree to be bound by these terms.
        </p>
        <div className="flex flex-wrap gap-4 text-xs text-slate-500 font-mono">
          <span>Last updated: June 2026</span>
          <span>•</span>
          <span>Effective: January 2025</span>
          <span>•</span>
          <span>BCU–AIUB British Council Partnership</span>
        </div>
      </div>

      {/* Summary box */}
      <div className="p-5 rounded-2xl border border-blue-500/20 bg-blue-600/5 mb-8">
        <p className="text-xs text-slate-300 leading-relaxed">
          <strong className="text-blue-400">Summary:</strong> By using DMA Academy you agree to use the platform lawfully, respect intellectual property, and maintain account security. Certificates are issued upon completion of requirements. We may update these terms with 14 days' notice.
        </p>
      </div>

      {/* Accordion */}
      <div className="space-y-3">
        {SECTIONS.map((section, idx) => (
          <div key={idx} className="rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden">
            <button
              onClick={() => toggle(idx)}
              className="w-full flex items-center justify-between p-5 text-left cursor-pointer hover:bg-white/[0.03] transition-colors"
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
          Questions about these terms? Contact us at{' '}
          <a href="mailto:digitalmfg.2026@gmail.com" className="text-blue-400 hover:underline">
            digitalmfg.2026@gmail.com
          </a>
        </p>
      </div>
    </div>
  );
}

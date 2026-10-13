import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle, Clock, Globe } from 'lucide-react';

export default function ContactUsPage({ cmsContent }: { cmsContent?: any }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [done, setDone] = useState(false);
  const contactPage = cmsContent?.pages?.find((page: any) => page.id === 'contact');
  const sectionContent = (id: string) => contactPage?.sections?.find((section: any) => section.id === id)?.content || {};
  const hero = sectionContent('contact_hero');
  const info = sectionContent('contact_info');
  const form = sectionContent('contact_form');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDone(true);
  };

  return (
    <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-12 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
            <Mail className="w-5 h-5 text-blue-400" />
          </div>
          <span className="text-xs font-bold text-blue-400 uppercase tracking-widest font-mono">{hero.badge || 'Reach Out'}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">{hero.title || 'Contact Us'}</h1>
        <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">
          {hero.description || 'Have a question about our programmes, partnerships, or research? Our team at the Digital Manufacturing Academy is here to help.'}
        </p>
        {hero.imageUrl && <img src={hero.imageUrl} alt="Contact the academy" className="w-full max-h-64 object-cover rounded-2xl border border-white/10 mt-5" />}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Contact Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl border border-slate-800 bg-[#111827] space-y-5">
            <h3 className="text-sm font-extrabold text-white">Contact Information</h3>

            <div className="space-y-4 text-xs text-slate-300">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600/15 border border-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <div>
                  <p className="font-bold text-white mb-0.5">AIUB Campus</p>
                    <p className="text-slate-400 leading-relaxed">{info.aiub_address || 'Bashundhara, Dhaka 1229, Bangladesh'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600/15 border border-blue-500/20 flex items-center justify-center shrink-0">
                  <Globe className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <div>
                  <p className="font-bold text-white mb-0.5">Birmingham City University</p>
                    <p className="text-slate-400 leading-relaxed">{info.bcu_address || 'United Kingdom'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600/15 border border-blue-500/20 flex items-center justify-center shrink-0">
                  <Mail className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <div>
                  <p className="font-bold text-white mb-0.5">Email</p>
                    <a href={`mailto:${info.email || 'info@digitalmanufacturing.academy'}`} className="text-blue-400 hover:underline">
                      {info.email || 'info@digitalmanufacturing.academy'}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600/15 border border-blue-500/20 flex items-center justify-center shrink-0">
                  <Phone className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <div>
                  <p className="font-bold text-white mb-0.5">Phone</p>
                    <p className="text-slate-400">{info.phone || '+880 2-9884455'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600/15 border border-blue-500/20 flex items-center justify-center shrink-0">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <div>
                  <p className="font-bold text-white mb-0.5">Response Time</p>
                  <p className="text-slate-400">Within 24 business hours</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-blue-500/20 bg-blue-600/5">
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong className="text-blue-400">British Council Partnership:</strong> This academy is co-funded under the Going Global Partnerships programme. For grant-related queries, please mention "BC Grant" in your subject line.
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-3">
          <div className="p-6 rounded-2xl border border-slate-800 bg-[#111827]">
            {done ? (
              <div className="py-16 flex flex-col items-center text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-teal-500/10 border border-teal-500/30 flex items-center justify-center">
                  <CheckCircle className="w-7 h-7 text-teal-400" />
                </div>
                <h4 className="text-base font-extrabold text-white">Message Sent!</h4>
                <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                  Our AIUB–BCU team will review your message and respond within 24 business hours.
                </p>
                <button
                  onClick={() => { setDone(false); setName(''); setEmail(''); setSubject(''); setMessage(''); }}
                  className="text-xs text-blue-400 hover:underline cursor-pointer"
                >
                  Send another message
                </button>
              </div>
            ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-sm font-extrabold text-white mb-5">{form.formTitle || 'Send a Message'}</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Full Name *</label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      required
                      placeholder="Your full name"
                      className="w-full text-xs p-3 rounded-lg bg-slate-900 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Email Address *</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      placeholder="your@email.com"
                      className="w-full text-xs p-3 rounded-lg bg-slate-900 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Subject *</label>
                  <select
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    required
                    className="w-full text-xs p-3 rounded-lg bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-blue-500/50 transition-colors cursor-pointer"
                  >
                    <option value="">Select a topic...</option>
                    <option value="enrollment">Course Enrollment</option>
                    <option value="partnership">Research Partnership</option>
                    <option value="grant">British Council Grant</option>
                    <option value="technical">Technical Support</option>
                    <option value="media">Media & Press</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Message *</label>
                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    required
                    placeholder="Describe your query in detail..."
                    rows={5}
                    className="w-full text-xs p-3 rounded-lg bg-slate-900 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-xs font-bold transition-all cursor-pointer shadow-lg shadow-blue-900/30"
                >
                  <Send className="w-3.5 h-3.5" />
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

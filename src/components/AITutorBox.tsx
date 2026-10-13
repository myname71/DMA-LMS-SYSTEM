import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, MessageSquare, HelpCircle, Loader2, BookOpen, Compass, Award } from 'lucide-react';

interface Message {
  role: 'bot' | 'user';
  text: string;
}

interface AITutorBoxProps {
  currentCourseName?: string;
  userContextName?: string;
}

export default function AITutorBox({
  currentCourseName = "General Catalog",
  userContextName = "Student"
}: AITutorBoxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTutorTab, setActiveTutorTab] = useState<'chat' | 'faqs' | 'guide'>('chat');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', text: `Hello! I am your **DMA AI Study Companion**. 🤖\n\nI am co-trained in **Industry 4.0/5.0**, **PLC Programming**, **Digital Twin networks**, and **Additive Manufacturing**.\n\nAsk me anything! For example:\n* *'Explain Siemens S7-1200 Ladder Logic'* \n* *'What is MQTT broker synchronicity?'*\n* *'Give me G01 G-code usage examples'*` }
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Selected FAQ for the instant pre-ready Q&A view
  const [activeFaqId, setActiveFaqId] = useState<number | null>(null);

  const threadEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (threadEndRef.current && activeTutorTab === 'chat') {
      threadEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading, activeTutorTab]);

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputText;
    if (!textToSend.trim()) return;

    // Switch to chat tab automatically if in another tab
    setActiveTutorTab('chat');

    // Append user message
    const userMsg: Message = { role: 'user', text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setLoading(true);

    try {
      const response = await fetch("/api/gemini/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          courseName: currentCourseName,
          userContext: userContextName
        })
      });

      const data = await response.json();
      if (data.reply) {
        setMessages(prev => [...prev, { role: 'bot', text: data.reply }]);
      } else {
        setMessages(prev => [...prev, { role: 'bot', text: "I encountered a routing anomaly. Please check server.ts backend configurations." }]);
      }
    } catch (err) {
      console.error("AI Tutor endpoint fault", err);
      setMessages(prev => [...prev, { role: 'bot', text: "Oops! My sensor feeds timed out. Please verify your internet or the backend server console." }]);
    } finally {
      setLoading(false);
    }
  };

  const sampleQuestions = [
    "What is standard Ladder Logic?",
    "Explain predictive G-Code diagnostics",
    "How does circular economy fit in factories?"
  ];

  // Pre-ready Q&A list for interactive immediate response
  const preReadyFAQs = [
    {
      id: 1,
      question: "How do I earn my certification badge?",
      answer: "To earn your certification, simply enroll in any Course Syllabus. Work through the digital curriculum by reviewing the materials (videos, interactive slides, and glossary worksheets). Finally, complete the end-of-course evaluative quiz inside your Student dashboard and achieve a score of 70% or higher. Your certificate will generate automatically as a high-fidelity PDF!"
    },
    {
      id: 2,
      question: "What is Transnational Education (TNE) support?",
      answer: "This signifies that our curriculums are designed and certified jointly under the British Council Going Global Partnerships grant scheme. It promotes academic cohesion and research alignment between the lead investigators at Birmingham City University (BCU) in the United Kingdom, and the Associate Dean of American International University Bangladesh (AIUB)."
    },
    {
      id: 3,
      question: "How do the PowerPoint PPTX presentations play?",
      answer: "Excellent question! If a course module contains slideshow slides rather than long pre-recorded lecture videos, we trigger our custom slides deck player instantly. You can easily click through bite-sized academic takeaways with our responsive 'Next' and 'Prev' slideshow buttons right in the classroom."
    },
    {
      id: 4,
      question: "Can instructors build custom syllabuses?",
      answer: "Absolutely! Simply login with an instructor account (or click 'Demo Instructor login' in the header panel), then navigate to the Instructor Dashboard. From there, you can connect your Google Drive to map active folders for files, or complete our quick Course Creator wizard to publish standard modules instantly."
    }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 text-left font-sans animate-fade-in">
      {/* Floating Button triggers */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="p-4 rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/30 hover:scale-105 transition-all flex items-center justify-center cursor-pointer animate-float border border-blue-400/25 relative group"
          style={{ animationDuration: '4.5s' }}
          id="ai-tutor-trigger"
        >
          <div className="absolute -inset-1.5 bg-blue-500 rounded-full opacity-20 blur-md group-hover:opacity-40 transition-opacity animate-pulse"></div>
          <Bot className="w-6 h-6 mr-1.5 object-contain relative z-10" />
          <span className="text-xs font-extrabold pr-1 relative z-10">DMA Assistant</span>
          <span className="flex h-2 w-2 relative z-10">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-400"></span>
          </span>
        </button>
      )}

      {/* Expanded Chat Overlay Box */}
      {isOpen && (
        <div className="w-[360px] sm:w-[410px] h-[550px] rounded-3xl glass-dialog shadow-[0_15px_50px_rgba(0,0,0,0.5)] flex flex-col justify-between overflow-hidden animate-slide-up border border-white/10">
          {/* Header */}
          <div className="p-4 bg-white/5 border-b border-white/10 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-white/15">
                  <Bot className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-white leading-none">DMA AI Study Companion</h4>
                  <span className="text-[10px] text-slate-400 font-medium font-mono">Accredited co-pilot • Online</span>
                </div>
              </div>

              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/10 rounded-lg text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Premium Interactive Tabs Controller */}
            <div className="grid grid-cols-3 gap-1 bg-slate-950/60 p-1 rounded-lg border border-white/5 text-[10px] font-mono">
              <button
                onClick={() => setActiveTutorTab('chat')}
                className={`py-1.5 rounded-md font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  activeTutorTab === 'chat' 
                    ? 'bg-blue-600 text-white shadow' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Ask AI</span>
              </button>
              <button
                onClick={() => setActiveTutorTab('faqs')}
                className={`py-1.5 rounded-md font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  activeTutorTab === 'faqs' 
                    ? 'bg-blue-600 text-white shadow' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Instant Q&A</span>
              </button>
              <button
                onClick={() => setActiveTutorTab('guide')}
                className={`py-1.5 rounded-md font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  activeTutorTab === 'guide' 
                    ? 'bg-blue-600 text-white shadow' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>User Manual</span>
              </button>
            </div>
          </div>

          {/* Messages list Thread or views depending on tab */}
          <div className="flex-1 p-4 overflow-y-auto bg-white/[0.01] text-xs">
            {activeTutorTab === 'chat' && (
              <div className="space-y-4">
                {messages.map((m, idx) => {
                  const isBot = m.role === 'bot';
                  return (
                    <div key={idx} className={`flex ${isBot ? 'justify-start' : 'justify-end'}`}>
                      <div className={`p-4.5 max-w-[85%] rounded-2xl relative ${
                        isBot 
                          ? 'glass-card border border-white/10 text-slate-200' 
                          : 'bg-blue-600 text-white font-medium shadow'
                      }`}>
                        {/* Render simplistic Markdown paragraphs */}
                        <div className="space-y-2 leading-relaxed">
                          {m.text.split('\n').map((para, pIdx) => {
                            if (para.startsWith('* ')) {
                              return <li className="ml-3 font-medium list-disc" key={pIdx}>{para.replace('* ', '')}</li>;
                            }
                            return <p key={pIdx}>{para}</p>;
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {loading && (
                  <div className="flex justify-start">
                    <div className="p-4 rounded-2xl glass-card border border-white/10 text-slate-300 flex items-center gap-2">
                      <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                      <span className="text-[11px] font-medium font-mono">Tutor processing prompt...</span>
                    </div>
                  </div>
                )}
                
                <div ref={threadEndRef} />
              </div>
            )}

            {/* Instant Preloaded Q&A View */}
            {activeTutorTab === 'faqs' && (
              <div className="space-y-3 p-1">
                <div className="mb-4 bg-blue-500/10 border border-blue-500/20 p-3 rounded-xl">
                  <span className="text-[10px] font-bold text-blue-400 uppercase font-mono tracking-wider block mb-1">💡 Instant Solution Guide</span>
                  <p className="text-[11px] text-slate-300 leading-normal">
                    Click any pre-ready engineering training or portal usage queries below to view immediate certified answers without network lag.
                  </p>
                </div>

                <div className="space-y-2">
                  {preReadyFAQs.map(faq => (
                    <div key={faq.id} className="rounded-xl border border-white/5 bg-slate-950/40 hover:border-white/15 transition-all text-left">
                      <button
                        onClick={() => setActiveFaqId(activeFaqId === faq.id ? null : faq.id)}
                        className="w-full p-3.5 px-4 text-left flex justify-between items-center text-slate-100 font-bold hover:text-blue-400 transition-colors text-[11px] sm:text-xs"
                      >
                        <span className="pr-3 leading-snug">{faq.question}</span>
                        <span className="text-slate-500 shrink-0 text-xs font-mono font-bold">
                          {activeFaqId === faq.id ? 'Hide [-]' : 'Show [+]'}
                        </span>
                      </button>
                      
                      {activeFaqId === faq.id && (
                        <div className="p-4 px-4 border-t border-white/5 bg-blue-600/[0.02] text-[11px] text-slate-300 leading-relaxed space-y-2 font-sans animate-fade-in">
                          <p>{faq.answer}</p>
                          <div className="flex justify-end pt-1">
                            <button
                              onClick={() => {
                                handleSendMessage(`Tell me more about: "${faq.question}"`);
                              }}
                              className="text-[9px] uppercase font-bold text-blue-400 hover:underline flex items-center gap-1 font-mono cursor-pointer"
                            >
                              <span>Explore more with AI →</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Digital Manufacturing Academy Quick User Manual Guide */}
            {activeTutorTab === 'guide' && (
              <div className="p-2 space-y-4 text-left animate-fade-in leading-relaxed text-[11px] sm:text-xs text-slate-300">
                <div className="flex items-center gap-2 mb-2">
                  <Compass className="w-5 h-5 text-blue-400" />
                  <h5 className="font-extrabold text-white text-xs sm:text-sm uppercase tracking-tight">Interactive Academy Manual</h5>
                </div>
                
                <p className="text-[11px] text-slate-400">
                  Welcome to the Digital Manufacturing Academy (DMA)! Follow this structured roadmap to start utilizing and mastering smart industrial engineering tools:
                </p>

                <div className="space-y-3.5">
                  <div className="flex gap-3">
                    <span className="w-5 h-5 rounded-full bg-blue-900/40 text-blue-400 flex items-center justify-center font-bold font-mono text-[10px] shrink-0 border border-blue-500/20">1</span>
                    <div>
                      <p className="font-bold text-slate-100 text-[11px]">Discover Academic Syllabuses</p>
                      <p className="text-[10px] text-slate-400">Navigate to the **Syllabus** catalog to filter classes by Level, Duration, or Category (e.g. Industry 4.0, Additive Manufacturing).</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <span className="w-5 h-5 rounded-full bg-blue-900/40 text-blue-400 flex items-center justify-center font-bold font-mono text-[10px] shrink-0 border border-blue-500/20">2</span>
                    <div>
                      <p className="font-bold text-slate-100 text-[11px]">Work with High-fidelity Slides & Videos</p>
                      <p className="text-[10px] text-slate-400">Study with interactive PowerPoint (PPTX) slide packages. Use the bespoke classroom control dashboard triggers to study text outlines.</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <span className="w-5 h-5 rounded-full bg-blue-900/40 text-blue-400 flex items-center justify-center font-bold font-mono text-[10px] shrink-0 border border-blue-500/20">3</span>
                    <div>
                      <p className="font-bold text-slate-100 text-[11px]">Assess & Earn Certification</p>
                      <p className="text-[10px] text-slate-400">Complete standard evaluation chapters. Achieve high pass scores to instantly populate a digital verified PDF transcript diploma.</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <span className="w-5 h-5 rounded-full bg-blue-900/40 text-blue-400 flex items-center justify-center font-bold font-mono text-[10px] shrink-0 border border-blue-500/20">4</span>
                    <div>
                      <p className="font-bold text-slate-100 text-[11px]">Sync Live Google Drive Files</p>
                      <p className="text-[10px] text-slate-400">Connect Google Drive storage to preview uploaded instructional documents, assignments, and download G-codes securely.</p>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between mt-2 font-mono">
                  <div className="flex items-center gap-1.5 text-[9px] text-slate-400">
                    <Award className="w-3.5 h-3.5 text-yellow-500" />
                    <span>Transnational Education Standard</span>
                  </div>
                  <span className="text-[8px] bg-blue-500/20 text-blue-400 uppercase font-black px-1.5 py-0.5 rounded">TNE-01</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick-select samples drawer (only in standard chat mode) */}
          {activeTutorTab === 'chat' && messages.length < 3 && !loading && (
            <div className="p-3 bg-white/[0.02]/80 border-t border-white/10 px-4 space-y-1.5 text-left">
              <span className="text-[9px] uppercase font-bold text-slate-500 flex items-center gap-1 font-mono">
                <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                <span>Try Suggested Prompts:</span>
              </span>
              <div className="flex flex-col gap-1">
                {sampleQuestions.map(q => (
                  <button
                    key={q}
                    onClick={() => handleSendMessage(q)}
                    className="w-full text-left p-1.5 px-2.5 rounded bg-white/5 border border-white/10 hover:border-blue-500/40 hover:bg-white/10 hover:text-blue-400 transition-all text-[10px] text-slate-300 font-medium cursor-pointer"
                  >
                    {q} →
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input control row bar */}
          <div className="p-3 bg-white/5 border-t border-white/10 flex items-center gap-2 px-4 shadow">
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSendMessage(); }}
              placeholder={
                activeTutorTab === 'chat' 
                  ? "Type your question..." 
                  : "Ask AI search engine now..."
              }
              className="flex-1 p-3 text-xs glass-input focus:border-blue-500 text-white"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim()}
              className="p-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white shadow cursor-pointer transition-all shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


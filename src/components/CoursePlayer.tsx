import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X, ChevronLeft, ChevronRight, Play, Pause, Lock, CheckCircle,
  Award, BookOpen, Zap, ToggleLeft, ToggleRight, Plus, AlertTriangle
} from 'lucide-react';
import { Course, User, Enrollment } from '../types';
import LessonMedia from './LessonMedia';

/* ─── Internal types ─── */
interface PlayerSlide { eyebrow: string; title: string; body: string }
interface PlayerPage { title: string; text: string }
interface PlayerSim { title: string; body: string }
interface QuizQ {
  q: string; type: 'mcq' | 'tf';
  options?: string[]; correct: number | boolean; explain: string;
}
interface PlayerModule {
  id: string; lessonId: string; title: string;
  playerType: 'slides' | 'document' | 'interactive';
  sub: string; objective: string;
  slides?: PlayerSlide[]; pages?: PlayerPage[]; sim?: PlayerSim;
  // Raw lesson media — used to play real video/PDF instead of generated slides.
  lessonType?: string;
  contentUrl?: string;
  videoSource?: string;
  lessonSlides?: { title?: string; content?: string; bullets?: string[]; image?: string }[];

  quiz: QuizQ[];
}
type ModStatus = 'locked' | 'inprogress' | 'done';

/* ─── DMA 101 curated module content ─── */
const DMA101_MODULES: Record<string, { slides?: PlayerSlide[]; pages?: PlayerPage[]; sim?: PlayerSim; quiz: QuizQ[] }> = {
  l_101_1: {
    slides: [
      { eyebrow: 'Module 1 · Slide 1', title: 'The Digital Manufacturing Revolution', body: 'Co-developed under the British Council Going Global Partnerships TNE Grant by Birmingham City University (BCU) and AIUB Bangladesh — bridging Industry 4.0 capability across two continents.' },
      { eyebrow: 'Module 1 · Slide 2', title: 'What is Digital Manufacturing?', body: '"Digital manufacturing integrates data, automation, connectivity, and advanced analytics across the entire product lifecycle to improve productivity, quality, and sustainability." — Chinnathai & Alkan, 2023' },
      { eyebrow: 'Module 1 · Slide 3', title: 'Industrial Evolution Timeline', body: 'Industry 1.0 → Steam & Mechanization · Industry 2.0 → Mass Production & Electricity · Industry 3.0 → Computers & Automation · Industry 4.0 → Cyber-Physical Systems · Industry 5.0 → Human-Tech Partnership · Industry 6.0 → Cognitive & Bio-Tech Networks' },
      { eyebrow: 'Module 1 · Slide 4', title: 'The Nine Pillars of Industry 4.0', body: 'Additive Manufacturing · Augmented Reality · Simulation · Autonomous Robots · Industrial IoT · Big Data Analytics · Cloud Computing · Cybersecurity · System Integration' },
      { eyebrow: 'Module 1 \u00b7 Slide 5', title: 'Real-World Case: Unilever Bangladesh', body: "Unilever's Khanpur Factory implemented an IoT-based utility monitoring system tracking real-time steam, water, and energy consumption across production lines — generating instant carbon accounting data. (Alam, 2023)" },
      { eyebrow: 'Module 1 \u00b7 Slide 6', title: 'Case Study: Ford Cologne Assembly', body: "Collaborative robots (cobots) work alongside human operators on assembly at Ford's Cologne plant — reducing physical strain while boosting quality output. (Emma & Michels, 2025)" },
    ],
    quiz: [
      { q: 'Which industry era introduced Cyber-Physical Systems and connectivity?', type: 'mcq', options: ['Industry 2.0', 'Industry 3.0', 'Industry 4.0', 'Industry 5.0'], correct: 2, explain: 'Industry 4.0 is characterized by Cyber-Physical Systems, IoT, and smart connectivity between machines and humans.' },
      { q: 'Digital Manufacturing places humans and sustainability at the center.', type: 'tf', correct: true, explain: 'Industry 5.0 — the current frontier — explicitly focuses on human-technology partnership, sustainability, and resilience.' },
      { q: 'How many pillars define Industry 4.0 according to the DMA framework?', type: 'mcq', options: ['5', '7', '9', '12'], correct: 2, explain: 'The DMA framework identifies nine pillars: AM, AR, Simulation, Robots, IIoT, Big Data, Cloud, Cybersecurity, and Integration.' },
    ],
  },
  l_101_2: {
    pages: [
      { title: '2.1 Core Design Technologies', text: '<mark>CAD (Computer-Aided Design)</mark> enables precise 3D modelling and geometric definition. <mark>CAE (Computer-Aided Engineering)</mark> validates designs through advanced simulation. <mark>PDM (Product Data Management)</mark> ensures seamless collaboration and version control across distributed teams.' },
      { title: '2.2 Parametric & Generative Design', text: '<mark>Parametric Design</mark> uses rule-based modelling that automatically updates geometry when parameters change. <mark>Generative Design</mark> employs algorithm-driven exploration of thousands of alternatives based on constraints, materials, and manufacturing methods. AI-assisted tools predict performance and accelerate design cycles.' },
      { title: '2.3 AR/VR/MR for Virtual Prototyping', text: '<mark>Augmented Reality (AR)</mark> overlays digital information onto physical environments for assembly guidance. <mark>Virtual Reality (VR)</mark> creates immersive environments for design validation and ergonomic testing. <mark>Mixed Reality (MR)</mark> blends physical and digital worlds to manipulate virtual objects in real space.' },
      { title: '2.4 Additive Manufacturing (AM) — Seven Categories', text: 'Parts are built layer-by-layer from digital models across seven AM categories: <mark>1. Material Extrusion</mark> · <mark>2. Binder Jetting</mark> · <mark>3. Material Jetting</mark> · <mark>4. Vat Photopolymerisation</mark> · <mark>5. Powder Bed Fusion</mark> · <mark>6. Sheet Lamination</mark> · <mark>7. Directed Energy Deposition</mark>' },
      { title: '2.5 AM Quality Assurance & Certification', text: 'Four-stage QA pipeline: <mark>[1] In-Process Monitoring</mark> (sensors track temperature & defect signatures) → <mark>[2] Post-Build Inspection</mark> (non-destructive testing, dimensional checks) → <mark>[3] Post-Processing</mark> (heat treatment, surface finish) → <mark>[4] Certification</mark> (ISO, ASTM standards: aerospace AS9100, medical ISO 13485).' },
    ],
    quiz: [
      { q: 'Generative design explores thousands of design alternatives using algorithms.', type: 'tf', correct: true, explain: 'Generative Design is algorithm-driven — it explores a vast solution space based on defined constraints, materials, and manufacturing methods.' },
      { q: 'Which AM process category builds parts using vats of liquid photopolymer?', type: 'mcq', options: ['Material Extrusion', 'Binder Jetting', 'Vat Photopolymerisation', 'Sheet Lamination'], correct: 2, explain: 'Vat Photopolymerisation (SLA/DLP) cures liquid resin layer-by-layer using UV light — producing high-resolution parts.' },
      { q: 'Which design approach automatically updates geometry when input parameters change?', type: 'mcq', options: ['Generative Design', 'Parametric Design', 'AI-Assisted Design', 'Topology Optimisation'], correct: 1, explain: 'Parametric Design stores relationships between features so that changing one parameter (e.g. radius) cascades updates through the model automatically.' },
    ],
  },
  l_101_3: {
    slides: [
      { eyebrow: 'Module 3 · Slide 1', title: 'Physics-Based Simulations', body: 'FEA (Finite Element Analysis) predicts structural behaviour under load. CFD (Computational Fluid Dynamics) models fluid flow and heat transfer. DEM (Discrete Element Method) simulates granular materials and particle interactions.' },
      { eyebrow: 'Module 3 · Slide 2', title: 'What is a Digital Twin?', body: 'A dynamic virtual representation of a physical product, process, machine, or system — connected to real-world sensor data and continuously updated to reflect actual condition and performance.' },
      { eyebrow: 'Module 3 · Slide 3', title: 'Three Categorical Levels', body: 'Digital Model → asynchronous manual data flow · Digital Shadow → real-time physical→digital data flow · Digital Twin → fully automated, bidirectional real-time data synchronisation between physical and virtual objects.' },
      { eyebrow: 'Module 3 · Slide 4', title: 'ISO 23247 Five-Layer Architecture', body: 'Physical Layer (machines, sensors) → Data Layer (logs, records) → Model Layer (CAD, FEA, ML) → Analytics Layer (AI predictions) → Application Layer (dashboards, alerts, maintenance scheduling).' },
      { eyebrow: 'Module 3 · Slide 5', title: 'Predictive Maintenance Outcomes', body: '25% downtime reduction via predictive anomaly detection · 40% maintenance cost savings through optimised scheduling · Shift from reactive to condition-based maintenance driven by continuous sensor telemetry.' },
    ],
    quiz: [
      { q: 'A Digital Shadow enables bidirectional real-time data flow between physical and digital objects.', type: 'tf', correct: false, explain: 'A Digital Shadow only flows data FROM the physical object TO the digital model — not back. Bidirectional real-time sync defines a full Digital Twin.' },
      { q: 'Which layer of the ISO 23247 architecture contains AI prediction models?', type: 'mcq', options: ['Physical Layer', 'Data Layer', 'Model Layer', 'Analytics Layer'], correct: 3, explain: 'The Analytics Layer hosts AI and machine learning models that generate predictions, anomaly detection, and optimisation insights.' },
      { q: 'What percentage of maintenance cost savings can Predictive Maintenance achieve according to DMA data?', type: 'mcq', options: ['10%', '25%', '40%', '60%'], correct: 2, explain: 'The DMA framework cites a 40% maintenance cost reduction through optimised scheduling enabled by continuous condition monitoring.' },
    ],
  },
  l_101_4: {
    slides: [
      { eyebrow: 'Module 4 · Slide 1', title: 'Industrial Big Data Landscape', body: 'Manufacturing generates terabytes of sensor, telemetry, and operational data daily. Harnessing this requires scalable data platforms, real-time streaming pipelines, and smart analytics architectures.' },
      { eyebrow: 'Module 4 · Slide 2', title: 'Edge AI in Smart Factories', body: 'Edge AI processes data locally at the machine level — reducing latency to milliseconds, enabling real-time defect detection, and reducing bandwidth costs. Critical for closed-loop quality control on the production floor.' },
      { eyebrow: 'Module 4 · Slide 3', title: 'Cybersecurity in Industry 4.0', body: 'Connected factories expand the attack surface dramatically. Key defences: network segmentation, OT/IT firewall separation, zero-trust architecture, encrypted MQTT/OPC-UA protocols, and regular penetration testing of PLCs.' },
      { eyebrow: 'Module 4 · Slide 4', title: 'Digital Maturity Roadmap', body: 'Stage 1: Digitised (basic sensors) · Stage 2: Connected (networked systems) · Stage 3: Visible (live dashboards) · Stage 4: Transparent (root-cause analytics) · Stage 5: Predictive (AI forecasting) · Stage 6: Adaptive (autonomous self-optimisation).' },
    ],
    quiz: [
      { q: 'Edge AI processes data in a centralised cloud data centre for lower latency.', type: 'tf', correct: false, explain: 'Edge AI processes data locally at the machine or gateway — precisely to eliminate cloud round-trip latency and enable real-time decisions.' },
      { q: 'Which protocol is standard for secure machine-to-machine messaging in IIoT?', type: 'mcq', options: ['HTTP REST', 'SMTP', 'MQTT / OPC-UA', 'FTP'], correct: 2, explain: 'MQTT and OPC-UA are the dominant IIoT messaging protocols — lightweight, publish-subscribe, and designed for high-frequency industrial sensor payloads.' },
      { q: 'At which Digital Maturity stage does autonomous self-optimisation occur?', type: 'mcq', options: ['Stage 3 — Visible', 'Stage 4 — Transparent', 'Stage 5 — Predictive', 'Stage 6 — Adaptive'], correct: 3, explain: 'Stage 6 (Adaptive) represents full autonomous operation — the factory adjusts its own parameters without human intervention based on predictive models.' },
    ],
  },
  l_101_5: {
    sim: {
      title: 'Smart Factory Collaborative Robotics Simulation',
      body: 'Run the cobot handshake protocol: Human Workspace Detection → Speed Reduction Trigger → Collaborative Grip Calibration → Task Completion Verification. Complete the 4-step sequence to register a certified CPS integration pass.',
    },
    quiz: [
      { q: 'Collaborative robots (cobots) are designed to operate independently, away from human operators.', type: 'tf', correct: false, explain: 'Cobots are specifically designed to work safely alongside humans — equipped with force-torque sensors, rounded edges, and collaborative workspace protocols.' },
      { q: 'What is the primary benefit of cobots in manufacturing?', type: 'mcq', options: ['Replacing all human workers', 'Reducing physical strain while boosting quality', 'Eliminating quality control', 'Increasing production noise'], correct: 1, explain: 'Cobots augment human capability — they handle repetitive, heavy, or precision-critical tasks while humans focus on judgment and oversight.' },
    ],
  },
};

/* ─── Build player modules from course lessons ─── */
function buildModules(course: Course): PlayerModule[] {
  return course.lessons.map((lesson, idx) => {
    const customData = DMA101_MODULES[lesson.id];
    const playerType: PlayerModule['playerType'] =
      lesson.type === 'pdf' ? 'document'
      : lesson.type === 'assignment' ? 'interactive'
      : 'slides';

    const defaultSlides: PlayerSlide[] = [
      { eyebrow: `Module ${idx + 1} · Slide 1`, title: lesson.title, body: lesson.richTextContent?.split('\n').slice(0, 3).join(' ') || 'Core syllabus slide.' },
      { eyebrow: `Module ${idx + 1} · Slide 2`, title: 'Learning Objectives', body: 'Review the provided reading materials, complete the interactive exercises, and pass the self-assessment quiz with 70% or higher to unlock the next module.' },
    ];
    const defaultPages: PlayerPage[] = [
      { title: `${idx + 1}.1 Overview`, text: lesson.richTextContent?.substring(0, 300) || 'Review the document for key industry standards and frameworks.' },
      { title: `${idx + 1}.2 Key Concepts`, text: 'Apply the <mark>core frameworks</mark> and <mark>industry standards</mark> described in this module to complete the assessment.' },
    ];
    const defaultSim: PlayerSim = {
      title: 'Interactive Lab Simulation',
      body: 'Follow the on-screen prompts to complete the practical lab exercise. Click "Run Sequence" to simulate the process.',
    };
    const defaultQuiz: QuizQ[] = course.quizzes[0]?.questions.slice(0, 2).map(q => ({
      q: q.question, type: 'mcq' as const, options: q.options, correct: q.correctAnswer,
      explain: 'Refer to the module content for the correct answer.',
    })) || [
      { q: `This module covers ${lesson.title}.`, type: 'tf', correct: true, explain: 'Correct — this module directly addresses the topic described.' },
    ];

    return {
      id: `pm_${lesson.id}`,
      lessonId: lesson.id,
      title: lesson.title,
      playerType,
      lessonType: lesson.type,
      contentUrl: lesson.contentUrl,
      videoSource: lesson.videoSource,
      lessonSlides: lesson.slides,
      sub: `DMA ${playerType === 'slides' ? 'Slide' : playerType === 'document' ? 'Document' : 'Interactive'} Player · ${lesson.duration}`,
      objective: lesson.richTextContent?.split('\n')[0]?.replace(/=+/g, '').trim() || `Complete this ${playerType} module and pass the self-assessment quiz.`,
      slides: customData?.slides ?? (playerType === 'slides' ? defaultSlides : undefined),
      pages: customData?.pages ?? (playerType === 'document' ? defaultPages : undefined),
      sim: customData?.sim ?? (playerType === 'interactive' ? defaultSim : undefined),
      quiz: customData?.quiz ?? defaultQuiz,
    };
  });
}

/* ─── Component ─── */
interface CoursePlayerProps {
  course: Course;
  currentUser?: User | null;
  enrollment?: Enrollment;
  onClose: () => void;
  onRequireAuth?: () => void;
}

const RESUME_KEY = 'dma_last_free_course';

export default function CoursePlayer({ course, currentUser, enrollment, onClose, onRequireAuth }: CoursePlayerProps) {
  const modules = useRef<PlayerModule[]>(buildModules(course)).current;

  /* Save guest progress to localStorage so home page can show "continue" banner */
  useEffect(() => {
    if (!currentUser && course.isFree) {
      try {
        localStorage.setItem(RESUME_KEY, JSON.stringify({
          courseId: course.id,
          courseTitle: course.title,
          courseLevel: course.level || '',
          courseThumbnail: course.thumbnail || '',
        }));
      } catch { /* localStorage unavailable */ }
    }
  }, [course.id, course.isFree, currentUser]);

  const [activeIdx, setActiveIdx] = useState(0);
  const [slideIdx, setSlideIdx] = useState<Record<string, number>>({});
  const [quizAnswers, setQuizAnswers] = useState<Record<string, Record<number, number | boolean>>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<Record<string, boolean>>({});
  const [modStatus, setModStatus] = useState<Record<string, ModStatus>>({});
  const [simDone, setSimDone] = useState<Record<string, boolean>>({});
  const [instrMode, setInstrMode] = useState(false);
  const [autoplay, setAutoplay] = useState<string | null>(null);
  const [moduleQuizzes, setModuleQuizzes] = useState<Record<string, QuizQ[]>>({});
  const [newQ, setNewQ] = useState({ text: '', type: 'mcq', opts: ['', '', '', ''], correct: 0, explain: '', tfCorrect: true });
  const [flashLocked, setFlashLocked] = useState<string | null>(null);
  const [certId] = useState(() => `DMA-${course.id.toUpperCase()}-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
  const autoplayTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  /* init state */
  useEffect(() => {
    const si: Record<string, number> = {};
    const ms: Record<string, ModStatus> = {};
    const mq: Record<string, QuizQ[]> = {};
    modules.forEach((m, i) => {
      si[m.id] = 0;
      ms[m.id] = i === 0 ? 'inprogress' : 'locked';
      mq[m.id] = [...m.quiz];
    });
    setSlideIdx(si);
    setModStatus(ms);
    setModuleQuizzes(mq);
  }, []);

  /* autoplay cleanup */
  useEffect(() => () => { if (autoplayTimer.current) clearInterval(autoplayTimer.current); }, []);

  const activeMod = modules[activeIdx];
  const allDone = modules.every(m => modStatus[m.id] === 'done');
  const overallPct = Math.round((modules.filter(m => modStatus[m.id] === 'done').length / modules.length) * 100);

  const totalPages = (m: PlayerModule) => m.playerType === 'slides' ? (m.slides?.length || 1) : (m.pages?.length || 1);
  const hasReachedEnd = (m: PlayerModule) => m.playerType === 'interactive' ? true : (slideIdx[m.id] || 0) >= totalPages(m) - 1;

  const stopAutoplay = useCallback(() => {
    if (autoplayTimer.current) clearInterval(autoplayTimer.current);
    setAutoplay(null);
  }, []);

  const clickModule = (m: PlayerModule, i: number) => {
    if (modStatus[m.id] === 'locked') {
      setFlashLocked(m.id);
      setTimeout(() => setFlashLocked(null), 500);
      return;
    }
    stopAutoplay();
    setActiveIdx(i);
  };

  const handlePrev = () => {
    stopAutoplay();
    setSlideIdx(p => ({ ...p, [activeMod.id]: Math.max(0, (p[activeMod.id] || 0) - 1) }));
  };
  const handleNext = () => {
    stopAutoplay();
    setSlideIdx(p => ({ ...p, [activeMod.id]: Math.min(totalPages(activeMod) - 1, (p[activeMod.id] || 0) + 1) }));
  };
  const handleAutoplay = () => {
    if (autoplay === activeMod.id) { stopAutoplay(); return; }
    stopAutoplay();
    setAutoplay(activeMod.id);
    autoplayTimer.current = setInterval(() => {
      setSlideIdx(p => {
        const cur = p[activeMod.id] || 0;
        if (cur < totalPages(activeMod) - 1) return { ...p, [activeMod.id]: cur + 1 };
        stopAutoplay();
        return p;
      });
    }, 2800);
  };

  const selectAnswer = (mId: string, qi: number, val: number | boolean) => {
    if (quizSubmitted[mId]) return;
    setQuizAnswers(p => ({ ...p, [mId]: { ...p[mId], [qi]: val } }));
  };

  const submitQuiz = (mId: string) => setQuizSubmitted(p => ({ ...p, [mId]: true }));
  const retakeQuiz = (mId: string) => {
    setQuizSubmitted(p => ({ ...p, [mId]: false }));
    setQuizAnswers(p => ({ ...p, [mId]: {} }));
  };

  const continueNext = (mId: string) => {
    setModStatus(p => {
      const next = { ...p, [mId]: 'done' as ModStatus };
      const nextIdx = modules.findIndex(m => m.id === mId) + 1;
      if (nextIdx < modules.length) next[modules[nextIdx].id] = 'inprogress';
      return next;
    });
    const nextIdx = modules.findIndex(m => m.id === mId) + 1;
    if (nextIdx < modules.length) setActiveIdx(nextIdx);
  };

  const addQuestion = (mId: string) => {
    if (!newQ.text.trim()) return;
    const q: QuizQ = newQ.type === 'mcq'
      ? { q: newQ.text, type: 'mcq', options: newQ.opts, correct: newQ.correct, explain: newQ.explain || 'See module content.' }
      : { q: newQ.text, type: 'tf', correct: newQ.tfCorrect, explain: newQ.explain || 'See module content.' };
    setModuleQuizzes(p => ({ ...p, [mId]: [...(p[mId] || []), q] }));
    setNewQ({ text: '', type: 'mcq', opts: ['', '', '', ''], correct: 0, explain: '', tfCorrect: true });
  };

  const curSlide = activeMod ? (slideIdx[activeMod.id] || 0) : 0;
  const total = activeMod ? totalPages(activeMod) : 1;
  const scrubPct = total > 1 ? Math.round(((curSlide + 1) / total) * 100) : 100;

  /* ── Renders ── */
  const renderPlayer = (m: PlayerModule) => {
    // Play the lesson's real media when it has a public URL: video (YouTube,
    // Vimeo, Drive, any public link) or a PDF reader with a page slider.
    if ((m.lessonType === 'video' || m.lessonType === 'pdf') && m.contentUrl) {
      return (
        <LessonMedia
          lesson={{
            title: m.title, type: m.lessonType, contentUrl: m.contentUrl,
            videoSource: m.videoSource as any, slides: m.lessonSlides,
          }}
        />
      );
    }
    if (m.playerType === 'slides') {
      const s = m.slides![curSlide] || m.slides![0];
      return (
        <div className="relative rounded-xl overflow-hidden border border-[#1c2c55] bg-gradient-to-br from-[#0d1c3e] to-[#08122a]" style={{ aspectRatio: '16/9', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '32px' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 0%, rgba(56,189,248,0.1), transparent 60%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: 14, left: 14, display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#ffb4b4', background: 'rgba(0,0,0,0.35)', padding: '4px 9px', borderRadius: 20 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#ff5c5c', display: 'inline-block', animation: 'dma-pulse 1.4s infinite' }} />
            LIVE SLIDE VIEW
          </div>
          <div style={{ fontSize: 11, letterSpacing: '1.5px', color: '#7fe3ff', textTransform: 'uppercase', marginBottom: 10 }}>{s.eyebrow}</div>
          <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 12, maxWidth: 580 }}>{s.title}</div>
          <div style={{ fontSize: 14, color: '#8fa0c9', maxWidth: 520, lineHeight: 1.6 }}>{s.body}</div>
        </div>
      );
    }
    if (m.playerType === 'document') {
      const p = m.pages![curSlide] || m.pages![0];
      return (
        <div className="relative rounded-xl overflow-hidden border border-[#1c2c55] bg-gradient-to-br from-[#0d1c3e] to-[#08122a]" style={{ minHeight: 280, padding: '28px 32px' }}>
          <div style={{ position: 'absolute', top: 14, left: 14, display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#38bdf8', background: 'rgba(0,0,0,0.35)', padding: '4px 9px', borderRadius: 20 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#38bdf8', display: 'inline-block' }} />
            SCROLL / HIGHLIGHT MODE
          </div>
          <div style={{ marginTop: 28 }}>
            <div style={{ fontSize: 11, letterSpacing: '1.5px', color: '#7fe3ff', textTransform: 'uppercase', marginBottom: 10 }}>{p.title}</div>
            <div className="doc-text" style={{ fontSize: 13.5, lineHeight: 1.75, color: '#8fa0c9' }} dangerouslySetInnerHTML={{ __html: p.text.replace(/<mark>/g, '<mark style="background:rgba(56,189,248,0.22);color:#7fe3ff;border-radius:3px;padding:0 2px">').replace(/<\/mark>/g, '</mark>') }} />
          </div>
        </div>
      );
    }
    /* interactive */
    return (
      <div className="relative rounded-xl overflow-hidden border border-[#1c2c55] bg-gradient-to-br from-[#0d1c3e] to-[#08122a]" style={{ minHeight: 280, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '32px' }}>
        <div style={{ position: 'absolute', top: 14, left: 14, display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#ffb4b4', background: 'rgba(0,0,0,0.35)', padding: '4px 9px', borderRadius: 20 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#ff5c5c', display: 'inline-block', animation: 'dma-pulse 1.4s infinite' }} />
          SANDBOXED SIMULATION
        </div>
        <Zap className="w-10 h-10 mb-4" style={{ color: '#38bdf8' }} />
        <div style={{ fontSize: 11, letterSpacing: '1.5px', color: '#7fe3ff', textTransform: 'uppercase', marginBottom: 10 }}>Iframe Simulation</div>
        <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>{m.sim?.title}</div>
        <div style={{ fontSize: 13.5, color: '#8fa0c9', maxWidth: 480, lineHeight: 1.6, marginBottom: 20 }}>{m.sim?.body}</div>
        {!simDone[m.id]
          ? <button onClick={() => setSimDone(p => ({ ...p, [m.id]: true }))} style={{ background: 'linear-gradient(135deg,#38bdf8,#1d6f99)', color: '#02101f', fontWeight: 700, border: 'none', padding: '10px 28px', borderRadius: 9, cursor: 'pointer', fontSize: 14, boxShadow: '0 0 14px rgba(56,189,248,.4)' }}>▶ Run P.A.S.S. Sequence</button>
          : <div style={{ color: '#34d399', fontWeight: 700, fontSize: 14 }}>✓ Sequence Verified — Simulation Complete</div>
        }
      </div>
    );
  };

  const renderControls = (m: PlayerModule) => {
    if (m.playerType === 'interactive') return null;
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14 }}>
        <button onClick={handlePrev} disabled={curSlide === 0} className="ctrl-btn-player" style={{ background: '#0f1f44', border: '1px solid #1c2c55', color: curSlide === 0 ? '#3a4a6a' : '#e7eefc', padding: '8px 14px', borderRadius: 9, cursor: curSlide === 0 ? 'not-allowed' : 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
          <ChevronLeft className="w-4 h-4" /> Prev
        </button>
        <button onClick={handleNext} disabled={curSlide >= total - 1} style={{ background: curSlide >= total - 1 ? '#0f1f44' : 'linear-gradient(135deg,#38bdf8,#1d6f99)', border: 'none', color: curSlide >= total - 1 ? '#3a4a6a' : '#02101f', fontWeight: 700, padding: '8px 18px', borderRadius: 9, cursor: curSlide >= total - 1 ? 'not-allowed' : 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, boxShadow: curSlide < total - 1 ? '0 0 12px rgba(56,189,248,.35)' : 'none' }}>
          {curSlide >= total - 1 ? 'End' : <>Next <ChevronRight className="w-4 h-4" /></>}
        </button>
        <button onClick={handleAutoplay} style={{ background: '#0f1f44', border: '1px solid #1c2c55', color: '#e7eefc', padding: '8px 14px', borderRadius: 9, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
          {autoplay === m.id ? <><Pause className="w-4 h-4" /> Pause</> : <><Play className="w-4 h-4" /> Autoplay</>}
        </button>
        <div style={{ flex: 1, height: 5, background: '#0c1733', borderRadius: 6, overflow: 'hidden', cursor: 'pointer' }}>
          <div style={{ height: '100%', width: `${scrubPct}%`, background: '#38bdf8', boxShadow: '0 0 6px #38bdf8', transition: 'width .3s' }} />
        </div>
        <span style={{ fontSize: 12, color: '#8fa0c9', whiteSpace: 'nowrap' }}>{curSlide + 1} / {total}</span>
      </div>
    );
  };

  const renderQuiz = (m: PlayerModule) => {
    /* ── Guest gate: require registration before exam ── */
    if (!currentUser) {
      return (
        <div style={{ textAlign: 'center', padding: '32px 24px' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(56,189,248,0.12)', border: '2px solid rgba(56,189,248,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', fontSize: 24 }}>🎓</div>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Registration Required to Take the Exam</div>
          <div style={{ fontSize: 13, color: '#8fa0c9', maxWidth: 420, margin: '0 auto 24px', lineHeight: 1.65 }}>
            You've completed the course content — great work! To take the module exam, earn your certificate, and save your progress, please create a free account. It only takes 2 minutes.
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => { onClose(); onRequireAuth?.(); }}
              style={{ background: 'linear-gradient(135deg,#38bdf8,#1d6f99)', border: 'none', color: '#02101f', fontWeight: 700, padding: '12px 28px', borderRadius: 10, cursor: 'pointer', fontSize: 14, boxShadow: '0 0 18px rgba(56,189,248,.4)' }}
            >
              Create Free Account
            </button>
            <button
              onClick={() => { onClose(); onRequireAuth?.(); }}
              style={{ background: 'transparent', border: '1px solid #38bdf8', color: '#38bdf8', fontWeight: 700, padding: '12px 28px', borderRadius: 10, cursor: 'pointer', fontSize: 14 }}
            >
              Sign In
            </button>
          </div>
          <div style={{ marginTop: 16, fontSize: 11, color: '#4a5a7a' }}>Free plan · No credit card required</div>
        </div>
      );
    }

    const qs = moduleQuizzes[m.id] || m.quiz;
    const submitted = quizSubmitted[m.id];
    const answers = quizAnswers[m.id] || {};
    const allAnswered = qs.every((_, qi) => answers[qi] !== undefined);
    const correctCount = qs.filter((q, qi) => answers[qi] === q.correct).length;
    const score = qs.length ? Math.round((correctCount / qs.length) * 100) : 0;
    const passed = score >= 70;

    return (
      <div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>📝 Self-Assessment Quiz</div>
          <div style={{ fontSize: 12, color: '#8fa0c9' }}>{qs.length} questions · MCQ &amp; True/False · Passing score 70%</div>
        </div>
        {qs.map((q, qi) => {
          const opts = q.type === 'mcq' ? (q.options || []) : [['True', true], ['False', false]] as [string, boolean][];
          return (
            <div key={qi} style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>{qi + 1}. {q.q}</div>
              {q.type === 'mcq' ? (q.options || []).map((opt, oi) => {
                const sel = answers[qi] === oi;
                const isCorrect = oi === q.correct;
                const borderColor = submitted ? (isCorrect ? '#34d399' : sel ? '#f87171' : '#1c2c55') : sel ? '#38bdf8' : '#1c2c55';
                const bg = submitted ? (isCorrect ? 'rgba(52,211,153,0.08)' : sel ? 'rgba(248,113,113,0.08)' : 'transparent') : sel ? 'rgba(56,189,248,0.08)' : 'transparent';
                return (
                  <div key={oi} onClick={() => selectAnswer(m.id, qi, oi)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', border: `1px solid ${borderColor}`, borderRadius: 9, marginBottom: 8, cursor: submitted ? 'default' : 'pointer', background: bg, transition: '.15s' }}>
                    <div style={{ width: 16, height: 16, borderRadius: '50%', border: `1.5px solid ${sel || (submitted && isCorrect) ? (submitted && isCorrect ? '#34d399' : submitted && sel ? '#f87171' : '#38bdf8') : '#8fa0c9'}`, background: sel || (submitted && isCorrect) ? (submitted && isCorrect ? '#34d399' : submitted && sel ? '#f87171' : '#38bdf8') : 'transparent', flexShrink: 0 }} />
                    <span style={{ fontSize: 13.5 }}>{opt}</span>
                  </div>
                );
              }) : ([['True', true], ['False', false]] as [string, boolean][]).map(([label, val]) => {
                const sel = answers[qi] === val;
                const isCorrect = val === q.correct;
                const borderColor = submitted ? (isCorrect ? '#34d399' : sel ? '#f87171' : '#1c2c55') : sel ? '#38bdf8' : '#1c2c55';
                const bg = submitted ? (isCorrect ? 'rgba(52,211,153,0.08)' : sel ? 'rgba(248,113,113,0.08)' : 'transparent') : sel ? 'rgba(56,189,248,0.08)' : 'transparent';
                return (
                  <div key={label} onClick={() => selectAnswer(m.id, qi, val)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', border: `1px solid ${borderColor}`, borderRadius: 9, marginBottom: 8, cursor: submitted ? 'default' : 'pointer', background: bg, transition: '.15s' }}>
                    <div style={{ width: 16, height: 16, borderRadius: '50%', border: `1.5px solid ${sel || (submitted && isCorrect) ? (submitted && isCorrect ? '#34d399' : '#f87171') : '#8fa0c9'}`, background: sel ? (submitted && !isCorrect ? '#f87171' : '#38bdf8') : submitted && isCorrect ? '#34d399' : 'transparent', flexShrink: 0 }} />
                    <span style={{ fontSize: 13.5 }}>{label}</span>
                  </div>
                );
              })}
              {submitted && (
                <div style={{ fontSize: 12, color: '#8fa0c9', marginTop: 6, padding: '8px 12px', borderLeft: '2px solid #1a4a66', background: 'rgba(255,255,255,0.02)', borderRadius: '0 8px 8px 0' }}>
                  💡 {q.explain}
                </div>
              )}
            </div>
          );
        })}
        {!submitted ? (
          <button onClick={() => submitQuiz(m.id)} disabled={!allAnswered} style={{ width: '100%', padding: '11px', background: allAnswered ? 'linear-gradient(135deg,#38bdf8,#1d6f99)' : '#0f1f44', border: 'none', color: allAnswered ? '#02101f' : '#3a4a6a', fontWeight: 700, borderRadius: 9, cursor: allAnswered ? 'pointer' : 'not-allowed', fontSize: 14, marginTop: 4, boxShadow: allAnswered ? '0 0 14px rgba(56,189,248,.35)' : 'none' }}>
            Submit Quiz
          </button>
        ) : (
          <div>
            <div style={{ textAlign: 'center', padding: 20, borderRadius: 12, border: `1px solid ${passed ? 'rgba(52,211,153,0.35)' : 'rgba(248,113,113,0.35)'}`, background: passed ? 'rgba(52,211,153,0.06)' : 'rgba(248,113,113,0.06)', marginTop: 6 }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: passed ? '#34d399' : '#f87171', marginBottom: 6 }}>{passed ? '✅ Passed' : '❌ Not Quite'} — {score}%</div>
              <div style={{ fontSize: 13, color: '#8fa0c9' }}>{passed ? 'Great work — this module is now complete and the next one is unlocked.' : 'You need 70% to pass. Review the explanations above, then retake.'}</div>
            </div>
            {!passed ? (
              <button onClick={() => retakeQuiz(m.id)} style={{ width: '100%', marginTop: 12, padding: '11px', background: '#0f1f44', border: '1px solid #38bdf8', color: '#38bdf8', fontWeight: 700, borderRadius: 9, cursor: 'pointer', fontSize: 14 }}>↻ Retake Quiz</button>
            ) : modStatus[m.id] !== 'done' ? (
              <button onClick={() => continueNext(m.id)} style={{ width: '100%', marginTop: 12, padding: '11px', background: 'linear-gradient(135deg,#38bdf8,#1d6f99)', border: 'none', color: '#02101f', fontWeight: 700, borderRadius: 9, cursor: 'pointer', fontSize: 14, boxShadow: '0 0 14px rgba(56,189,248,.35)' }}>
                {activeIdx === modules.length - 1 ? '🏁 Finish Course' : 'Continue to Next Module →'}
              </button>
            ) : null}
          </div>
        )}
      </div>
    );
  };

  const renderInstructor = (m: PlayerModule) => {
    const qs = moduleQuizzes[m.id] || m.quiz;
    return (
      <div style={{ border: '1px dashed #1a4a66', borderRadius: 12, padding: 18, background: 'rgba(56,189,248,0.03)' }}>
        <div style={{ fontSize: 13, color: '#7fe3ff', fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Plus className="w-4 h-4" /> Instructor Tools — Add question to "{m.title}"
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
          <input value={newQ.text} onChange={e => setNewQ(p => ({ ...p, text: e.target.value }))} placeholder="Question text..." style={{ flex: 1, minWidth: 180, background: '#08122a', border: '1px solid #1c2c55', color: '#e7eefc', padding: '8px 10px', borderRadius: 8, fontSize: 13 }} />
          <select value={newQ.type} onChange={e => setNewQ(p => ({ ...p, type: e.target.value as 'mcq' | 'tf' }))} style={{ background: '#08122a', border: '1px solid #1c2c55', color: '#e7eefc', padding: '8px 10px', borderRadius: 8, fontSize: 13 }}>
            <option value="mcq">Multiple Choice</option>
            <option value="tf">True / False</option>
          </select>
        </div>
        {newQ.type === 'mcq' && newQ.opts.map((opt, oi) => (
          <div key={oi} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
            <input type="radio" name="correctOpt" checked={newQ.correct === oi} onChange={() => setNewQ(p => ({ ...p, correct: oi }))} style={{ accentColor: '#38bdf8' }} />
            <input value={opt} onChange={e => setNewQ(p => { const opts = [...p.opts]; opts[oi] = e.target.value; return { ...p, opts }; })} placeholder={`Option ${String.fromCharCode(65 + oi)}`} style={{ flex: 1, background: '#08122a', border: '1px solid #1c2c55', color: '#e7eefc', padding: '7px 10px', borderRadius: 8, fontSize: 12 }} />
          </div>
        ))}
        {newQ.type === 'tf' && (
          <div style={{ display: 'flex', gap: 16, marginBottom: 10 }}>
            <label style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 13, color: '#e7eefc' }}><input type="radio" name="tfcorrect" checked={newQ.tfCorrect === true} onChange={() => setNewQ(p => ({ ...p, tfCorrect: true }))} style={{ accentColor: '#38bdf8' }} /> True</label>
            <label style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 13, color: '#e7eefc' }}><input type="radio" name="tfcorrect" checked={newQ.tfCorrect === false} onChange={() => setNewQ(p => ({ ...p, tfCorrect: false }))} style={{ accentColor: '#38bdf8' }} /> False</label>
          </div>
        )}
        <input value={newQ.explain} onChange={e => setNewQ(p => ({ ...p, explain: e.target.value }))} placeholder="Explanation (shown after submitting)..." style={{ width: '100%', background: '#08122a', border: '1px solid #1c2c55', color: '#e7eefc', padding: '8px 10px', borderRadius: 8, fontSize: 13, marginBottom: 10, boxSizing: 'border-box' }} />
        <button onClick={() => addQuestion(m.id)} style={{ background: 'linear-gradient(135deg,#38bdf8,#1d6f99)', border: 'none', color: '#02101f', fontWeight: 700, padding: '9px 20px', borderRadius: 9, cursor: 'pointer', fontSize: 13 }}>+ Add Question to Module</button>
        <div style={{ marginTop: 16, borderTop: '1px solid #1c2c55', paddingTop: 12 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 8 }}>All modules overview</div>
          <ul style={{ fontSize: 12, color: '#8fa0c9', paddingLeft: 18, margin: 0, lineHeight: 1.7 }}>
            {modules.map(mm => <li key={mm.id}>{mm.title} — {(moduleQuizzes[mm.id] || mm.quiz).length} questions — <span style={{ color: modStatus[mm.id] === 'done' ? '#34d399' : modStatus[mm.id] === 'inprogress' ? '#fbbf24' : '#8fa0c9' }}>{modStatus[mm.id]}</span></li>)}
          </ul>
        </div>
      </div>
    );
  };

  const renderCertificate = () => {
    const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    return (
      <div style={{ border: '2px solid #38bdf8', borderRadius: 14, padding: 40, textAlign: 'center', background: 'radial-gradient(circle at 50% 0%, rgba(56,189,248,0.12), transparent 60%), #0a1530', boxShadow: '0 0 30px rgba(56,189,248,0.25)' }}>
        <div style={{ fontSize: 13, letterSpacing: 3, color: '#7fe3ff', marginBottom: 14 }}>🏆 CERTIFICATE OF COMPLETION</div>
        <h2 style={{ fontSize: 22, margin: '0 0 6px', color: '#e7eefc' }}>{course.title}</h2>
        <div style={{ fontSize: 13, color: '#8fa0c9', marginBottom: 14 }}>British Council · BCU · AIUB Transnational Education Programme</div>
        <div style={{ fontSize: 28, color: '#7fe3ff', fontWeight: 700, fontFamily: 'Georgia,serif', margin: '14px 0' }}>{currentUser?.name || 'Academy Graduate'}</div>
        <p style={{ color: '#8fa0c9', fontSize: 13 }}>has successfully completed all modules and assessments of this course.</p>
        <div style={{ width: 64, height: 64, margin: '18px auto 0', background: 'repeating-linear-gradient(0deg,#0c1838 0 4px, transparent 4px 8px), repeating-linear-gradient(90deg,#0c1838 0 4px, transparent 4px 8px)', border: '2px solid #1a4a66', borderRadius: 6 }} />
        <div style={{ fontSize: 12, color: '#8fa0c9', marginTop: 16 }}>Certificate ID: {certId} &nbsp;·&nbsp; Issued {dateStr} &nbsp;·&nbsp; Verified by Digital Manufacturing Academy</div>
        <button onClick={() => window.print()} style={{ marginTop: 18, background: 'linear-gradient(135deg,#38bdf8,#1d6f99)', border: 'none', color: '#02101f', fontWeight: 700, padding: '10px 28px', borderRadius: 9, cursor: 'pointer', fontSize: 13 }}>⬇ Download Certificate</button>
      </div>
    );
  };

  if (!activeMod) return null;

  return (
    <>
      <style>{`
        @keyframes dma-pulse{0%,100%{opacity:1}50%{opacity:.25}}
        .dma-player-overlay{position:fixed;inset:0;z-index:9999;background:rgba(4,8,18,0.98);display:flex;flex-direction:column;font-family:'Segoe UI',system-ui,-apple-system,Arial,sans-serif;color:#e7eefc;overflow:hidden;}
      `}</style>
      <div className="dma-player-overlay">
        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px', background: '#0a1530', borderBottom: '1px solid #1c2c55', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#38bdf8,#1d4f7a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#02101f', fontSize: 13, boxShadow: '0 0 14px rgba(56,189,248,0.5)' }}>MD</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: .3 }}>Digital Manufacturing Academy</div>
              <div style={{ fontSize: 10, color: '#8fa0c9' }}>Course Player · British Council BCU–AIUB TNE</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 12, color: '#8fa0c9' }}><span style={{ color: '#38bdf8', fontWeight: 700 }}>{overallPct}%</span> complete</div>
            <button onClick={onClose} style={{ background: 'transparent', border: '1px solid #1c2c55', color: '#8fa0c9', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
              <X className="w-4 h-4" /> Exit Player
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Sidebar */}
          <div style={{ width: 285, flexShrink: 0, background: 'linear-gradient(180deg,#0a1530,#060c1a)', borderRight: '1px solid #1c2c55', padding: '18px 16px', display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto' }}>
            {/* Overall progress */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: '#8fa0c9', marginBottom: 6 }}>
                <span>Course Progress</span><span style={{ color: '#38bdf8', fontWeight: 700 }}>{overallPct}%</span>
              </div>
              <div style={{ height: 8, borderRadius: 6, background: '#0c1733', border: '1px solid #1c2c55', overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 6, width: `${overallPct}%`, background: 'linear-gradient(90deg,#1d6f99,#38bdf8,#7fe3ff)', boxShadow: '0 0 10px rgba(56,189,248,0.6)', transition: 'width .5s' }} />
              </div>
            </div>

            {/* Module list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
              {modules.map((m, i) => {
                const status = modStatus[m.id];
                const isActive = i === activeIdx;
                const isFlash = flashLocked === m.id;
                const pagePct = status === 'done' ? 100 : m.playerType === 'interactive' ? (simDone[m.id] ? 80 : 30) : Math.round(((slideIdx[m.id] || 0) + 1) / totalPages(m) * 70);
                return (
                  <div key={m.id} onClick={() => clickModule(m, i)} style={{ padding: '11px 12px', borderRadius: 10, border: `1px solid ${isFlash ? '#f87171' : isActive ? '#38bdf8' : '#1c2c55'}`, background: isActive ? 'rgba(56,189,248,0.1)' : 'rgba(255,255,255,0.015)', cursor: status === 'locked' ? 'not-allowed' : 'pointer', transition: '.15s', boxShadow: isActive ? '0 0 12px rgba(56,189,248,0.18) inset' : 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12.5, fontWeight: 600 }}>
                      <span style={{ flex: 1, marginRight: 8, lineHeight: 1.3 }}>{i + 1}. {m.title}</span>
                      {status === 'locked' && <Lock style={{ width: 9, height: 9, color: '#2b3a63', flexShrink: 0 }} />}
                      {status === 'inprogress' && <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#fbbf24', boxShadow: '0 0 7px rgba(251,191,36,.7)', flexShrink: 0 }} />}
                      {status === 'done' && <CheckCircle style={{ width: 9, height: 9, color: '#34d399', flexShrink: 0 }} />}
                    </div>
                    <div style={{ fontSize: 10, color: '#8fa0c9', marginTop: 3, textTransform: 'uppercase', letterSpacing: .4 }}>{m.playerType} · {m.sub.split('·').pop()?.trim()}</div>
                    <div style={{ height: 4, borderRadius: 4, background: '#0c1733', marginTop: 8, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pagePct}%`, background: '#38bdf8', boxShadow: '0 0 5px rgba(56,189,248,.5)', transition: 'width .4s' }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Instructor toggle */}
            <div style={{ borderTop: '1px solid #1c2c55', paddingTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: '#8fa0c9' }}>
              <span>Instructor Mode</span>
              <button onClick={() => setInstrMode(p => !p)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: instrMode ? '#38bdf8' : '#8fa0c9', display: 'flex' }}>
                {instrMode ? <ToggleRight className="w-7 h-7" /> : <ToggleLeft className="w-7 h-7" />}
              </button>
            </div>
          </div>

          {/* Main area */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18, gap: 20 }}>
              <div>
                <h1 style={{ fontSize: 20, margin: '0 0 4px', fontWeight: 700 }}>{activeMod.title}</h1>
                <p style={{ margin: 0, color: '#8fa0c9', fontSize: 13 }}>{activeMod.objective}</p>
              </div>
              <span style={{ fontSize: 11, padding: '4px 10px', borderRadius: 20, border: '1px solid #1a4a66', color: '#7fe3ff', background: 'rgba(56,189,248,0.08)', whiteSpace: 'nowrap' }}>{activeMod.sub}</span>
            </div>

            {/* Player card */}
            <div style={{ background: '#0c1838', border: '1px solid #1c2c55', borderRadius: 14, padding: 22, marginBottom: 20 }}>
              {renderPlayer(activeMod)}
              {renderControls(activeMod)}
            </div>

            {/* Quiz card — shown when module reached end and not locked */}
            {modStatus[activeMod.id] !== 'locked' && hasReachedEnd(activeMod) && (
              <div style={{ background: '#0c1838', border: '1px solid #1c2c55', borderRadius: 14, padding: 22, marginBottom: 20 }}>
                {renderQuiz(activeMod)}
              </div>
            )}

            {/* Instructor panel */}
            {instrMode && (
              <div style={{ background: '#0c1838', border: '1px solid #1c2c55', borderRadius: 14, padding: 22, marginBottom: 20 }}>
                {renderInstructor(activeMod)}
              </div>
            )}

            {/* Certificate */}
            {allDone && (
              <div style={{ background: '#0c1838', border: '1px solid #1c2c55', borderRadius: 14, padding: 22, marginBottom: 20 }}>
                {renderCertificate()}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

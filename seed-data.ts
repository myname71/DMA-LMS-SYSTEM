// ─────────────────────────────────────────────────────────────────────────────
// Digital Manufacturing Academy — demo seed content (data only).
// This module holds the SAME demo accounts + courses + learning path + events
// that prisma/seed.ts writes to PostgreSQL.
// phpMyAdmin. It is imported by server.ts so the db_state.json fallback store
// (used when the local PostgreSQL database is not configured) boots with an identical dataset.
// No Prisma / runtime dependencies here — keep it pure data.
// ─────────────────────────────────────────────────────────────────────────────

export interface DemoUserSeed {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  bio?: string;
  specialization?: string;
  subscriptionPlan: string;
  joinedAt: string;
  mustChangePassword: boolean;
}

export const DEMO_USERS: DemoUserSeed[] = [
  {
    id: "u_instructor",
    name: "Prof. Dr. Abdur Rahman (Instructor)",
    email: "instructor@digitalmanufacturing.academy",
    role: "instructor",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
    bio: "Associate Dean & Lead Investigator, AIUB",
    specialization: "Digital Manufacturing & Smart Factory",
    subscriptionPlan: "pro",
    joinedAt: "2024-05-15T00:00:00.000Z",
    mustChangePassword: false,
  },
  {
    id: "u_student",
    name: "Alex Rivera (Student)",
    email: "student@digitalmanufacturing.academy",
    role: "student",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop",
    subscriptionPlan: "pro",
    joinedAt: "2025-01-10T00:00:00.000Z",
    mustChangePassword: false,
  },
];

export const SEED_COURSES: any[] = [
  {
    id: "c_1",
    title: "Introduction to Digital Twins & Smart Infrastructure",
    headline: "Build a fully synchronized virtual twin of physical industrial assets",
    description: "A comprehensive starter program structured by BCU investigators. Explores IoT data structures, visual asset geometry in CAD/CAM, and bridging real-time telemetry to Unity-based virtual mockups.",
    category: "Digital Twin",
    level: "Beginner",
    duration: "14 Hours",
    instructorId: "u_instructor",
    instructorName: "Prof. Dr. Abdur Rahman",
    price: 49,
    isFree: false,
    image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600&h=400&fit=crop",
    lessons: [
      { id: "l_1_1", title: "Introduction to Cyber-Physical Systems (CPS)", duration: "15 mins", type: "video", contentUrl: "https://www.w3schools.com/html/mov_bbb.mp4", isRequired: true },
      { id: "l_1_2", title: "Digital Twins: Core Blueprint Document", duration: "35 mins", type: "pdf", contentUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", isRequired: true },
      { id: "l_1_3", title: "Setting up sensor arrays with MQTT protocols", duration: "22 mins", type: "video", contentUrl: "https://www.w3schools.com/html/movie.mp4", isRequired: true },
      { id: "l_1_4", title: "Project Assignment: Simple Twin Definition", duration: "60 mins", type: "assignment", contentUrl: "Submit a PDF specifying your chosen dual-system architecture.", isRequired: true },
    ],
    quizzes: [
      {
        id: "q_1_1",
        title: "MQTT & Virtual Synchronicity Assessment",
        passingScore: 80,
        questions: [
          { id: "qq_1_1_1", question: "What constitutes the core function of a Digital Twin of a pump system?", options: ["To show photos of the pump in different angles", "Real-time physical asset simulation and parameter modeling via sensor feeds", "To calculate shipping times", "To provide offline print instruction leaflets only"], correctAnswer: 1 },
          { id: "qq_1_1_2", question: "Which protocol is most widely used for sparse, high-frequency IoT data payloads?", options: ["HTTP POST", "MQTT / AMQP", "FTP", "SMTP"], correctAnswer: 1 },
        ],
      },
    ],
    assignments: [
      { id: "a_1_1", title: "Building an MQTT Broker Topology Diagram", description: "Provide an architecture document or file showing the data flow from physical Raspberry Pi nodes to an Express endpoint and the final CAD visual canvas.", dueDate: "Within 7 days", status: "pending" },
    ],
    isPublished: true,
    approvalStatus: "approved",
    enrollmentCount: 1620,
    ratingAverage: 4.8,
    createdAt: "2024-09-01T00:00:00.000Z",
  },
  {
    id: "c_2",
    title: "Industrial Robotics, CNC Machining & PLC Programming",
    headline: "Program complex assembly loops and smart manufacturing schedules",
    description: "An advanced curriculum focusing on 6-axis arm programming, G-code Generation, ladder logic, Siemens S7-1200 setups, and real-time safety protocols in smart manufacturing layouts.",
    category: "Industrial Robotics",
    level: "Advanced",
    duration: "22 Hours",
    instructorId: "u_instructor",
    instructorName: "Dr. Javaid Butt",
    price: 89,
    isFree: false,
    image: "https://images.unsplash.com/photo-1561557944-6e7860d1a7eb?w=600&h=400&fit=crop",
    lessons: [
      { id: "l_2_1", title: "Introduction to Ladder Logic for PLC Modulators", duration: "25 mins", type: "video", contentUrl: "https://www.w3schools.com/html/mov_bbb.mp4", isRequired: true },
      { id: "l_2_2", title: "Industrial Robotic Arm Safety Zones and Guard Rails", duration: "18 mins", type: "video", contentUrl: "https://www.w3schools.com/html/movie.mp4", isRequired: true },
      { id: "l_2_3", title: "G-Code Optimization Reference Manual", duration: "45 mins", type: "pdf", contentUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", isRequired: true },
    ],
    quizzes: [
      {
        id: "q_2_1",
        title: "Ladder Logic & CNC G-Code Quiz",
        passingScore: 75,
        questions: [
          { id: "qq_2_1_1", question: "What is the function of the G01 command in CNC programming?", options: ["Rapid travel position search", "Linear intervention feed interpolation", "Circular rotation interpolation", "Pause application for coolant induction"], correctAnswer: 1 },
        ],
      },
    ],
    assignments: [],
    isPublished: true,
    approvalStatus: "approved",
    enrollmentCount: 940,
    ratingAverage: 4.7,
    createdAt: "2024-09-01T00:00:00.000Z",
  },
  {
    id: "c_101",
    title: "Digital Manufacturing Academy Course 101",
    headline: "Comprehensive TNE British Council & BCU Certified Core Competency Curriculum",
    description: "An expert-designed certification pathway covering the complete Industrial Evolution from Industry 4.0 to Industry 5.0 and emerging 6.0 cognitive networks. Gain practical skills in Parametric Generative Design, Additive Manufacturing workflows, bidirectionally synchronized Digital Twins, Cyber-Physical Systems (CPS), Industrial Data Analytics, Collaborative Robotics (Cobots), cybersecurity protocols, and Digital Maturity Readiness roadmaps.",
    category: "Smart Factory",
    level: "Advanced",
    duration: "36 Hours",
    instructorId: "u_instructor",
    instructorName: "Dr. Javaid Butt",
    price: 0,
    isFree: true,
    image: "/course-cover.webp",
    lessons: [
      { id: "l_101_0", title: "Course Introduction: Digital Manufacturing Academy Overview", duration: "10 mins", type: "pptx", contentUrl: "https://docs.google.com/presentation/d/1z7GJF7ZenxFnSfxBR7Da0lt3oec5ZtS0/embed?start=false&loop=false&delayms=3000", isRequired: true },
      { id: "l_101_1a", title: "Module 1 - PPTX 1: Course Roadmap & Learning Objectives", duration: "15 mins", type: "pptx", contentUrl: "https://docs.google.com/presentation/d/1dKg-aGkpSGP2DlugfUh-gs2GmNDhWOTJ/embed?start=false&loop=false&delayms=3000", isRequired: true },
      { id: "l_101_1b", title: "Module 1 - PDF 1: Pre-assessment Questionnaire", duration: "10 mins", type: "pdf", contentUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", isRequired: true },
      { id: "l_101_1c", title: "Module 1 - PDF 2: Glossary of Terms", duration: "15 mins", type: "pdf", contentUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", isRequired: true },
      { id: "l_101_2", title: "Module 2: Advanced Design & Additive Manufacturing Workflows", duration: "50 mins", type: "pptx", contentUrl: "https://docs.google.com/presentation/d/1dthMY3zBGlwl_bT6w8ZCrzz_VRABKoMR/embed?start=false&loop=false&delayms=3000", isRequired: true },
      { id: "l_101_3", title: "Module 3: Physics-Based Simulations & Bidirectional Digital Twins", duration: "55 mins", type: "pptx", contentUrl: "https://docs.google.com/presentation/d/1dzzmkg0HseItZr8UUdNUQGq67yBMkJ5Z/embed?start=false&loop=false&delayms=3000", isRequired: true },
      { id: "l_101_4", title: "Module 4: Big Data Platforms, Edge AI & Cybersecurity", duration: "50 mins", type: "pptx", contentUrl: "https://docs.google.com/presentation/d/1kenUItVbwY8w9qxE6qQO3kgdL_h9YR8G/embed?start=false&loop=false&delayms=3000", isRequired: true },
      { id: "l_101_5", title: "Module 5: Advanced Robotics, Collaborative Cobots & Dynamic Navigation", duration: "45 mins", type: "pptx", contentUrl: "https://docs.google.com/presentation/d/1sw-bFGVhpqt0XgdTX825MVpDYdoSvVLi/embed?start=false&loop=false&delayms=3000", isRequired: true },
      { id: "l_101_6", title: "Module 6: Strategic Roadmap Frameworks & Organizational Change", duration: "50 mins", type: "pptx", contentUrl: "https://docs.google.com/presentation/d/1y8w7Pl4eH_ikhOr-AY_Nh-2C0MjNtRxN/embed?start=false&loop=false&delayms=3000", isRequired: true },
    ],
    quizzes: [
      {
        id: "q_101",
        title: "Digital Manufacturing Academy Course 101 Certification Quiz",
        passingScore: 80,
        questions: [
          { id: "qq_101_1", question: "What is the primary goal of digital manufacturing?", options: ["Expedite communication speed without mechanical change", "Increase manual labor ratios", "Improve process efficiency, product quality and manufacturing innovation", "Enhance localized software dependencies only"], correctAnswer: 2 },
          { id: "qq_101_2", question: "Which industrial revolution introduced automation, PLCs, and computers into manufacturing?", options: ["Industry 1.0", "Industry 2.0", "Industry 3.0", "Industry 6.0"], correctAnswer: 2 },
          { id: "qq_101_3", question: "Which of the following are key characteristics of smart manufacturing?", options: ["Manual paper-based scheduling and localized standalone silos", "Real-time data monitoring/connectivity and intelligent automation/decision-making", "Complete removal of human operators and manual safety gears", "Substantially high upfront costs with no feedback protocols"], correctAnswer: 1 },
          { id: "qq_101_4", question: "Which of the following principles best describe the concept of Industry 6.0?", options: ["Complete replacement of humans by autonomous grid networks", "Greater integration of human-centric/ethical technologies and enhanced focus on sustainability & societal wellbeing", "Exclusively focusing on vertical production silos with no environmental metrics", "Replacing cybersecurity protocols with offline paper files"], correctAnswer: 1 },
          { id: "qq_101_5", question: "What is the core target of test/generative design in product development?", options: ["Automated hand-sketching of wireframe blueprints", "Algorithm-driven, AI-based exploration of thousands of design alternatives based on material & manufacturing constraints", "Storing CAD data files inside remote tape backups", "Formatting consumer shipping containers"], correctAnswer: 1 },
          { id: "qq_101_6", question: "Which dual application set is most closely associated with AR/VR/MR virtual prototyping?", options: ["Static financial bookkeeping and manual payroll processing", "Immersive operator training, virtual validation, and product design reviews inside shared workspaces", "Standard structural calculations and paper filing systems", "Writing ladder logic scripts for Siemens micro-controllers"], correctAnswer: 1 },
          { id: "qq_101_7", question: "Which option best reflects the primary goal of circular manufacturing?", options: ["Maximising assembly lines speed regardless of raw material waste", "Extending product and material lifecycles through reuse, repair, remanufacturing, and recycling resource efficiency", "Replacing all automated machine groups with human hands", "Increasing mineral and raw resource extraction rates"], correctAnswer: 1 },
          { id: "qq_101_8", question: "Which statement best distinguishes a Cyber-Physical System (CPS) from a Digital Twin?", options: ["CPS is mainly a virtual graphic layout used in design", "CPS integrates sensing, controllers, and actuators to connect/control the physical world, whereas a Digital Twin models, analyzes, and predicts behavior based on live/historical data feeds", "CPS is strictly offline, while Digital Twins must run in space orbits", "CPS eliminates the requirement for secure network protocols"], correctAnswer: 1 },
          { id: "qq_101_9", question: "Which of the following is most critical to maintain a useful real-time Digital Twin?", options: ["Establishing a static 3D database that is never synchronized with the machine", "Ensuring reliable sensor data feeds and continuous automated synchronization between physical assets and virtual representations", "Replacing network routers with paper ledgers", "Running high-frequency calculations offline and discarding logs"], correctAnswer: 1 },
          { id: "qq_101_10", question: "In advanced digital manufacturing environments, industrial data analytics is primarily implemented to:", options: ["Enhance operational intelligence through pattern recognition, predictive modelling, and adaptive process optimisation", "Replace cyber-physical communication networks with standalone mechanical belts", "Decline industrial IoT sensors in the factory lines", "Prevent operator interaction entirely"], correctAnswer: 0 },
          { id: "qq_101_11", question: "What constitutes the value evidence of industrial data platforms shown historically in Siemens Amberg, Bosch, and Unilever?", options: ["Upwards of 99.9% product quality, OEE efficiency improvements, and energy consumption reductions of 15-20%", "Slightly increased downtime of 12%", "Uncontrolled cost overrides due to cloud database configurations", "Substantial increase in defect rates"], correctAnswer: 0 },
          { id: "qq_101_12", question: "Under Industry 5.0, what distinguishes collaborative robots (cobots) from conventional automation machinery?", options: ["Cobots must reside inside closed guarding units with strict safety fences", "Cobots prioritize safe human-robot collaboration, tracking force & proximity inputs to operate safely alongside people in shared workspaces", "Cobots run without electricity or programming logic", "Cobots are made solely for material sorting in outdoor environments"], correctAnswer: 1 },
          { id: "qq_101_13", question: "Which two initial actions must a manufacturing SME prioritize to improve digital transformation readiness?", options: ["Buying various specialized AI suites immediately to speed up deployment", "Conducting a digital maturity readiness assessment (such as IMPULS) and defining a clear vision aligned with ROI outcomes", "Hiring temporary contract workers and replacing existing legacy machines before standardizing data layers", "Decline standard IT protocols to reduce organizational friction"], correctAnswer: 1 },
        ],
      },
    ],
    assignments: [
      { id: "a_101_1", title: "Project Assignment: Industrial Digital Maturity & Roadmap Formulation", description: "Prepare an exhaustive Brownfield retrofitting plan or 5-stage transformation roadmap for an existing SME manufacturing floor.", dueDate: "Within 10 days", status: "pending" },
    ],
    isPublished: true,
    approvalStatus: "approved",
    enrollmentCount: 150,
    ratingAverage: 4.9,
    createdAt: "2024-09-01T00:00:00.000Z",
  },
];

export const SEED_LEARNING_PATHS: any[] = [
  {
    id: "lp_1",
    title: "Industry 4.0 Cyber-Physical Systems Expert",
    description: "An advanced curriculum curated by BCU and AIUB experts. Sequentially links Cyber-Physical synchronisation concepts from Digital Twin introduction to PLC and robotics control systems.",
    category: "Smart Factory",
    courses: ["c_1", "c_2"],
    instructorId: "u_instructor",
    instructorName: "Prof. Dr. Abdur Rahman",
    badge: "Cyber-Physical Systems Architect",
    enrolledStudents: ["u_student"],
    createdAt: "2024-09-01T00:00:00.000Z",
  },
];

export const SEED_EVENTS: any[] = [
  {
    id: "evt_001",
    title: "Digital Twin Synchronization Workshop",
    date: "2026-06-25",
    time: "14:00",
    host: "Dr. Javaid Butt",
    type: "UK Webinar",
    desc: "Real-time broker synchronization on mechanical systems. Live Q&A regarding our G-Code templates.",
    category: "Digital Twin",
    attendees: ["u_student"],
    createdAt: "2026-05-01T00:00:00.000Z",
  },
  {
    id: "evt_002",
    title: "Sensory MQTT Networks Audit Symposium",
    date: "2026-07-15",
    time: "10:00",
    host: "Prof. Dr. Abdur Rahman",
    type: "AIUB Laboratory",
    desc: "Physical assembly robotics telemetry monitoring with Siemens relay structures. On-site seat reservation required.",
    category: "Robotics",
    attendees: [],
    createdAt: "2026-05-01T00:00:00.000Z",
  },
];

export const SEED_ENROLLMENTS: any[] = [
  {
    id: "enr_student_101",
    userId: "u_student",
    courseId: "c_101",
    progress: 0,
    completedLessons: [],
    quizAttempts: {},
    enrolledAt: "2025-01-15T00:00:00.000Z",
    completedAt: null,
  },
];

export const DEFAULT_THEME = {
  primaryColor: "#2563eb",
  accentColor: "#06b6d4",
  darkMode: true,
  fontFamily: "Inter",
  borderRadius: "0.5rem",
};

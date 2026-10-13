import { Course, User, SubscriptionPlan } from '../types';

export const DEMO_USERS: { [key: string]: User } = {
  student: {
    id: 'u_student',
    name: 'Alex Rivera (Student)',
    email: 'student@digitalmanufacturing.academy',
    role: 'student',
    joinedAt: '2025-01-10',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop',
    subscriptionPlan: 'pro',
  },
  instructor: {
    id: 'u_instructor',
    name: 'Prof. Dr. Abdur Rahman (Instructor)',
    email: 'instructor@digitalmanufacturing.academy',
    role: 'instructor',
    joinedAt: '2024-05-15',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
    isApproved: true,
  },
  admin: {
    id: 'u_admin',
    name: 'Sarah Connor (Admin)',
    email: 'admin@digitalmanufacturing.academy',
    role: 'admin',
    joinedAt: '2024-01-01',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop',
  },
  super_admin: {
    id: 'u_super_admin',
    name: 'Director James Smith (Super Admin)',
    email: 'superadmin@digitalmanufacturing.academy',
    role: 'super_admin',
    joinedAt: '2023-01-01',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop',
  },
};

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 'Free',
    billing: 'forever',
    features: [
      'Access to 5 core introductory courses',
      'Downloadable PDF manuals and resource guides',
      'Mobile-friendly lecture materials',
      'Standard community forum access',
      'No certificate of completion',
    ],
  },
  {
    id: 'pro',
    name: 'Advanced',
    price: '৳999',
    billing: 'year',
    features: [
      'Access to all 12+ Industry 4.0 courses',
      'Direct interaction with BCU & AIUB expert team',
      'Advanced hands-on simulator resources',
      'Verified academic certificates of completion',
      'Comprehensive preparation for global manufacturing roles',
      'Dynamic quiz attempts & detailed grading metrics',
    ],
  },
  {
    id: 'enterprise',
    name: 'Professional',
    price: '৳1,999',
    billing: 'year',
    features: [
      'Unlimited employee licenses (up to 15 users)',
      'Custom sub-categories & localized organization trackers',
      'Custom learning path generation with AI helper',
      'Dedicated technical advisor from BCU/AIUB researchers',
      'Direct API integrations with corporate HR portals',
      'On-demand custom workshop webinars',
    ],
  },
];

export const INITIAL_COURSES: Course[] = [
  {
    id: 'c_1',
    title: 'Introduction to Digital Twins & Smart Infrastructure',
    headline: 'Build a fully synchronized virtual twin of physical industrial assets',
    description: 'A comprehensive starter program structured by BCU investigators. Explores IoT data structures, visual asset geometry in CAD/CAM, and bridging real-time telemetry to Unity-based virtual mockups.',
    category: 'Digital Twin',
    level: 'Beginner',
    duration: '14 Hours',
    instructorId: 'u_instructor',
    instructorName: 'Prof. Dr. Abdur Rahman',
    price: 49,
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600&h=400&fit=crop',
    lessons: [
      {
        id: 'l_1_1',
        title: 'Introduction to Cyber-Physical Systems (CPS)',
        duration: '15 mins',
        type: 'video',
        contentUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        isRequired: true,
      },
      {
        id: 'l_1_2',
        title: 'Digital Twins: Core Blueprint Document',
        duration: '35 mins',
        type: 'pdf',
        contentUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        isRequired: true,
      },
      {
        id: 'l_1_3',
        title: 'Setting up sensor arrays with MQTT protocols',
        duration: '22 mins',
        type: 'video',
        contentUrl: 'https://www.w3schools.com/html/movie.mp4',
        isRequired: true,
      },
      {
        id: 'l_1_4',
        title: 'Project Assignment: Simple Twin Definition',
        duration: '60 mins',
        type: 'assignment',
        contentUrl: 'Submit a PDF specifying your chosen dual-system architecture.',
        isRequired: true,
      },
    ],
    quizzes: [
      {
        id: 'q_1_1',
        title: 'MQTT & Virtual Synchronicity Assessment',
        passingScore: 80,
        questions: [
          {
            id: 'qq_1_1_1',
            question: 'What constitutes the core function of a Digital Twin of a pump system?',
            options: [
              'To show photos of the pump in different angles',
              'Real-time physical asset simulation and parameter modeling via sensor feeds',
              'To calculate shipping times',
              'To provide offline print instruction leaflets only',
            ],
            correctAnswer: 1,
          },
          {
            id: 'qq_1_1_2',
            question: 'Which protocol is most widely used for sparse, high-frequency IoT data payloads?',
            options: ['HTTP POST', 'MQTT / AMQP', 'FTP', 'SMTP'],
            correctAnswer: 1,
          },
        ],
      },
    ],
    assignments: [
      {
        id: 'a_1_1',
        title: 'Building an MQTT Broker Topology Diagram',
        description: 'Provide an architecture document or file showing the data flow from physical Raspberry Pi nodes to an Express endpoint and the final CAD visual canvas.',
        dueDate: 'Within 7 days',
        status: 'pending',
      },
    ],
    reviews: [
      {
        id: 'rv_1',
        userId: 'u_student_rev1',
        userName: 'Marcus Aurelio',
        rating: 5,
        comment: 'Amazing course. It describes exactly what we are deploying in our automotive plant.',
        date: '2025-05-18',
      },
    ],
    enrollmentCount: 1620,
    ratingAverage: 4.8,
    isPublished: true,
  },
  {
    id: 'c_2',
    title: 'Industrial Robotics, CNC Machining & PLC Programming',
    headline: 'Program complex assembly loops and smart manufacturing schedules',
    description: 'An advanced curriculum focusing on 6-axis arm programming, G-code Generation, ladder logic, Siemens S7-1200 setups, and real-time safety protocols in smart manufacturing layouts.',
    category: 'Industrial Robotics',
    level: 'Advanced',
    duration: '22 Hours',
    instructorId: 'u_instructor',
    instructorName: 'Prof Javaid Butt',
    price: 89,
    image: 'https://images.unsplash.com/photo-1561557944-6e7860d1a7eb?w=600&h=400&fit=crop',
    lessons: [
      {
        id: 'l_2_1',
        title: 'Introduction to Ladder Logic for PLC Modulators',
        duration: '25 mins',
        type: 'video',
        contentUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        isRequired: true,
      },
      {
        id: 'l_2_2',
        title: 'Industrial Robotic Arm Safety Zones and Guard Rails',
        duration: '18 mins',
        type: 'video',
        contentUrl: 'https://www.w3schools.com/html/movie.mp4',
        isRequired: true,
      },
      {
        id: 'l_2_3',
        title: 'G-Code Optimization Reference Manual',
        duration: '45 mins',
        type: 'pdf',
        contentUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        isRequired: true,
      },
    ],
    quizzes: [
      {
        id: 'q_2_1',
        title: 'Ladder Logic & CNC G-Code Quiz',
        passingScore: 75,
        questions: [
          {
            id: 'qq_2_1_1',
            question: 'What is the function of the G01 command in CNC programming?',
            options: [
              'Rapid travel position search',
              'Linear intervention feed interpolation',
              'Circular rotation interpolation',
              'Pause application for coolant induction',
            ],
            correctAnswer: 1,
          },
        ],
      },
    ],
    assignments: [],
    reviews: [
      {
        id: 'rv_2',
        userId: 'u_student_rev2',
        userName: 'Liam Sterling',
        rating: 4,
        comment: 'Very informative and covers PLC parameters extremely well. Requires strong industrial focus.',
        date: '2025-06-01',
      },
    ],
    enrollmentCount: 940,
    ratingAverage: 4.7,
    isPublished: true,
  },
  {
    id: 'c_3',
    title: 'Sustainable Manufacturing & Circular Economy Strategy',
    headline: 'Incorporate eco-friendly paradigms and waste reduction algorithms into manufacturing lines',
    description: 'Examines Carbon-Footprint audits, lifecycle indices, recycling-optimization metrics, and power regulation for Industry 4.0 plants.',
    category: 'Sustainability',
    level: 'Intermediate',
    duration: '10 Hours',
    instructorId: 'u_instructor',
    instructorName: 'Dr. Chowdhury Akram',
    price: 39,
    image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&h=400&fit=crop',
    lessons: [
      {
        id: 'l_3_1',
        title: 'Defining Circular Life-Cycles in Multi-Material Fabrication',
        duration: '30 mins',
        type: 'video',
        contentUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        isRequired: true,
      },
      {
        id: 'l_3_2',
        title: 'LEED Certification Matrix for Factories',
        duration: '20 mins',
        type: 'pdf',
        contentUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        isRequired: false,
      },
    ],
    quizzes: [],
    assignments: [],
    reviews: [],
    enrollmentCount: 420,
    ratingAverage: 4.9,
    isPublished: true,
  },
  {
    id: 'c_101',
    title: 'Digital Manufacturing Academy Course 101',
    headline: 'Comprehensive TNE British Council & BCU Certified Core Competency Curriculum',
    description: 'An expert-designed certification pathway covering the complete Industrial Evolution from Industry 4.0 to Industry 5.0 and emerging 6.0 cognitive networks. Gain practical skills in Parametric Generative Design, Additive Manufacturing workflows, bidirectionally synchronized Digital Twins, Cyber-Physical Systems (CPS), Industrial Data Analytics, Collaborative Robotics (Cobots), cybersecurity protocols, and Digital Maturity Readiness roadmaps.',
    category: 'Smart Factory',
    level: 'Advanced',
    duration: '36 Hours',
    instructorId: 'u_instructor',
    instructorName: 'Prof Javaid Butt',
    price: 129,
    image: '/course-cover.webp',
    lessons: [
      {
        id: 'l_101_1',
        title: 'Module 1: Foundations of Digital Manufacturing & Evolution',
        duration: '45 mins',
        type: 'video',
        contentUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        isRequired: true,
        richTextContent: `======================================================
  MODULE 1: FOUNDATIONS OF DIGITAL MANUFACTURING
======================================================

1. INTRODUCTION TO THE COURSE & CERTIFICATION
Co-developed under the British Council Going Global Partnerships Transnational Education (TNE) Exploratory Grant, by Birmingham City University (BCU) and American International University Bangladesh (AIUB).

COURSE KEY AUTHORS & EXPERTS:
- Prof Javaid Butt (Professor of Manufacturing & Product Design, BCU)
- Md. Ashikul Alam Khan (Lecturer in Operations & Supply Chain Management, BCU)
- Muhammad Adnan (Lecturer in Project Management, BCU)

------------------------------------------------------
2. WHAT IS DIGITAL MANUFACTURING?
"Digital manufacturing integrates data, automation, connectivity, and advanced analytics across the entire product lifecycle to improve productivity, quality, and sustainability." (Chinnathai & Alkan, 2023)

------------------------------------------------------
3. THE GLOBAL EVOLUTION OF MANUFACTURING (TIMELINE):
- INDUSTRY 1.0 (Mechanization, water power, steam power)
- INDUSTRY 2.0 (Mass production, assembly line, electricity)
- INDUSTRY 3.0 (Computer and automation)
- INDUSTRY 4.0 (Cyber physical systems, connectivity)
- INDUSTRY 5.0 (Human-tech partnership, AI, Robotics, IoT - places humans, sustainability, and resilience at the center)
- INDUSTRY 6.0 (Living, symbiotic industrial ecosystems, cognitive networks, and bio-tech design)

------------------------------------------------------
4. THE NINE PILLARS OF INDUSTRY 4.0:
[ Additive Manufacturing | Augmented Reality | Simulation ]
[ Autonomous Robots    | Industrial IoT   | Big Data   ]
[ Cloud Computing      | Cyber Security   | Integration]

------------------------------------------------------
5. REAL-WORLD CASE EVIDENCE:
- Unilever's Khanpur Factory (Bangladesh):
  Implemented an IoT-based utility monitoring system to track real-time steam, water, and energy consumption across production lines, generating instant carbon accounting data. (Alam, 2023)
- Ford Cologne Assembly Plant (Germany):
  Collaborative robots (cobots) work alongside human operators on assembly, reducing physical strain while boosting quality. (Emma & Michels, 2025)`
      },
      {
        id: 'l_101_2',
        title: 'Module 2: Advanced Design & Additive Manufacturing Workflows',
        duration: '50 mins',
        type: 'pdf',
        contentUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        isRequired: true,
        richTextContent: `======================================================
  MODULE 2: DESIGN & ADVANCED MANUFACTURING
======================================================

1. CORE DESIGN TECHNOLOGIES:
- CAD (Computer-Aided Design): Enables precise 3D modelling and geometric definition. (Camba et al., 2023)
- CAE (Computer-Aided Engineering): Validates designs through advanced simulation and analysis. (Chang, 2013)
- PDM (Product Data Management): Ensures seamless collaboration and version control across teams.

------------------------------------------------------
2. PARAMETRIC, GENERATIVE & AI-ASSISTED DESIGN:
- Parametric Design: Rule-based modelling that automatically updates geometry when parameters change.
- Generative Design: Algorithm-driven exploration of thousands of design alternatives based on constraints, materials, and manufacturing methods.
- AI-Assisted Tools: Machine learning algorithms that predict performance, suggest improvements, and accelerate design cycles.

------------------------------------------------------
3. AR/VR/MR FOR VIRTUAL PROTOTYPING:
- Augmented Reality (AR): Overlays digital info onto physical environments for assembly and maintenance.
- Virtual Reality (VR): Immersive digital environments for design validation, ergonomic testing, and collaborative reviews.
- Mixed Reality (MR): Blend physical and digital worlds to manipulate virtual objects in real space.

------------------------------------------------------
4. DESIGN FOR EXCELLENCE (DfX):
Strategic engineering approach to optimize performance across multiple lifecycle considerations:
[ DFM (Mfg) | DFA (Assembly) | DFR (Reliability) | DFS (Security) ]
[ DFC (Cost)| DFS (Service)  | DFSuS (Sust.)    | DFSC (Supply)  ]

------------------------------------------------------
5. TOPOLOGY OPTIMISATION:
Advanced computational design that removes unnecessary material while maintaining structural integrity. Creates organic, lightweight geometries. (Zhu et al., 2020)

------------------------------------------------------
6. ADDITIVE MANUFACTURING (AM):
Creates parts layer by layer directly from digital models. Seven categories:
1. Material Extrusion       2. Binder Jetting      3. Material Jetting
4. Vat Photopolymerisation 5. Powder Bed Fusion   6. Sheet Lamination
7. Directed Energy Deposition

------------------------------------------------------
7. AM QUALITY ASSURANCE, POST-PROCESSING & CERTIFICATION:
[1] In-Process Monitoring (sensors track temperature & defects)
[2] Post-Build Inspection (Non-destructive testing, dimensional checks)
[3] Post-Processing (heat treatment, surface finish, machining)
[4] Certification (ISO, ASTM standards like aerospace AS9100, medical ISO 13485)

------------------------------------------------------
8. CIRCULAR MANUFACTURING & LCA:
- Circular Manufacturing: Shifting from "take-make-waste" to reuse, repair, remanufacturing, and recycling. (Stahel, 2019)
- LCA (Life Cycle Assessment): Evaluate environmental impacts from raw material to disposal. (Biblioteca et al., 2026)
- Carbon Accounting & Sustainability Metrics: Quantify emissions and map KPIs.
- Circular Models: Product-as-a-Service, Extended Producer Responsibility, Industrial Symbiosis, and Renewable Resource Integration.`
      },
      {
        id: 'l_101_3',
        title: 'Module 3: Physics-Based Simulations & Bidirectional Digital Twins',
        duration: '55 mins',
        type: 'video',
        contentUrl: 'https://www.w3schools.com/html/movie.mp4',
        isRequired: true,
        richTextContent: `======================================================
  MODULE 3: SIMULATIONS & DIGITAL TWINS
======================================================

1. PHYSICS-BASED SIMULATIONS:
- Finite Element Analysis (FEA): Predicts structural behaviour under load to optimize durability and material weight. (Tobi et al., 2018)
- Computational Fluid Dynamics (CFD): Models fluid flow and heat transfer inside manufacturing processes (injection moulding, cooling). (Juan Carlos, 2025)
- Discrete Element Method (DEM): Simulates granular materials and particle interactions (powders, conveyor belts). (Guo and Curtis, 2015)

------------------------------------------------------
2. WHAT IS A DIGITAL TWIN?
A dynamic virtual representation of a physical product, process, machine, or system, connected to real-world data and updated over time to reflect condition and performance.

------------------------------------------------------
3. CATEGORICAL DISTINCTION:
- DIGITAL MODEL: Physical and digital objects are decoupled. Data flow is asynchronous (manual).
- DIGITAL SHADOW: Direct near real-time automated data flow from physical to digital object (but NOT vice versa).
- DIGITAL TWIN: Seamless, fully automated real-time bidirectional data flow between physical and digital objects.

------------------------------------------------------
4. FIVE-LAYER ARCHITECTURE (ISO 23247):
- PHYSICAL LAYER: CNCs, robots, sensors, operators.
- DATA LAYER: logs, environmental inputs, records.
- MODEL LAYER: CADs, FEAs, statistical & ML layers.
- ANALYTICS LAYER: AI intelligence, prediction models.
- APPLICATION LAYER: dashboards, alerts, maintenance.

------------------------------------------------------
5. DIGITAL TWINS IN ADDITIVE MANUFACTURING:
Combining CAD data, thermal images, and sensor readings to predict part quality instantly. Crucial because AM is highly sensitive to dramatic changes in laser speed or powder feed.

------------------------------------------------------
6. PREDICTIVE MAINTENANCE:
Transforming reactive maintenance to condition-based monitoring.
- DOWNTIME REDUCTION: 25% (predictive analytics identify anomalies)
- MAINTENANCE COST SAVINGS: 40% (optimised scheduling reduces servicing)

------------------------------------------------------
7. CYBER-PHYSICAL SYSTEMS (CPS) VS DIGITAL TWINS:
- CPS connects and CONTROLS physical systems (Sensors + Actuators + PLCs + Protocols).
- Digital Twins MODEL, SIMULATE, PREDICT, and OPTIMIZE the systems.`
      },
      {
        id: 'l_101_4',
        title: 'Module 4: Big Data Platforms, Edge AI & Cybersecurity',
        duration: '50 mins',
        type: 'pdf',
        contentUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        isRequired: true,
        richTextContent: `======================================================
  MODULE 4: DATA, AI & CYBERSECURITY IN MFG
======================================================

1. INDUSTRIAL DATA ANALYTICS:
Treats factory data as a strategic asset rather than a by-product. Includes machine sensors, PLCs, cycle times, and supply chain logistics.

------------------------------------------------------
2. INDUSTRIAL DATA PLATFORMS: BUSINESS VALUE EVIDENCE:
- Siemens' Amberg Electronics Plant:
  Governed 50+ million data points/day. Achieved over 99.9% product quality, 75% process automation, and a defect rate below 15 parts per million!
- Bosch Connected Industry:
  Reduced unplanned downtime by ~25% and improved OEE by 5-10% across multiple plants.
- Unilever Smart Factories:
  Advanced data governance led to 15-20% reduction in energy consumption and 10-15% production efficiency gains.

------------------------------------------------------
3. AI APPLICATIONS IN ACTION:
- General Electric: AI-driven predictive maintenance achieved a 20% reduction in maintenance costs & 10% gain in asset availability.
- BMW: Computer vision quality checks achieved 30% faster inspection on production line with reduced error rates.
- Caterpillar: Machine Learning analytics reduced unplanned downtime by 45% and overall maintenance fees by 20%.

------------------------------------------------------
4. EDGE AI AND INTELLIGENT CONTROL:
Processes data directly on-machine instead of transferring to the cloud. Low latency, immediate shutdown triggers.
- Bosch edge cameras cut inspection latency to milliseconds, reducing defect escape rate by 25%.
- Honeywell edge analytics reduced unplanned downtime by 30% via immediate fault responses.

------------------------------------------------------
5. CYBERSECURITY THREATS IN SMART FACTORIES:
MALICIOUS ACTORS TARGETING CONNECTED ICS, OT, AND PROTOCOLS:
- Ransomware (locks production, demands payout)
- Malware (disrupts PLCs & G-code coordinates)
- Phishing & Credential Theft (unauthorised access)
- Supply Chain Attacks (malicious vendor updates)

HISTORICAL SETBACKS:
- Maersk (NotPetya Attack, 2017): Shut down IT/OT worldwide. Lost USD 300 Million.
- Toyota Supplier Kojima Industries (2022): Shut down 14 Toyota plants (28 lines) in a single day. Lost estimated USD 375-400 Million.
- NVIDIA Manufacturing Partner (2023): Credential theft led to massive proprietary chip design data leaks.

------------------------------------------------------
6. DIGITAL RISK REGISTER & GOVERNANCE:
Structured 4-stage management:
1. Identify & Assess -> 2. Mitigate & Control -> 3. Monitor & Detect -> 4. Respond & Improve
- Ethical AI: ensuring transparency, explainability (XAI), accountability, and fairness in algorithmic decision-making.`
      },
      {
        id: 'l_101_5',
        title: 'Module 5: Advanced Robotics, Collaborative Cobots & Dynamic Navigation',
        duration: '45 mins',
        type: 'video',
        contentUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        isRequired: true,
        richTextContent: `======================================================
  MODULE 5: ADVANCED ROBOTICS & INTELLIGENT MFG
======================================================

1. INDUSTRIAL ROBOTICS AND RECONFIGURABILITY:
Deployment of programmable robotics (welding, assembly, paint, packaging). Modern systems are grouped into reconfigurable robotic work cells with machine vision integration.

------------------------------------------------------
2. COLLABORATIVE ROBOTS (COBOTS):
- Purpose-built to work safely alongside human operators, augmenting capabilities rather than replacing them.
- Equipped with force-sensing and active proximity sensors that automatically slow down or stop contact to prevent collisions.
- Human-Robot Synergy: Combines human creativity, adaptability, and ethical judgment with robotic precision, repeatable strength, and raw mechanical speed.

------------------------------------------------------
3. ERGONOMICS, HR STANDARDS & WORKFORCE SAFETY:
Adapting factory setups to minimize operator body strain. Alignment with Human-Robot Interaction (HRI) standards ensures intuitive gesture/touch interfaces. (Gualtieri et al., 2020)

------------------------------------------------------
4. AUTONOMOUS ROBOTS: AMRs VS AGVs:
Intelligent transportation systems for physical material handling:
- AGVs (Automated Guided Vehicles): Follow strict predefined routes using magnetic tape, markers, or tracks. Rigid and struggle with obstacles.
- AMRs (Autonomous Mobile Robots): Use LiDAR sensors, cameras, mapping, and AI coordinates to navigate dynamically, bypass obstacles, and chart alternative paths in real time.

------------------------------------------------------
5. IIOT CONNECTED ECOSYSTEMS:
- Connected Manufacturing: Integrating machines, software, and industrial networks so assets exchange live telemetry.
- Smart Sensors: Continually collect temperature, vibration, hydraulic pressure, and power consumption.
- Real-Time Insights: Instant database analysis feeds dashboards, providing operators with actionable alerts.`
      },
      {
        id: 'l_101_6',
        title: 'Module 6: Strategic Roadmap Frameworks & Organizational Change',
        duration: '50 mins',
        type: 'pdf',
        contentUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        isRequired: true,
        richTextContent: `======================================================
  MODULE 6: DIGITAL TRANSFORMATION STRATEGY
======================================================

1. THE DIGITAL TRANSFORMATION ROADMAP:
Digital Transformation (DX) is the strategic integration of digital technologies to reshape processes, business models, and workforce capabilities. (Iskuja, 2025)

------------------------------------------------------
2. THE FIVE-STAGE TRANSFORMATION MODEL:
1. Assess Current State: Conduct digital maturity assessments to uncover process bottlenecks and skills gaps.
2. Define Vision & Strategy: Match transformation goals directly to business outcomes (OEE, cost, carbon).
3. Prioritise Technologies & Investments: Select tech (IoT, Cobots, Twins) based on feasibility and clear ROI estimates.
4. Implement in Phased Pilots: Roll out small-scale high-impact pilot projects: scale proven systems while safeguarding data.
5. Build Workforce Culture: Upskill teams in data literacy and cultivate continuous improvement change management (change to upskilling ecosystem).

------------------------------------------------------
3. READINESS ASSESSMENT TOOLS:
- IMPULS / Industrie 4.0 Online Tool: Checks readiness across Strategy, Smart Factory, Smart Operations, Smart Products, Data Services, and Employees.
- Transition is an integrated framework (Strategy, Tech, Data, People, Processes, Governance, Value) rather than a simple software purchase!

------------------------------------------------------
4. GREENFIELD VS BROWNFIELD DIGITALISATION:
- GREENFIELD: Building new factories from scratch. Designed with IoT-native machines, perfect data flows, and zero historical legacy constraints. Highly expensive, but zero integration friction.
- BROWNFIELD: Modernising existing plants & legacy devices by retrofitting sensors, adding communication protocols, and phasing updates. Economical for SMEs but highly complex. (Hammond et al., 2023)

------------------------------------------------------
5. DIGITAL FINANCING:
- Clear ROI modeling: assessing operational savings, raw waste reduction, and risk mitigation cases.
- Grants and Incentive Schemes: government subsidies to support IoT pilot adoption and workforce upskilling.
- PPP (Public-Private Partnerships): pooling capital, technical research (such as BCU and AIUB teams), and corporate players to distribute scale risk.`
      }
    ],
    quizzes: [
      {
        id: 'q_101',
        title: 'Digital Manufacturing Academy Course 101 Certification Quiz',
        passingScore: 80,
        questions: [
          {
            id: 'qq_101_1',
            question: 'What is the primary goal of digital manufacturing?',
            options: [
              'Expedite communication speed without mechanical change',
              'Increase manual labor ratios',
              'Improve process efficiency, product quality and manufacturing innovation',
              'Enhance localized software dependencies only'
            ],
            correctAnswer: 2
          },
          {
            id: 'qq_101_2',
            question: 'Which industrial revolution introduced automation, PLCs, and computers into manufacturing?',
            options: [
              'Industry 1.0',
              'Industry 2.0',
              'Industry 3.0',
              'Industry 6.0'
            ],
            correctAnswer: 2
          },
          {
            id: 'qq_101_3',
            question: 'Which of the following are key characteristics of smart manufacturing?',
            options: [
              'Manual paper-based scheduling and localized standalone silos',
              'Real-time data monitoring/connectivity and intelligent automation/decision-making',
              'Complete removal of human operators and manual safety gears',
              'Substantially high upfront costs with no feedback protocols'
            ],
            correctAnswer: 1
          },
          {
            id: 'qq_101_4',
            question: 'Which of the following principles best describe the concept of Industry 6.0?',
            options: [
              'Complete replacement of humans by autonomous grid networks',
              'Greater integration of human-centric/ethical technologies and enhanced focus on sustainability & societal wellbeing',
              'Exclusively focusing on vertical production silos with no environmental metrics',
              'Replacing cybersecurity protocols with offline paper files'
            ],
            correctAnswer: 1
          },
          {
            id: 'qq_101_5',
            question: 'What is the core target of test/generative design in product development?',
            options: [
              'Automated hand-sketching of wireframe blueprints',
              'Algorithm-driven, AI-based exploration of thousands of design alternatives based on material & manufacturing constraints',
              'Storing CAD data files inside remote tape backups',
              'Formatting consumer shipping containers'
            ],
            correctAnswer: 1
          },
          {
            id: 'qq_101_6',
            question: 'Which dual application set is most closely associated with AR/VR/MR virtual prototyping?',
            options: [
              'Static financial bookkeeping and manual payroll processing',
              'Immersive operator training, virtual validation, and product design reviews inside shared workspaces',
              'Standard structural calculations and paper filing systems',
              'Writing ladder logic scripts for Siemens micro-controllers'
            ],
            correctAnswer: 1
          },
          {
            id: 'qq_101_7',
            question: 'Which option best reflects the primary goal of circular manufacturing?',
            options: [
              'Maximising assembly lines speed regardless of raw material waste',
              'Extending product and material lifecycles through reuse, repair, remanufacturing, and recycling resource efficiency',
              'Replacing all automated machine groups with human hands',
              'Increasing mineral and raw resource extraction rates'
            ],
            correctAnswer: 1
          },
          {
            id: 'qq_101_8',
            question: 'Which statement best distinguishes a Cyber-Physical System (CPS) from a Digital Twin?',
            options: [
              'CPS is mainly a virtual graphic layout used in design',
              'CPS integrates sensing, controllers, and actuators to connect/control the physical world, whereas a Digital Twin models, analyzes, and predicts behavior based on live/historical data feeds',
              'CPS is strictly offline, while Digital Twins must run in space orbits',
              'CPS eliminates the requirement for secure network protocols'
            ],
            correctAnswer: 1
          },
          {
            id: 'qq_101_9',
            question: 'Which of the following is most critical to maintain a useful real-time Digital Twin?',
            options: [
              'Establishing a static 3D database that is never synchronized with the machine',
              'Ensuring reliable sensor data feeds and continuous automated synchronization between physical assets and virtual representations',
              'Replacing network routers with paper ledgers',
              'Running high-frequency calculations offline and discarding logs'
            ],
            correctAnswer: 1
          },
          {
            id: 'qq_101_10',
            question: 'In advanced digital manufacturing environments, industrial data analytics is primarily implemented to:',
            options: [
              'Enhance operational intelligence through pattern recognition, predictive modelling, and adaptive process optimisation',
              'Replace cyber-physical communication networks with standalone mechanical belts',
              'Decline industrial IoT sensors in the factory lines',
              'Prevent operator interaction entirely'
            ],
            correctAnswer: 0
          },
          {
            id: 'qq_101_11',
            question: 'What constitutes the value evidence of industrial data platforms shown historically in Siemens Amberg, Bosch, and Unilever?',
            options: [
              'Upwards of 99.9% product quality, OEE efficiency improvements, and energy consumption reductions of 15-20%',
              'Slightly increased downtime of 12%',
              'Uncontrolled cost overrides due to cloud database configurations',
              'Substantial increase in defect rates'
            ],
            correctAnswer: 0
          },
          {
            id: 'qq_101_12',
            question: 'Under Industry 5.0, what distinguishes collaborative robots (cobots) from conventional automation machinery?',
            options: [
              'Cobots must reside inside closed guarding units with strict safety fences',
              'Cobots prioritize safe human-robot collaboration, tracking force & proximity inputs to operate safely alongside people in shared workspaces',
              'Cobots run without electricity or programming logic',
              'Cobots are made solely for material sorting in outdoor environments'
            ],
            correctAnswer: 1
          },
          {
            id: 'qq_101_13',
            question: 'Which two initial actions must a manufacturing SME prioritize to improve digital transformation readiness?',
            options: [
              'Buying various specialized AI suites immediately to speed up deployment',
              'Conducting a digital maturity readiness assessment (such as IMPULS) and defining a clear vision aligned with ROI outcomes',
              'Hiring temporary contract workers and replacing existing legacy machines before standardizing data layers',
              'Decline standard IT protocols to reduce organizational friction'
            ],
            correctAnswer: 1
          }
        ]
      }
    ],
    assignments: [
      {
        id: 'a_101_1',
        title: 'Project Assignment: Industrial Digital Maturity & Roadmap Formulation',
        description: 'Prepare an exhaustive Brownfield retrofitting plan or 5-stage transformation roadmap for an existing SME manufacturing floor. Incorporate exact details of CAD/CAE/PDM integrations, digital twin levels, collaborative cobot work cells, carbon lifecycle metrics, and cyber-risk registers.',
        dueDate: 'Within 10 days',
        status: 'pending'
      }
    ],
    reviews: [
      {
        id: 'rv_101_1',
        userId: 'u_student_rev_101',
        userName: 'Ayesha Chowdhury',
        rating: 5,
        comment: 'Absolutely stunning curriculum! The BCU and AIUB researchers provided incredible details matching exactly what is taught in British Transnational modules.',
        date: '2026-06-08'
      }
    ],
    enrollmentCount: 150,
    ratingAverage: 4.9,
    isPublished: true,
  }
];

export const GENERAL_FAQS = [
  {
    question: 'Who administers the Digital Manufacturing Academy certifications?',
    answer: 'The certification is co-developed and authenticated by investigators and experts from Birmingham City University (UK) and American International University in Bangladesh (AIUB) under the British Council Going Global Partnerships grant.',
  },
  {
    question: 'How do I earn Course Certificates?',
    answer: 'Once you enroll in an open course, you watch the core curriculum video lessons, read associated PDF reference materials, submit the assignments, and achieve a passing grade on the integrated quizzes. Upon fulfilling these milestones, the system automatically triggers a cryptographic dynamic certificate of completion.',
  },
  {
    question: 'Can I publish a course as an outside Instructor?',
    answer: 'Yes! Certified Industry 4.5 instructors can sign up, access the Course Creation wizard, upload PDFs/videos, structure quizzes, write lessons, publish the draft, and manage student analytical trackers inside their customized Instructor panel.',
  },
  {
    question: 'Is there support for offline setup and downloadable database schemas?',
    answer: 'The platform uses PostgreSQL through Prisma. Administrators can configure the database connection and schema using the deployment guide and Prisma commands in the project documentation.',
  },
];

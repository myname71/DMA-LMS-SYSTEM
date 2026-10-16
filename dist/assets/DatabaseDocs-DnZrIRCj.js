import{c as r,r as E,j as e,a as d}from"./index-CeqKkyKu.js";import{C as A}from"./copy-BcEdTvqV.js";/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const R=[["path",{d:"M12 20v2",key:"1lh1kg"}],["path",{d:"M12 2v2",key:"tus03m"}],["path",{d:"M17 20v2",key:"1rnc9c"}],["path",{d:"M17 2v2",key:"11trls"}],["path",{d:"M2 12h2",key:"1t8f8n"}],["path",{d:"M2 17h2",key:"7oei6x"}],["path",{d:"M2 7h2",key:"asdhe0"}],["path",{d:"M20 12h2",key:"1q8mjw"}],["path",{d:"M20 17h2",key:"1fpfkl"}],["path",{d:"M20 7h2",key:"1o8tra"}],["path",{d:"M7 20v2",key:"4gnj0m"}],["path",{d:"M7 2v2",key:"1i4yhu"}],["rect",{x:"4",y:"4",width:"16",height:"16",rx:"2",key:"1vbyd7"}],["rect",{x:"8",y:"8",width:"8",height:"8",rx:"1",key:"z9xiuo"}]],p=r("cpu",R);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const u=[["ellipse",{cx:"12",cy:"5",rx:"9",ry:"3",key:"msslwz"}],["path",{d:"M3 5V19A9 3 0 0 0 21 19V5",key:"1wlel7"}],["path",{d:"M3 12A9 3 0 0 0 21 12",key:"mv7ke4"}]],N=r("database",u);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const S=[["path",{d:"M10 12.5 8 15l2 2.5",key:"1tg20x"}],["path",{d:"m14 12.5 2 2.5-2 2.5",key:"yinavb"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["path",{d:"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z",key:"1mlx9k"}]],L=r("file-code",S);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const m=[["line",{x1:"22",x2:"2",y1:"12",y2:"12",key:"1y58io"}],["path",{d:"M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z",key:"oot6mr"}],["line",{x1:"6",x2:"6.01",y1:"16",y2:"16",key:"sgf278"}],["line",{x1:"10",x2:"10.01",y1:"16",y2:"16",key:"1l4acy"}]],h=r("hard-drive",m);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const C=[["path",{d:"M12 19h8",key:"baeox8"}],["path",{d:"m4 17 6-6-6-6",key:"1yngyt"}]],I=r("terminal",C),x=`
DIGITAL MANUFACTURING ACADEMY 
POSTGRESQL COMPLETE PRODUCTION SCHEMA

1. ROLES TABLE
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

2. USERS TABLE
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified_at TIMESTAMP NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id INT REFERENCES roles(id) ON DELETE SET NULL,
    avatar_url VARCHAR(255) DEFAULT 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    subscription_plan VARCHAR(50) DEFAULT 'none',
    subscription_expires_at TIMESTAMP NULL,
    is_approved BOOLEAN DEFAULT TRUE, -- False for instructors until admin approval
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

3. PERMISSIONS TABLE
CREATE TABLE permissions (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT
);

4. ROLE_HAS_PERMISSIONS CROSS JOIN TABLE
CREATE TABLE role_permissions (
    role_id INT REFERENCES roles(id) ON DELETE CASCADE,
    permission_id INT REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

5. COURSE CATEGORIES TABLE
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    image_url VARCHAR(255) DEFAULT 'https://images.unsplash.com/photo-1611532736597'
);

6. COURSES TABLE
CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    headline VARCHAR(255),
    description TEXT,
    level VARCHAR(50) DEFAULT 'Intermediate', -- Beginner, Intermediate, Advanced
    duration VARCHAR(50),
    price DECIMAL(10, 2) DEFAULT 0.00,
    thumbnail_url VARCHAR(255),
    instructor_id INT REFERENCES users(id) ON DELETE CASCADE,
    category_id INT REFERENCES categories(id) ON DELETE SET NULL,
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

7. LESSONS TABLE (Structured Sections)
CREATE TABLE lessons (
    id SERIAL PRIMARY KEY,
    course_id INT REFERENCES courses(id) ON DELETE CASCADE,
    section_title VARCHAR(100) NOT NULL DEFAULT 'Core Curriculum',
    title VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- video, pdf, assignment
    content_url TEXT NOT NULL,  -- video file path or dummy pdf reference
    duration_minutes INT DEFAULT 15,
    sort_order INT DEFAULT 0,
    is_required BOOLEAN DEFAULT TRUE
);

8. COURSE ENROLLMENTS TABLE 
CREATE TABLE enrollments (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    course_id INT REFERENCES courses(id) ON DELETE CASCADE,
    progress_percent INT DEFAULT 0,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP DEFAULT NULL,
    UNIQUE (user_id, course_id)
);

-- 9. LESSON_PROGRESS TRACKER (Real-Time Completion)
CREATE TABLE lesson_progress (
    id SERIAL PRIMARY KEY,
    enrollment_id INT REFERENCES enrollments(id) ON DELETE CASCADE,
    lesson_id INT REFERENCES lessons(id) ON DELETE CASCADE,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (enrollment_id, lesson_id)
);

10. QUIZZES TABLE
CREATE TABLE quizzes (
    id SERIAL PRIMARY KEY,
    course_id INT REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    passing_score_percent INT DEFAULT 80
);

11. QUIZ QUESTIONS TABLE
CREATE TABLE quiz_questions (
    id SERIAL PRIMARY KEY,
    quiz_id INT REFERENCES quizzes(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    options JSONB NOT NULL, -- Binary JSON options array
    correct_option_index INT NOT NULL
);

12. CERTIFICATES TABLE
CREATE TABLE certificates (
    id SERIAL PRIMARY KEY,
    enrollment_id INT REFERENCES enrollments(id) ON DELETE CASCADE,
    credential_uuid UUID UNIQUE DEFAULT gen_random_uuid(),
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

13. ASSIGNMENTS TABLE
CREATE TABLE assignments (
    id SERIAL PRIMARY KEY,
    course_id INT REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    instructions TEXT NOT NULL,
    max_score INT DEFAULT 100,
    due_date TIMESTAMP NULL
);

14. ASSIGNMENT SUBMISSIONS TABLE
CREATE TABLE assignment_submissions (
    id SERIAL PRIMARY KEY,
    assignment_id INT REFERENCES assignments(id) ON DELETE CASCADE,
    student_id INT REFERENCES users(id) ON DELETE CASCADE,
    submission_text TEXT,
    file_path VARCHAR(255),
    grade INT DEFAULT NULL,
    feedback TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

15. PAYMENTS & SUBSCRIPTIONS RECORD (SaaS Module)
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'paid', -- pending, paid, refunded
    gateway_transaction_id VARCHAR(100),
    subscription_plan VARCHAR(50), -- basic, pro, enterprise
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


NODE.JS / EXPRESS API EXAMPLES

1. GET PUBLISHED COURSES
Example Express route (adapt the query to your database client):

router.get('/courses', async (req, res, next) => {
  try {
    const category = req.query.category;
    const result = category
      ? await db.query(
          'SELECT c.* FROM courses c JOIN categories cat ON cat.id = c.category_id WHERE c.is_published = TRUE AND cat.slug = $1',
          [category]
        )
      : await db.query(
          'SELECT * FROM courses WHERE is_published = TRUE'
        );

    res.status(200).json({ status: 'success', courses: result.rows });
  } catch (error) {
    next(error);
  }
});

2. COURSE CREATION
Validate request fields on the server and enforce permissions using your Node.js authentication middleware before inserting a course. Use parameterized SQL queries (or your configured ORM) to prevent SQL injection. Store uploaded thumbnails in your configured storage provider and save the resulting URL in thumbnail_url.

3. LEARNING PROGRESS
Verify that the authenticated student is enrolled in the course and that the lesson belongs to that course. Save lesson completion in lesson_progress, recalculate progress_percent from completed versus total lessons, and issue a certificate only when all required lessons are complete. Use a database transaction to keep related updates consistent.

4. SECURITY NOTES
- Do not trust role names or user IDs supplied by the browser; derive the user from verified server-side authentication.
- Validate and authorize every course, lesson, enrollment, and certificate operation.
- Never store plaintext passwords; use a suitable password-hashing library.
- Keep database credentials and JWT secrets in server-side environment variables.

`,g=`
HOSTINGER MANAGED NODE.JS APPS & SHARED HOSTING OPTIMIZATION GUIDE

1. CONFIGURING PASSENGERS / REVERSE PROXY
Hostinger Managed Node.JS uses Phusion Passenger under cPanel/hPanel.
* Ensure your server entry point binds to process.env.PORT, but defaults to 3000.
* Create a file named 'app.js' or '.htaccess' inside your root folder:

 .htaccess :
  <IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteRule ^$ http://127.0.0.1:3000/ [P,L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^(.*)$ http://127.0.0.1:3000/$1 [P,L]
  </IfModule>

2. REDIS CACHING FOR PERSISTENT SESSIONS
Configure a secure caching client on your backend:
================ Express code ================
import redis from 'redis';
const redisClient = redis.createClient({
    url: process.env.REDIS_URL || 'redis://127.0.0.1:6379'
});
redisClient.on('error', err => console.log('Redis Cache Error', err));

3. SHARED MEMORY MITIGATIONS (HOSTINGER CPU THROTTLING)
* Avoid run-time Typescript compiling directly on shared hosting CPU kernels!
* Compile modules beforehand utilizing our production script:
  $ npm run build
  This compiles all React paths into high efficiency static HTML index pages and CJS chunks, completely preventing continuous Gulp/Vite watching overhead on small CPU tier limits memory.
`,M=`
To set up this Enterprise LMS on your personal machine or factory intranet workstation:

STEP 1: INSTALL PRE-REQUISITES
1. Node.JS (Ver 20+ LTS recommended) from https://nodejs.org/
2. PostgreSQL 15+ database (Supabase PostgreSQL is supported).
3. Git Bash command line interface helper.

STEP 2: DIRECTORY SETUP & ENVIRONMENT CLONING
Unzip the project file or pull using Git to a target workspace folder, e.g., 'C:\\digital-manufacturing-academy\\'

STEP 3: SECURING ENVIRONMENT VALUES (.ENV)
Copy '.env.example' into '.env' inside the root folder:
  $ copy .env.example .env
Fill in your Postgres connection credentials and your secure Google Gemini keys:
  GEMINI_API_KEY="your_secure_api_key"

STEP 4: DEPENDENCY PROVISIONING
In Git Bash or cmd prompt run:
  $ npm install

STEP 5: RUN DEVELOPMENT DEV MODE
Launch the full stack application on port 3000 immediately:
  $ npm run dev

STEP 6: COMPILE Standalone Production Package
To test ready-to-deploy IIS bundles:
  $ npm run build
  This generates 'dist/index.html' and 'dist/server.cjs' for rapid delivery.
`,U=`
DIGITAL MANUFACTURING ACADEMY (DMA) ENTERPRISE SYSTEM ARCHITECTURE

[1. Presentation Layer (Vite + React Canvas)]
  │
  ├─► Interactive Space Grotesk Displays & Glassmorphic Hero
  ├─► Student Learning Panel (Video Progress Meter, PDF Previews, Dynamic Certificate Creator)
  ├─► Instructor Board (Curriculum Wizard, Quiz Setup, Student Approval, Revenue Logs)
  ├─► Admin Board (User approving, log clear triggers, moderation pipelines)
  └─► Database Workspace (Inspect SQL schemas, downloadable scripts, custom tutorials)
  
[2. Controller Layer (Express Server Route Brokers)]
  │
  ├─► Auth Controllers: Role based logins, 
  ├─► Progress Syncers: Lesson marking, scores calculations
  ├─► Gemini API Connector: Secure proxy safeguarding key tokens, serving custom AI chat bots
  └─► Serialization persistence: Preserves dynamic database changes directly in workspace
  
[3. Caching & Database Schemas (SaaS Level Frameworks)]
  │
  ├─► SQL Database: fully normalized schemas, cascade deletions, JSONB options arrays
  └─► Cache layer: Redis key state storage for subscription expiration sessions
`;function b(){const[t,l]=E.useState("schema"),[c,a]=E.useState(null),o=[{id:"schema",label:"Postgres SQL Schema",icon:N,source:x},{id:"hosting",label:"Hostinger Node/Redis",icon:h,source:g},{id:"windows",label:"Windows Station Setup",icon:I,source:M},{id:"architecture",label:"System Landscape",icon:p,source:U}],n=o.find(s=>s.id===t)?.source||"",T=()=>{navigator.clipboard.writeText(n),a(t),setTimeout(()=>a(null),2e3)};return e.jsxs("div",{className:"relative text-white min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto",id:"code-docs-workspace",children:[e.jsx("div",{className:"absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(37,99,235,0.06),transparent_50%)] z-0 pointer-events-none"}),e.jsx("div",{className:"relative z-10 text-left space-y-4 border-b border-white/10 pb-6 mb-8",children:e.jsxs("div",{children:[e.jsx("span",{className:"text-xs font-bold text-blue-400 uppercase block mb-1",children:"DIGITAL MANUFACTURING ACADEMY • ARCHITECTURE MANUAL"}),e.jsxs("h2",{className:"text-2xl font-extrabold text-slate-100 flex items-center gap-2 font-sans",children:[e.jsx(L,{className:"w-6 h-6 text-blue-400"}),e.jsx("span",{children:"Developer Code & SQL Database Workspace"})]}),e.jsx("p",{className:"text-xs text-slate-400",children:"Explore fully detailed model tables, server proxies, Hostinger server deployment optimizations, and Windows offline workstation setups."})]})}),e.jsxs("div",{className:"relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 text-left",children:[e.jsxs("div",{className:"lg:col-span-4 space-y-3.5",children:[e.jsx("h3",{className:"text-xs font-bold uppercase tracking-wider text-slate-400 pl-1 mb-2",children:"Technical Categories"}),o.map(s=>{const i=t===s.id;return e.jsxs("button",{onClick:()=>l(s.id),className:`w-full flex items-center gap-3.5 p-4 rounded-xl border text-left transition-all cursor-pointer ${i?"border-blue-500 bg-blue-600/10 shadow-lg shadow-blue-550/5":"border-white/5 bg-white/[0.02] hover:bg-white/[0.05]"}`,children:[e.jsx(s.icon,{className:`w-5 h-5 ${i?"text-blue-400":"text-slate-400"}`}),e.jsxs("div",{children:[e.jsx("div",{className:`text-xs font-bold ${i?"text-white":"text-slate-200"}`,children:s.label}),e.jsx("div",{className:"text-[10px] text-slate-500 font-mono capitalize",children:s.id==="schema"?"Cascade constraints schemas":s.id==="hosting"?"Phusion reverse proxy guide":s.id==="windows"?"Offline workstation setup":"System overview"})]})]},s.id)}),e.jsxs("div",{className:"p-4 rounded-xl border border-dashed border-white/10 bg-white/[0.01] text-[11px] text-slate-400 leading-relaxed font-sans space-y-3",children:[e.jsxs("div",{className:"flex gap-2 text-emerald-400 font-bold items-center",children:[e.jsx(d,{className:"w-4 h-4 shrink-0"}),e.jsx("span",{children:"Production Config Valid"})]}),e.jsx("p",{children:"Database migrations leverage relational keys and cascade deletion triggers. Feel free to copy these SQL definitions and run directly into your PostgreSQL or phpMyAdmin environments."})]})]}),e.jsxs("div",{className:"lg:col-span-8 flex flex-col h-full rounded-2xl border border-white/10 bg-[#030712]/75 backdrop-blur-md shadow-inner overflow-hidden",children:[e.jsxs("div",{className:"bg-white/5 border-b border-white/10 p-3.5 flex items-center justify-between text-xs text-slate-400 font-mono",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"w-3 h-3 rounded-full bg-red-500/80"}),e.jsx("span",{className:"w-3 h-3 rounded-full bg-amber-500/80"}),e.jsx("span",{className:"w-3 h-3 rounded-full bg-teal-500/80"}),e.jsx("span",{className:"ml-1 text-slate-500",children:t==="schema"?"postgres_mysql_schema.sql":t==="hosting"?"hostinger_node_guide.txt":t==="windows"?"windows_setup_guide.txt":"system_landscape.md"})]}),e.jsx("button",{onClick:T,className:"p-1 px-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 flex items-center gap-1 text-slate-200 transition-all font-sans font-bold text-[10px] cursor-pointer",children:c===t?e.jsxs(e.Fragment,{children:[e.jsx(d,{className:"w-3 h-3 text-emerald-400"}),e.jsx("span",{className:"text-emerald-400 text-[10px]",children:"Copied!"})]}):e.jsxs(e.Fragment,{children:[e.jsx(A,{className:"w-3 h-3"}),e.jsx("span",{children:"Copy Code block"})]})})]}),e.jsx("div",{className:"flex-1 p-5 overflow-auto text-xs font-mono text-slate-350 bg-slate-950/40 leading-relaxed max-h-[580px] word-break-all whitespace-pre",children:n})]})]})]})}export{b as default};

import{v as r,y as l,x as e,g as d}from"./index-DwDO_8FQ.js";import{C as p}from"./copy-EKAkJUtJ.js";/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const T=[["path",{d:"m16 18 6-6-6-6",key:"eg8j8"}],["path",{d:"m8 6-6 6 6 6",key:"ppft3o"}]],A=r("code",T);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const R=[["path",{d:"M12 20v2",key:"1lh1kg"}],["path",{d:"M12 2v2",key:"tus03m"}],["path",{d:"M17 20v2",key:"1rnc9c"}],["path",{d:"M17 2v2",key:"11trls"}],["path",{d:"M2 12h2",key:"1t8f8n"}],["path",{d:"M2 17h2",key:"7oei6x"}],["path",{d:"M2 7h2",key:"asdhe0"}],["path",{d:"M20 12h2",key:"1q8mjw"}],["path",{d:"M20 17h2",key:"1fpfkl"}],["path",{d:"M20 7h2",key:"1o8tra"}],["path",{d:"M7 20v2",key:"4gnj0m"}],["path",{d:"M7 2v2",key:"1i4yhu"}],["rect",{x:"4",y:"4",width:"16",height:"16",rx:"2",key:"1vbyd7"}],["rect",{x:"8",y:"8",width:"8",height:"8",rx:"1",key:"z9xiuo"}]],m=r("cpu",R);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const N=[["ellipse",{cx:"12",cy:"5",rx:"9",ry:"3",key:"msslwz"}],["path",{d:"M3 5V19A9 3 0 0 0 21 19V5",key:"1wlel7"}],["path",{d:"M3 12A9 3 0 0 0 21 12",key:"mv7ke4"}]],S=r("database",N);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const h=[["path",{d:"M10 12.5 8 15l2 2.5",key:"1tg20x"}],["path",{d:"m14 12.5 2 2.5-2 2.5",key:"yinavb"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["path",{d:"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z",key:"1mlx9k"}]],L=r("file-code",h);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const C=[["line",{x1:"22",x2:"2",y1:"12",y2:"12",key:"1y58io"}],["path",{d:"M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z",key:"oot6mr"}],["line",{x1:"6",x2:"6.01",y1:"16",y2:"16",key:"sgf278"}],["line",{x1:"10",x2:"10.01",y1:"16",y2:"16",key:"1l4acy"}]],I=r("hard-drive",C);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const g=[["path",{d:"M12 19h8",key:"baeox8"}],["path",{d:"m4 17 6-6-6-6",key:"1yngyt"}]],x=r("terminal",g),_=`-- ==========================================
-- DIGITAL MANUFACTURING ACADEMY 
-- POSTGRESQL COMPLETE PRODUCTION SCHEMA
-- ==========================================

-- 1. ROLES TABLE
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. USERS TABLE
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

-- 3. PERMISSIONS TABLE
CREATE TABLE permissions (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT
);

-- 4. ROLE_HAS_PERMISSIONS CROSS JOIN TABLE
CREATE TABLE role_permissions (
    role_id INT REFERENCES roles(id) ON DELETE CASCADE,
    permission_id INT REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- 5. COURSE CATEGORIES TABLE
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    image_url VARCHAR(255) DEFAULT 'https://images.unsplash.com/photo-1611532736597'
);

-- 6. COURSES TABLE
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

-- 7. LESSONS TABLE (Structured Sections)
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

-- 8. COURSE ENROLLMENTS TABLE 
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

-- 10. QUIZZES TABLE
CREATE TABLE quizzes (
    id SERIAL PRIMARY KEY,
    course_id INT REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    passing_score_percent INT DEFAULT 80
);

-- 11. QUIZ QUESTIONS TABLE
CREATE TABLE quiz_questions (
    id SERIAL PRIMARY KEY,
    quiz_id INT REFERENCES quizzes(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    options JSONB NOT NULL, -- Binary JSON options array
    correct_option_index INT NOT NULL
);

-- 12. CERTIFICATES TABLE
CREATE TABLE certificates (
    id SERIAL PRIMARY KEY,
    enrollment_id INT REFERENCES enrollments(id) ON DELETE CASCADE,
    credential_uuid UUID UNIQUE DEFAULT gen_random_uuid(),
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 13. ASSIGNMENTS TABLE
CREATE TABLE assignments (
    id SERIAL PRIMARY KEY,
    course_id INT REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    instructions TEXT NOT NULL,
    max_score INT DEFAULT 100,
    due_date TIMESTAMP NULL
);

-- 14. ASSIGNMENT SUBMISSIONS TABLE
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

-- 15. PAYMENTS & SUBSCRIPTIONS RECORD (SaaS Module)
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'paid', -- pending, paid, refunded
    gateway_transaction_id VARCHAR(100),
    subscription_plan VARCHAR(50), -- basic, pro, enterprise
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`,M=`<?php

namespace App\\Http\\Controllers\\API;

use App\\Http\\Controllers\\Controller;
use App\\Models\\Course;
use App\\Models\\Enrollment;
use Illuminate\\Http\\Request;
use Illuminate\\Support\\Facades\\Validator;
use Illuminate\\Support\\Facades\\Auth;

/**
 * Enterprise Laravel Controller supporting sanctum validation, secure AWS uploads,
 * real-time telemetry syncing, and certification logic.
 */
class LMSCourseController extends Controller
{
    /**
     * Get published courses with relationship metrics.
     */
    public function index(Request $request)
    {
        $courses = Course::with(['instructor:id,name,avatar_url', 'category'])
            ->where('is_published', true)
            ->when($request->query('category'), function($query, $cat) {
                return $query->whereHas('category', function($q) use ($cat) {
                    $q->where('slug', $cat);
                });
            })
            ->withCount('students')
            ->get();

        return response()->json([
            'status' => 'success',
            'courses' => $courses
        ], 200);
    }

    /**
     * Course Creation Wizard (Role: Super_Admin / Instructor)
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'headline' => 'required|string',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'category_id' => 'required|exists:categories,id',
            'thumbnail' => 'image|mimes:jpeg,png,webp|max:5120' // Max 5MB
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = Auth::user();
        if ($user->role !== 'instructor' && $user->role !== 'admin' && $user->role !== 'super_admin') {
            return response()->json(['error' => 'Unverified capability permissions.'], 403);
        }

        $thumbnailPath = 'default_thumbnail.png';
        if ($request->hasFile('thumbnail')) {
            $thumbnailPath = $request->file('thumbnail')->store('thumbnails', 's3');
        }

        $course = Course::create([
            'title' => $request->title,
            'slug' => \\Str::slug($request->title),
            'headline' => $request->headline,
            'description' => $request->description,
            'level' => $request->level ?? 'Intermediate',
            'duration' => $request->duration ?? '12 Hours',
            'price' => $request->price,
            'thumbnail_url' => $thumbnailPath,
            'instructor_id' => $user->id,
            'category_id' => $request->category_id,
            'is_published' => true
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'LMS Course published successfully',
            'course' => $course
        ], 201);
    }

    /**
     * Progress Tracking Synchronization
     */
    public function syncProgress(Request $request)
    {
        $student = Auth::user();
        $validator = Validator::make($request->all(), [
            'course_id' => 'required|exists:courses,id',
            'completed_lesson_id' => 'required|exists:lessons,id'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        $enrollment = Enrollment::firstOrCreate([
            'user_id' => $student->id,
            'course_id' => $request->course_id
        ]);

        // Connect lesson to progress cross tables
        $enrollment->completedLessons()->syncWithoutDetaching([$request->completed_lesson_id]);

        // Calculate and auto update overall progress
        $totalLessons = $enrollment->course->lessons()->count();
        $doneLessons = $enrollment->completedLessons()->count();
        $progress = min(100, (int) (($doneLessons / max(1, $totalLessons)) * 100));

        $enrollment->update(['progress_percent' => $progress]);

        // Automatically trigger certificate generator on 100% completion
        if ($progress >= 100 && !$enrollment->completed_at) {
            $enrollment->update(['completed_at' => now()]);
            $certificate = $enrollment->certificate()->create([
                'credential_uuid' => \\Str::uuid()
            ]);
        }

        return response()->json([
            'status' => 'success',
            'progress' => $progress,
            'certified' => ($progress >= 100)
        ], 200);
    }
}
`,y=`=======================================================================
HOSTINGER MANAGED NODE.JS APPS & SHARED HOSTING OPTIMIZATION GUIDE
=======================================================================

1. CONFIGURING PASSENGERS / REVERSE PROXY
Hostinger Managed Node.JS uses Phusion Passenger under cPanel/hPanel.
* Ensure your server entry point binds to process.env.PORT, but defaults to 3000.
* Create a file named 'app.js' or '.htaccess' inside your root folder:
  ================ .htaccess ================
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
`,U=`=======================================================================
WINDOWS LOCAL APPLET & WORKSTATION OFFLINE SETUP GUIDE
=======================================================================

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
`,b=`=======================================================================
DIGITAL MANUFACTURING ACADEMY (DMA) ENTERPRISE SYSTEM ARCHITECTURE
=======================================================================

[1. Presentation Layer (Vite + React Canvas)]
  │
  ├─► Interactive Space Grotesk Displays & Glassmorphic Hero
  ├─► Student Learning Panel (Video Progress Meter, PDF Previews, Dynamic Certificate Creator)
  ├─► Instructor Board (Curriculum Wizard, Quiz Setup, Student Approval, Revenue Logs)
  ├─► Admin Board (User approving, log clear triggers, moderation pipelines)
  └─► Database Workspace (Inspect SQL schemas, downloadable scripts, custom tutorials)
  
[2. Controller Layer (Express Server Route Brokers)]
  │
  ├─► Auth Controllers: Role based logins, sanctum token mimicking
  ├─► Progress Syncers: Lesson marking, scores calculations
  ├─► Gemini API Connector: Secure proxy safeguarding key tokens, serving custom AI chat bots
  └─► Serialization persistence: Preserves dynamic database changes directly in workspace
  
[3. Caching & Database Schemas (SaaS Level Frameworks)]
  │
  ├─► SQL Database: fully normalized schemas, cascade deletions, JSONB options arrays
  └─► Cache layer: Redis key state storage for subscription expiration sessions
`;function O(){const[t,E]=l.useState("schema"),[c,o]=l.useState(null),a=[{id:"schema",label:"Postgres SQL Schema",icon:S,source:_},{id:"controller",label:"Laravel Controller",icon:A,source:M},{id:"hosting",label:"Hostinger Node/Redis",icon:I,source:y},{id:"windows",label:"Windows Station Setup",icon:x,source:U},{id:"architecture",label:"System Landscape",icon:m,source:b}],n=a.find(s=>s.id===t)?.source||"",u=()=>{navigator.clipboard.writeText(n),o(t),setTimeout(()=>o(null),2e3)};return e.jsxs("div",{className:"relative text-white min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto",id:"code-docs-workspace",children:[e.jsx("div",{className:"absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(37,99,235,0.06),transparent_50%)] z-0 pointer-events-none"}),e.jsx("div",{className:"relative z-10 text-left space-y-4 border-b border-white/10 pb-6 mb-8",children:e.jsxs("div",{children:[e.jsx("span",{className:"text-xs font-bold text-blue-400 uppercase block mb-1",children:"DIGITAL MANUFACTURING ACADEMY • ARCHITECTURE MANUAL"}),e.jsxs("h2",{className:"text-2xl font-extrabold text-slate-100 flex items-center gap-2 font-sans",children:[e.jsx(L,{className:"w-6 h-6 text-blue-400"}),e.jsx("span",{children:"Developer Code & SQL Database Workspace"})]}),e.jsx("p",{className:"text-xs text-slate-400",children:"Explore fully detailed model tables, server proxies, Laravel controller routing patterns, Hostinger server deployment optimizations, and Windows offline workstation setups."})]})}),e.jsxs("div",{className:"relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 text-left",children:[e.jsxs("div",{className:"lg:col-span-4 space-y-3.5",children:[e.jsx("h3",{className:"text-xs font-bold uppercase tracking-wider text-slate-400 pl-1 mb-2",children:"Technical Categories"}),a.map(s=>{const i=t===s.id;return e.jsxs("button",{onClick:()=>E(s.id),className:`w-full flex items-center gap-3.5 p-4 rounded-xl border text-left transition-all cursor-pointer ${i?"border-blue-500 bg-blue-600/10 shadow-lg shadow-blue-550/5":"border-white/5 bg-white/[0.02] hover:bg-white/[0.05]"}`,children:[e.jsx(s.icon,{className:`w-5 h-5 ${i?"text-blue-400":"text-slate-400"}`}),e.jsxs("div",{children:[e.jsx("div",{className:`text-xs font-bold ${i?"text-white":"text-slate-200"}`,children:s.label}),e.jsx("div",{className:"text-[10px] text-slate-500 font-mono capitalize",children:s.id==="schema"?"Cascade constraints schemas":s.id==="controller"?"Sanctum auth APIs":s.id==="hosting"?"Phusion reverse proxy guide":s.id==="windows"?"Offline factory clone":"Multi-tier mapping model"})]})]},s.id)}),e.jsxs("div",{className:"p-4 rounded-xl border border-dashed border-white/10 bg-white/[0.01] text-[11px] text-slate-400 leading-relaxed font-sans space-y-3",children:[e.jsxs("div",{className:"flex gap-2 text-emerald-400 font-bold items-center",children:[e.jsx(d,{className:"w-4 h-4 shrink-0"}),e.jsx("span",{children:"Production Config Valid"})]}),e.jsx("p",{children:"Database migrations leverage relational keys and cascade deletion triggers. Feel free to copy these SQL definitions and run directly into your PostgreSQL or phpMyAdmin environments."})]})]}),e.jsxs("div",{className:"lg:col-span-8 flex flex-col h-full rounded-2xl border border-white/10 bg-[#030712]/75 backdrop-blur-md shadow-inner overflow-hidden",children:[e.jsxs("div",{className:"bg-white/5 border-b border-white/10 p-3.5 flex items-center justify-between text-xs text-slate-400 font-mono",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"w-3 h-3 rounded-full bg-red-500/80"}),e.jsx("span",{className:"w-3 h-3 rounded-full bg-amber-500/80"}),e.jsx("span",{className:"w-3 h-3 rounded-full bg-teal-500/80"}),e.jsx("span",{className:"ml-1 text-slate-500",children:t==="schema"?"postgres_mysql_schema.sql":t==="controller"?"API_LMSCourseController.php":t==="hosting"?"hostinger_node_guide.txt":t==="windows"?"windows_install_blueprint.bat":"dma_architecture_landscape.pdf"})]}),e.jsx("button",{onClick:u,className:"p-1 px-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 flex items-center gap-1 text-slate-200 transition-all font-sans font-bold text-[10px] cursor-pointer",children:c===t?e.jsxs(e.Fragment,{children:[e.jsx(d,{className:"w-3 h-3 text-emerald-400"}),e.jsx("span",{className:"text-emerald-400 text-[10px]",children:"Copied!"})]}):e.jsxs(e.Fragment,{children:[e.jsx(p,{className:"w-3 h-3"}),e.jsx("span",{children:"Copy Code block"})]})})]}),e.jsx("div",{className:"flex-1 p-5 overflow-auto text-xs font-mono text-slate-350 bg-slate-950/40 leading-relaxed max-h-[580px] word-break-all whitespace-pre",children:n})]})]})]})}export{O as default};

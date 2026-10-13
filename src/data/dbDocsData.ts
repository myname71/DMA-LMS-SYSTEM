export const POSTGRES_SCHEMA = `
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
     * Course Creation Wizard (Role: Super_Admin / Instructor/admin)
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
`;

export const HOSTING_OPTIMIZATION = `
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
`;

export const WINDOWS_LOCAL_SETUP = `
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
`;

export const ARCHITECTURE_LANDSCAPE = `
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
`;
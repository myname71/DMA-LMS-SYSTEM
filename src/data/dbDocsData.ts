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
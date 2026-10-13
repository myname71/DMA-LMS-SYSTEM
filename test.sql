-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.app_users (
  id character varying NOT NULL,
  name character varying NOT NULL,
  email character varying NOT NULL UNIQUE,
  password character varying,
  role character varying NOT NULL DEFAULT 'student'::character varying,
  is_approved boolean NOT NULL DEFAULT false,
  suspended boolean NOT NULL DEFAULT false,
  subscription_plan character varying NOT NULL DEFAULT 'free'::character varying,
  avatar text,
  bio text,
  specialization character varying,
  joined_at character varying,
  custom_role_id character varying,
  qualification_doc text,
  phone character varying,
  qualifications jsonb,
  badges jsonb,
  must_change_password boolean NOT NULL DEFAULT false,
  updated_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT app_users_pkey PRIMARY KEY (id)
);
CREATE TABLE public.categories (
  id character varying NOT NULL,
  name character varying NOT NULL UNIQUE,
  description text,
  CONSTRAINT categories_pkey PRIMARY KEY (id)
);
CREATE TABLE public.courses (
  id character varying NOT NULL,
  category_id character varying NOT NULL,
  instructor_id character varying,
  title character varying NOT NULL,
  slug character varying NOT NULL UNIQUE,
  description text,
  difficulty character varying NOT NULL CHECK (difficulty::text = ANY (ARRAY['beginner'::character varying, 'intermediate'::character varying, 'advanced'::character varying]::text[])),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'draft'::text CHECK (status = ANY (ARRAY['draft'::text, 'review'::text, 'published'::text, 'archived'::text])),
  published_at timestamp with time zone,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  price_amount numeric NOT NULL DEFAULT 0 CHECK (price_amount >= 0::numeric),
  currency_code character NOT NULL DEFAULT 'BDT'::bpchar,
  CONSTRAINT courses_pkey PRIMARY KEY (id),
  CONSTRAINT courses_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id),
  CONSTRAINT courses_instructor_id_fkey FOREIGN KEY (instructor_id) REFERENCES public.app_users(id)
);
CREATE TABLE public.lessons (
  id character varying NOT NULL,
  course_id character varying NOT NULL,
  title character varying NOT NULL,
  lesson_number integer NOT NULL CHECK (lesson_number > 0),
  duration_minutes integer NOT NULL CHECK (duration_minutes > 0),
  content text,
  section_id uuid,
  CONSTRAINT lessons_pkey PRIMARY KEY (id),
  CONSTRAINT lessons_course_section_fk FOREIGN KEY (section_id) REFERENCES public.course_sections(id),
  CONSTRAINT lessons_course_section_fk FOREIGN KEY (course_id) REFERENCES public.course_sections(course_id),
  CONSTRAINT lessons_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id)
);
CREATE TABLE public.certifications (
  id character varying NOT NULL,
  user_id character varying NOT NULL,
  course_id character varying NOT NULL,
  certificate_code character varying NOT NULL UNIQUE,
  issued_at timestamp with time zone NOT NULL,
  CONSTRAINT certifications_pkey PRIMARY KEY (id),
  CONSTRAINT certifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.app_users(id),
  CONSTRAINT certifications_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id)
);
CREATE TABLE public.roles (
  code text NOT NULL,
  name text NOT NULL,
  CONSTRAINT roles_pkey PRIMARY KEY (code)
);
CREATE TABLE public.user_roles (
  user_id character varying NOT NULL,
  role_code text NOT NULL,
  CONSTRAINT user_roles_pkey PRIMARY KEY (user_id),
  CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.app_users(id),
  CONSTRAINT user_roles_role_code_fkey FOREIGN KEY (role_code) REFERENCES public.roles(code)
);
CREATE TABLE public.subscription_plans (
  code text NOT NULL,
  name text NOT NULL,
  price_amount numeric NOT NULL CHECK (price_amount >= 0::numeric),
  currency_code character NOT NULL DEFAULT 'BDT'::bpchar,
  billing_interval text NOT NULL DEFAULT 'yearly'::text CHECK (billing_interval = 'yearly'::text),
  is_active boolean NOT NULL DEFAULT true,
  CONSTRAINT subscription_plans_pkey PRIMARY KEY (code)
);
CREATE TABLE public.subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id character varying NOT NULL,
  role_code text NOT NULL DEFAULT 'student'::text CHECK (role_code = 'student'::text),
  plan_code text NOT NULL,
  status text NOT NULL DEFAULT 'active'::text CHECK (status = ANY (ARRAY['pending'::text, 'active'::text, 'past_due'::text, 'canceled'::text, 'expired'::text])),
  starts_at timestamp with time zone NOT NULL DEFAULT now(),
  ends_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT subscriptions_pkey PRIMARY KEY (id),
  CONSTRAINT subscriptions_plan_code_fkey FOREIGN KEY (plan_code) REFERENCES public.subscription_plans(code),
  CONSTRAINT subscriptions_student_role_fk FOREIGN KEY (user_id) REFERENCES public.user_roles(user_id),
  CONSTRAINT subscriptions_student_role_fk FOREIGN KEY (role_code) REFERENCES public.user_roles(role_code)
);
CREATE TABLE public.quizzes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  course_id character varying NOT NULL,
  lesson_id character varying,
  title text NOT NULL,
  questions jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(questions) = 'array'::text),
  passing_score numeric NOT NULL DEFAULT 70 CHECK (passing_score >= 0::numeric AND passing_score <= 100::numeric),
  max_attempts integer CHECK (max_attempts IS NULL OR max_attempts > 0),
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT quizzes_pkey PRIMARY KEY (id),
  CONSTRAINT quizzes_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id),
  CONSTRAINT quizzes_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(id),
  CONSTRAINT quizzes_course_lesson_fk FOREIGN KEY (lesson_id) REFERENCES public.lessons(id),
  CONSTRAINT quizzes_course_lesson_fk FOREIGN KEY (course_id) REFERENCES public.lessons(course_id)
);
CREATE TABLE public.quiz_attempts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL,
  user_id character varying NOT NULL,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(answers) = ANY (ARRAY['object'::text, 'array'::text])),
  score numeric CHECK (score >= 0::numeric AND score <= 100::numeric),
  passed boolean,
  started_at timestamp with time zone NOT NULL DEFAULT now(),
  submitted_at timestamp with time zone,
  CONSTRAINT quiz_attempts_pkey PRIMARY KEY (id),
  CONSTRAINT quiz_attempts_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.quizzes(id),
  CONSTRAINT quiz_attempts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.app_users(id)
);
CREATE TABLE public.assignments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  course_id character varying NOT NULL,
  lesson_id character varying,
  title text NOT NULL,
  description text,
  instructions jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(instructions) = 'object'::text),
  due_at timestamp with time zone,
  max_score numeric CHECK (max_score IS NULL OR max_score > 0::numeric),
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT assignments_pkey PRIMARY KEY (id),
  CONSTRAINT assignments_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(id),
  CONSTRAINT assignments_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id),
  CONSTRAINT assignments_course_lesson_fk FOREIGN KEY (lesson_id) REFERENCES public.lessons(id),
  CONSTRAINT assignments_course_lesson_fk FOREIGN KEY (course_id) REFERENCES public.lessons(course_id)
);
CREATE TABLE public.assignment_submissions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  assignment_id uuid NOT NULL,
  user_id character varying NOT NULL,
  attempt_number integer NOT NULL DEFAULT 1 CHECK (attempt_number > 0),
  submission jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(submission) = 'object'::text),
  status text NOT NULL DEFAULT 'submitted'::text CHECK (status = ANY (ARRAY['submitted'::text, 'graded'::text, 'returned'::text])),
  score numeric CHECK (score IS NULL OR score >= 0::numeric),
  feedback text,
  submitted_at timestamp with time zone NOT NULL DEFAULT now(),
  graded_at timestamp with time zone,
  CONSTRAINT assignment_submissions_pkey PRIMARY KEY (id),
  CONSTRAINT assignment_submissions_assignment_id_fkey FOREIGN KEY (assignment_id) REFERENCES public.assignments(id),
  CONSTRAINT assignment_submissions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.app_users(id)
);
CREATE TABLE public.lesson_progress (
  user_id character varying NOT NULL,
  lesson_id character varying NOT NULL,
  completed_at timestamp with time zone,
  last_position_seconds integer NOT NULL DEFAULT 0 CHECK (last_position_seconds >= 0),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT lesson_progress_pkey PRIMARY KEY (user_id, lesson_id),
  CONSTRAINT lesson_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.app_users(id),
  CONSTRAINT lesson_progress_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(id)
);
CREATE TABLE public.exams (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  course_id character varying NOT NULL,
  title text NOT NULL,
  questions jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(questions) = 'array'::text),
  passing_score numeric NOT NULL DEFAULT 70 CHECK (passing_score >= 0::numeric AND passing_score <= 100::numeric),
  duration_minutes integer CHECK (duration_minutes IS NULL OR duration_minutes > 0),
  max_attempts integer CHECK (max_attempts IS NULL OR max_attempts > 0),
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT exams_pkey PRIMARY KEY (id),
  CONSTRAINT exams_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id)
);
CREATE TABLE public.exam_attempts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  exam_id uuid NOT NULL,
  user_id character varying NOT NULL,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(answers) = ANY (ARRAY['object'::text, 'array'::text])),
  score numeric CHECK (score >= 0::numeric AND score <= 100::numeric),
  passed boolean,
  started_at timestamp with time zone NOT NULL DEFAULT now(),
  submitted_at timestamp with time zone,
  CONSTRAINT exam_attempts_pkey PRIMARY KEY (id),
  CONSTRAINT exam_attempts_exam_id_fkey FOREIGN KEY (exam_id) REFERENCES public.exams(id),
  CONSTRAINT exam_attempts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.app_users(id)
);
CREATE TABLE public.course_sections (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  course_id character varying NOT NULL,
  title text NOT NULL,
  description text,
  section_number integer NOT NULL CHECK (section_number > 0),
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT course_sections_pkey PRIMARY KEY (id),
  CONSTRAINT course_sections_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id)
);
CREATE TABLE public.course_enrollments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id character varying NOT NULL,
  course_id character varying NOT NULL,
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'active'::text, 'completed'::text, 'cancelled'::text, 'refunded'::text, 'suspended'::text])),
  enrollment_type text NOT NULL CHECK (enrollment_type = ANY (ARRAY['free'::text, 'purchase'::text, 'subscription'::text, 'admin_grant'::text])),
  enrolled_at timestamp with time zone NOT NULL DEFAULT now(),
  completed_at timestamp with time zone,
  CONSTRAINT course_enrollments_pkey PRIMARY KEY (id),
  CONSTRAINT course_enrollments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.app_users(id),
  CONSTRAINT course_enrollments_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id)
);
CREATE TABLE public.billing_orders (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id character varying NOT NULL,
  enrollment_id uuid,
  subscription_id uuid,
  amount numeric NOT NULL CHECK (amount >= 0::numeric),
  currency_code character NOT NULL DEFAULT 'BDT'::bpchar,
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'paid'::text, 'failed'::text, 'cancelled'::text, 'refunded'::text, 'partially_refunded'::text])),
  provider text NOT NULL DEFAULT 'manual'::text,
  provider_order_id text,
  idempotency_key text NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  paid_at timestamp with time zone,
  CONSTRAINT billing_orders_pkey PRIMARY KEY (id),
  CONSTRAINT billing_orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.app_users(id),
  CONSTRAINT billing_orders_enrollment_user_fk FOREIGN KEY (enrollment_id) REFERENCES public.course_enrollments(id),
  CONSTRAINT billing_orders_enrollment_user_fk FOREIGN KEY (user_id) REFERENCES public.course_enrollments(user_id),
  CONSTRAINT billing_orders_subscription_user_fk FOREIGN KEY (subscription_id) REFERENCES public.subscriptions(id),
  CONSTRAINT billing_orders_subscription_user_fk FOREIGN KEY (user_id) REFERENCES public.subscriptions(user_id)
);
CREATE TABLE public.payment_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  billing_order_id uuid NOT NULL,
  provider text NOT NULL,
  provider_transaction_id text,
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'authorized'::text, 'captured'::text, 'failed'::text, 'refunded'::text, 'partially_refunded'::text])),
  amount numeric NOT NULL CHECK (amount >= 0::numeric),
  refunded_amount numeric NOT NULL DEFAULT 0,
  currency_code character NOT NULL DEFAULT 'BDT'::bpchar,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  completed_at timestamp with time zone,
  CONSTRAINT payment_transactions_pkey PRIMARY KEY (id),
  CONSTRAINT payment_transactions_billing_order_id_fkey FOREIGN KEY (billing_order_id) REFERENCES public.billing_orders(id)
);
CREATE TABLE public.payment_webhook_events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  provider text NOT NULL,
  provider_event_id text NOT NULL,
  event_type text NOT NULL,
  received_at timestamp with time zone NOT NULL DEFAULT now(),
  processed_at timestamp with time zone,
  processing_error text,
  CONSTRAINT payment_webhook_events_pkey PRIMARY KEY (id)
);
CREATE TABLE public.tasks (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  title text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT tasks_pkey PRIMARY KEY (id)
);
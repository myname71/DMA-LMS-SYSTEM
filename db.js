/**
 * Hostinger + Supabase JS client (optional helper).
 *
 * Your main DMA app already uses Prisma via db.ts + DATABASE_URL / DIRECT_URL.
 * This file is only if you follow Hostinger's supabase-js tutorial or need the
 * REST/realtime client for ad-hoc scripts.
 *
 * Env vars (set in Hostinger panel or .env):
 *   SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
 *   SUPABASE_API_KEY=your_service_role_or_anon_key
 *
 * CommonJS version (matches Hostinger docs). For ESM, use db.supabase.mjs.
 */

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_API_KEY || process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    "[supabase] SUPABASE_URL and SUPABASE_API_KEY are not both set. Client may fail."
  );
}

const supabase = createClient(supabaseUrl || "", supabaseKey || "");

// Test the connection against a real table name from your Supabase project.
// Replace "app_users" if you use a different public table.
supabase
  .from("app_users")
  .select("*")
  .limit(1)
  .then(({ data, error }) => {
    if (error) console.error("Connection error:", error);
    else console.log("Connected:", data);
  });

module.exports = supabase;

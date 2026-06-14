#!/usr/bin/env node
// =====================================================================
// scripts/check-supabase.mjs
// =====================================================================
// Quick validator: prints whether Supabase env is configured and whether
// the running app can talk to it. Useful in CI or before deploying.
//
// Usage:
//   node scripts/check-supabase.mjs
//   node scripts/check-supabase.mjs --live   # also ping the URL
// =====================================================================

import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const checks = [];
let ok = true;

function check(name, pass, detail) {
  checks.push({ name, pass, detail });
  if (!pass) ok = false;
}

// ---- 1. .env.local presence ----
const envPath = resolve(root, '.env.local');
check('.env.local exists', existsSync(envPath), existsSync(envPath) ? envPath : 'create from .env.local.example');

// ---- 2. parse env (if .env.local exists) ----
function loadEnv(path) {
  if (!existsSync(path)) return {};
  const text = readFileSync(path, 'utf8');
  const out = {};
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const m = trimmed.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (m) {
      let v = m[2].trim();
      // strip inline comments
      const hashIdx = v.indexOf(' #');
      if (hashIdx > 0) v = v.slice(0, hashIdx).trim();
      // strip surrounding quotes
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      out[m[1]] = v;
    }
  }
  return out;
}

const env = { ...process.env, ...loadEnv(envPath) };

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// ---- 3. URL format ----
const urlLooksValid = !!url && url.startsWith('https://') && url.includes('.supabase.co');
check(
  'NEXT_PUBLIC_SUPABASE_URL set',
  urlLooksValid,
  url
    ? url.replace(/(.{20}).+(.{15})/, '$1...$2')
    : 'set in .env.local — see https://supabase.com/dashboard → Settings → API',
);

// ---- 4. Key format ----
const keyLooksValid = !!key && key.startsWith('eyJ') && key.length > 80;
check(
  'NEXT_PUBLIC_SUPABASE_ANON_KEY set',
  keyLooksValid,
  key ? `${key.slice(0, 12)}...${key.slice(-6)} (len ${key.length})` : 'set in .env.local — copy "anon public" key, NOT service_role',
);

// ---- 5. SQL migration file present ----
const migration = resolve(root, 'supabase/migrations/0001_leaderboard_scores.sql');
check(
  'SQL migration file present',
  existsSync(migration),
  existsSync(migration) ? 'supabase/migrations/0001_leaderboard_scores.sql' : 'missing!',
);

// ---- 6. (optional) live ping ----
const live = process.argv.includes('--live');
if (live && urlLooksValid && keyLooksValid) {
  try {
    const res = await fetch(`${url}/auth/v1/health`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(8000),
    });
    const ok200 = res.ok;
    let body = '';
    try { body = await res.text(); } catch {}
    check('Live ping to Supabase', ok200, `HTTP ${res.status} ${body.slice(0, 100)}`);
  } catch (e) {
    check('Live ping to Supabase', false, `error: ${e.message}`);
  }
}

// ---- report ----
console.log('');
for (const c of checks) {
  const mark = c.pass ? '\x1b[32m✓\x1b[0m' : '\x1b[31m✗\x1b[0m';
  console.log(`${mark} ${c.name}`);
  console.log(`    ${c.detail}`);
}
console.log('');

// ---- file presence checks ----
const requiredFiles = [
  { path: 'src/middleware.ts', label: 'Next.js middleware entry' },
  { path: 'src/lib/supabase/middleware.ts', label: 'session refresh helper' },
  { path: 'src/lib/supabase/client.ts', label: 'browser client' },
  { path: 'src/lib/supabase/server.ts', label: 'server client' },
  { path: 'supabase/migrations/0001_leaderboard_scores.sql', label: 'leaderboard migration' },
];

console.log('\x1b[1mIntegration files:\x1b[0m');
let allFilesOk = true;
for (const f of requiredFiles) {
  const exists = existsSync(join(root, f.path));
  if (!exists) allFilesOk = false;
  console.log(`  ${exists ? '\x1b[32m✓\x1b[0m' : '\x1b[31m✗\x1b[0m'} ${f.path}  (${f.label})`);
}
console.log('');

if (ok && allFilesOk) {
  console.log('\x1b[32mSupabase configured + all files present. Run `npm run dev` and visit /leaderboard.\x1b[0m');
  process.exit(0);
} else if (ok && !allFilesOk) {
  console.log('\x1b[33mEnv is set, but some integration files are missing. See above.\x1b[0m');
  process.exit(1);
} else if (!ok && allFilesOk) {
  console.log('\x1b[33mFiles are all in place, but Supabase is NOT configured. App will run in local-only mode.\x1b[0m');
  console.log('\x1b[33mSee .env.local.example for setup instructions.\x1b[0m');
  process.exit(1);
} else {
  console.log('\x1b[33mSupabase NOT configured AND some files are missing. See above.\x1b[0m');
  console.log('\x1b[33mSee .env.local.example for setup instructions.\x1b[0m');
  process.exit(1);
}

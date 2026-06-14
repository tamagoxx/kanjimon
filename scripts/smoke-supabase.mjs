// scripts/smoke-supabase.mjs
// Quick connectivity + table-existence smoke test for the kanjimon Supabase project.
// Usage: node scripts/smoke-supabase.mjs

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load .env.local manually (Node 20 doesn't auto-load)
function loadEnv(path) {
  const env = {};
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m) env[m[1]] = m[2].trim();
  }
  return env;
}

const env = loadEnv(resolve(process.cwd(), '.env.local'));
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('FAIL: missing NEXT_PUBLIC_SUPABASE_URL or publishable/anon key in .env.local');
  process.exit(1);
}

const supabase = createClient(url, key);
console.log(`URL: ${url}`);
console.log(`Key: ${key.slice(0, 24)}... (${key.length} chars)\n`);

const TABLES = ['leaderboard_scores'];
let pass = 0, fail = 0;

for (const table of TABLES) {
  const t0 = Date.now();
  const { data, error, count } = await supabase
    .from(table)
    .select('*', { count: 'exact', head: true });
  const ms = Date.now() - t0;
  if (error) {
    console.log(`FAIL  ${table.padEnd(20)} ${ms}ms  ${error.message}`);
    fail++;
  } else {
    console.log(`OK    ${table.padEnd(20)} ${ms}ms  rows=${count ?? '?'}`);
    pass++;
  }
}

// Real query — pull first 3 rows to confirm we can read actual data
const { data: sample, error: sampleErr } = await supabase
  .from('leaderboard_scores')
  .select('game_mode, user_id, score, played_at')
  .order('score', { ascending: false })
  .limit(3);

if (sampleErr) {
  console.log(`\nFAIL  leaderboard_scores sample query  ${sampleErr.message}`);
  fail++;
} else {
  console.log(`\nTop 3 leaderboard_scores rows:`);
  for (const r of sample ?? []) {
    console.log(`  ${r.game_mode}  user=${String(r.user_id).slice(0, 8)}...  score=${r.score}  ${r.played_at}`);
  }
  pass++;
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);

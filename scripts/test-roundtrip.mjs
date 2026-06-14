// scripts/test-roundtrip.mjs
// Round-trip test: sign up test user, INSERT row to leaderboard_scores,
// verify RLS policies (anon read yes / anon write no / user write own yes /
// cross-user write no / update no / delete no).
//
// Usage: node scripts/test-roundtrip.mjs
// Env:   .env.local NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
//
// Leaves the test user + 1 leaderboard row in the DB. Clean up via:
//   supabase auth admin delete-user <id>  (need service_role)
// or manually in Supabase Dashboard → Authentication → Users.

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

function loadEnv(path) {
  const env = {};
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m) env[m[1]] = m[m.length - 1].trim();
    else if (m) env[m[1]] = m[2].trim();
  }
  return env;
}

const env = loadEnv(resolve(process.cwd(), '.env.local'));
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('FAIL: missing NEXT_PUBLIC_SUPABASE_URL or key in .env.local');
  process.exit(1);
}

const anon = createClient(url, key);
const ts = Date.now();
const TEST_EMAIL = `kanjimon-test-${ts}@example.com`;
const TEST_PASS = `test-${ts}-${Math.random().toString(36).slice(2, 10)}`;
const USERNAME = `tester-${ts}`;

let pass = 0, fail = 0;
const tests = [];

function test(name, fn) {
  tests.push({ name, fn });
}

const log = (label, ok, detail = '') => {
  const mark = ok ? 'PASS' : 'FAIL';
  console.log(`  ${mark}  ${label}${detail ? '  ' + detail : ''}`);
  if (ok) pass++; else fail++;
};

// ============================================================
// 1. Sign up a real test user
// ============================================================
console.log(`\n[1] Sign up test user: ${TEST_EMAIL}`);

const { data: signUp, error: signUpErr } = await anon.auth.signUp({
  email: TEST_EMAIL,
  password: TEST_PASS,
  options: { data: { username: USERNAME } },
});

if (signUpErr) {
  console.error(`  FAIL  signUp: ${signUpErr.message}`);
  process.exit(1);
}

const user = signUp?.user;
if (!user?.id) {
  console.error('  FAIL  signUp: no user.id returned');
  process.exit(1);
}
log('signUp returned user.id', true, user.id);

const session = signUp.session;
if (!session?.access_token) {
  console.error('  FAIL  no session (auto-confirm OFF? need email confirm to get session)');
  console.error('         Enable auto-confirm in Dashboard → Auth → Sign In/Up');
  process.exit(1);
}
log('signUp returned access_token (auto-confirm ON)', true);

const auth = createClient(url, key, {
  global: { headers: { Authorization: `Bearer ${session.access_token}` } },
});

// ============================================================
// 2. RLS tests on leaderboard_scores
// ============================================================
console.log(`\n[2] RLS tests on leaderboard_scores`);

// Test: anon SELECT (public read)
test('anon SELECT top rows', async () => {
  const { data, error } = await anon.from('leaderboard_scores').select('*').limit(1);
  if (error) throw new Error(error.message);
  return `rows=${data?.length ?? 0}`;
});

// Test: anon INSERT (should FAIL — only authenticated allowed)
test('anon INSERT (should fail)', async () => {
  const { error } = await anon.from('leaderboard_scores').insert({
    user_id: user.id,
    username: 'hacker',
    game_mode: 'kanji-drop',
    score: 999,
  });
  if (!error) throw new Error('INSERT succeeded — RLS broken!');
  if (!/row-level security|permission|policy/i.test(error.message))
    throw new Error(`unexpected: ${error.message}`);
  return error.message.slice(0, 60);
});

// Test: authenticated INSERT with OWN user_id (should pass)
test('auth INSERT with own user_id', async () => {
  const { data, error } = await auth.from('leaderboard_scores').insert({
    user_id: user.id,
    username: USERNAME,
    game_mode: 'kanji-drop',
    score: 1000,
    wave: 5,
    kills: 12,
    max_combo: 4,
  }).select();
  if (error) throw new Error(error.message);
  if (!data?.[0]?.id) throw new Error('no row id returned');
  return `row id=${data[0].id.slice(0, 8)}...`;
});

// Test: authenticated INSERT with WRONG user_id (should FAIL — WITH CHECK)
test('auth INSERT with WRONG user_id (should fail)', async () => {
  const FAKE_UUID = '00000000-0000-0000-0000-000000000000';
  const { error } = await auth.from('leaderboard_scores').insert({
    user_id: FAKE_UUID,
    username: 'spoofed',
    game_mode: 'kanji-drop',
    score: 999,
  });
  if (!error) throw new Error('INSERT succeeded — WITH CHECK broken!');
  return error.message.slice(0, 60);
});

// Test: authenticated UPDATE (should FAIL — no policy)
test('auth UPDATE (should fail)', async () => {
  const { error } = await auth.from('leaderboard_scores')
    .update({ score: 0 })
    .eq('user_id', user.id);
  if (!error) throw new Error('UPDATE succeeded — no policy should block');
  return error.message.slice(0, 60);
});

// Test: authenticated DELETE (should FAIL — no policy)
test('auth DELETE (should fail)', async () => {
  const { error } = await auth.from('leaderboard_scores')
    .delete()
    .eq('user_id', user.id);
  if (!error) throw new Error('DELETE succeeded — no policy should block');
  return error.message.slice(0, 60);
});

// Test: authenticated SELECT (should pass — public read)
test('auth SELECT own row', async () => {
  const { data, error } = await auth.from('leaderboard_scores')
    .select('*').eq('user_id', user.id);
  if (error) throw new Error(error.message);
  if (data.length !== 1) throw new Error(`expected 1 row, got ${data.length}`);
  return `score=${data[0].score} game=${data[0].game_mode}`;
});

// ============================================================
// 3. Run all tests
// ============================================================
console.log('');
for (const { name, fn } of tests) {
  try {
    const detail = await fn();
    log(name, true, detail ?? '');
  } catch (e) {
    log(name, false, e.message);
  }
}

console.log(`\n${pass} passed, ${fail} failed`);
console.log(`\nTest user: ${TEST_EMAIL}`);
console.log(`  user.id = ${user.id}`);
console.log(`  password = ${TEST_PASS}`);
console.log(`\nCleanup: Supabase Dashboard → Authentication → Users → delete '${TEST_EMAIL}'`);
console.log(`         Or run: supabase auth admin delete-user ${user.id}  (needs service_role)`);

process.exit(fail === 0 ? 0 : 1);

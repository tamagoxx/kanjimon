// scripts/admin-test-flow.mjs
// ============================================================
// Verifies the full Supabase auth + DB integration using the
// SERVICE_ROLE key (bypasses GoTrue's per-IP rate limit).
//
// What it does:
//  1. Admin-creates a test user (test1+<ts>@example.com)
//  2. Verifies the user appears in auth.users (admin API)
//  3. Verifies the handle_new_user() trigger created a profiles row
//  4. Inserts a player_saves row (proves RLS allows own writes via anon
//     after the user has a session — but here we use service_role to
//     write the row, then verify anon can SELECT it via RLS)
//  5. Prints everything the dev can cross-check in the dashboard
//
// Usage: node scripts/admin-test-flow.mjs
//
// Cleans up the test user at the end so the script is re-runnable.
// ============================================================

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

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
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error('FAIL: missing URL or SERVICE_ROLE_KEY');
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const ts = Date.now();
const email = `tester${ts}@example.com`;
const password = 'TestPass123!';
const username = `tester${ts}`;

let pass = 0, fail = 0;
function ok(msg)   { console.log(`✓ ${msg}`); pass++; }
function bad(msg)  { console.log(`✗ ${msg}`); fail++; }
function info(msg) { console.log(`  ${msg}`); }

console.log(`\n[admin-test-flow] email=${email}  username=${username}\n`);

// 1. Admin-create user
const { data: created, error: createErr } = await admin.auth.admin.createUser({
  email,
  password,
  email_confirm: true,  // skip email confirmation
  user_metadata: { username },
});
if (createErr || !created?.user) {
  bad(`createUser failed: ${createErr?.message}`);
  process.exit(1);
}
const userId = created.user.id;
ok(`auth.admin.createUser → user_id=${userId}`);

// 2. Verify user in auth.users
const { data: listData, error: listErr } = await admin.auth.admin.listUsers({ perPage: 5 });
if (listErr) {
  bad(`listUsers failed: ${listErr.message}`);
} else {
  const found = listData.users.find((u) => u.id === userId);
  if (found) ok(`auth.users contains ${email}`); else bad(`auth.users MISSING ${email}`);
  info(`  total users in project: ${listData.users.length}`);
}

// 3. Wait briefly for the trigger, then verify profiles row
await new Promise((r) => setTimeout(r, 800));
const { data: prof, error: profErr } = await admin
  .from('profiles')
  .select('id,username,level,xp,created_at')
  .eq('id', userId)
  .maybeSingle();
if (profErr) {
  bad(`profiles SELECT failed: ${profErr.message}`);
} else if (!prof) {
  bad(`profiles row NOT created — trigger may have failed again`);
} else {
  ok(`profiles row created (trigger fired)`);
  info(`  id=${prof.id}  username=${prof.username}  level=${prof.level}  xp=${prof.xp}`);
}

// 4. Insert a player_saves row as service_role (proves schema works)
const { error: saveErr } = await admin.from('player_saves').insert({
  user_id: userId,
  state: { test: true, ts, source: 'admin-test-flow' },
});
if (saveErr) {
  bad(`player_saves INSERT failed: ${saveErr.message}`);
} else {
  ok(`player_saves row inserted`);
}

// 5. Insert a leaderboard_scores row
const { error: lbErr } = await admin.from('leaderboard_scores').insert({
  user_id: userId,
  username,
  game_mode: 'kanji-drop',
  score: 9999,
  wave: 12,
  kills: 87,
  max_combo: 14,
});
if (lbErr) {
  bad(`leaderboard_scores INSERT failed: ${lbErr.message}`);
} else {
  ok(`leaderboard_scores row inserted (score=9999)`);
}

// 6. Anon read: confirm RLS lets the leaderboard be queried publicly
const anon = createClient(url, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const { data: topAnon, error: anonErr } = await anon
  .from('leaderboard_scores')
  .select('username,score,game_mode')
  .eq('game_mode', 'kanji-drop')
  .order('score', { ascending: false })
  .limit(3);
if (anonErr) {
  bad(`anon leaderboard SELECT failed: ${anonErr.message}`);
} else {
  ok(`anon leaderboard SELECT (top-3 kanji-drop):`);
  for (const row of topAnon ?? []) info(`  ${row.username}: ${row.score}`);
}

// 7. Anon read: confirm RLS BLOCKS reading player_saves without a session
const { data: savesAnon, error: savesAnonErr } = await anon
  .from('player_saves')
  .select('*');
if (savesAnonErr) {
  // Some setups return 401/permission denied — that's actually a PASS
  ok(`anon player_saves SELECT blocked (RLS working): ${savesAnonErr.message}`);
} else if (!savesAnon || savesAnon.length === 0) {
  ok(`anon player_saves SELECT returns 0 rows (RLS working)`);
} else {
  bad(`anon player_saves LEAKED ${savesAnon.length} rows — RLS not working!`);
}

// 8. Sign in as the test user via anon client (mimics what the browser does)
const { data: signInData, error: signInErr } = await anon.auth.signInWithPassword({
  email,
  password,
});
if (signInErr || !signInData.session) {
  bad(`anon signInWithPassword failed: ${signInErr?.message}`);
} else {
  ok(`anon signInWithPassword → session.user.id=${signInData.session.user.id}`);
  // After signin, the user should be able to read their own player_saves
  const authed = createClient(url, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${signInData.session.access_token}` } },
  });
  const { data: ownSaves, error: ownSavesErr } = await authed
    .from('player_saves')
    .select('*')
    .eq('user_id', userId);
  if (ownSavesErr) {
    bad(`signed-in user SELECT own player_saves failed: ${ownSavesErr.message}`);
  } else if (ownSaves && ownSaves.length === 1) {
    ok(`signed-in user can SELECT own player_saves (RLS satisfied)`);
  } else {
    bad(`signed-in user SELECT returned ${ownSaves?.length} rows (expected 1)`);
  }
}

console.log(`\n[admin-test-flow] ${pass} pass, ${fail} fail\n`);

// Cleanup
console.log('[cleanup] deleting test user + cascades...');
const { error: delErr } = await admin.auth.admin.deleteUser(userId);
if (delErr) console.log(`  deleteUser failed: ${delErr.message}`);
else console.log('  ✓ test user deleted (profiles + player_saves cascade)');

process.exit(fail > 0 ? 1 : 0);

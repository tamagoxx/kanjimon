
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

function loadEnv(p) {
  const env = {};
  for (const line of readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m) env[m[1]] = m[2].trim();
  }
  return env;
}
const env = loadEnv(resolve(process.cwd(), '.env.local'));
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// First, delete any leftover test user from previous run
const email = 'kanjimon-test@example.com';
const { data: existing } = await admin.auth.admin.listUsers();
const oldUser = existing?.users.find((u) => u.email === email);
if (oldUser) {
  await admin.auth.admin.deleteUser(oldUser.id);
  console.log('deleted old test user');
}

// Create fresh
const { data, error } = await admin.auth.admin.createUser({
  email,
  password: 'KanjiTest123!',
  email_confirm: true,
  user_metadata: { username: 'kanjimon_test' },
});
if (error) { console.error('FAIL:', error.message); process.exit(1); }
console.log('CREATED test user:');
console.log('  email:    ' + email);
console.log('  password: KanjiTest123!');
console.log('  user_id:  ' + data.user.id);
console.log('  username: kanjimon_test');

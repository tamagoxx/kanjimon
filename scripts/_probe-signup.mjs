import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
const env = {};
for (const line of readFileSync('/root/kanjimon/.env.local', 'utf8').split('\n')) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].trim();
}
const c = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
const emails = [
  'test@example.com',
  'test+foo@example.com',
  'kanjimon_test@example.com',
  'kanjimon.test@example.com',
  'kanjimon-test-12345@example.com',
  'a@b.co',
];
for (const e of emails) {
  const { error } = await c.auth.signUp({ email: e, password: 'x'.repeat(20) });
  console.log(`${e.padEnd(40)} ${error ? 'FAIL: ' + error.message : 'OK'}`);
}

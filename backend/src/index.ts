import { randomBytes } from 'node:crypto';
import { resolve } from 'node:path';
import { createApp } from './app.ts';
import { openDb } from './db.ts';
import { createImageStore } from './images.ts';

const env = process.env;
const dataDir = resolve(env.DATA_DIR || 'data');

const adminEmail = (env.ADMIN_EMAIL || '').trim();
const adminPassword = env.ADMIN_PASSWORD || '';
if (!adminEmail || !adminPassword) {
  console.warn('[server] ADMIN_EMAIL or ADMIN_PASSWORD is not set: the admin panel login is disabled. Add both to .env (see .env.example).');
} else if (adminPassword.length < 8) {
  console.warn('[server] ADMIN_PASSWORD is shorter than 8 characters. Use a long, unique password.');
}

let sessionSecret = env.SESSION_SECRET || '';
if (!sessionSecret) {
  sessionSecret = randomBytes(32).toString('hex');
  console.warn('[server] SESSION_SECRET is not set: using a random one, so admin sessions end whenever the server restarts.');
}

const app = createApp({
  db: openDb(env.DATABASE_PATH ? resolve(env.DATABASE_PATH) : resolve(dataDir, 'site.db')),
  images: createImageStore(resolve(dataDir, 'uploads')),
  adminEmail,
  adminPassword,
  sessionSecret,
  publicUrl: env.PUBLIC_URL || undefined,
  distDir: resolve(env.FRONTEND_DIST || '../frontend/dist'),
  trustProxy: Number(env.TRUST_PROXY) || 0,
});

const port = Number(env.PORT) || 3001;
app.listen(port, () => console.log(`[server] listening on http://localhost:${port}  (data: ${dataDir})`));

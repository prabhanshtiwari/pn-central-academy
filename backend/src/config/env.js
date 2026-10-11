import 'dotenv/config';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(here, '../..');

export function ensureJwtSecret() {
  if (process.env.JWT_SECRET?.length >= 32) return process.env.JWT_SECRET;
  const secretFile = path.join(backendRoot, '.jwt-secret');
  try {
    if (fs.existsSync(secretFile)) {
      const stored = fs.readFileSync(secretFile, 'utf8').trim();
      if (stored.length >= 32) {
        process.env.JWT_SECRET = stored;
        return stored;
      }
    }
    const secret = crypto.randomBytes(64).toString('base64url');
    fs.writeFileSync(secretFile, `${secret}\n`, { mode: 0o600, flag: 'w' });
    try { fs.chmodSync(secretFile, 0o600); } catch { /* Windows may not support POSIX modes. */ }
    process.env.JWT_SECRET = secret;
    console.info('Generated and saved a strong JWT secret to backend/.jwt-secret.');
    return secret;
  } catch (error) {
    // A read-only container must supply JWT_SECRET through its environment.
    throw new Error(`JWT_SECRET is missing and a local secret file could not be created: ${error.message}`);
  }
}

export function getBackendRoot() { return backendRoot; }

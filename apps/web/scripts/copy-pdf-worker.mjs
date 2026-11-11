import { copyFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const source = require.resolve('pdfjs-dist/build/pdf.worker.min.mjs');
const workspaceRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const target = resolve(workspaceRoot, 'public/pdf.worker.min.mjs');
mkdirSync(dirname(target), { recursive: true });
copyFileSync(source, target);
console.log('Prepared public/pdf.worker.min.mjs');

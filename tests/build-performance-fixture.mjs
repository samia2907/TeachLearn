// Production bundling of the real App/routes with an isolated SDK boundary.
import { build } from 'vite';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
const names = new Map();
function scan(dir) {
  for (const item of readdirSync(dir, { withFileTypes: true })) {
    const path = `${dir}/${item.name}`;
    if (item.isDirectory()) scan(path);
    else if (/\.[jm]?[sx]+$/.test(path)) {
      for (const match of readFileSync(path, 'utf8').matchAll(/import\s*\{([^}]+)\}\s*from\s*["'](firebase\/(?:auth|firestore|functions))["']/g)) {
        const exports = names.get(match[2]) || new Set();
        match[1].split(',').map(name => name.trim().split(/\s+as\s+/)[0]).filter(Boolean).forEach(name => exports.add(name));
        names.set(match[2], exports);
      }
    }
  }
}
scan('src');
const fixturePath = JSON.stringify(resolve('tests/performance-fixture.js').replaceAll('\\', '/'));
await build({
  build: { outDir: 'dist/performance-fixture', copyPublicDir: false },
  plugins: [{
    name: 'isolated-performance-fixture', enforce: 'pre',
    resolveId(source, importer) {
      if (names.has(source)) return '\0test:' + source;
      if (/\/firebase\/firebase(?:\.js)?$/.test(source) || (source === './firebase' && importer?.replaceAll('\\', '/').includes('/src/firebase/'))) return '\0test:config';
    },
    load(id) {
      if (id === '\0test:config') return `import {fixture} from ${fixturePath}; export const auth=fixture.auth, db={}, functions={}, app={}, firebaseConfig={}; export default app;`;
      if (id.startsWith('\0test:firebase/')) return `import {api} from ${fixturePath};` + [...names.get(id.slice(6))].map(name => `export const ${name}=api.${name} || (()=>{throw Error('Unexpected fixture operation: ${name}')});`).join('\n');
    },
  }],
});

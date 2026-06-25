#!/usr/bin/env node
/** Publish all wizard metaobject entries (DRAFT → ACTIVE for storefront) */
import { execFileSync } from 'node:child_process';
import { writeFileSync, unlinkSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const STORE = 'riift-hq.myshopify.com';
const TYPES = ['wizard_step', 'wizard_candidate', 'wizard_shaper_region'];

function shopify(args) {
  const env = { ...process.env };
  if (process.platform === 'win32') {
    env.Path = [
      process.env.APPDATA && join(process.env.APPDATA, 'npm'),
      'C:\\Program Files\\nodejs',
      env.Path || env.PATH || '',
    ].join(';');
  }
  return JSON.parse(
    execFileSync('shopify', args, { encoding: 'utf8', env, shell: process.platform === 'win32' })
  );
}

function run(file, variables, mutate = false) {
  const args = ['store', 'execute', '-s', STORE, '--query-file', file, '-j'];
  let vf;
  if (variables) {
    vf = join(tmpdir(), `riift-publish-${Date.now()}-${Math.random()}.json`);
    writeFileSync(vf, JSON.stringify(variables), 'utf8');
    args.push('--variable-file', vf);
  }
  if (mutate) args.push('--allow-mutations');
  try {
    const res = shopify(args);
    return res.data ?? res;
  } finally {
    if (vf) try { unlinkSync(vf); } catch { /* */ }
  }
}

let published = 0;
for (const type of TYPES) {
  const query = `query { metaobjects(type: "${type}", first: 50) { nodes { id handle capabilities { publishable { status } } } } }`;
  const qf = join(tmpdir(), `riift-q-${type}.graphql`);
  writeFileSync(qf, query, 'utf8');
  const nodes = run(qf).metaobjects?.nodes || [];
  try { unlinkSync(qf); } catch { /* */ }

  for (const node of nodes) {
    if (node.capabilities?.publishable?.status === 'ACTIVE') {
      console.log(`  skip ${type}/${node.handle} (already active)`);
      continue;
    }
    const res = run(join(__dirname, 'graphql/publish-metaobject.graphql'), { id: node.id }, true);
    const errs = res.metaobjectUpdate?.userErrors || [];
    if (errs.length) {
      console.log(`  ❌ ${type}/${node.handle}: ${errs.map((e) => e.message).join('; ')}`);
    } else {
      console.log(`  ✅ published ${type}/${node.handle}`);
      published++;
    }
  }
}

console.log(`\nDone — published ${published} entries. Storefront will now read metaobjects.\n`);

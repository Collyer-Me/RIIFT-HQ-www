#!/usr/bin/env node
/** Link battery wizard_candidate entries to PowerPack products */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const STORE = 'riift-hq.myshopify.com';
const LINKS = {
  'battery-2p': 'riift-powerpack-2p',
  'battery-3p': 'riift-powerpack-3p',
  'battery-4p': 'riift-powerpack-4p',
};

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
    vf = join(tmpdir(), `riift-link-${Date.now()}.json`);
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

const products = run(join(__dirname, 'graphql/list-products.graphql')).products.nodes;
const productByHandle = Object.fromEntries(products.map((p) => [p.handle, p.id]));

const candidates = run(join(__dirname, 'graphql/battery-candidates.graphql')).metaobjects.nodes;

for (const [handle, productHandle] of Object.entries(LINKS)) {
  const entry = candidates.find((c) => c.handle === handle);
  const productId = productByHandle[productHandle];
  if (!entry || !productId) {
    console.log(`Skip ${handle}`);
    continue;
  }
  const res = run(
    join(__dirname, 'graphql/metaobject-update.graphql'),
    {
      id: entry.id,
      metaobject: { fields: [{ key: 'product', value: productId }] },
    },
    true
  );
  const errs = res.metaobjectUpdate?.userErrors || [];
  if (errs.length) console.log(`❌ ${handle}:`, errs.map((e) => e.message).join('; '));
  else console.log(`✅ ${handle} → ${productHandle}`);
}

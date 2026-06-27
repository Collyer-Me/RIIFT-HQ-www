#!/usr/bin/env node
/**
 * Audit product theme templates and assign powerpack template to kit products.
 * Idempotent — safe to re-run.
 *
 * Usage: node scripts/assign-product-templates.mjs
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const STORE = 'riift-hq.myshopify.com';

const AUDIT_QUERY = readFileSync(
  join(__dirname, 'graphql/assign-product-templates-audit.graphql'),
  'utf8'
);
const UPDATE_MUTATION = readFileSync(
  join(__dirname, 'graphql/product-template-update.graphql'),
  'utf8'
);

/** Handles that must use the powerpack alternate template. */
const POWERPACK_HANDLES = new Set(['riift-powerpack']);

/** Handles that must stay on the default product template (riift-product-standard). */
const STANDARD_HANDLES = new Set(['riift-spare-battery', 'riift-spare-remote', 'riift-tee']);

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

function runGraphql(query, variables, mutate = false) {
  const tmp = join(tmpdir(), `riift-templates-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const gqlPath = `${tmp}.graphql`;
  writeFileSync(gqlPath, query, 'utf8');
  const args = ['store', 'execute', '-s', STORE, '-j', '--query-file', gqlPath];
  let varPath;
  if (variables) {
    varPath = `${tmp}.json`;
    writeFileSync(varPath, JSON.stringify(variables), 'utf8');
    args.push('--variable-file', varPath);
  }
  if (mutate) args.push('--allow-mutations');
  try {
    const res = shopify(args);
    return res.data ?? res;
  } finally {
    try {
      unlinkSync(gqlPath);
    } catch {
      /* */
    }
    if (varPath) {
      try {
        unlinkSync(varPath);
      } catch {
        /* */
      }
    }
  }
}

function updateTemplate(productId, templateSuffix) {
  const res = runGraphql(
    UPDATE_MUTATION,
    {
      input: { id: productId, templateSuffix: templateSuffix || null },
    },
    true
  );
  const payload = res.productUpdate;
  if (payload.userErrors?.length) {
    throw new Error(
      `${productId}: ${payload.userErrors.map((e) => e.message).join('; ')}`
    );
  }
  return payload.product;
}

function desiredSuffix(handle, tags = []) {
  if (POWERPACK_HANDLES.has(handle)) return 'powerpack';
  if (STANDARD_HANDLES.has(handle)) return null;
  const tagList = tags.map((t) => t.toLowerCase());
  if (tagList.includes('powerpack') || handle.includes('powerpack')) return 'powerpack';
  return null;
}

function auditMetafields(product, label) {
  if (!product) {
    console.log(`  ${label}: not found — skip metafield audit`);
    return;
  }
  const mf = product.metafields?.nodes || [];
  console.log(`  ${label} product metafields (${mf.length}): ${mf.map((n) => n.key).join(', ') || 'none'}`);
  const variants = product.variants?.nodes || [];
  for (const v of variants.slice(0, 3)) {
    const vmf = v.metafields?.nodes || [];
    console.log(`    variant ${v.title}: ${vmf.map((n) => n.key).join(', ') || 'no riift metafields'}`);
  }
}

console.log('Auditing product templates on', STORE, '...\n');

const data = runGraphql(AUDIT_QUERY);

const candidates = [];
const seen = new Set();

function addProduct(node) {
  if (!node?.id || seen.has(node.id)) return;
  seen.add(node.id);
  candidates.push(node);
}

addProduct(data.powerpack);
addProduct(data.spareBattery);
addProduct(data.spareRemote);
addProduct(data.tee);
for (const node of data.products?.nodes || []) {
  addProduct(node);
}

console.log('Current templates:');
for (const p of candidates) {
  const suffix = p.templateSuffix || '(default)';
  console.log(`  ${p.handle}: ${suffix}`);
}

console.log('\nMetafield audit (PowerPack):');
auditMetafields(data.powerpack, 'riift-powerpack');

console.log('\nApplying template assignments...');
let updated = 0;

for (const p of candidates) {
  const want = desiredSuffix(p.handle, p.tags);
  const have = p.templateSuffix || null;
  if (have === want) {
    console.log(`  OK ${p.handle} → ${want || 'default'}`);
    continue;
  }
  const result = updateTemplate(p.id, want);
  console.log(
    `  Updated ${result.handle}: ${have || 'default'} → ${result.templateSuffix || 'default'}`
  );
  updated += 1;
}

console.log(`\nDone. ${updated} product(s) updated.`);
console.log('Expected: riift-powerpack → powerpack; accessories/merch → default product.');

#!/usr/bin/env node
/**
 * Validate wizard metaobject definitions and seed entries from _docs/wizard/seed-data.json
 *
 * Prerequisites:
 *   shopify store auth --store riift-hq.myshopify.com --scopes read_metaobject_definitions,write_metaobject_definitions,read_metaobjects,write_metaobjects,read_products
 *
 * Usage:
 *   node scripts/seed-wizard-metaobjects.mjs          # validate + seed missing entries
 *   node scripts/seed-wizard-metaobjects.mjs --check  # validate only
 */

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const STORE = process.env.SHOPIFY_STORE || 'riift-hq.myshopify.com';
const CHECK_ONLY = process.argv.includes('--check');

const EXPECTED = {
  wizard_step: {
    fields: ['sort_order', 'key', 'eyebrow', 'title', 'options_json'],
    types: {
      sort_order: ['number_integer'],
      key: ['single_line_text_field'],
      eyebrow: ['single_line_text_field'],
      title: ['single_line_text_field'],
      options_json: ['json'],
    },
  },
  wizard_candidate: {
    fields: [
      'candidate_id',
      'candidate_type',
      'name',
      'short_label',
      'subtitle',
      'price_label',
      'pack_index',
      'product',
      'score_weights',
    ],
    types: {
      candidate_id: ['single_line_text_field'],
      candidate_type: ['single_line_text_field'],
      name: ['single_line_text_field'],
      short_label: ['single_line_text_field'],
      subtitle: ['single_line_text_field'],
      price_label: ['single_line_text_field'],
      pack_index: ['number_integer'],
      product: ['product_reference'],
      score_weights: ['json'],
    },
  },
  wizard_shaper_region: {
    fields: ['region_id', 'shaper_name'],
    types: {
      region_id: ['single_line_text_field'],
      shaper_name: ['single_line_text_field'],
    },
  },
};

const CHECK_QUERY_FILE = join(__dirname, 'graphql/check-metaobject.graphql');
const CREATE_MUTATION_FILE = join(__dirname, 'graphql/metaobject-create.graphql');

function shopify(args) {
  const env = { ...process.env };
  if (process.platform === 'win32') {
    const extra = [
      process.env.APPDATA && join(process.env.APPDATA, 'npm'),
      'C:\\Program Files\\nodejs',
    ].filter(Boolean);
    env.Path = [...extra, env.Path || env.PATH || ''].join(';');
  }
  try {
    const out = execFileSync('shopify', args, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      env,
      shell: process.platform === 'win32',
    });
    return JSON.parse(out);
  } catch (err) {
    const msg = err.stderr?.toString() || err.stdout?.toString() || err.message;
    if (/No stored app authentication/i.test(msg)) {
      console.error('\n❌ Store not authenticated. Run:\n');
      console.error(
        `   shopify store auth --store ${STORE} --scopes read_metaobject_definitions,write_metaobject_definitions,read_metaobjects,write_metaobjects,read_products\n`
      );
      process.exit(1);
    }
    throw new Error(msg);
  }
}

function unwrap(res) {
  return res?.data ?? res ?? {};
}

function execute(queryFile, variables, allowMutations = false) {
  const args = ['store', 'execute', '-s', STORE, '--query-file', queryFile, '-j'];
  let varFile;
  if (variables) {
    varFile = join(tmpdir(), `riift-wizard-seed-${Date.now()}.json`);
    writeFileSync(varFile, JSON.stringify(variables), 'utf8');
    args.push('--variable-file', varFile);
  }
  if (allowMutations) args.push('--allow-mutations');
  try {
    return shopify(args);
  } finally {
    if (varFile) {
      try {
        unlinkSync(varFile);
      } catch {
        /* ignore */
      }
    }
  }
}

function validateDefinition(type, definition) {
  const issues = [];
  if (!definition) {
    issues.push(`Definition "${type}" not found — check the Type handle is exactly "${type}"`);
    return issues;
  }
  if (definition.access?.storefront !== 'PUBLIC_READ') {
    issues.push(`Storefront access must be "Read" (PUBLIC_READ), currently: ${definition.access?.storefront ?? 'none'}`);
  }
  const keys = new Map(definition.fieldDefinitions.map((f) => [f.key, f.type.name]));
  for (const key of EXPECTED[type].fields) {
    if (!keys.has(key)) {
      issues.push(`Missing field key: "${key}"`);
      continue;
    }
    const allowed = EXPECTED[type].types[key];
    const actual = keys.get(key);
    if (!allowed.includes(actual)) {
      issues.push(`Field "${key}" should be ${allowed.join(' or ')}, got "${actual}"`);
    }
  }
  for (const key of keys.keys()) {
    if (!EXPECTED[type].fields.includes(key)) {
      issues.push(`Unexpected extra field: "${key}" (OK to keep, but not used by theme)`);
    }
  }
  return issues;
}

function field(key, value) {
  return { key, value: value == null ? '' : String(value) };
}

function buildStepFields(step) {
  return [
    field('sort_order', step.sort_order),
    field('key', step.key),
    field('eyebrow', step.eyebrow),
    field('title', step.title),
    field('options_json', JSON.stringify(step.options_json)),
  ];
}

function buildCandidateFields(candidate, productGid) {
  const fields = [
    field('candidate_id', candidate.candidate_id),
    field('candidate_type', candidate.candidate_type),
    field('name', candidate.name),
    field('short_label', candidate.short_label),
    field('subtitle', candidate.subtitle),
    field('price_label', candidate.price_label ?? ''),
    field('pack_index', candidate.pack_index ?? 0),
    field('score_weights', candidate.score_weights ? JSON.stringify(candidate.score_weights) : '{}'),
  ];
  if (candidate.candidate_type === 'battery' && productGid) {
    fields.push(field('product', productGid));
  }
  return fields;
}

function buildShaperFields(entry) {
  return [field('region_id', entry.region_id), field('shaper_name', entry.shaper_name)];
}

async function main() {
  const seed = JSON.parse(readFileSync(join(ROOT, '_docs/wizard/seed-data.json'), 'utf8'));
  let hasErrors = false;
  const existing = {};
  let productMap = {};

  console.log(`\n🔍 Checking wizard metaobjects on ${STORE}\n`);

  for (const type of Object.keys(EXPECTED)) {
    const res = execute(CHECK_QUERY_FILE, { type });
    const data = unwrap(res);
    const definition = data.definition;
    const issues = validateDefinition(type, definition);
    existing[type] = new Set((definition?.metaobjects?.nodes || []).map((n) => n.handle));

    if (issues.length) {
      hasErrors = true;
      console.log(`\n📋 ${type}`);
      issues.forEach((i) => console.log(`   ⚠️  ${i}`));
    } else {
      console.log(`✅ ${type} — definition OK (${existing[type].size} entries)`);
    }

    if (type === 'wizard_candidate' && data.products?.nodes) {
      productMap = Object.fromEntries(data.products.nodes.map((p) => [p.handle, p.id]));
    }
  }

  const requiredProducts = ['riift-powerpack-2p', 'riift-powerpack-3p', 'riift-powerpack-4p'];
  const missingProducts = requiredProducts.filter((h) => !productMap[h]);
  if (missingProducts.length) {
    console.log('\n⚠️  Products not found (battery candidates will seed without product link):');
    missingProducts.forEach((h) => console.log(`   - ${h}`));
  } else {
    console.log('\n✅ PowerPack products found for Buy now linking');
  }

  const toCreate = {
    wizard_step: seed.wizard_steps.filter((s) => !existing.wizard_step.has(s.handle)),
    wizard_candidate: seed.wizard_candidates.filter((c) => !existing.wizard_candidate.has(c.handle)),
    wizard_shaper_region: seed.wizard_shaper_regions.filter((s) => !existing.wizard_shaper_region.has(s.handle)),
  };

  const totalMissing =
    toCreate.wizard_step.length +
    toCreate.wizard_candidate.length +
    toCreate.wizard_shaper_region.length;

  console.log('\n📦 Entries to create:', totalMissing);
  if (totalMissing === 0) {
    console.log('   All seed entries already exist.');
  } else {
    Object.entries(toCreate).forEach(([type, items]) => {
      if (items.length) console.log(`   ${type}: ${items.map((i) => i.handle).join(', ')}`);
    });
  }

  if (hasErrors) {
    console.log('\n❌ Fix definition issues above before seeding.');
    process.exit(1);
  }

  if (CHECK_ONLY) {
    console.log('\n✅ Check complete (--check mode, no entries created)\n');
    return;
  }

  if (totalMissing === 0) {
    console.log('\n✅ Wizard metaobjects ready — theme will use Admin config.\n');
    return;
  }

  console.log('\n🌱 Creating entries...\n');

  for (const step of toCreate.wizard_step) {
    const res = execute(
      CREATE_MUTATION_FILE,
      {
        metaobject: {
          type: 'wizard_step',
          handle: step.handle,
          capabilities: { publishable: { status: 'ACTIVE' } },
          fields: buildStepFields(step),
        },
      },
      true
    );
    const errs = unwrap(res).metaobjectCreate?.userErrors || [];
    if (errs.length) {
      console.log(`   ❌ ${step.handle}: ${errs.map((e) => e.message).join('; ')}`);
      hasErrors = true;
    } else {
      console.log(`   ✅ wizard_step / ${step.handle}`);
    }
  }

  for (const candidate of toCreate.wizard_candidate) {
    const handle = candidate.product_handle;
    const productGid = handle ? productMap[handle] : null;
    const res = execute(
      CREATE_MUTATION_FILE,
      {
        metaobject: {
          type: 'wizard_candidate',
          handle: candidate.handle,
          capabilities: { publishable: { status: 'ACTIVE' } },
          fields: buildCandidateFields(candidate, productGid),
        },
      },
      true
    );
    const errs = unwrap(res).metaobjectCreate?.userErrors || [];
    if (errs.length) {
      console.log(`   ❌ ${candidate.handle}: ${errs.map((e) => e.message).join('; ')}`);
      hasErrors = true;
    } else {
      const link = productGid ? ` → ${handle}` : ' (no product linked)';
      console.log(`   ✅ wizard_candidate / ${candidate.handle}${link}`);
    }
  }

  for (const region of toCreate.wizard_shaper_region) {
    const res = execute(
      CREATE_MUTATION_FILE,
      {
        metaobject: {
          type: 'wizard_shaper_region',
          handle: region.handle,
          capabilities: { publishable: { status: 'ACTIVE' } },
          fields: buildShaperFields(region),
        },
      },
      true
    );
    const errs = unwrap(res).metaobjectCreate?.userErrors || [];
    if (errs.length) {
      console.log(`   ❌ ${region.handle}: ${errs.map((e) => e.message).join('; ')}`);
      hasErrors = true;
    } else {
      console.log(`   ✅ wizard_shaper_region / ${region.handle}`);
    }
  }

  if (hasErrors) {
    console.log('\n❌ Some entries failed — see messages above.\n');
    process.exit(1);
  }

  console.log('\n✅ Done! Reload /pages/wizard — theme now reads metaobjects.\n');
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});

#!/usr/bin/env node
/**
 * Create riift product + variant metafield definitions with storefront read access.
 * Required for theme Liquid to read per-variant specs (energy, run time, weight, etc.).
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const STORE = 'riift-hq.myshopify.com';

const PRODUCT_DEFINITIONS = [
  ['eyebrow', 'Eyebrow', 'single_line_text_field'],
  ['tier_heading', 'Tier selector label', 'single_line_text_field'],
  ['price_note', 'Price note', 'single_line_text_field'],
  ['footnote', 'Buy block footnote', 'multi_line_text_field'],
  ['gallery_label', 'Gallery overlay label', 'single_line_text_field'],
  ['default_tier', 'Default tier (2P, 3P, 4P)', 'single_line_text_field'],
  ['wizard_url', 'Wizard URL', 'url'],
  ['spec_heading', 'Spec table heading', 'single_line_text_field'],
  ['spec_footnote', 'Spec table footnote', 'multi_line_text_field'],
  ['kit_heading', 'Kit section heading', 'single_line_text_field'],
  ['kit_intro', 'Kit section intro', 'multi_line_text_field'],
  ['kit_items', 'Kit items (JSON)', 'json'],
  ['propulsion_eyebrow', 'Propulsion eyebrow', 'single_line_text_field'],
  ['propulsion_heading', 'Propulsion heading', 'single_line_text_field'],
  ['propulsion_image', 'Propulsion background image', 'file_reference'],
  ['propulsion_stats', 'Propulsion stats (JSON)', 'json'],
  ['show_comparison', 'Show comparison table', 'boolean'],
  ['compare_heading', 'Comparison heading', 'single_line_text_field'],
  ['compare_intro', 'Comparison intro', 'multi_line_text_field'],
  ['compare_column_1_label', 'Comparison column 1 label', 'single_line_text_field'],
  ['compare_column_2_label', 'Comparison column 2 label', 'single_line_text_field'],
  ['compare_rows', 'Comparison rows (JSON)', 'json'],
  ['cta_heading', 'CTA heading', 'single_line_text_field'],
  ['cta_body', 'CTA body', 'multi_line_text_field'],
  ['cta_button_label', 'CTA button label', 'single_line_text_field'],
  ['cta_button_url', 'CTA button URL', 'url'],
];

const VARIANT_DEFINITIONS = [
  ['tier_label', 'Tier label (Entry, All-day, Flagship)', 'single_line_text_field'],
  ['usable_energy', 'Usable energy', 'single_line_text_field'],
  ['efoil_run_time', 'Efoil run time', 'single_line_text_field'],
  ['pack_weight', 'Pack weight', 'single_line_text_field'],
  ['track_compat_line', 'Track compatibility (buy block)', 'single_line_text_field'],
  ['track_compat_table', 'Compatible tracks (spec table)', 'single_line_text_field'],
  ['battery_config', 'Battery configuration', 'single_line_text_field'],
  ['cell', 'Cell', 'single_line_text_field'],
  ['nominal_voltage', 'Nominal pack voltage', 'single_line_text_field'],
  ['capacity', 'Capacity', 'single_line_text_field'],
  ['peak_thrust', 'Peak thrust', 'single_line_text_field'],
  ['battery_weight', 'Battery weight', 'single_line_text_field'],
  ['system_weight', 'System weight installed', 'single_line_text_field'],
  ['recharge_time', 'Recharge time', 'single_line_text_field'],
];

const CREATE_MUTATION = readFileSync(join(__dirname, 'graphql/metafield-definition-create.graphql'), 'utf8');
const CHECK_QUERY = readFileSync(join(__dirname, 'graphql/riift-metafield-definitions-check.graphql'), 'utf8');

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
  const tmp = join(tmpdir(), `riift-mfdef-${Date.now()}`);
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
    try { unlinkSync(gqlPath); } catch { /* */ }
    if (varPath) try { unlinkSync(varPath); } catch { /* */ }
  }
}

function existingKeys(data) {
  const product = new Set(data.productDefinitions?.nodes?.map((n) => n.key) || []);
  const variant = new Set(data.variantDefinitions?.nodes?.map((n) => n.key) || []);
  return { product, variant };
}

const existing = existingKeys(runGraphql(CHECK_QUERY));

for (const [key, name, type] of PRODUCT_DEFINITIONS) {
  if (existing.product.has(key)) {
    console.log(`Skip product riift.${key} (exists)`);
    continue;
  }
  const res = runGraphql(
    CREATE_MUTATION,
    {
      definition: {
        name,
        namespace: 'riift',
        key,
        type,
        ownerType: 'PRODUCT',
        access: { storefront: 'PUBLIC_READ' },
      },
    },
    true
  );
  const errs = res.metafieldDefinitionCreate?.userErrors || [];
  if (errs.length) {
    console.error(`product riift.${key}:`, errs.map((e) => e.message).join('; '));
  } else {
    console.log(`Created product riift.${key}`);
  }
}

for (const [key, name, type] of VARIANT_DEFINITIONS) {
  if (existing.variant.has(key)) {
    console.log(`Skip variant riift.${key} (exists)`);
    continue;
  }
  const res = runGraphql(
    CREATE_MUTATION,
    {
      definition: {
        name,
        namespace: 'riift',
        key,
        type,
        ownerType: 'PRODUCTVARIANT',
        access: { storefront: 'PUBLIC_READ' },
      },
    },
    true
  );
  const errs = res.metafieldDefinitionCreate?.userErrors || [];
  if (errs.length) {
    console.error(`variant riift.${key}:`, errs.map((e) => e.message).join('; '));
  } else {
    console.log(`Created variant riift.${key}`);
  }
}

console.log('Done. Run: node scripts/seed-powerpack-metafields.mjs');

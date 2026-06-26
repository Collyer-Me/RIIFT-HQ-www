#!/usr/bin/env node
/**
 * Seed RIIFT PowerPack product + variant metafields (Admin source of truth).
 * Usage: node scripts/seed-powerpack-metafields.mjs
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const STORE = 'riift-hq.myshopify.com';
const PRODUCT_HANDLE = 'riift-powerpack';

const VARIANT_SPECS = {
  '2P': {
    tier_label: 'Entry',
    battery_config: '12S2P',
    cell: '21700 · 6,000 mAh',
    nominal_voltage: '43.2 V',
    capacity: '12 Ah',
    usable_energy: '518 Wh',
    efoil_run_time: '~30 min',
    peak_thrust: '28 kg',
    battery_weight: '2.5 kg',
    pack_weight: '3.2 kg',
    system_weight: '4.4 kg',
    recharge_time: '~48 min',
    track_compat_line: 'Fits both 2P and 4P RIIFT Tracks.',
    track_compat_table: '2P & 4P',
  },
  '3P': {
    tier_label: 'All-day',
    battery_config: '12S3P',
    cell: '21700 · 6,000 mAh',
    nominal_voltage: '43.2 V',
    capacity: '18 Ah',
    usable_energy: '778 Wh',
    efoil_run_time: '~45 min',
    peak_thrust: '28 kg',
    battery_weight: '3.5 kg',
    pack_weight: '4.5 kg',
    system_weight: '5.7 kg',
    recharge_time: '~72 min',
    track_compat_line: 'Fits 4P RIIFT Tracks.',
    track_compat_table: '4P',
  },
  '4P': {
    tier_label: 'Flagship',
    battery_config: '12S4P',
    cell: '21700 · 6,000 mAh',
    nominal_voltage: '43.2 V',
    capacity: '24 Ah',
    usable_energy: '1,036 Wh',
    efoil_run_time: '~60 min',
    peak_thrust: '28 kg',
    battery_weight: '4.5 kg',
    pack_weight: '5.8 kg',
    system_weight: '7.0 kg',
    recharge_time: '~96 min',
    track_compat_line: 'Fits 4P RIIFT Tracks.',
    track_compat_table: '4P',
  },
};

const PRODUCT_METAFIELDS = {
  eyebrow: { type: 'single_line_text_field', value: 'RIIFT Power System' },
  tier_heading: { type: 'single_line_text_field', value: 'Choose your pack' },
  price_note: { type: 'single_line_text_field', value: 'AUD incl. GST' },
  footnote: {
    type: 'multi_line_text_field',
    value: 'Launches September 2026 · PowerPack delivery from December 2026.',
  },
  gallery_label: { type: 'single_line_text_field', value: 'RIIFT Power System' },
  default_tier: { type: 'single_line_text_field', value: '4P' },
  wizard_url: { type: 'url', value: 'https://riift-hq.myshopify.com/pages/wizard' },
  spec_heading: { type: 'single_line_text_field', value: 'Full specifications' },
  spec_footnote: {
    type: 'multi_line_text_field',
    value:
      '*80 kg rider, flat water, continuous at ~20 km/h. Heavier riders and harder riding reduce run time; surfing roughly doubles it. †PowerPack + Propulsion Unit installed. ‡0–100% at 15 A, nominal. Prices AUD incl. GST.',
  },
  kit_heading: { type: 'single_line_text_field', value: "What's in the kit" },
  kit_intro: {
    type: 'multi_line_text_field',
    value:
      'Everything you need to ride, in one case. The kit clips into the RIIFT Tracks your shaper builds into the board.',
  },
  kit_items: {
    type: 'json',
    value: [
      {
        eyebrow: '01',
        title: 'PowerPack',
        body: 'The battery and onboard computer — the brain and power source of the system. 2P, 3P or 4P.',
      },
      {
        eyebrow: '02',
        title: 'Propulsion Unit',
        body: 'Motor, 49.5 mm pod, hub, blades and cable. Compact, efficient and low-drag.',
      },
      {
        eyebrow: '03',
        title: 'Remote',
        body: 'Wireless throttle control, intuitive from the first ride.',
      },
      {
        eyebrow: '04',
        title: 'Charger',
        body: 'Recharge your PowerPacks between sessions and stay on the water longer.',
      },
      {
        eyebrow: '05',
        title: 'Hard Case',
        body: 'A protective travel and storage case sized for the full kit.',
      },
    ],
  },
  propulsion_eyebrow: { type: 'single_line_text_field', value: 'The propulsion unit' },
  propulsion_heading: {
    type: 'single_line_text_field',
    value: 'A thinner pod cuts drag at every speed',
  },
  propulsion_stats: {
    type: 'json',
    value: [
      { value: '49.5', unit: 'mm', label: 'Pod diameter — vs a 63 mm industry standard.' },
      { value: '38', unit: '%', label: 'Less drag than the industry-standard pod.' },
      {
        value: '150',
        unit: 'W/kg',
        label: 'Up to, in 4P — power-to-weight at the top of the class.',
      },
    ],
  },
  show_comparison: { type: 'boolean', value: true },
  compare_heading: { type: 'single_line_text_field', value: 'How it compares' },
  compare_intro: {
    type: 'multi_line_text_field',
    value:
      'RIIFT 4P against the comparable FoilDrive Fusion. Manufacturer-published figures.',
  },
  compare_column_1_label: { type: 'single_line_text_field', value: 'RIIFT 4P' },
  compare_column_2_label: { type: 'single_line_text_field', value: 'FoilDrive Fusion' },
  compare_rows: {
    type: 'json',
    value: [
      { label: 'Usable energy', riift_value: '1,036 Wh', compare_value: '860 Wh' },
      { label: 'Complete weight', riift_value: '7.0 kg', compare_value: '7.9 kg' },
      { label: 'Peak thrust', riift_value: '28 kg', compare_value: '34 kg' },
      { label: 'RRP incl. tax', riift_value: '$10,000', compare_value: '$11,600' },
    ],
  },
  cta_heading: { type: 'single_line_text_field', value: 'Not sure which pack?' },
  cta_body: {
    type: 'multi_line_text_field',
    value: "Answer a few questions and we'll rank the right tracks and battery for how you ride.",
  },
  cta_button_label: { type: 'single_line_text_field', value: 'Start RIIFT Wizard' },
  cta_button_url: { type: 'url', value: 'https://riift-hq.myshopify.com/pages/wizard' },
};

const METAFIELDS_SET = readFileSync(join(__dirname, 'graphql/metafields-set.graphql'), 'utf8');
const PRODUCT_QUERY = readFileSync(join(__dirname, 'graphql/product-powerpack-check.graphql'), 'utf8');

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

function run(query, variables, mutate = false) {
  const args = ['store', 'execute', '-s', STORE, '-j'];
  let vf;
  let qf;
  const tmp = join(tmpdir(), `riift-seed-${Date.now()}-${Math.random().toString(36).slice(2)}`);

  if (query.includes('mutation') || query.trimStart().startsWith('mutation')) {
    writeFileSync(`${tmp}.graphql`, query, 'utf8');
    qf = `${tmp}.graphql`;
    args.push('--query-file', qf);
  } else {
    writeFileSync(`${tmp}.graphql`, query, 'utf8');
    args.push('--query-file', `${tmp}.graphql`);
  }

  if (variables) {
    vf = `${tmp}.json`;
    writeFileSync(vf, JSON.stringify(variables), 'utf8');
    args.push('--variable-file', vf);
  }
  if (mutate) args.push('--allow-mutations');
  try {
    const res = shopify(args);
    return res.data ?? res;
  } finally {
    try {
      unlinkSync(`${tmp}.graphql`);
    } catch {
      /* */
    }
    if (vf) try { unlinkSync(vf); } catch { /* */ }
  }
}

function formatMetafieldValue(def) {
  if (def.type === 'json') return JSON.stringify(def.value);
  if (def.type === 'boolean') return def.value ? 'true' : 'false';
  return String(def.value);
}

function buildMetafields(ownerId, fields, specs = null) {
  const out = [];
  for (const [key, def] of Object.entries(fields)) {
    out.push({
      ownerId,
      namespace: 'riift',
      key,
      type: def.type,
      value: formatMetafieldValue(def),
    });
  }
  if (specs) {
    for (const [key, value] of Object.entries(specs)) {
      out.push({
        ownerId,
        namespace: 'riift',
        key,
        type: 'single_line_text_field',
        value: String(value),
      });
    }
  }
  return out;
}

const productData = run(PRODUCT_QUERY).productByHandle;
if (!productData) {
  console.error(`Product not found: ${PRODUCT_HANDLE}`);
  process.exit(1);
}

const productId = productData.id;
const metafields = buildMetafields(productId, PRODUCT_METAFIELDS);

for (const variant of productData.variants.nodes) {
  const tier = variant.selectedOptions?.[0]?.value?.toUpperCase() || variant.title.toUpperCase();
  const specs = VARIANT_SPECS[tier];
  if (!specs) {
    console.warn(`No specs for variant tier ${tier}`);
    continue;
  }
  metafields.push(...buildMetafields(variant.id, {}, specs));
}

// Shopify metafieldsSet accepts max 25 per call
const chunkSize = 25;
for (let i = 0; i < metafields.length; i += chunkSize) {
  const chunk = metafields.slice(i, i + chunkSize);
  const res = run(METAFIELDS_SET, { metafields: chunk }, true);
  const errs = res.metafieldsSet?.userErrors || [];
  if (errs.length) {
    console.error('metafieldsSet errors:', errs);
    process.exit(1);
  }
  console.log(`Set ${chunk.length} metafields (batch ${Math.floor(i / chunkSize) + 1})`);
}

console.log(`Done. Product: https://riift-hq.myshopify.com/products/${PRODUCT_HANDLE}`);

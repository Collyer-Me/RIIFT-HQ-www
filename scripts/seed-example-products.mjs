#!/usr/bin/env node
/**
 * Create example catalog products: spare battery (2P/3P/4P), remote, tee.
 * Idempotent — skips products that already exist.
 * Usage: node scripts/seed-example-products.mjs
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const STORE = 'riift-hq.myshopify.com';

const PRODUCT_SET = readFileSync(join(__dirname, 'graphql/product-powerpack-create.graphql'), 'utf8');
const CHECK_QUERY = readFileSync(join(__dirname, 'graphql/example-products-check.graphql'), 'utf8');
const PUBLISH_MUTATION = readFileSync(join(__dirname, 'graphql/product-publish.graphql'), 'utf8');
const METAFIELDS_SET = readFileSync(join(__dirname, 'graphql/metafields-set.graphql'), 'utf8');

const EXAMPLE_PRODUCTS = [
  {
    handle: 'riift-spare-battery',
    input: {
      title: 'RIIFT Spare PowerPack',
      handle: 'riift-spare-battery',
      descriptionHtml:
        '<p>Replacement PowerPack module — battery and onboard computer. Clip-in compatible with RIIFT Tracks. Choose 2P, 3P or 4P to match your board.</p>',
      vendor: 'RIIFT',
      productType: 'Accessory',
      status: 'ACTIVE',
      productOptions: [{ name: 'Pack', values: [{ name: '2P' }, { name: '3P' }, { name: '4P' }] }],
      variants: [
        { optionValues: [{ optionName: 'Pack', name: '2P' }], price: '4500.00', sku: 'RIIFT-SB-2P' },
        { optionValues: [{ optionName: 'Pack', name: '3P' }], price: '6500.00', sku: 'RIIFT-SB-3P' },
        { optionValues: [{ optionName: 'Pack', name: '4P' }], price: '8500.00', sku: 'RIIFT-SB-4P' },
      ],
    },
    metafields: {
      eyebrow: 'RIIFT Power System',
      price_note: 'AUD incl. GST',
      footnote: 'Spare module only — Propulsion Unit, remote and case sold separately.',
    },
    variantSpecs: {
      '2P': { usable_energy: '518 Wh', pack_weight: '3.2 kg' },
      '3P': { usable_energy: '778 Wh', pack_weight: '4.5 kg' },
      '4P': { usable_energy: '1,036 Wh', pack_weight: '5.8 kg' },
    },
  },
  {
    handle: 'riift-spare-remote',
    input: {
      title: 'RIIFT Remote',
      handle: 'riift-spare-remote',
      descriptionHtml:
        '<p>Wireless throttle remote for the RIIFT Power System. Intuitive control from the first ride. USB rechargeable.</p>',
      vendor: 'RIIFT',
      productType: 'Accessory',
      status: 'ACTIVE',
      productOptions: [{ name: 'Title', values: [{ name: 'Default Title' }] }],
      variants: [
        {
          optionValues: [{ optionName: 'Title', name: 'Default Title' }],
          price: '290.00',
          sku: 'RIIFT-REMOTE',
        },
      ],
    },
    metafields: {
      eyebrow: 'RIIFT Power System',
      price_note: 'AUD incl. GST',
    },
  },
  {
    handle: 'riift-tee',
    input: {
      title: 'RIIFT Tee',
      handle: 'riift-tee',
      descriptionHtml:
        '<p>RIIFT wordmark tee. Heavyweight cotton, relaxed fit. Wear it between sessions.</p>',
      vendor: 'RIIFT',
      productType: 'Merch',
      status: 'ACTIVE',
      productOptions: [
        {
          name: 'Size',
          values: [{ name: 'S' }, { name: 'M' }, { name: 'L' }, { name: 'XL' }],
        },
      ],
      variants: [
        { optionValues: [{ optionName: 'Size', name: 'S' }], price: '45.00', sku: 'RIIFT-TEE-S' },
        { optionValues: [{ optionName: 'Size', name: 'M' }], price: '45.00', sku: 'RIIFT-TEE-M' },
        { optionValues: [{ optionName: 'Size', name: 'L' }], price: '45.00', sku: 'RIIFT-TEE-L' },
        { optionValues: [{ optionName: 'Size', name: 'XL' }], price: '45.00', sku: 'RIIFT-TEE-XL' },
      ],
    },
    metafields: {
      price_note: 'AUD incl. GST',
    },
  },
];

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
  const tmp = join(tmpdir(), `riift-example-${Date.now()}-${Math.random().toString(36).slice(2)}`);
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
    if (varPath)
      try {
        unlinkSync(varPath);
      } catch {
        /* */
      }
  }
}

function formatMetafieldValue(def) {
  if (typeof def === 'object' && def !== null && 'type' in def) {
    if (def.type === 'json') return JSON.stringify(def.value);
    if (def.type === 'boolean') return def.value ? 'true' : 'false';
    return String(def.value);
  }
  return String(def);
}

function setProductMetafields(productId, fields) {
  const typeForKey = {
    footnote: 'multi_line_text_field',
    kit_intro: 'multi_line_text_field',
    spec_footnote: 'multi_line_text_field',
    compare_intro: 'multi_line_text_field',
    cta_body: 'multi_line_text_field',
  };
  const metafields = Object.entries(fields).map(([key, value]) => ({
    ownerId: productId,
    namespace: 'riift',
    key,
    type: typeForKey[key] || 'single_line_text_field',
    value: String(value),
  }));
  if (!metafields.length) return;

  const res = runGraphql(METAFIELDS_SET, { metafields }, true);
  const errs = res.metafieldsSet?.userErrors || [];
  if (errs.length) throw new Error(errs.map((e) => e.message).join('; '));
}

function setVariantMetafields(variantNodes, specsByTier) {
  if (!specsByTier) return;
  const metafields = [];
  for (const variant of variantNodes) {
    const tier = variant.selectedOptions?.[0]?.value?.toUpperCase() || variant.title?.toUpperCase();
    const specs = specsByTier[tier];
    if (!specs) continue;
    for (const [key, value] of Object.entries(specs)) {
      metafields.push({
        ownerId: variant.id,
        namespace: 'riift',
        key,
        type: 'single_line_text_field',
        value: String(value),
      });
    }
  }
  if (!metafields.length) return;
  const res = runGraphql(METAFIELDS_SET, { metafields }, true);
  const errs = res.metafieldsSet?.userErrors || [];
  if (errs.length) throw new Error(errs.map((e) => e.message).join('; '));
}

function publishProduct(productId, publicationId) {
  const res = runGraphql(PUBLISH_MUTATION, { id: productId, publicationId }, true);
  const errs = res.publishablePublish?.userErrors || [];
  if (errs.length) throw new Error(errs.map((e) => e.message).join('; '));
}

const check = runGraphql(CHECK_QUERY);
const publicationId = check.publications?.nodes?.find((p) => p.name === 'Online Store')?.id;
if (!publicationId) {
  console.error('Online Store publication not found');
  process.exit(1);
}

const existing = {
  'riift-spare-battery': check.spareBattery,
  'riift-spare-remote': check.spareRemote,
  'riift-tee': check.tee,
};

for (const product of EXAMPLE_PRODUCTS) {
  const found = existing[product.handle];
  let productId;
  let variantNodes = [];

  if (found?.id) {
    productId = found.id;
    console.log(`Exists ${product.handle} — updating metafields & publish`);
    // Re-fetch variants for metafield seeding
    const detail = runGraphql(
      `query($handle: String!) { productByHandle(handle: $handle) { id variants(first: 20) { nodes { id title selectedOptions { name value } } } } }`,
      { handle: product.handle }
    );
    variantNodes = detail.productByHandle?.variants?.nodes || [];
  } else {
    const res = runGraphql(PRODUCT_SET, { input: product.input }, true);
    const errs = res.productSet?.userErrors || [];
    if (errs.length) {
      console.error(`Failed ${product.handle}:`, errs);
      process.exit(1);
    }

    const created = res.productSet.product;
    productId = created.id;
    variantNodes = created.variants?.nodes || [];
    console.log(`Created ${created.handle} (${productId})`);
  }

  if (product.metafields) {
    setProductMetafields(productId, product.metafields);
    console.log(`  Set product metafields`);
  }

  if (product.variantSpecs && variantNodes.length) {
    setVariantMetafields(variantNodes, product.variantSpecs);
    console.log(`  Set variant metafields`);
  }

  publishProduct(productId, publicationId);
  console.log(`  Published to Online Store`);
  console.log(`  https://riift-hq.myshopify.com/products/${product.handle}`);
}

console.log('\nDone. Product templates: run `node scripts/assign-product-templates.mjs`');
console.log('  RIIFT PowerPack (+ 2p/3p/4p handles) → powerpack');
console.log('  Spare battery, Remote, Tee → Default product');

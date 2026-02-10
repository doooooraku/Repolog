#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { Buffer } from 'node:buffer';
import { performance } from 'node:perf_hooks';

const KB = 1024;
const MB = KB * KB;
const BASE_TEMPLATE_BYTES = 4 * KB;
const DATA_URI_PREFIX = 'data:image/png;base64,';

const FONT_CATALOG = [
  {
    key: 'latin',
    family: 'Noto Sans',
    filePath: 'assets/fonts/NotoSans-Variable.ttf',
  },
  {
    key: 'jp',
    family: 'Noto Sans JP',
    filePath: 'assets/fonts/NotoSansJP-Variable.ttf',
  },
  {
    key: 'sc',
    family: 'Noto Sans SC',
    filePath: 'assets/fonts/NotoSansSC-Variable.ttf',
  },
  {
    key: 'tc',
    family: 'Noto Sans TC',
    filePath: 'assets/fonts/NotoSansTC-Variable.ttf',
  },
  {
    key: 'kr',
    family: 'Noto Sans KR',
    filePath: 'assets/fonts/NotoSansKR-Variable.ttf',
  },
  {
    key: 'thai',
    family: 'Noto Sans Thai',
    filePath: 'assets/fonts/NotoSansThai-Variable.ttf',
  },
  {
    key: 'devanagari',
    family: 'Noto Sans Devanagari',
    filePath: 'assets/fonts/NotoSansDevanagari-Variable.ttf',
  },
];

const SCENARIOS = [
  {
    id: 'short_text',
    label: 'Short text / low photo count',
    localeHint: 'en',
    photoCount: 4,
    reportName: 'Bridge inspection',
    comment:
      'Checked anchors and guard rails. No visible damage. Next routine check is scheduled for tomorrow morning.',
  },
  {
    id: 'photo_heavy',
    label: 'Photo heavy / same language',
    localeHint: 'en',
    photoCount: 80,
    reportName: 'Warehouse post-rain patrol',
    comment:
      'Large route patrol with many evidence photos. Findings are mostly normal, but drainage around loading dock B needs follow-up.',
  },
  {
    id: 'multilingual',
    label: 'Multilingual scripts / medium photo count',
    localeHint: 'ja',
    photoCount: 12,
    reportName: '多言語点検レポート',
    comment:
      '日本語とEnglishを混在。简体中文・繁體中文・한국어・ไทย・हिन्दीを含む確認用コメント。',
  },
];

const SCRIPT_REGEX = {
  devanagari: /[\u0900-\u097F]/u,
  thai: /[\u0E00-\u0E7F]/u,
  hangul: /[\u1100-\u11FF\u3130-\u318F\uAC00-\uD7AF]/u,
  hiraganaKatakana: /[\u3040-\u30FF]/u,
  cjkUnified: /[\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF]/u,
};

const DEFAULTS = {
  iterations: 7,
  sampleImagePath: 'assets/images/icon.png',
  outJsonPath: 'docs/how-to/benchmarks/pdf_font_benchmark.latest.json',
  outMarkdownPath: 'docs/how-to/benchmarks/pdf_font_benchmark.latest.md',
  write: true,
};

function printUsage() {
  console.log(`Usage: node scripts/pdf-font-benchmark.mjs [options]

Options:
  --iterations <number>      Number of runs per scenario/strategy (default: ${DEFAULTS.iterations})
  --sample-image <path>      Sample image used for size estimation (default: ${DEFAULTS.sampleImagePath})
  --out-json <path>          JSON output path (default: ${DEFAULTS.outJsonPath})
  --out-md <path>            Markdown output path (default: ${DEFAULTS.outMarkdownPath})
  --no-write                 Run benchmark but do not write files
  -h, --help                 Show this help
`);
}

function parseArgs(argv) {
  const args = { ...DEFAULTS };
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === '--iterations') {
      const raw = argv[i + 1];
      const parsed = Number.parseInt(raw ?? '', 10);
      if (!Number.isInteger(parsed) || parsed < 1) {
        throw new Error(`Invalid value for --iterations: ${raw ?? '(missing)'}`);
      }
      args.iterations = parsed;
      i += 1;
      continue;
    }
    if (token === '--sample-image') {
      args.sampleImagePath = argv[i + 1] ?? '';
      i += 1;
      continue;
    }
    if (token === '--out-json') {
      args.outJsonPath = argv[i + 1] ?? '';
      i += 1;
      continue;
    }
    if (token === '--out-md') {
      args.outMarkdownPath = argv[i + 1] ?? '';
      i += 1;
      continue;
    }
    if (token === '--no-write') {
      args.write = false;
      continue;
    }
    if (token === '-h' || token === '--help') {
      args.help = true;
      continue;
    }
    throw new Error(`Unknown option: ${token}`);
  }

  return args;
}

const fontBase64Cache = new Map();

function toPercent(value) {
  if (!Number.isFinite(value)) return 'n/a';
  return `${(value * 100).toFixed(1)}%`;
}

function bytesToMb(value) {
  return value / MB;
}

function base64Length(rawBytes) {
  return Math.ceil(rawBytes / 3) * 4;
}

function round(value, digits = 2) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function median(values) {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }
  return sorted[middle];
}

function percentile(values, percentileValue) {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.max(
    0,
    Math.min(sorted.length - 1, Math.ceil((percentileValue / 100) * sorted.length) - 1),
  );
  return sorted[index];
}

function detectScriptSubset(text, localeHint) {
  const selected = new Set(['latin']);
  if (SCRIPT_REGEX.devanagari.test(text)) {
    selected.add('devanagari');
  }
  if (SCRIPT_REGEX.thai.test(text)) {
    selected.add('thai');
  }
  if (SCRIPT_REGEX.hangul.test(text)) {
    selected.add('kr');
  }
  if (SCRIPT_REGEX.hiraganaKatakana.test(text)) {
    selected.add('jp');
  }
  if (SCRIPT_REGEX.cjkUnified.test(text)) {
    if (localeHint === 'ja') {
      selected.add('jp');
    } else if (localeHint === 'zh-Hans') {
      selected.add('sc');
    } else if (localeHint === 'zh-Hant') {
      selected.add('tc');
    } else {
      // When locale is unknown, keep CJK-safe fallback to avoid false negatives.
      selected.add('jp');
      selected.add('sc');
      selected.add('tc');
    }
  }
  return [...selected];
}

function selectFontKeys(strategy, scenario) {
  if (strategy === 'all_fonts') {
    return FONT_CATALOG.map((font) => font.key);
  }
  if (strategy === 'script_subset') {
    const text = `${scenario.reportName}\n${scenario.comment}`;
    return detectScriptSubset(text, scenario.localeHint);
  }
  throw new Error(`Unknown strategy: ${strategy}`);
}

async function readFontMetadata(rootDir) {
  const out = {};
  for (const font of FONT_CATALOG) {
    const absolutePath = path.join(rootDir, font.filePath);
    const stats = await fs.stat(absolutePath);
    out[font.key] = {
      ...font,
      absolutePath,
      rawBytes: stats.size,
      base64Bytes: base64Length(stats.size),
    };
  }
  return out;
}

async function loadFontBase64(fontMeta, useCache) {
  if (useCache && fontBase64Cache.has(fontMeta.key)) {
    return fontBase64Cache.get(fontMeta.key);
  }

  const buffer = await fs.readFile(fontMeta.absolutePath);
  const encoded = buffer.toString('base64');
  if (useCache) {
    fontBase64Cache.set(fontMeta.key, encoded);
  }
  return encoded;
}

function buildFontCss(selectedFontMeta, encodedByFontKey) {
  return selectedFontMeta
    .map((fontMeta) => {
      const encoded = encodedByFontKey[fontMeta.key];
      return `@font-face {\n  font-family: '${fontMeta.family}';\n  src: url('data:font/ttf;base64,${encoded}') format('truetype');\n  font-weight: 100 900;\n  font-style: normal;\n}`;
    })
    .join('\n');
}

async function benchmarkOneRun({
  scenario,
  strategy,
  fontMetaMap,
  sampleImageDataUriBytes,
  runIndex,
}) {
  const isColdRun = runIndex === 0;
  if (isColdRun) {
    fontBase64Cache.clear();
    if (typeof global.gc === 'function') {
      global.gc();
    }
  }

  const memoryBefore = process.memoryUsage();
  const totalStart = performance.now();

  const selectStart = performance.now();
  const selectedKeys = selectFontKeys(strategy, scenario);
  const selectedFontMeta = selectedKeys.map((key) => fontMetaMap[key]);
  const selectMs = performance.now() - selectStart;

  const encodeStart = performance.now();
  const encodedList = await Promise.all(
    selectedFontMeta.map(async (fontMeta) => [fontMeta.key, await loadFontBase64(fontMeta, true)]),
  );
  const encodeMs = performance.now() - encodeStart;
  const encodedByFontKey = Object.fromEntries(encodedList);

  const cssStart = performance.now();
  const css = buildFontCss(selectedFontMeta, encodedByFontKey);
  const cssMs = performance.now() - cssStart;
  const cssBytes = Buffer.byteLength(css, 'utf8');

  const textPayload = `${scenario.reportName}\n${scenario.comment}`;
  const textBytes = Buffer.byteLength(textPayload, 'utf8');
  const photoBytes = scenario.photoCount * sampleImageDataUriBytes;
  const estimatedPdfInputBytes = BASE_TEMPLATE_BYTES + cssBytes + textBytes + photoBytes;

  const rawFontBytes = selectedFontMeta.reduce((sum, fontMeta) => sum + fontMeta.rawBytes, 0);
  const base64FontBytes = selectedFontMeta.reduce((sum, fontMeta) => sum + fontMeta.base64Bytes, 0);

  const totalMs = performance.now() - totalStart;
  const memoryAfter = process.memoryUsage();

  return {
    isColdRun,
    selectedFontKeys: selectedKeys,
    selectedFontFamilies: selectedFontMeta.map((fontMeta) => fontMeta.family),
    timingsMs: {
      total: round(totalMs, 3),
      select: round(selectMs, 3),
      encode: round(encodeMs, 3),
      css: round(cssMs, 3),
    },
    bytes: {
      rawFontBytes,
      base64FontBytes,
      cssBytes,
      textBytes,
      samplePhotoDataUriBytes: sampleImageDataUriBytes,
      estimatedPhotoBytes: photoBytes,
      estimatedPdfInputBytes,
    },
    memory: {
      heapUsedBefore: memoryBefore.heapUsed,
      heapUsedAfter: memoryAfter.heapUsed,
      rssBefore: memoryBefore.rss,
      rssAfter: memoryAfter.rss,
      rssDelta: memoryAfter.rss - memoryBefore.rss,
    },
  };
}

function summarizeRuns(runs) {
  if (runs.length === 0) {
    throw new Error('No benchmark runs found.');
  }

  const coldRun = runs.find((run) => run.isColdRun) ?? runs[0];
  const warmRuns = runs.filter((run) => !run.isColdRun);
  const warmTotal = warmRuns.map((run) => run.timingsMs.total);
  const warmEncode = warmRuns.map((run) => run.timingsMs.encode);

  return {
    selectedFontKeys: coldRun.selectedFontKeys,
    selectedFontFamilies: coldRun.selectedFontFamilies,
    bytes: coldRun.bytes,
    cold: {
      timingsMs: coldRun.timingsMs,
      rssDeltaMb: round(bytesToMb(coldRun.memory.rssDelta), 3),
    },
    warm: {
      runCount: warmRuns.length,
      totalMedianMs: round(median(warmTotal) ?? 0, 3),
      totalP90Ms: round(percentile(warmTotal, 90) ?? 0, 3),
      encodeMedianMs: round(median(warmEncode) ?? 0, 3),
      encodeP90Ms: round(percentile(warmEncode, 90) ?? 0, 3),
    },
  };
}

function buildMarkdown(report) {
  const lines = [];
  lines.push('# PDF Font Benchmark (Issue #72)');
  lines.push('');
  lines.push(`- Benchmarked at (UTC): ${report.benchmarkedAtUtc}`);
  lines.push(`- Node: ${report.environment.node}`);
  lines.push(`- Platform: ${report.environment.platform}/${report.environment.arch}`);
  lines.push(`- Iterations per scenario: ${report.settings.iterations}`);
  lines.push(`- Sample image: \`${report.settings.sampleImagePath}\``);
  lines.push(`- Sample image raw bytes: ${report.settings.sampleImageRawBytes}`);
  lines.push(`- Sample image data URI bytes: ${report.settings.sampleImageDataUriBytes}`);
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push(
    '| Scenario | Strategy | Fonts | Font payload (MB, base64) | Estimated PDF input (MB) | Cold total (ms) | Warm median (ms) |',
  );
  lines.push('| --- | --- | --- | ---: | ---: | ---: | ---: |');

  for (const scenario of report.scenarios) {
    for (const strategyName of ['all_fonts', 'script_subset']) {
      const strategy = scenario.results[strategyName];
      lines.push(
        `| ${scenario.label} | ${strategyName} | ${strategy.selectedFontKeys.length} | ${bytesToMb(strategy.bytes.base64FontBytes).toFixed(2)} | ${bytesToMb(strategy.bytes.estimatedPdfInputBytes).toFixed(2)} | ${strategy.cold.timingsMs.total.toFixed(2)} | ${strategy.warm.totalMedianMs.toFixed(2)} |`,
      );
    }
  }

  lines.push('');
  lines.push('## Delta (script_subset vs all_fonts)');
  lines.push('');
  lines.push('| Scenario | Font payload reduction | Estimated input reduction | Warm median speedup |');
  lines.push('| --- | ---: | ---: | ---: |');

  for (const scenario of report.scenarios) {
    const allFonts = scenario.results.all_fonts;
    const subset = scenario.results.script_subset;
    const payloadReduction =
      1 - subset.bytes.base64FontBytes / Math.max(1, allFonts.bytes.base64FontBytes);
    const inputReduction =
      1 - subset.bytes.estimatedPdfInputBytes / Math.max(1, allFonts.bytes.estimatedPdfInputBytes);
    const speedup =
      1 - subset.warm.totalMedianMs / Math.max(0.0001, allFonts.warm.totalMedianMs);

    lines.push(
      `| ${scenario.label} | ${toPercent(payloadReduction)} | ${toPercent(inputReduction)} | ${toPercent(speedup)} |`,
    );
  }

  lines.push('');
  lines.push('## Notes');
  lines.push('');
  lines.push('- This benchmark measures the font embedding path and estimated PDF input size.');
  lines.push('- Estimated size uses one fixed sample image payload for repeatability.');
  lines.push('- Real device PDF size/time still depends on actual photo content and native print engine behavior.');

  return lines.join('\n');
}

async function ensureParentDir(filePath) {
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printUsage();
    return;
  }

  const rootDir = process.cwd();
  const fontMetaMap = await readFontMetadata(rootDir);

  const sampleImageAbsolutePath = path.join(rootDir, args.sampleImagePath);
  const sampleImageStats = await fs.stat(sampleImageAbsolutePath);
  const sampleImageRawBytes = sampleImageStats.size;
  const sampleImageDataUriBytes =
    Buffer.byteLength(DATA_URI_PREFIX, 'utf8') + base64Length(sampleImageRawBytes);

  const report = {
    benchmarkedAtUtc: new Date().toISOString(),
    environment: {
      node: process.version,
      platform: process.platform,
      arch: process.arch,
    },
    settings: {
      iterations: args.iterations,
      sampleImagePath: args.sampleImagePath,
      sampleImageRawBytes,
      sampleImageDataUriBytes,
      baseTemplateBytes: BASE_TEMPLATE_BYTES,
    },
    scenarios: [],
  };

  for (const scenario of SCENARIOS) {
    const scenarioReport = {
      id: scenario.id,
      label: scenario.label,
      localeHint: scenario.localeHint,
      photoCount: scenario.photoCount,
      textLength: Array.from(`${scenario.reportName}\n${scenario.comment}`).length,
      results: {},
    };

    for (const strategyName of ['all_fonts', 'script_subset']) {
      const runs = [];
      for (let runIndex = 0; runIndex < args.iterations; runIndex += 1) {
        const runResult = await benchmarkOneRun({
          scenario,
          strategy: strategyName,
          fontMetaMap,
          sampleImageDataUriBytes,
          runIndex,
        });
        runs.push(runResult);
      }
      scenarioReport.results[strategyName] = summarizeRuns(runs);
    }

    report.scenarios.push(scenarioReport);
  }

  const markdown = buildMarkdown(report);

  if (args.write) {
    const outJsonPath = path.join(rootDir, args.outJsonPath);
    const outMarkdownPath = path.join(rootDir, args.outMarkdownPath);

    await ensureParentDir(outJsonPath);
    await ensureParentDir(outMarkdownPath);

    await fs.writeFile(outJsonPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
    await fs.writeFile(outMarkdownPath, `${markdown}\n`, 'utf8');
  }

  process.stdout.write(`${markdown}\n`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});

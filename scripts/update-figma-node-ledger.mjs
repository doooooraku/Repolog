#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const PRIORITY_ORDER = new Map([
  ['P0', 0],
  ['P1', 1],
  ['P2', 2],
  ['P3', 3],
]);

const DEFAULT_LEDGER_PATH = 'docs/reference/UI_Figma/screen_node_ledger.md';

const parseArgs = (argv) => {
  const args = {
    dryRun: false,
    ledgerPath: DEFAULT_LEDGER_PATH,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === '--') {
      continue;
    }
    if (token === '--dry-run') {
      args.dryRun = true;
      continue;
    }
    if (!token.startsWith('--')) {
      continue;
    }

    const key = token.slice(2);
    const value = argv[i + 1];
    if (!value || value.startsWith('--')) {
      throw new Error(`Missing value for --${key}`);
    }
    args[key] = value;
    i += 1;
  }

  return args;
};

const extractFromFigmaUrl = (rawUrl) => {
  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error('Invalid URL format.');
  }

  if (!parsed.hostname.includes('figma.com')) {
    throw new Error('URL host must be figma.com.');
  }

  const segments = parsed.pathname.split('/').filter(Boolean);
  const designIndex = segments.indexOf('design');
  if (designIndex < 0 || designIndex + 1 >= segments.length) {
    throw new Error('Could not extract fileKey from URL path.');
  }

  const fileKey = segments[designIndex + 1];
  const rawNodeId = parsed.searchParams.get('node-id');
  if (!rawNodeId) {
    throw new Error('URL must include node-id query parameter.');
  }

  const decodedNodeId = decodeURIComponent(rawNodeId);
  const normalizedNodeId = decodedNodeId.replace(/-/g, ':');

  return {
    fileKey,
    rawNodeId: decodedNodeId,
    normalizedNodeId,
  };
};

const parseTableRows = (markdown) => {
  const lines = markdown.split('\n');
  const rows = [];
  for (const line of lines) {
    if (!line.startsWith('|')) continue;
    if (line.includes('画面名') || line.includes('---')) continue;
    const columns = line
      .split('|')
      .slice(1, -1)
      .map((part) => part.trim());
    if (columns.length < 5) continue;
    rows.push({
      screenName: columns[0],
      nodeId: columns[1].replace(/^`+|`+$/g, ''),
      purpose: columns[2],
      priority: columns[3],
      updatedDate: columns[4],
    });
  }
  return rows;
};

const buildLedgerMarkdown = ({ fileKey, rows }) => {
  const today = new Date().toISOString().slice(0, 10);
  const header = [
    '# Figma Screen Node Ledger',
    '',
    `- fileKey: \`${fileKey}\``,
    `- updatedAt: ${today}`,
    '',
    '| 画面名 | node-id | 用途 | 優先度 | 更新日 |',
    '|---|---|---|---|---|',
  ];

  const body = rows.map(
    (row) =>
      `| ${row.screenName} | \`${row.nodeId}\` | ${row.purpose} | ${row.priority} | ${row.updatedDate} |`,
  );

  return `${header.concat(body).join('\n')}\n`;
};

const sortRows = (rows) =>
  rows.sort((a, b) => {
    const leftPriority = PRIORITY_ORDER.get(a.priority) ?? 99;
    const rightPriority = PRIORITY_ORDER.get(b.priority) ?? 99;
    if (leftPriority !== rightPriority) return leftPriority - rightPriority;
    return a.screenName.localeCompare(b.screenName, 'ja');
  });

const main = () => {
  const args = parseArgs(process.argv.slice(2));
  if (!args.url) {
    throw new Error('Usage: node scripts/update-figma-node-ledger.mjs --url <figma-url> [--screen <name>] [--purpose <text>] [--priority <P0|P1|P2|P3>] [--ledgerPath <path>] [--dry-run]');
  }

  const { fileKey, rawNodeId, normalizedNodeId } = extractFromFigmaUrl(args.url);
  const priority = (args.priority ?? 'P2').toUpperCase();
  if (!PRIORITY_ORDER.has(priority)) {
    throw new Error('priority must be one of P0, P1, P2, P3.');
  }

  const screenName = args.screen ?? `Screen ${normalizedNodeId}`;
  const purpose = args.purpose ?? '-';
  const updatedDate = new Date().toISOString().slice(0, 10);

  const ledgerPath = path.resolve(process.cwd(), args.ledgerPath);
  const currentMarkdown = fs.existsSync(ledgerPath)
    ? fs.readFileSync(ledgerPath, 'utf8')
    : '';

  const existingRows = currentMarkdown.length > 0 ? parseTableRows(currentMarkdown) : [];

  const rowIndex = existingRows.findIndex((row) => row.screenName === screenName);
  const nextRow = {
    screenName,
    nodeId: normalizedNodeId,
    purpose,
    priority,
    updatedDate,
  };

  if (rowIndex >= 0) {
    existingRows[rowIndex] = nextRow;
  } else {
    existingRows.push(nextRow);
  }

  const sortedRows = sortRows(existingRows);
  const nextMarkdown = buildLedgerMarkdown({ fileKey, rows: sortedRows });

  if (!args.dryRun) {
    fs.mkdirSync(path.dirname(ledgerPath), { recursive: true });
    fs.writeFileSync(ledgerPath, nextMarkdown, 'utf8');
  }

  process.stdout.write(
    [
      'Figma extraction result:',
      `- fileKey: ${fileKey}`,
      `- node-id(raw): ${rawNodeId}`,
      `- node-id(normalized): ${normalizedNodeId}`,
      `- ledgerPath: ${path.relative(process.cwd(), ledgerPath)}`,
      args.dryRun ? '- mode: dry-run (no write)' : '- mode: write',
    ].join('\n') + '\n',
  );
};

try {
  main();
} catch (error) {
  process.stderr.write(`Error: ${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(1);
}

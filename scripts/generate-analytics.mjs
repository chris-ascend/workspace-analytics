#!/usr/bin/env node
/**
 * Generates analytics.json from the workspace monorepo.
 * Run with: node scripts/generate-analytics.mjs
 */
import { execSync } from 'child_process';
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'fs';
import { join, extname, basename } from 'path';

const WORKSPACE = '/Users/chrisragobeer/development/dev/workspace';
const FRONTEND_FEATURES_DIR = join(WORKSPACE, 'apps/frontend/src/features');
const BACKEND_DOMAINS_DIR   = join(WORKSPACE, 'apps/backend/lib/workspacex');
const OUT = './public/data/analytics.json';

function run(cmd, cwd = WORKSPACE) {
  try {
    return execSync(cmd, { cwd, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
  } catch {
    return '';
  }
}

// ── Language mapping ──────────────────────────────────────────────────────────
const LANG_MAP = {
  '.ts': 'TypeScript', '.tsx': 'TypeScript (JSX)',
  '.js': 'JavaScript', '.jsx': 'JavaScript (JSX)',
  '.ex': 'Elixir', '.exs': 'Elixir Script',
  '.heex': 'HEEx', '.eex': 'EEx',
  '.css': 'CSS', '.scss': 'SCSS',
  '.json': 'JSON', '.yaml': 'YAML', '.yml': 'YAML',
  '.md': 'Markdown', '.sh': 'Shell',
  '.sql': 'SQL', '.graphql': 'GraphQL', '.gql': 'GraphQL',
  '.html': 'HTML', '.svg': 'SVG',
  '.py': 'Python', '.rb': 'Ruby',
};

// Source-code extensions only (for LOC counts in feature areas)
const CODE_EXTS = new Set([
  '.ts', '.tsx', '.js', '.jsx',
  '.ex', '.exs', '.heex', '.eex',
  '.css', '.scss', '.sql', '.graphql', '.gql',
  '.py', '.rb', '.sh',
]);

const EXCLUDED_DIRS = new Set([
  'node_modules', '_build', 'deps', '.git', 'dist', '.next',
  'coverage', '__pycache__', '.venv', 'priv/static', '.elixir_ls',
]);

// ── File walker ───────────────────────────────────────────────────────────────
function walkFiles(dir, files = []) {
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return files; }
  for (const e of entries) {
    if (EXCLUDED_DIRS.has(e.name)) continue;
    const full = join(dir, e.name);
    if (e.isDirectory()) walkFiles(full, files);
    else if (e.isFile()) files.push(full);
  }
  return files;
}

function countLinesInFiles(files) {
  let lines = 0;
  for (const f of files) {
    if (!CODE_EXTS.has(extname(f).toLowerCase())) continue;
    try { lines += readFileSync(f, 'utf8').split('\n').length; } catch {}
  }
  return lines;
}

// ── Global file stats ─────────────────────────────────────────────────────────
console.log('📂 Scanning files…');
const allFiles = walkFiles(WORKSPACE);

const langCounts = {};
const langLines = {};
let totalLines = 0;

for (const f of allFiles) {
  const ext = extname(f).toLowerCase();
  const lang = LANG_MAP[ext];
  if (!lang) continue;
  langCounts[lang] = (langCounts[lang] || 0) + 1;
  try {
    const content = readFileSync(f, 'utf8');
    const lines = content.split('\n').length;
    langLines[lang] = (langLines[lang] || 0) + lines;
    totalLines += lines;
  } catch { /* binary or unreadable */ }
}

// ── Frontend feature areas ────────────────────────────────────────────────────
console.log('🎨 Analyzing frontend feature areas…');

// Human-readable display names
const FEATURE_LABELS = {
  prepareTaxWorksheets: 'Prepare Tax Worksheets',
  pbc:                  'PBC',
  vision:               'Vision (CRM)',
  entityTax:            'Entity Tax',
  questionnaire:        'Questionnaire',
  dataReview:           'Data Review',
  agent:                'Agent',
  projects:             'Projects',
  clientPortal:         'Client Portal',
  clientDetails:        'Client Details',
  clientGroup:          'Client Group',
  clientList:           'Client List',
  bor:                  'BOR',
  dataCleaning:         'Data Cleaning',
  commandPalette:       'Command Palette',
  taxDelivery:          'Tax Delivery',
  taxAdvisory:          'Tax Advisory',
  k1Matching:           'K-1 Matching',
  re_engagement:        'Re-engagement',
  'engagement-letters': 'Engagement Letters',
  'questionnaire-v2':   'Questionnaire v2',
  complianceCheck:      'Compliance Check',
  notifications:        'Notifications',
  firms:                'Firms',
  search:               'Search',
  taskPortal:           'Task Portal',
  confidentialLeaders:  'Confidential Leaders',
  changelog:            'Changelog',
  featurebase:          'Featurebase',
  review:               'Review',
};

function analyzeFeatureDir(baseDir, layer) {
  const results = [];
  let entries;
  try { entries = readdirSync(baseDir, { withFileTypes: true }); } catch { return results; }
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    const full = join(baseDir, e.name);
    const files = walkFiles(full);
    const codeFiles = files.filter(f => CODE_EXTS.has(extname(f).toLowerCase()));
    const lines = countLinesInFiles(files);
    const label = FEATURE_LABELS[e.name] ?? e.name;
    results.push({
      key: e.name,
      label,
      layer,
      files: codeFiles.length,
      lines,
    });
  }
  return results.sort((a, b) => b.lines - a.lines);
}

const frontendFeatures = analyzeFeatureDir(FRONTEND_FEATURES_DIR, 'frontend');

// ── Backend domain areas ──────────────────────────────────────────────────────
console.log('⚙️  Analyzing backend domain areas…');

const DOMAIN_LABELS = {
  tax:        'Tax',
  cbor:       'CBOR',
  agentic:    'Agentic',
  compliance: 'Compliance',
  teams:      'Teams',
  databricks: 'Databricks',
  eval:       'Eval',
  broadway:   'Broadway',
  crm:        'CRM',
  llms:       'LLMs',
  knuula:     'Knuula',
  core:       'Core',
  mappers:    'Mappers',
  integrations: 'Integrations',
  fireflies:  'Fireflies',
  pdf:        'PDF',
  notes:      'Notes',
  s3:         'S3',
  scripts:    'Scripts',
  services:   'Services',
  audit:      'Audit',
  boldsign:   'BoldSign',
  email:      'Email',
  sns:        'SNS',
  auth:       'Auth',
  repo:       'Repo',
  notifications: 'Notifications',
  changelog:  'Changelog',
  github:     'GitHub',
  logging:    'Logging',
  cache:      'Cache',
};

const backendDomains = analyzeFeatureDir(BACKEND_DOMAINS_DIR, 'backend');
// Apply label overrides
for (const d of backendDomains) {
  d.label = DOMAIN_LABELS[d.key] ?? d.label;
}

// ── Git stats ─────────────────────────────────────────────────────────────────
console.log('📜 Reading git history…');

// Commits per day (last 90 days)
const sinceDate = new Date();
sinceDate.setDate(sinceDate.getDate() - 90);
const since = sinceDate.toISOString().split('T')[0];

const logRaw = run('git log -n 3000 --format="%ad" --date=short --no-merges');
const commitsByDay = {};
for (const line of logRaw.split('\n').filter(Boolean)) {
  if (line >= since) commitsByDay[line] = (commitsByDay[line] || 0) + 1;
}
const commitTimeline = [];
const cursor = new Date(since);
const today = new Date();
while (cursor <= today) {
  const key = cursor.toISOString().split('T')[0];
  commitTimeline.push({ date: key, commits: commitsByDay[key] || 0 });
  cursor.setDate(cursor.getDate() + 1);
}

// Total commits
const totalCommits = parseInt(run('git rev-list --count HEAD --no-merges') || '0', 10);

// Most changed files (last 500 commits) — enriched with feature area
const changedRaw = run('git log -500 --name-only --format="" --no-merges');
const fileCounts = {};
for (const line of changedRaw.split('\n').filter(Boolean)) {
  fileCounts[line] = (fileCounts[line] || 0) + 1;
}

function resolveFeatureArea(filePath) {
  // Frontend feature
  const fmatch = filePath.match(/apps\/frontend\/src\/features\/([^/]+)/);
  if (fmatch) {
    const key = fmatch[1];
    return FEATURE_LABELS[key] ?? key;
  }
  // Backend domain
  const bmatch = filePath.match(/apps\/backend\/lib\/workspacex\/([^/]+)/);
  if (bmatch) {
    const key = bmatch[1];
    return DOMAIN_LABELS[key] ?? key;
  }
  return null;
}

const hotFiles = Object.entries(fileCounts)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 20)
  .map(([file, changes]) => ({
    file: basename(file),
    path: file,
    changes,
    area: resolveFeatureArea(file),
  }));

// Recent commits
const recentRaw = run('git log --format="%H|%s|%an|%ad" --date=short --no-merges -30');
const recentCommits = recentRaw
  .split('\n')
  .filter(Boolean)
  .map(line => {
    const [hash, subject, author, date] = line.split('|');
    return { hash: hash?.slice(0, 7), subject, author, date };
  });

// Commit breakdown by day-of-week (last 2000 commits)
const dowRaw = run('git log -2000 --format="%ad" --date=format:"%u" --no-merges');
const dowCounts = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, '7': 0 };
for (const d of dowRaw.split('\n').filter(Boolean)) {
  if (dowCounts[d] !== undefined) dowCounts[d]++;
}
const dayNames = ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const commitsByDow = Object.entries(dowCounts).map(([d, count]) => ({
  day: dayNames[parseInt(d)],
  commits: count,
}));

// ── Language chart data ───────────────────────────────────────────────────────
const languageStats = Object.entries(langCounts)
  .map(([lang, files]) => ({ lang, files, lines: langLines[lang] || 0 }))
  .sort((a, b) => b.lines - a.lines)
  .slice(0, 12);

// ── Summary ───────────────────────────────────────────────────────────────────
const totalFeatureLines = frontendFeatures.reduce((s, f) => s + f.lines, 0);
const totalDomainLines  = backendDomains.reduce((s, d) => s + d.lines, 0);

const analytics = {
  generatedAt: new Date().toISOString(),
  workspace: WORKSPACE,
  summary: {
    totalFiles: allFiles.length,
    totalLines,
    totalCommits,
    frontendFeatures: frontendFeatures.length,
    backendDomains: backendDomains.length,
  },
  languageStats,
  frontendFeatures,
  backendDomains,
  commitTimeline,
  hotFiles,
  recentCommits,
  commitsByDow,
  totals: {
    frontendLines: totalFeatureLines,
    backendLines: totalDomainLines,
  },
};

if (!existsSync('./public/data')) mkdirSync('./public/data', { recursive: true });
writeFileSync(OUT, JSON.stringify(analytics, null, 2));
console.log(`✅ Analytics written to ${OUT}`);
console.log(`   Files: ${analytics.summary.totalFiles.toLocaleString()}`);
console.log(`   Lines: ${analytics.summary.totalLines.toLocaleString()}`);
console.log(`   Commits: ${analytics.summary.totalCommits.toLocaleString()}`);
console.log(`   Frontend features: ${frontendFeatures.length}`);
console.log(`   Backend domains: ${backendDomains.length}`);

#!/usr/bin/env node
/**
 * Generates analytics.json from the workspace monorepo.
 * Run with: node scripts/generate-analytics.mjs
 */
import { execSync } from 'child_process';
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'fs';
import { join, extname, basename } from 'path';

const WORKSPACE             = '/Users/chrisragobeer/development/dev/workspace';
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

// ── Display labels ────────────────────────────────────────────────────────────
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
  're-engagement':      'Re-engagement',
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

const DOMAIN_LABELS = {
  tax:          'Tax',       cbor:       'CBOR',
  agentic:      'Agentic',   compliance: 'Compliance',
  teams:        'Teams',     databricks: 'Databricks',
  eval:         'Eval',      broadway:   'Broadway',
  crm:          'CRM',       llms:       'LLMs',
  knuula:       'Knuula',    core:       'Core',
  mappers:      'Mappers',   integrations:'Integrations',
  fireflies:    'Fireflies', pdf:        'PDF',
  notes:        'Notes',     s3:         'S3',
  scripts:      'Scripts',   services:   'Services',
  audit:        'Audit',     boldsign:   'BoldSign',
  email:        'Email',     sns:        'SNS',
  auth:         'Auth',      repo:       'Repo',
  notifications:'Notifications', changelog: 'Changelog',
  github:       'GitHub',    logging:    'Logging',
  cache:        'Cache',     ecto_types: 'Ecto Types',
  email_verification: 'Email Verification',
};

// ── Product buckets (for investment allocation) ───────────────────────────────
// Keys match directory names, not display labels.
const PRODUCT_BUCKETS = {
  'Tax Workflows': {
    color: '#3b82f6',
    frontend: ['prepareTaxWorksheets', 'entityTax', 'pbc', 'questionnaire', 'questionnaire-v2',
               'k1Matching', 'taxAdvisory', 'taxDelivery', 'dataReview', 'dataCleaning',
               'bor', 'engagement-letters', 'complianceCheck'],
    backend:  ['tax', 'cbor', 'compliance'],
  },
  'AI / Agent': {
    color: '#8b5cf6',
    frontend: ['agent'],
    backend:  ['agentic', 'llms', 'eval', 'databricks'],
  },
  'CRM': {
    color: '#06b6d4',
    frontend: ['vision', 'clientDetails', 'clientGroup', 'clientList'],
    backend:  ['crm'],
  },
  'Client Tools': {
    color: '#10b981',
    frontend: ['clientPortal', 'taskPortal', 're-engagement', 'notifications',
               'review', 'featurebase'],
    backend:  ['knuula', 'boldsign', 'fireflies'],
  },
  'Projects': {
    color: '#f59e0b',
    frontend: ['projects'],
    backend:  [],
  },
  'Platform / Infra': {
    color: '#6b7280',
    frontend: ['commandPalette', 'search', 'firms', 'changelog', 'confidentialLeaders'],
    backend:  ['teams', 'broadway', 'auth', 'email', 'email_verification', 's3', 'pdf',
               'integrations', 'github', 'core', 'mappers', 'services', 'audit', 'notes',
               'sns', 'cache', 'logging', 'repo', 'ecto_types', 'scripts'],
  },
};

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
  } catch {}
}

// ── Feature area LOC scan ─────────────────────────────────────────────────────
console.log('🎨 Analyzing feature areas…');
function analyzeFeatureDir(baseDir, layer, labelMap) {
  const results = [];
  let entries;
  try { entries = readdirSync(baseDir, { withFileTypes: true }); } catch { return results; }
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    const full = join(baseDir, e.name);
    const files = walkFiles(full);
    const codeFiles = files.filter(f => CODE_EXTS.has(extname(f).toLowerCase()));
    const lines = countLinesInFiles(files);
    results.push({
      key: e.name,
      label: labelMap[e.name] ?? e.name,
      layer,
      files: codeFiles.length,
      lines,
      recentCommits: 0,   // filled in below
      weeklyCommits: new Array(12).fill(0),
      activityState: 'dormant',
    });
  }
  return results;
}

const frontendFeatures = analyzeFeatureDir(FRONTEND_FEATURES_DIR, 'frontend', FEATURE_LABELS);
const backendDomains   = analyzeFeatureDir(BACKEND_DOMAINS_DIR, 'backend', DOMAIN_LABELS);

// Build lookup: layer:key → area object
const areaLookup = new Map();
for (const a of [...frontendFeatures, ...backendDomains]) {
  areaLookup.set(`${a.layer}:${a.key}`, a);
}

// ── Path → area resolver ──────────────────────────────────────────────────────
function resolveAreaRef(filePath) {
  const fm = filePath.match(/apps\/frontend\/src\/features\/([^/]+)/);
  if (fm) return { layer: 'frontend', key: fm[1] };
  const bm = filePath.match(/apps\/backend\/lib\/workspacex\/([^/]+)/);
  if (bm) return { layer: 'backend', key: bm[1] };
  return null;
}

function resolveAreaLabel(filePath) {
  const ref = resolveAreaRef(filePath);
  if (!ref) return null;
  const area = areaLookup.get(`${ref.layer}:${ref.key}`);
  return area?.label ?? null;
}

// ── Git commit history — per-area path-filtered queries ──────────────────────
console.log('📜 Reading git history (per-area)…');

const WEEKS = 12;
const now = new Date();
const windowStart = new Date(now);
windowStart.setDate(windowStart.getDate() - WEEKS * 7);

const since30Str  = new Date(now); since30Str.setDate(since30Str.getDate() - 30);
const sincePrevStr = new Date(now); sincePrevStr.setDate(sincePrevStr.getDate() - 60);

// ISO date string for comparison (lexicographic works for YYYY-MM-DD)
const since30Date  = since30Str.toISOString().slice(0, 10);
const sincePrevDate = sincePrevStr.toISOString().slice(0, 10);

// Build week labels
const weekLabels = [];
for (let w = 0; w < WEEKS; w++) {
  const d = new Date(windowStart);
  d.setDate(d.getDate() + w * 7);
  weekLabels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
}

// Week index from an ISO date string
function getWeekIndex(dateStr) {
  const msPerWeek = 1000 * 60 * 60 * 24 * 7;
  const d = new Date(dateStr + 'T12:00:00Z'); // noon UTC to avoid DST edge cases
  const ws = new Date(windowStart.toISOString().slice(0, 10) + 'T12:00:00Z');
  return Math.floor((d - ws) / msPerWeek);
}

// Per-area git log (path-filtered — guaranteed accurate for merged histories)
const allAreasList = [...frontendFeatures, ...backendDomains];
for (const area of allAreasList) {
  const dirPath = area.layer === 'frontend'
    ? `apps/frontend/src/features/${area.key}`
    : `apps/backend/lib/workspacex/${area.key}`;

  // Get last 500 commit dates for this area (fast, path-scoped)
  const dates = run(`git log --format="%ad" --date=short -500 -- "${dirPath}/"`)
    .split('\n').filter(Boolean);

  let recent = 0;
  let prev = 0;
  for (const d of dates) {
    const wi = getWeekIndex(d);
    if (wi >= 0 && wi < WEEKS) area.weeklyCommits[wi]++;
    if (d >= since30Date) recent++;
    else if (d >= sincePrevDate) prev++;
  }
  area.recentCommits = recent;
  area.prevCommits   = prev;
}

// Activity state
for (const area of allAreasList) {
  if (area.recentCommits >= 8)      area.activityState = 'active';
  else if (area.recentCommits >= 1) area.activityState = 'maintenance';
  else                              area.activityState = 'dormant';
}

// Sort by recent activity
frontendFeatures.sort((a, b) => b.recentCommits - a.recentCommits || b.lines - a.lines);
backendDomains.sort((a, b) => b.recentCommits - a.recentCommits || b.lines - a.lines);

// ── "Where We're Building" — top areas by recent commits ─────────────────────
const allAreas = [...frontendFeatures, ...backendDomains];
const whereWeAreBuilding = allAreas
  .filter(a => a.recentCommits > 0)
  .sort((a, b) => b.recentCommits - a.recentCommits)
  .slice(0, 20)
  .map(a => ({ label: a.label, layer: a.layer, recentCommits: a.recentCommits }));

const commitsLast30 = allAreas.reduce((s, a) => s + a.recentCommits, 0);
const commitsPrev30 = allAreas.reduce((s, a) => s + (a.prevCommits ?? 0), 0);

// ── Investment allocation (by product bucket) ─────────────────────────────────
const bucketCommits = {};
for (const [bucket, { color, frontend, backend }] of Object.entries(PRODUCT_BUCKETS)) {
  let commits = 0;
  for (const key of frontend) {
    const a = areaLookup.get(`frontend:${key}`);
    if (a) commits += a.recentCommits;
  }
  for (const key of backend) {
    const a = areaLookup.get(`backend:${key}`);
    if (a) commits += a.recentCommits;
  }
  bucketCommits[bucket] = { commits, color };
}
const totalBucketCommits = Object.values(bucketCommits).reduce((s, b) => s + b.commits, 0) || 1;
const investmentAllocation = Object.entries(bucketCommits)
  .map(([bucket, { commits, color }]) => ({
    bucket,
    commits,
    color,
    pct: Math.round((commits / totalBucketCommits) * 100),
  }))
  .sort((a, b) => b.commits - a.commits);

// ── Commit timeline (90 days, daily) ─────────────────────────────────────────
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

// Most changed files (last 500 commits)
const changedRaw = run('git log -500 --name-only --format="" --no-merges');
const fileCounts = {};
for (const line of changedRaw.split('\n').filter(Boolean)) {
  fileCounts[line] = (fileCounts[line] || 0) + 1;
}
const hotFiles = Object.entries(fileCounts)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 20)
  .map(([file, changes]) => ({
    file: basename(file),
    path: file,
    changes,
    area: resolveAreaLabel(file),
  }));

// Recent commits
const recentRaw = run('git log --format="%H|%s|%an|%ad" --date=short --no-merges -30');
const recentCommits = recentRaw
  .split('\n').filter(Boolean)
  .map(line => {
    const [hash, subject, author, date] = line.split('|');
    return { hash: hash?.slice(0, 7), subject, author, date };
  });

// Day of week
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

// Language stats
const languageStats = Object.entries(langCounts)
  .map(([lang, files]) => ({ lang, files, lines: langLines[lang] || 0 }))
  .sort((a, b) => b.lines - a.lines)
  .slice(0, 12);

// Active area count
const activeAreas = allAreas.filter(a => a.activityState === 'active').length;

// Clean internal-only fields before output
for (const a of allAreasList) delete a.prevCommits;

// Sorted by LOC for the size panels
const frontendByLOC = [...frontendFeatures].sort((a, b) => b.lines - a.lines);
const backendByLOC  = [...backendDomains].sort((a, b) => b.lines - a.lines);

// ── Output ────────────────────────────────────────────────────────────────────
const analytics = {
  generatedAt: new Date().toISOString(),
  workspace: WORKSPACE,
  summary: {
    totalFiles: allFiles.length,
    totalLines,
    totalCommits,
    frontendFeatures: frontendFeatures.length,
    backendDomains: backendDomains.length,
    activeAreas,
    commitsLast30,
    commitsPrev30,
  },
  totals: {
    frontendLines: frontendByLOC.reduce((s, f) => s + f.lines, 0),
    backendLines: backendByLOC.reduce((s, d) => s + d.lines, 0),
  },
  weekLabels,
  whereWeAreBuilding,
  investmentAllocation,
  // Activity-sorted (for heatmap + exec view)
  frontendFeatures,
  backendDomains,
  // LOC-sorted (for size panels)
  frontendByLOC,
  backendByLOC,
  languageStats,
  commitTimeline,
  hotFiles,
  recentCommits,
  commitsByDow,
};

if (!existsSync('./public/data')) mkdirSync('./public/data', { recursive: true });
writeFileSync(OUT, JSON.stringify(analytics, null, 2));
console.log(`✅ Analytics written to ${OUT}`);
console.log(`   Files: ${analytics.summary.totalFiles.toLocaleString()}`);
console.log(`   Lines: ${analytics.summary.totalLines.toLocaleString()}`);
console.log(`   Commits: ${analytics.summary.totalCommits.toLocaleString()}`);
console.log(`   Active areas: ${activeAreas}`);
console.log(`   Commits last 30d: ${commitsLast30} (prev 30d: ${commitsPrev30})`);
console.log(`   Frontend features: ${frontendFeatures.length} | Backend domains: ${backendDomains.length}`);

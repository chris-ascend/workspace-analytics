#!/usr/bin/env node
/**
 * Generates analytics.json from the workspace monorepo.
 * Run with: node scripts/generate-analytics.mjs
 */
import { execSync } from 'child_process';
import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync, existsSync } from 'fs';
import { join, extname, basename } from 'path';

const WORKSPACE = '/Users/chrisragobeer/development/dev/workspace';
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

// ── File stats ────────────────────────────────────────────────────────────────
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

// ── App / package breakdown ───────────────────────────────────────────────────
const appsDir = join(WORKSPACE, 'apps');
const packagesDir = join(WORKSPACE, 'packages');

function analyzeDir(baseDir, type) {
  const results = [];
  let entries;
  try { entries = readdirSync(baseDir, { withFileTypes: true }); } catch { return results; }
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    const full = join(baseDir, e.name);
    const files = walkFiles(full);
    const tsFiles = files.filter(f => ['.ts', '.tsx'].includes(extname(f))).length;
    const exFiles = files.filter(f => ['.ex', '.exs'].includes(extname(f))).length;
    let lines = 0;
    for (const f of files) {
      const ext = extname(f).toLowerCase();
      if (!LANG_MAP[ext]) continue;
      try { lines += readFileSync(f, 'utf8').split('\n').length; } catch {}
    }
    results.push({ name: e.name, type, files: files.length, tsFiles, exFiles, lines });
  }
  return results;
}

console.log('📦 Analyzing apps & packages…');
const apps = analyzeDir(appsDir, 'app');
const packages = analyzeDir(packagesDir, 'package');
const modules = [...apps, ...packages].sort((a, b) => b.lines - a.lines);

// ── Git stats ─────────────────────────────────────────────────────────────────
console.log('📜 Reading git history…');

// Commits per day (last 90 days) — use -n 2000 to avoid full-repo scan hanging
const sinceDate = new Date();
sinceDate.setDate(sinceDate.getDate() - 90);
const since = sinceDate.toISOString().split('T')[0];

const logRaw = run(
  `git log -n 3000 --format="%ad" --date=short --no-merges`,
);
const commitsByDay = {};
for (const line of logRaw.split('\n').filter(Boolean)) {
  if (line >= since) commitsByDay[line] = (commitsByDay[line] || 0) + 1;
}
// Fill gaps for the 90-day window
const commitTimeline = [];
const cursor = new Date(since);
const today = new Date();
while (cursor <= today) {
  const key = cursor.toISOString().split('T')[0];
  commitTimeline.push({ date: key, commits: commitsByDay[key] || 0 });
  cursor.setDate(cursor.getDate() + 1);
}

// Top contributors from last 1000 commits (no merges) — avoids full-repo scan timeout
const contribRaw = run('git log --format="%an" --no-merges -1000');
const contribMap = {};
for (const name of contribRaw.split('\n').filter(Boolean)) {
  contribMap[name] = (contribMap[name] || 0) + 1;
}
const contributors = Object.entries(contribMap)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 15)
  .map(([name, commits]) => ({ name, commits }));

// Total commits (last 180 days to keep it fast; fallback to full if quick)
const totalCommits = parseInt(run('git rev-list --count HEAD --no-merges') || '0', 10);

// Most changed files (last 500 commits, no merges)
const changedRaw = run(
  `git log -500 --name-only --format="" --no-merges`,
);
const fileCounts = {};
for (const line of changedRaw.split('\n').filter(Boolean)) {
  fileCounts[line] = (fileCounts[line] || 0) + 1;
}
const hotFiles = Object.entries(fileCounts)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 20)
  .map(([file, changes]) => ({ file: basename(file), path: file, changes }));

// Recent commits
const recentRaw = run(
  'git log --format="%H|%s|%an|%ad" --date=short --no-merges -30',
);
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
const analytics = {
  generatedAt: new Date().toISOString(),
  workspace: WORKSPACE,
  summary: {
    totalFiles: allFiles.length,
    totalLines,
    totalCommits,
    topLanguage: languageStats[0]?.lang || 'Unknown',
    contributors: contributors.length || 0,
    apps: apps.length,
    packages: packages.length,
  },
  languageStats,
  modules,
  commitTimeline,
  contributors,
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

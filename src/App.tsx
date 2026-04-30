import { useAnalytics } from './hooks/useAnalytics'
import { StatCard } from './components/StatCard'
import { AreaActivityBar } from './components/AreaActivityBar'
import { InvestmentDonut } from './components/InvestmentDonut'
import { VelocityHeatmap } from './components/VelocityHeatmap'
import { FeatureAreaChart } from './components/FeatureAreaChart'
import { CommitTimeline } from './components/CommitTimeline'
import { LanguageChart } from './components/LanguageChart'
import { HotFiles } from './components/HotFiles'
import { RecentCommits } from './components/RecentCommits'
import { DowChart } from './components/DowChart'

function fmtNum(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return n.toLocaleString()
}

function delta(curr: number, prev: number) {
  if (!prev) return null
  return Math.round(((curr - prev) / prev) * 100)
}

function GitIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M13 6h3a2 2 0 0 1 2 2v7"/><path d="M11 18H8a2 2 0 0 1-2-2V9"/></svg>
}
function FileIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
}
function LinesIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
}
function ZapIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
}
function ActivityIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
}
function RefreshIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-950">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400 text-sm">Loading analytics…</p>
      </div>
    </div>
  )
}

function SectionLabel({ children }: { children: string }) {
  return (
    <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">
      {children}
    </h2>
  )
}

export default function App() {
  const { data, loading, error } = useAnalytics()

  if (loading) return <LoadingSpinner />

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-950">
        <div className="text-center max-w-sm">
          <p className="text-red-400 text-sm font-medium mb-2">Failed to load analytics data</p>
          <p className="text-gray-500 text-xs">{error ?? 'data/analytics.json not found'}</p>
          <p className="text-gray-600 text-xs mt-4">Run <code className="text-blue-400">npm run generate</code> to generate data.</p>
        </div>
      </div>
    )
  }

  const {
    summary, totals, weekLabels,
    whereWeAreBuilding, investmentAllocation,
    frontendFeatures, backendDomains, frontendByLOC, backendByLOC,
    languageStats, commitTimeline, hotFiles, recentCommits, commitsByDow,
  } = data

  const velocityDelta = delta(summary.commitsLast30, summary.commitsPrev30)

  const generatedDate = new Date(data.generatedAt).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <h1 className="text-base font-bold text-white tracking-tight">workspace-analytics</h1>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{data.workspace}</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <RefreshIcon />
            <span>Generated {generatedDate}</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard
            label="Commits Last 30d"
            value={summary.commitsLast30.toLocaleString()}
            sub={velocityDelta !== null
              ? `${velocityDelta >= 0 ? '▲' : '▼'} ${Math.abs(velocityDelta)}% vs prev 30d`
              : undefined}
            icon={<ZapIcon />}
            accent={velocityDelta !== null && velocityDelta < 0 ? 'text-red-400' : 'text-green-400'}
          />
          <StatCard
            label="Active Areas"
            value={summary.activeAreas}
            sub={`of ${summary.frontendFeatures + summary.backendDomains} total`}
            icon={<ActivityIcon />}
            accent="text-yellow-400"
          />
          <StatCard
            label="Total Commits"
            value={fmtNum(summary.totalCommits)}
            icon={<GitIcon />}
            accent="text-blue-400"
          />
          <StatCard
            label="Lines of Code"
            value={fmtNum(summary.totalLines)}
            sub={`FE ${fmtNum(totals.frontendLines)} · BE ${fmtNum(totals.backendLines)}`}
            icon={<LinesIcon />}
            accent="text-cyan-400"
          />
          <StatCard
            label="Total Files"
            value={fmtNum(summary.totalFiles)}
            icon={<FileIcon />}
            accent="text-purple-400"
          />
        </div>

        {/* ── Where We're Building ── */}
        <section>
          <SectionLabel>Where We're Building</SectionLabel>
          <AreaActivityBar data={whereWeAreBuilding} />
        </section>

        {/* ── Investment Allocation + Velocity Heatmap ── */}
        <section>
          <SectionLabel>Investment & Velocity</SectionLabel>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-2">
              <InvestmentDonut
                data={investmentAllocation}
                commitsLast30={summary.commitsLast30}
                commitsPrev30={summary.commitsPrev30}
              />
            </div>
            <div className="lg:col-span-3">
              <VelocityHeatmap
                frontendFeatures={frontendFeatures}
                backendDomains={backendDomains}
                weekLabels={weekLabels}
              />
            </div>
          </div>
        </section>

        {/* ── Feature Areas (by codebase size) ── */}
        <section>
          <SectionLabel>Codebase Size by Feature Area</SectionLabel>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FeatureAreaChart
              data={frontendByLOC}
              title="Frontend Features"
              sub="apps/frontend/src/features — sorted by lines of code"
              accentColor="bg-blue-500"
              accentText="text-blue-400"
              badgeClass="bg-blue-500/10 text-blue-400 border border-blue-500/20"
            />
            <FeatureAreaChart
              data={backendByLOC}
              title="Backend Domains"
              sub="apps/backend/lib/workspacex — sorted by lines of code"
              accentColor="bg-purple-500"
              accentText="text-purple-400"
              badgeClass="bg-purple-500/10 text-purple-400 border border-purple-500/20"
            />
          </div>
        </section>

        {/* ── Recent Activity ── */}
        <section>
          <SectionLabel>Recent Activity</SectionLabel>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <HotFiles data={hotFiles} />
            <RecentCommits data={recentCommits} />
          </div>
        </section>

        {/* ── Technical ── */}
        <section>
          <SectionLabel>Technical</SectionLabel>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3">
              <CommitTimeline data={commitTimeline} />
            </div>
            <div className="lg:col-span-2 space-y-6">
              <LanguageChart data={languageStats} />
              <DowChart data={commitsByDow} />
            </div>
          </div>
        </section>

      </main>

      <footer className="border-t border-gray-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 text-center">
          <p className="text-xs text-gray-600">
            workspace-analytics · regenerate with <code className="text-gray-500">npm run generate</code>
          </p>
        </div>
      </footer>
    </div>
  )
}

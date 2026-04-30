import type { FeatureArea } from '../types'
import { SectionHeader } from './SectionHeader'

interface Props {
  frontendFeatures: FeatureArea[]
  backendDomains: FeatureArea[]
}

const STATE_CONFIG = [
  {
    state: 'active',
    label: 'Active',
    color: '#10b981',
    bg: 'bg-emerald-500',
    text: 'text-emerald-700',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    def: '8+ commits / 30d',
  },
  {
    state: 'maintenance',
    label: 'Maintenance',
    color: '#f59e0b',
    bg: 'bg-amber-400',
    text: 'text-amber-600',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    def: '1–7 commits / 30d',
  },
  {
    state: 'dormant',
    label: 'Dormant',
    color: '#d1d5db',
    bg: 'bg-gray-300',
    text: 'text-gray-400',
    badge: 'bg-gray-50 text-gray-500 border-gray-200',
    def: '0 commits / 30d',
  },
]

export function FocusRatio({ frontendFeatures, backendDomains }: Props) {
  const all = [...frontendFeatures, ...backendDomains]
  const total = all.length

  const states = STATE_CONFIG.map(cfg => ({
    ...cfg,
    areas: all.filter(a => a.activityState === cfg.state),
    count: all.filter(a => a.activityState === cfg.state).length,
    pct: total ? Math.round((all.filter(a => a.activityState === cfg.state).length / total) * 100) : 0,
  }))

  // Top active area labels (up to 4)
  const activeAreas = states[0].areas
    .sort((a, b) => b.recentCommits - a.recentCommits)
    .slice(0, 4)

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col">
      <SectionHeader
        title="Engineering Focus"
        sub="How effort is distributed across tracked areas"
      />

      {/* Three big numbers */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {states.map(({ state, label, count, pct, text, badge }) => (
          <div key={state} className={`rounded-lg border px-3 py-2.5 text-center ${badge}`}>
            <p className={`text-2xl font-bold ${text}`}>{count}</p>
            <p className="text-[11px] font-semibold mt-0.5">{label}</p>
            <p className="text-[10px] opacity-70 mt-0.5">{pct}%</p>
          </div>
        ))}
      </div>

      {/* Stacked bar */}
      <div className="h-2 rounded-full overflow-hidden flex gap-px mb-4">
        {states.map(({ state, bg, pct }) =>
          pct > 0 ? (
            <div
              key={state}
              className={`${bg} h-full`}
              style={{ width: `${pct}%` }}
              title={`${state}: ${pct}%`}
            />
          ) : null
        )}
      </div>

      {/* Most active areas */}
      {activeAreas.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold text-ascend-muted uppercase tracking-widest mb-2">
            Most active right now
          </p>
          <div className="flex flex-wrap gap-1.5">
            {activeAreas.map(a => (
              <span
                key={a.key}
                className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium"
              >
                {a.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Legend definitions */}
      <div className="flex items-center gap-3 mt-auto pt-3 border-t border-gray-100 mt-4">
        {states.map(({ state, label, color, def }) => (
          <div key={state} className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }} />
            <span className="text-[10px] text-gray-400">{label} = {def}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import type { FeatureArea } from '../types'
import { SectionHeader } from './SectionHeader'

interface Props {
  frontendFeatures: FeatureArea[]
  backendDomains: FeatureArea[]
}

const STATE_CONFIG = [
  { state: 'active',      label: 'Active',      color: '#10b981', bg: 'bg-emerald-500' },
  { state: 'maintenance', label: 'Maintenance', color: '#f59e0b', bg: 'bg-amber-400'  },
  { state: 'dormant',     label: 'Dormant',     color: '#d1d5db', bg: 'bg-gray-300'   },
]

export function FocusRatio({ frontendFeatures, backendDomains }: Props) {
  const all = [...frontendFeatures, ...backendDomains]
  const total = all.length

  const counts = STATE_CONFIG.map(({ state, label, color }) => ({
    name: label,
    value: all.filter(a => a.activityState === state).length,
    color,
    pct: total ? Math.round((all.filter(a => a.activityState === state).length / total) * 100) : 0,
  }))

  const activeCount = counts[0].value
  const focusScore = total ? Math.round((activeCount / total) * 100) : 0

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col">
      <SectionHeader
        title="Team Focus"
        sub="Active vs. maintenance vs. dormant areas"
      />

      <div className="flex items-center gap-6 flex-1">
        {/* Donut */}
        <div className="w-32 h-32 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={counts}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={60}
                dataKey="value"
                strokeWidth={0}
                paddingAngle={2}
              >
                {counts.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8 }}
                formatter={(v, name) => [`${v} areas`, name]}
                itemStyle={{ color: '#102556', fontSize: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend + focus score */}
        <div className="flex-1 min-w-0">
          {/* Focus score */}
          <div className="mb-3">
            <span className="text-3xl font-bold text-ascend-navy">{focusScore}%</span>
            <span className="text-xs text-ascend-muted ml-2">focused</span>
          </div>

          <div className="space-y-2">
            {counts.map(({ name, value, color, pct }) => (
              <div key={name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                  <span className="text-xs text-ascend-muted">{name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-ascend-navy">{value}</span>
                  <span className="text-[10px] text-gray-400 w-8 text-right">{pct}%</span>
                </div>
              </div>
            ))}
          </div>

          <p className="text-[10px] text-gray-400 mt-3">{total} total areas tracked</p>
        </div>
      </div>
    </div>
  )
}

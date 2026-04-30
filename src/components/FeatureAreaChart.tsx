import { useState } from 'react'
import type { FeatureArea } from '../types'
import { SectionHeader } from './SectionHeader'

interface Props {
  data: FeatureArea[]
  title: string
  sub?: string
  accentColor: string
  accentText: string
  badgeClass: string
}

const STATE_BADGE: Record<string, string> = {
  active:      'bg-green-500/15 text-green-400 border-green-500/25',
  maintenance: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25',
  dormant:     'bg-gray-700/40 text-gray-500 border-gray-600/20',
}

function fmtLines(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`
  return String(n)
}

const DISPLAY_LIMIT = 12

export function FeatureAreaChart({ data, title, sub, accentColor, accentText, badgeClass }: Props) {
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? data : data.slice(0, DISPLAY_LIMIT)
  const maxLines = data[0]?.lines ?? 1

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <div className="flex items-start justify-between mb-5">
        <SectionHeader title={title} sub={sub} />
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ml-3 ${badgeClass}`}>
          {data.length} areas
        </span>
      </div>

      <div className="space-y-2.5">
        {visible.map((area, i) => {
          const pct = (area.lines / maxLines) * 100
          return (
            <div key={area.key}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[11px] text-gray-600 font-mono w-5 shrink-0 text-right">
                    {i + 1}
                  </span>
                  <span className="text-sm font-medium text-white truncate">{area.label}</span>
                  <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded border shrink-0 ${STATE_BADGE[area.activityState]}`}>
                    {area.activityState === 'active' ? `${area.recentCommits} commits` : area.activityState}
                  </span>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-3">
                  <span className={`text-xs font-mono font-semibold ${accentText} w-14 text-right`}>
                    {fmtLines(area.lines)}
                  </span>
                </div>
              </div>
              <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden ml-7">
                <div
                  className={`h-full ${accentColor} rounded-full transition-all duration-500`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {data.length > DISPLAY_LIMIT && (
        <button
          onClick={() => setExpanded(e => !e)}
          className="mt-4 ml-7 text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          {expanded ? '▲ Show less' : `▼ Show ${data.length - DISPLAY_LIMIT} more`}
        </button>
      )}
    </div>
  )
}

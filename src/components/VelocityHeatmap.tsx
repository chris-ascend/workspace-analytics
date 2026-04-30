import type { FeatureArea } from '../types'
import { SectionHeader } from './SectionHeader'

interface Props {
  frontendFeatures: FeatureArea[]
  backendDomains: FeatureArea[]
  weekLabels: string[]
}

const STATE_DOT: Record<string, string> = {
  active:      'bg-green-400',
  maintenance: 'bg-yellow-500',
  dormant:     'bg-gray-700',
}

const STATE_LABEL: Record<string, string> = {
  active:      'Active',
  maintenance: 'Maint.',
  dormant:     'Dormant',
}

// Color cell by intensity (0–max commits)
function cellColor(count: number, max: number): string {
  if (count === 0) return 'bg-gray-800'
  const ratio = count / max
  if (ratio >= 0.75) return 'bg-blue-400'
  if (ratio >= 0.45) return 'bg-blue-500/70'
  if (ratio >= 0.2)  return 'bg-blue-600/50'
  return 'bg-blue-700/30'
}

interface AreaRowProps {
  area: FeatureArea
  max: number
  weekLabels: string[]
}

function AreaRow({ area, max, weekLabels }: AreaRowProps) {
  return (
    <div className="flex items-center gap-2 group">
      {/* State dot */}
      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${STATE_DOT[area.activityState]}`} />
      {/* Label */}
      <span className="text-xs text-gray-400 w-36 shrink-0 truncate group-hover:text-white transition-colors">
        {area.label}
      </span>
      {/* Weekly cells */}
      <div className="flex gap-0.5 flex-1">
        {area.weeklyCommits.map((count, i) => (
          <div
            key={i}
            title={`${weekLabels[i]}: ${count} commits`}
            className={`flex-1 h-4 rounded-sm ${cellColor(count, max)} transition-opacity group-hover:opacity-90`}
          />
        ))}
      </div>
      {/* Recent total */}
      <span className="text-xs font-mono text-gray-500 w-6 text-right shrink-0">
        {area.recentCommits > 0 ? area.recentCommits : ''}
      </span>
    </div>
  )
}

function HeatmapSection({
  title, areas, max, weekLabels,
}: {
  title: string
  areas: FeatureArea[]
  max: number
  weekLabels: string[]
}) {
  // Only show areas with any activity in the window
  const visible = areas.filter(a => a.weeklyCommits.some(c => c > 0))
  if (!visible.length) return null

  return (
    <div>
      <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-2">{title}</p>
      <div className="space-y-1">
        {visible.map(a => (
          <AreaRow key={a.key} area={a} max={max} weekLabels={weekLabels} />
        ))}
      </div>
    </div>
  )
}

export function VelocityHeatmap({ frontendFeatures, backendDomains, weekLabels }: Props) {
  const allAreas = [...frontendFeatures, ...backendDomains]
  const max = Math.max(1, ...allAreas.flatMap(a => a.weeklyCommits))

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <div className="flex items-start justify-between mb-4">
        <SectionHeader title="Area Velocity" sub="Commit intensity per week — 12-week window" />
        <div className="flex items-center gap-3 text-[10px] text-gray-500 shrink-0 ml-4 mt-0.5">
          {Object.entries(STATE_DOT).map(([state, cls]) => (
            <div key={state} className="flex items-center gap-1">
              <div className={`w-1.5 h-1.5 rounded-full ${cls}`} />
              <span>{STATE_LABEL[state]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Week labels header */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-[9.5rem] shrink-0" />
        <div className="flex gap-0.5 flex-1">
          {weekLabels.map((label, i) => (
            <div key={i} className="flex-1 text-center">
              <span className="text-[9px] text-gray-600 leading-none">
                {i % 3 === 0 ? label.split(' ')[0] : ''}
              </span>
            </div>
          ))}
        </div>
        <div className="w-6" />
      </div>

      <div className="space-y-4 max-h-[520px] overflow-y-auto scrollbar-thin pr-1">
        <HeatmapSection
          title="Frontend"
          areas={frontendFeatures}
          max={max}
          weekLabels={weekLabels}
        />
        <HeatmapSection
          title="Backend"
          areas={backendDomains}
          max={max}
          weekLabels={weekLabels}
        />
      </div>

      {/* Intensity legend */}
      <div className="flex items-center gap-1 mt-4 ml-[9.5rem]">
        <span className="text-[10px] text-gray-600 mr-1">Less</span>
        {['bg-gray-800', 'bg-blue-700/30', 'bg-blue-600/50', 'bg-blue-500/70', 'bg-blue-400'].map((c, i) => (
          <div key={i} className={`w-4 h-4 rounded-sm ${c}`} />
        ))}
        <span className="text-[10px] text-gray-600 ml-1">More</span>
      </div>
    </div>
  )
}

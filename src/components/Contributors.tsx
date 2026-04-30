import type { Contributor } from '../types'
import { SectionHeader } from './SectionHeader'

interface Props {
  data: Contributor[]
}

const RANK_COLORS = ['text-yellow-400', 'text-gray-300', 'text-orange-400']

export function Contributors({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <SectionHeader title="Top Contributors" />
        <p className="text-sm text-gray-500">No contributor data available.</p>
      </div>
    )
  }

  const max = data[0].commits

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <SectionHeader title="Top Contributors" sub="All-time commits (no merges)" />
      <div className="space-y-2">
        {data.map((c, i) => (
          <div key={c.name} className="flex items-center gap-3">
            <span className={`text-xs font-bold w-4 shrink-0 ${RANK_COLORS[i] ?? 'text-gray-600'}`}>
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-sm text-white truncate">{c.name}</span>
                <span className="text-xs font-mono text-gray-400 shrink-0 ml-2">
                  {c.commits.toLocaleString()}
                </span>
              </div>
              <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full"
                  style={{ width: `${(c.commits / max) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

import type { Module } from '../types'
import { SectionHeader } from './SectionHeader'

interface Props {
  data: Module[]
}

function fmtLines(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return String(n)
}

const TYPE_COLORS = {
  app: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  package: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
}

export function ModuleBreakdown({ data }: Props) {
  const maxLines = Math.max(...data.map(d => d.lines))

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <SectionHeader title="Apps & Packages" sub="Sorted by lines of code" />
      <div className="space-y-3 max-h-72 overflow-y-auto scrollbar-thin pr-1">
        {data.map(m => (
          <div key={m.name}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2 min-w-0">
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border shrink-0 ${TYPE_COLORS[m.type]}`}>
                  {m.type}
                </span>
                <span className="text-sm font-medium text-white truncate">{m.name}</span>
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-2">
                <span className="text-xs text-gray-400">{m.files} files</span>
                <span className="text-xs font-mono text-gray-300">{fmtLines(m.lines)}</span>
              </div>
            </div>
            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{ width: `${(m.lines / maxLines) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

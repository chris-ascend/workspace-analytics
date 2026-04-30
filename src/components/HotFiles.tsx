import type { HotFile } from '../types'
import { SectionHeader } from './SectionHeader'

interface Props {
  data: HotFile[]
}

export function HotFiles({ data }: Props) {
  const max = Math.max(...data.map(d => d.changes))

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <SectionHeader title="Most Changed Files" sub="Last 500 commits" />
      <div className="space-y-2.5">
        {data.slice(0, 12).map((f, i) => (
          <div key={f.path} className="flex items-center gap-3">
            <span className="text-xs font-mono text-gray-600 w-4 shrink-0 text-right">{i + 1}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <p className="text-xs text-white font-medium truncate">{f.file}</p>
                {f.area && (
                  <span className="text-[10px] text-orange-400/70 bg-orange-500/10 border border-orange-500/20 px-1.5 py-0.5 rounded shrink-0">
                    {f.area}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-gray-600 truncate mt-0.5">{f.path}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-16 h-1 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500 rounded-full"
                  style={{ width: `${(f.changes / max) * 100}%` }}
                />
              </div>
              <span className="text-xs font-mono text-orange-400 w-6 text-right">{f.changes}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

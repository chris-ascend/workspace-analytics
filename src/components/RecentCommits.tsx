import type { RecentCommit } from '../types'
import { SectionHeader } from './SectionHeader'

interface Props {
  data: RecentCommit[]
}

export function RecentCommits({ data }: Props) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <SectionHeader title="Recent Commits" sub="Latest 20, no merges" />
      <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-thin pr-1">
        {data.slice(0, 20).map(c => (
          <div key={c.hash} className="flex items-start gap-3 py-1.5 border-b border-gray-800/60 last:border-0">
            <span className="font-mono text-xs text-blue-400 shrink-0 pt-0.5">{c.hash}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-200 truncate">{c.subject}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">{c.author} · {c.date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

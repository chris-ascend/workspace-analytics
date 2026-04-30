import type { ReactNode } from 'react'

interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  icon: ReactNode
  accent?: string
}

export function StatCard({ label, value, sub, icon, accent = 'text-ascend-sky' }: StatCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-start gap-4 shadow-sm">
      <div className={`mt-0.5 ${accent} shrink-0`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-ascend-muted uppercase tracking-widest">{label}</p>
        <p className="text-2xl font-bold text-ascend-navy mt-1 truncate">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

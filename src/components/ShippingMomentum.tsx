import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import type { CommitDay } from '../types'
import { SectionHeader } from './SectionHeader'

interface Props {
  data: CommitDay[]
  commitsLast30: number
  commitsPrev30: number
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function delta(curr: number, prev: number) {
  if (!prev) return null
  return Math.round(((curr - prev) / prev) * 100)
}

function rollingAvg(data: CommitDay[], window = 7): (CommitDay & { avg: number })[] {
  return data.map((d, i) => {
    const slice = data.slice(Math.max(0, i - window + 1), i + 1)
    const avg = slice.reduce((s, x) => s + x.commits, 0) / slice.length
    return { ...d, avg: Math.round(avg * 10) / 10 }
  })
}

export function ShippingMomentum({ data, commitsLast30, commitsPrev30 }: Props) {
  const enriched = rollingAvg(data)
  const d = delta(commitsLast30, commitsPrev30)

  // Trend direction from first half vs second half of 7-day avg
  const mid = Math.floor(enriched.length / 2)
  const firstHalfAvg = enriched.slice(0, mid).reduce((s, x) => s + x.avg, 0) / mid
  const secondHalfAvg = enriched.slice(mid).reduce((s, x) => s + x.avg, 0) / enriched.slice(mid).length
  const trendUp = secondHalfAvg >= firstHalfAvg

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <SectionHeader
          title="Shipping Momentum"
          sub="Daily commits + 7-day rolling average — last 90 days"
        />
        <div className="text-right shrink-0 ml-4">
          <div className="flex items-center gap-2 justify-end">
            <span className="text-xl font-bold text-ascend-navy">{commitsLast30.toLocaleString()}</span>
            {d !== null && (
              <span className={`text-sm font-semibold ${d >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                {d >= 0 ? '▲' : '▼'} {Math.abs(d)}%
              </span>
            )}
          </div>
          <p className="text-[10px] text-gray-400">commits last 30d</p>
          <p className={`text-[11px] font-semibold mt-1 ${trendUp ? 'text-emerald-600' : 'text-red-400'}`}>
            {trendUp ? '↑ Trending up' : '↓ Trending down'}
          </p>
        </div>
      </div>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={enriched} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="momentumGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#61caf9" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#61caf9" stopOpacity={0}    />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tickFormatter={(v, i) => i % 14 === 0 ? formatDate(String(v)) : ''}
              tick={{ fill: '#9ca3af', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#9ca3af', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8 }}
              labelStyle={{ color: '#4a5464', fontSize: 12 }}
              labelFormatter={(v) => formatDate(String(v))}
              formatter={(v, name) => [
                name === 'avg' ? `${v} (7d avg)` : `${v} commits`,
                name === 'avg' ? 'Rolling avg' : 'Daily',
              ]}
              itemStyle={{ fontSize: 11 }}
            />
            <Area
              type="monotone"
              dataKey="commits"
              stroke="#61caf9"
              strokeWidth={1}
              strokeOpacity={0.4}
              fill="url(#momentumGrad)"
              dot={false}
              activeDot={{ r: 3, fill: '#61caf9' }}
              name="commits"
            />
            <Line
              type="monotone"
              dataKey="avg"
              stroke="#2a60bc"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4, fill: '#2a60bc' }}
              name="avg"
            />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 11, color: '#4a5464' }}
              formatter={(value) => value === 'avg' ? '7-day avg' : 'Daily commits'}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

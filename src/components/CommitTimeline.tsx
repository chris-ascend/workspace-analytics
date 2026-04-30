import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import type { CommitDay } from '../types'
import { SectionHeader } from './SectionHeader'

interface Props {
  data: CommitDay[]
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function tickFormatter(value: string, index: number) {
  return index % 14 === 0 ? formatDate(value) : ''
}

export function CommitTimeline({ data }: Props) {
  const max = Math.max(...data.map(d => d.commits))

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <SectionHeader title="Commit Activity" sub="Last 90 days (no merges)" />
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="commitGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#61caf9" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#61caf9" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tickFormatter={tickFormatter}
              tick={{ fill: '#9ca3af', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#9ca3af', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              domain={[0, max + 1]}
            />
            <Tooltip
              contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8 }}
              labelStyle={{ color: '#4a5464', fontSize: 12 }}
              itemStyle={{ color: '#61caf9' }}
              labelFormatter={(v) => formatDate(String(v))}
              formatter={(v) => [`${v} commits`, '']}
            />
            <Area
              type="monotone"
              dataKey="commits"
              stroke="#61caf9"
              strokeWidth={2}
              fill="url(#commitGrad)"
              dot={false}
              activeDot={{ r: 4, fill: '#61caf9' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

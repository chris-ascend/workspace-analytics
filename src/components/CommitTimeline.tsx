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

// Show every ~2 weeks on x-axis
function tickFormatter(value: string, index: number) {
  return index % 14 === 0 ? formatDate(value) : ''
}

export function CommitTimeline({ data }: Props) {
  const max = Math.max(...data.map(d => d.commits))

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <SectionHeader
        title="Commit Activity"
        sub="Last 90 days (no merges)"
      />
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="commitGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis
              dataKey="date"
              tickFormatter={tickFormatter}
              tick={{ fill: '#6b7280', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#6b7280', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              domain={[0, max + 1]}
            />
            <Tooltip
              contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8 }}
              labelStyle={{ color: '#9ca3af', fontSize: 12 }}
              itemStyle={{ color: '#60a5fa' }}
              labelFormatter={(v) => formatDate(String(v))}
              formatter={(v) => [`${v} commits`, '']}
            />
            <Area
              type="monotone"
              dataKey="commits"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#commitGrad)"
              dot={false}
              activeDot={{ r: 4, fill: '#3b82f6' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

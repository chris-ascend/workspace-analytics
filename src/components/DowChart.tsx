import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import type { DowStat } from '../types'
import { SectionHeader } from './SectionHeader'

interface Props {
  data: DowStat[]
}

export function DowChart({ data }: Props) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <SectionHeader title="Commits by Day of Week" sub="Last 2,000 commits" />
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="day"
              tick={{ fill: '#9ca3af', fontSize: 12 }}
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
              itemStyle={{ color: '#2a60bc' }}
              formatter={(v) => [`${v} commits`, '']}
            />
            <Bar dataKey="commits" fill="#2a60bc" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

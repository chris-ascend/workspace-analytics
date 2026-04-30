import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import type { LanguageStat } from '../types'
import { SectionHeader } from './SectionHeader'

interface Props {
  data: LanguageStat[]
}

const COLORS = [
  '#3b82f6', '#8b5cf6', '#06b6d4', '#10b981',
  '#f59e0b', '#ef4444', '#ec4899', '#14b8a6',
  '#a855f7', '#f97316', '#84cc16', '#6366f1',
]

function fmtLines(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`
  return String(n)
}

export function LanguageChart({ data }: Props) {
  const chartData = data.map(d => ({ ...d, displayLines: d.lines }))

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <SectionHeader title="Lines of Code by Language" sub="Source files only" />
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 0, right: 12, bottom: 0, left: 90 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fill: '#6b7280', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={fmtLines}
            />
            <YAxis
              type="category"
              dataKey="lang"
              tick={{ fill: '#d1d5db', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={88}
            />
            <Tooltip
              contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8 }}
              labelStyle={{ color: '#9ca3af', fontSize: 12 }}
              cursor={{ fill: 'rgba(255,255,255,0.03)' }}
              formatter={(v, _name, props) => [
                `${Number(v).toLocaleString()} lines (${props.payload.files} files)`,
                props.payload.lang,
              ]}
            />
            <Bar dataKey="displayLines" radius={[0, 4, 4, 0]}>
              {chartData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

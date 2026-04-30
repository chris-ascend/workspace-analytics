import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import type { LanguageStat } from '../types'
import { SectionHeader } from './SectionHeader'

interface Props {
  data: LanguageStat[]
}

const COLORS = [
  '#102556', '#2a60bc', '#61caf9', '#89ffc7',
  '#a7dce8', '#4a5464', '#0ea5e9', '#38bdf8',
  '#7dd3fc', '#bae6fd', '#0284c7', '#0369a1',
]

function fmtLines(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`
  return String(n)
}

export function LanguageChart({ data }: Props) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <SectionHeader title="Lines of Code by Language" sub="Source files only" />
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 12, bottom: 0, left: 90 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fill: '#9ca3af', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={fmtLines}
            />
            <YAxis
              type="category"
              dataKey="lang"
              tick={{ fill: '#102556', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={88}
            />
            <Tooltip
              contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8 }}
              labelStyle={{ color: '#4a5464', fontSize: 12 }}
              cursor={{ fill: 'rgba(0,0,0,0.03)' }}
              formatter={(v, _name, props) => [
                `${Number(v).toLocaleString()} lines (${props.payload.files} files)`,
                props.payload.lang,
              ]}
            />
            <Bar dataKey="lines" radius={[0, 4, 4, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

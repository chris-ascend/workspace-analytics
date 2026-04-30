import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import type { WhereWeAreBuilding } from '../types'
import { SectionHeader } from './SectionHeader'

interface Props {
  data: WhereWeAreBuilding[]
}

export function AreaActivityBar({ data }: Props) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <SectionHeader
        title="Where We're Building"
        sub="Commits per product area — last 30 days"
      />
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 40, bottom: 0, left: 130 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fill: '#6b7280', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="label"
              tick={{ fill: '#d1d5db', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={128}
            />
            <Tooltip
              contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8 }}
              labelStyle={{ color: '#9ca3af', fontSize: 12 }}
              cursor={{ fill: 'rgba(255,255,255,0.03)' }}
              formatter={(v, _n, props) => [
                `${v} commits (${props.payload.layer})`,
                'Last 30 days',
              ]}
            />
            <Bar dataKey="recentCommits" radius={[0, 4, 4, 0]} maxBarSize={18}>
              {data.map((d) => (
                <Cell
                  key={d.label}
                  fill={d.layer === 'frontend' ? '#3b82f6' : '#8b5cf6'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center gap-4 mt-3 ml-[138px]">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-blue-500" />
          <span className="text-xs text-gray-500">Frontend</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-purple-500" />
          <span className="text-xs text-gray-500">Backend</span>
        </div>
      </div>
    </div>
  )
}

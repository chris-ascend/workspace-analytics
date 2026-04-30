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
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
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
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fill: '#9ca3af', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="label"
              tick={{ fill: '#102556', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={128}
            />
            <Tooltip
              contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8 }}
              labelStyle={{ color: '#4a5464', fontSize: 12 }}
              cursor={{ fill: 'rgba(0,0,0,0.03)' }}
              formatter={(v, _n, props) => [
                `${v} commits (${props.payload.layer})`,
                'Last 30 days',
              ]}
            />
            <Bar dataKey="recentCommits" radius={[0, 4, 4, 0]} maxBarSize={18}>
              {data.map((d) => (
                <Cell
                  key={d.label}
                  fill={d.layer === 'frontend' ? '#61caf9' : '#2a60bc'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center gap-4 mt-3 ml-[138px]">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-ascend-sky" />
          <span className="text-xs text-ascend-muted">Frontend</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-ascend-blue" />
          <span className="text-xs text-ascend-muted">Backend</span>
        </div>
      </div>
    </div>
  )
}

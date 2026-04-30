import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import type { InvestmentBucket } from '../types'
import { SectionHeader } from './SectionHeader'

interface Props {
  data: InvestmentBucket[]
  commitsLast30: number
  commitsPrev30: number
}

function delta(curr: number, prev: number) {
  if (!prev) return null
  return Math.round(((curr - prev) / prev) * 100)
}

export function InvestmentDonut({ data, commitsLast30, commitsPrev30 }: Props) {
  const d = delta(commitsLast30, commitsPrev30)

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col">
      <SectionHeader
        title="Investment Allocation"
        sub="Share of commits last 30 days by product area"
      />

      <div className="flex flex-col gap-4 flex-1">
        {/* Velocity pulse */}
        <div className="flex items-center gap-3 bg-ascend-bg rounded-lg px-4 py-3 border border-gray-200">
          <div>
            <p className="text-2xl font-bold text-ascend-navy">{commitsLast30.toLocaleString()}</p>
            <p className="text-xs text-ascend-muted">commits last 30d</p>
          </div>
          {d !== null && (
            <div className={`ml-auto text-sm font-semibold ${d >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              {d >= 0 ? '▲' : '▼'} {Math.abs(d)}%
              <p className="text-xs font-normal text-gray-400">vs prev 30d</p>
            </div>
          )}
        </div>

        {/* Donut */}
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                dataKey="commits"
                nameKey="bucket"
                strokeWidth={0}
                paddingAngle={2}
              >
                {data.map((entry) => (
                  <Cell key={entry.bucket} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8 }}
                formatter={(v, name) => [`${v} commits`, name]}
                itemStyle={{ color: '#102556', fontSize: 12 }}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                formatter={(value, entry) => (
                  <span style={{ color: '#4a5464', fontSize: 12 }}>
                    {value}{' '}
                    <span style={{ color: entry.color, fontWeight: 700 }}>
                      {(entry.payload as unknown as InvestmentBucket).pct}%
                    </span>
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

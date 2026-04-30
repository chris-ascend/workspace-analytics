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
  const pct = Math.round(((curr - prev) / prev) * 100)
  return pct
}

export function InvestmentDonut({ data, commitsLast30, commitsPrev30 }: Props) {
  const d = delta(commitsLast30, commitsPrev30)

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col">
      <SectionHeader
        title="Investment Allocation"
        sub="Share of commits last 30 days by product area"
      />

      <div className="flex flex-col gap-4 flex-1">
        {/* Velocity pulse */}
        <div className="flex items-center gap-3 bg-gray-800/50 rounded-lg px-4 py-3">
          <div>
            <p className="text-2xl font-bold text-white">{commitsLast30.toLocaleString()}</p>
            <p className="text-xs text-gray-500">commits last 30d</p>
          </div>
          {d !== null && (
            <div className={`ml-auto text-sm font-semibold ${d >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {d >= 0 ? '▲' : '▼'} {Math.abs(d)}%
              <p className="text-xs font-normal text-gray-500">vs prev 30d</p>
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
                contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8 }}
                formatter={(v, name) => [`${v} commits`, name]}
                itemStyle={{ color: '#d1d5db', fontSize: 12 }}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                formatter={(value, entry) => (
                  <span style={{ color: '#9ca3af', fontSize: 12 }}>
                    {value} <span style={{ color: entry.color, fontWeight: 600 }}>
                      {(entry.payload as InvestmentBucket).pct}%
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

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts'
import type { FeatureArea, InvestmentBucket } from '../types'
import { SectionHeader } from './SectionHeader'

interface Props {
  frontendFeatures: FeatureArea[]
  backendDomains: FeatureArea[]
  investmentAllocation: InvestmentBucket[]
  weekLabels: string[]
}

export function InvestmentTrend({
  frontendFeatures,
  backendDomains,
  investmentAllocation,
  weekLabels,
}: Props) {
  const allAreas = [...frontendFeatures, ...backendDomains]

  // Build color map from investmentAllocation
  const colorMap: Record<string, string> = {}
  for (const b of investmentAllocation) colorMap[b.bucket] = b.color

  const buckets = investmentAllocation.map(b => b.bucket)

  // Build weekly data: one entry per week with a key per bucket
  const chartData = weekLabels.map((label, weekIdx) => {
    const entry: Record<string, string | number> = { week: label }
    for (const bucket of buckets) {
      entry[bucket] = allAreas
        .filter(a => a.bucket === bucket)
        .reduce((sum, a) => sum + (a.weeklyCommits[weekIdx] ?? 0), 0)
    }
    return entry
  })

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <SectionHeader
        title="Investment Trend"
        sub="Commit share by product bucket — 12-week rolling window"
      />
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 4, right: 4, bottom: 0, left: -20 }}
            barSize={14}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis
              dataKey="week"
              tick={{ fill: '#9ca3af', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              interval={2}
            />
            <YAxis
              tick={{ fill: '#9ca3af', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8 }}
              labelStyle={{ color: '#4a5464', fontSize: 12 }}
              itemStyle={{ fontSize: 11 }}
              formatter={(v, name) => [`${v} commits`, name]}
            />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 11, color: '#4a5464' }}
            />
            {buckets.map(bucket => (
              <Bar
                key={bucket}
                dataKey={bucket}
                stackId="a"
                fill={colorMap[bucket] ?? '#9ca3af'}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

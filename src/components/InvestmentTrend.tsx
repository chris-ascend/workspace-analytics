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

function slugify(name: string) {
  return name.replace(/[^a-z0-9]/gi, '_')
}

export function InvestmentTrend({
  frontendFeatures,
  backendDomains,
  investmentAllocation,
  weekLabels,
}: Props) {
  const allAreas = [...frontendFeatures, ...backendDomains]

  const buckets = investmentAllocation.map(b => ({
    name: b.bucket,
    key: slugify(b.bucket),
    color: b.color,
  }))

  // Build weekly data: one entry per week with a sanitized key per bucket
  const chartData = weekLabels.map((label, weekIdx) => {
    const entry: Record<string, string | number> = { week: label }
    for (const bucket of buckets) {
      entry[bucket.key] = allAreas
        .filter(a => a.bucket === bucket.name)
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
              formatter={(v, key) => {
                const b = buckets.find(b => b.key === key)
                return [`${v} commits`, b?.name ?? String(key)]
              }}
            />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 11, color: '#4a5464' }}
              formatter={(key) => {
                const b = buckets.find(b => b.key === key)
                return b?.name ?? key
              }}
            />
            {buckets.map(bucket => (
              <Bar
                key={bucket.key}
                dataKey={bucket.key}
                stackId="a"
                fill={bucket.color}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

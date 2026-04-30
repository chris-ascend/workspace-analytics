import type { InvestmentBucket, FeatureArea } from '../types'
import { SectionHeader } from './SectionHeader'

interface Props {
  investmentAllocation: InvestmentBucket[]
  frontendFeatures: FeatureArea[]
  backendDomains: FeatureArea[]
}

function computeBucketTrend(
  bucket: string,
  areas: FeatureArea[],
): number | null {
  const bucketAreas = areas.filter(a => a.bucket === bucket)
  if (!bucketAreas.length) return null

  // weeklyCommits is oldest→newest (12 weeks). Last 4 vs prior 4.
  const last4  = bucketAreas.reduce((s, a) => s + a.weeklyCommits.slice(-4).reduce((x, y) => x + y, 0), 0)
  const prev4  = bucketAreas.reduce((s, a) => s + a.weeklyCommits.slice(-8, -4).reduce((x, y) => x + y, 0), 0)
  if (!prev4) return null
  return Math.round(((last4 - prev4) / prev4) * 100)
}

export function TopBets({ investmentAllocation, frontendFeatures, backendDomains }: Props) {
  const allAreas = [...frontendFeatures, ...backendDomains]
  const top5 = investmentAllocation.slice(0, 5)
  const maxCommits = top5[0]?.commits ?? 1

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col">
      <SectionHeader
        title="Top Bets"
        sub="Where engineering effort is concentrated (last 30 days)"
      />

      <div className="space-y-4 flex-1">
        {top5.map((bucket, i) => {
          const trend = computeBucketTrend(bucket.bucket, allAreas)
          const barPct = Math.round((bucket.commits / maxCommits) * 100)

          return (
            <div key={bucket.bucket} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[11px] font-bold text-ascend-muted w-4 shrink-0">{i + 1}</span>
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: bucket.color }} />
                  <span className="text-sm font-semibold text-ascend-navy truncate">{bucket.bucket}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-2">
                  <span className="text-xs text-ascend-muted">{bucket.pct}%</span>
                  {trend !== null && (
                    <span className={`text-xs font-semibold ${trend >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}%
                    </span>
                  )}
                </div>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${barPct}%`, background: bucket.color }}
                />
              </div>
            </div>
          )
        })}
      </div>

      <p className="text-[10px] text-gray-400 mt-4">
        Trend = last 4 weeks vs prior 4 weeks
      </p>
    </div>
  )
}

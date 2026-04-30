export interface LanguageStat {
  lang: string
  files: number
  lines: number
  meaningful: boolean
}

export interface FeatureArea {
  key: string
  label: string
  layer: 'frontend' | 'backend'
  files: number
  lines: number
  recentCommits: number
  weeklyCommits: number[]   // 12 values, oldest → newest
  activityState: 'active' | 'maintenance' | 'dormant'
}

export interface WhereWeAreBuilding {
  label: string
  layer: 'frontend' | 'backend'
  recentCommits: number
}

export interface InvestmentBucket {
  bucket: string
  commits: number
  color: string
  pct: number
}

export interface CommitDay {
  date: string
  commits: number
}

export interface HotFile {
  file: string
  path: string
  changes: number
  area: string | null
}

export interface RecentCommit {
  hash: string
  subject: string
  author: string
  date: string
}

export interface DowStat {
  day: string
  commits: number
}

export interface Analytics {
  generatedAt: string
  workspace: string
  weekLabels: string[]
  summary: {
    totalFiles: number
    totalLines: number
    meaningfulLines: number
    totalCommits: number
    frontendFeatures: number
    backendDomains: number
    activeAreas: number
    commitsLast30: number
    commitsPrev30: number
  }
  totals: {
    frontendLines: number
    backendLines: number
  }
  whereWeAreBuilding: WhereWeAreBuilding[]
  investmentAllocation: InvestmentBucket[]
  languageStats: LanguageStat[]
  frontendFeatures: FeatureArea[]   // sorted by recent activity
  backendDomains: FeatureArea[]     // sorted by recent activity
  frontendByLOC: FeatureArea[]      // sorted by LOC
  backendByLOC: FeatureArea[]       // sorted by LOC
  commitTimeline: CommitDay[]
  hotFiles: HotFile[]
  recentCommits: RecentCommit[]
  commitsByDow: DowStat[]
}

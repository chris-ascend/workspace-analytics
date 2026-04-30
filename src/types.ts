export interface LanguageStat {
  lang: string
  files: number
  lines: number
}

export interface FeatureArea {
  key: string
  label: string
  layer: 'frontend' | 'backend'
  files: number
  lines: number
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
  summary: {
    totalFiles: number
    totalLines: number
    totalCommits: number
    frontendFeatures: number
    backendDomains: number
  }
  totals: {
    frontendLines: number
    backendLines: number
  }
  languageStats: LanguageStat[]
  frontendFeatures: FeatureArea[]
  backendDomains: FeatureArea[]
  commitTimeline: CommitDay[]
  hotFiles: HotFile[]
  recentCommits: RecentCommit[]
  commitsByDow: DowStat[]
}

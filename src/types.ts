export interface LanguageStat {
  lang: string
  files: number
  lines: number
}

export interface Module {
  name: string
  type: 'app' | 'package'
  files: number
  tsFiles: number
  exFiles: number
  lines: number
}

export interface CommitDay {
  date: string
  commits: number
}

export interface Contributor {
  name: string
  commits: number
}

export interface HotFile {
  file: string
  path: string
  changes: number
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
    topLanguage: string
    contributors: number
    apps: number
    packages: number
  }
  languageStats: LanguageStat[]
  modules: Module[]
  commitTimeline: CommitDay[]
  contributors: Contributor[]
  hotFiles: HotFile[]
  recentCommits: RecentCommit[]
  commitsByDow: DowStat[]
}

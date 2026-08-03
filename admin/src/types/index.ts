// 赛程阶段
export const STAGE_OPTIONS = [
  { value: 'REGULAR', label: '常规赛' },
  { value: 'REVIVAL', label: '复活赛' },
  { value: 'PLAYOFF', label: '季后赛' },
  { value: 'FINAL', label: '总决赛' },
] as const

export type StageValue = (typeof STAGE_OPTIONS)[number]['value']

export const stageToLabel = (stage: string) => {
  return STAGE_OPTIONS.find((s) => s.value === stage)?.label || stage
}

// 赛季
export interface Season {
  id: number
  name: string
  description?: string
  startDate?: string
  endDate?: string
  currentSeason?: boolean
  createTime?: string
  updateTime?: string
}

// 战队
export interface Team {
  id: number
  seasonId: number
  name: string
  logo?: string
  description?: string
  createTime?: string
  updateTime?: string
}

// 选手记录（扁平结构，用于 /api/players）
export interface PlayerRecordVO {
  id: number
  playerName: string
  playerAvatar?: string
  teamName: string
  teamLogo?: string
  season: string
  stage: string
  round: number
  date: string
  identity?: string
  role?: string
  score: number
  voteScore: number
  winScore: number
  skillScore: number
  penaltyScore: number
  extraScore: number
  isMvp: boolean
  isSvp: boolean
  isBlame: boolean
  createdAt?: string
  updatedAt?: string
}

export interface PlayerRecordDTO {
  playerName: string
  playerAvatar?: string
  teamName: string
  teamLogo?: string
  season: string
  stage: string
  round: number
  date: string
  identity?: string
  role?: string
  voteScore: number
  winScore: number
  skillScore: number
  penaltyScore: number
  extraScore: number
  isMvp: boolean
  isSvp: boolean
  isBlame: boolean
}

export interface PlayerRecordListVO {
  list: PlayerRecordVO[]
  total: number
}

// 排行榜
export interface TeamRanking {
  rank: number
  teamId: number
  teamName: string
  teamLogo?: string
  score: number
}

export interface PlayerRanking {
  rank: number
  playerId: number
  playerName: string
  playerAvatar?: string
  teamId: number
  teamName: string
  score: number
}

export interface ScheduleItem {
  stage: string
  stageLabel: string
  roundNumber: number
  matchDate: string
  teams: string[]
}

export interface SeasonInfo {
  id: number
  name: string
  description?: string
  currentSeason?: boolean
}

// 导入结果
export interface ImportFailRow {
  rowNum: number
  reason: string
  rowData?: string
}

export interface ImportResultVO {
  total: number
  successCount: number
  failCount: number
  skipCount: number
  failRows: ImportFailRow[]
}

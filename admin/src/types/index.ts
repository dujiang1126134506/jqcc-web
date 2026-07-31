// 全局类型定义

// 赛程阶段
export type StageEnum = 'REGULAR' | 'REVIVAL' | 'PLAYOFF' | 'FINAL'

export const STAGE_OPTIONS: { label: string; value: StageEnum }[] = [
  { label: '常规赛', value: 'REGULAR' },
  { label: '复活赛', value: 'REVIVAL' },
  { label: '季后赛', value: 'PLAYOFF' },
  { label: '总决赛', value: 'FINAL' },
]

export function stageLabel(v?: string): string {
  const found = STAGE_OPTIONS.find((o) => o.value === v)
  return found ? found.label : v || '-'
}

// 分页结果
export interface PageResult<T> {
  list: T[]
  total: number
  pageNum: number
  pageSize: number
}

// 赛季
export interface Season {
  id?: number
  name: string
  description?: string
  currentSeason?: boolean
  startDate?: string
  endDate?: string
  createTime?: string
  updateTime?: string
}

// 战队
export interface Team {
  id?: number
  name: string
  logo?: string
  description?: string
  createTime?: string
  updateTime?: string
}

// 选手
export interface Player {
  id?: number
  name: string
  avatar?: string
  teamId: number
  position?: string
  createTime?: string
  updateTime?: string
}

// 选手得分记录（完整VO）
export interface PlayerScoreVO {
  id: number
  seasonId: number
  teamId: number
  teamName: string
  teamLogo?: string
  playerId: number
  playerName: string
  playerAvatar?: string
  stage: StageEnum
  stageLabel?: string
  roundNumber: number
  matchDate: string
  identity?: string
  version?: string
  winLoseScore: number
  voteScore: number
  skillScore: number
  penaltyScore: number
  extraScore: number
  totalScore: number
  mvp: boolean
  svp: boolean
  scapegoat: boolean
  createTime?: string
  updateTime?: string
}

// 选手得分 DTO（新增/编辑）
export interface PlayerScoreDTO {
  seasonId: number
  teamId: number
  playerId: number
  stage: StageEnum
  roundNumber: number
  matchDate: string
  identity?: string
  version?: string
  winLoseScore?: number
  voteScore?: number
  skillScore?: number
  penaltyScore?: number
  extraScore?: number
  mvp?: boolean
  svp?: boolean
  scapegoat?: boolean
}

// 导入结果
export interface ImportResultVO {
  total: number
  successCount: number
  failCount: number
  skipCount: number
  failRows: ImportFailRow[]
}

export interface ImportFailRow {
  rowNum: number
  reason: string
  rowData?: string
}

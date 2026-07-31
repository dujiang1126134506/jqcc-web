import { get, post, put, del, upload } from '@/utils/request'
import type {
  Season,
  Team,
  Player,
  PlayerScoreVO,
  PlayerScoreDTO,
  PageResult,
  ImportResultVO,
} from '@/types'

// ============== 赛季 ==============
export const seasonApi = {
  list: () => get<Season[]>('/seasons'),
  detail: (id: number) => get<Season>(`/seasons/${id}`),
  create: (data: Season) => post<Season>('/seasons', data),
  update: (id: number, data: Season) => put<Season>(`/seasons/${id}`, data),
  delete: (id: number) => del<void>(`/seasons/${id}`),
}

// ============== 战队 ==============
export const teamApi = {
  list: () => get<Team[]>('/teams'),
  detail: (id: number) => get<Team>(`/teams/${id}`),
  create: (data: Team) => post<Team>('/teams', data),
  update: (id: number, data: Team) => put<Team>(`/teams/${id}`, data),
  delete: (id: number) => del<void>(`/teams/${id}`),
}

// ============== 选手 ==============
export const playerApi = {
  list: () => get<Player[]>('/players'),
  listByTeam: (teamId: number) => get<Player[]>(`/players/by-team/${teamId}`),
  detail: (id: number) => get<Player>(`/players/${id}`),
  create: (data: Player) => post<Player>('/players', data),
  update: (id: number, data: Player) => put<Player>(`/players/${id}`, data),
  delete: (id: number) => del<void>(`/players/${id}`),
}

// ============== 选手得分 ==============
export interface PlayerScoreQuery {
  seasonId?: number
  teamId?: number
  playerId?: number
  stage?: string
  roundNumber?: number
  startDate?: string
  endDate?: string
  pageNum?: number
  pageSize?: number
}

export const playerScoreApi = {
  page: (params: PlayerScoreQuery) =>
    get<PageResult<PlayerScoreVO>>('/player-scores/page', params),
  detail: (id: number) => get<PlayerScoreVO>(`/player-scores/${id}`),
  create: (data: PlayerScoreDTO) => post<number>('/player-scores', data),
  update: (id: number, data: PlayerScoreDTO) => put<void>(`/player-scores/${id}`, data),
  delete: (id: number) => del<void>(`/player-scores/${id}`),
  deleteBatch: (ids: number[]) => del<void>('/player-scores/batch', ids),
}

// ============== 数据导入 ==============
export const importApi = {
  excel: (file: File, seasonId: number, skipDuplicate = true) => {
    const form = new FormData()
    form.append('file', file)
    return upload<ImportResultVO>(`/import/excel`, form, { seasonId, skipDuplicate })
  },
  csv: (file: File, seasonId: number, skipDuplicate = true) => {
    const form = new FormData()
    form.append('file', file)
    return upload<ImportResultVO>(`/import/csv`, form, { seasonId, skipDuplicate })
  },
}

// ============== 小程序端（用于仪表盘） ==============
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
  teamId?: number
  teamName?: string
  score: number
}

export interface ScheduleItem {
  stage: string
  stageLabel: string
  roundNumber: number
  matchDate: string
  teams: string[]
}

export const appApi = {
  seasons: () => get<Season[]>('/app/seasons'),
  currentSeasonId: () => get<number>('/app/current-season'),
  teamTotalRanking: (seasonId?: number) =>
    get<TeamRanking[]>('/app/ranking/team-total', { seasonId }),
  teamAverageRanking: (seasonId?: number) =>
    get<TeamRanking[]>('/app/ranking/team-average', { seasonId }),
  playerTotalRanking: (seasonId?: number) =>
    get<PlayerRanking[]>('/app/ranking/player-total', { seasonId }),
  schedule: (seasonId?: number) => get<ScheduleItem[]>('/app/schedule', { seasonId }),
}

import request from '@/utils/request'
import type {
  Season,
  Team,
  PlayerRecordVO,
  PlayerRecordDTO,
  PlayerRecordListVO,
  TeamRanking,
  PlayerRanking,
  ScheduleItem,
  SeasonInfo,
  ImportResultVO,
} from '@/types'

// ========== 赛季 ==========
export const getSeasons = () => request.get<any, Season[]>('/seasons')
export const getSeason = (id: number) => request.get<any, Season>(`/seasons/${id}`)
export const createSeason = (data: Partial<Season>) => request.post<any, Season>('/seasons', data)
export const updateSeason = (id: number, data: Partial<Season>) =>
  request.put<any, Season>(`/seasons/${id}`, data)
export const deleteSeason = (id: number) => request.delete<any, void>(`/seasons/${id}`)

// ========== 战队 ==========
export const getTeams = () => request.get<any, Team[]>('/teams')
export const getTeam = (id: number) => request.get<any, Team>(`/teams/${id}`)
export const createTeam = (data: Partial<Team>) => request.post<any, Team>('/teams', data)
export const updateTeam = (id: number, data: Partial<Team>) =>
  request.put<any, Team>(`/teams/${id}`, data)
export const deleteTeam = (id: number) => request.delete<any, void>(`/teams/${id}`)

// ========== 选手数据（扁平结构 /api/players）==========
export const getPlayerList = (params: {
  season?: string
  stage?: string
  keyword?: string
}) => request.get<any, PlayerRecordListVO>('/players', { params })

export const getPlayer = (id: number) => request.get<any, PlayerRecordVO>(`/players/${id}`)

export const createPlayer = (data: PlayerRecordDTO) =>
  request.post<any, PlayerRecordVO>('/players', data)

export const updatePlayer = (id: number, data: PlayerRecordDTO) =>
  request.put<any, PlayerRecordVO>(`/players/${id}`, data)

export const deletePlayer = (id: number) => request.delete<any, void>(`/players/${id}`)

// ========== 排行榜 / 赛程（/api/app）==========
export const getAppSeasons = () => request.get<any, SeasonInfo[]>('/app/seasons')
export const getCurrentSeasonId = () => request.get<any, number>('/app/current-season')

export const getTeamTotalRanking = (seasonId?: number) =>
  request.get<any, TeamRanking[]>('/app/ranking/team-total', { params: { seasonId } })

export const getTeamAverageRanking = (seasonId?: number) =>
  request.get<any, TeamRanking[]>('/app/ranking/team-average', { params: { seasonId } })

export const getPlayerTotalRanking = (seasonId?: number) =>
  request.get<any, PlayerRanking[]>('/app/ranking/player-total', { params: { seasonId } })

export const getSchedule = (seasonId?: number) =>
  request.get<any, ScheduleItem[]>('/app/schedule', { params: { seasonId } })

// ========== 数据导入 ==========
export const importExcel = (file: File, seasonId: number, skipDuplicate = true) => {
  const form = new FormData()
  form.append('file', file)
  return request.post<any, ImportResultVO>('/import/excel', form, {
    params: { seasonId, skipDuplicate },
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const importCsv = (file: File, seasonId: number, skipDuplicate = true) => {
  const form = new FormData()
  form.append('file', file)
  return request.post<any, ImportResultVO>('/import/csv', form, {
    params: { seasonId, skipDuplicate },
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

// ========== 文件上传 ==========
export const uploadImage = (file: File) => {
  const form = new FormData()
  form.append('file', file)
  return request.post<any, { url: string }>('/upload/image', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

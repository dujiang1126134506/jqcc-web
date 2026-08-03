import React, { useEffect, useState } from 'react'
import { Card, Row, Col, Select, Table, Statistic, Tag, Space, Spin } from 'antd'
import {
  TeamOutlined,
  TrophyOutlined,
  UserOutlined,
  CalendarOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import {
  getAppSeasons,
  getCurrentSeasonId,
  getTeamTotalRanking,
  getTeamAverageRanking,
  getPlayerTotalRanking,
  getSchedule,
  getPlayerList,
} from '@/api'
import { stageToLabel, type SeasonInfo, type TeamRanking, type PlayerRanking, type ScheduleItem } from '@/types'

const Dashboard: React.FC = () => {
  const [seasons, setSeasons] = useState<SeasonInfo[]>([])
  const [currentSeasonId, setCurrentSeasonId] = useState<number | null>(null)
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null)

  const [teamTotal, setTeamTotal] = useState<TeamRanking[]>([])
  const [teamAvg, setTeamAvg] = useState<TeamRanking[]>([])
  const [playerTotal, setPlayerTotal] = useState<PlayerRanking[]>([])
  const [schedule, setSchedule] = useState<ScheduleItem[]>([])
  const [recordCount, setRecordCount] = useState(0)
  const [teamCount, setTeamCount] = useState(0)
  const [playerCount, setPlayerCount] = useState(0)
  const [loading, setLoading] = useState(false)

  const loadData = async (seasonId: number | null) => {
    if (!seasonId) return
    setLoading(true)
    try {
      const [t1, t2, p1, s1, listRes] = await Promise.all([
        getTeamTotalRanking(seasonId),
        getTeamAverageRanking(seasonId),
        getPlayerTotalRanking(seasonId),
        getSchedule(seasonId),
        getPlayerList({}),
      ])
      setTeamTotal(Array.isArray(t1) ? t1 : [])
      setTeamAvg(Array.isArray(t2) ? t2 : [])
      setPlayerTotal(Array.isArray(p1) ? p1 : [])
      setSchedule(Array.isArray(s1) ? s1 : [])
      setRecordCount(listRes?.total || 0)
      const teams = new Set((listRes?.list || []).map((x) => x.teamName))
      const players = new Set((listRes?.list || []).map((x) => x.playerName))
      setTeamCount(teams.size)
      setPlayerCount(players.size)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  const init = async () => {
    try {
      const [s1, s2] = await Promise.all([getAppSeasons(), getCurrentSeasonId()])
      setSeasons(Array.isArray(s1) ? s1 : [])
      setCurrentSeasonId(s2 ?? null)
      setSelectedSeason(s2 ?? null)
      if (s2) loadData(s2)
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    init()
  }, [])

  const teamColumns: ColumnsType<TeamRanking> = [
    { title: '排名', dataIndex: 'rank', width: 70, align: 'center' },
    { title: '战队名称', dataIndex: 'teamName' },
    { title: '分数', dataIndex: 'score', align: 'right', render: (v: number) => <b>{v}</b> },
  ]

  const playerColumns: ColumnsType<PlayerRanking> = [
    { title: '排名', dataIndex: 'rank', width: 70, align: 'center' },
    { title: '选手名称', dataIndex: 'playerName' },
    { title: '战队', dataIndex: 'teamName' },
    { title: '总分', dataIndex: 'score', align: 'right', render: (v: number) => <b>{v}</b> },
  ]

  const scheduleColumns: ColumnsType<ScheduleItem> = [
    {
      title: '阶段',
      dataIndex: 'stage',
      width: 100,
      render: (v: string) => <Tag color="blue">{stageToLabel(v)}</Tag>,
    },
    { title: '场次', dataIndex: 'roundNumber', width: 80 },
    { title: '比赛日期', dataIndex: 'matchDate', width: 120 },
    { title: '参赛战队', dataIndex: 'teams', render: (teams: string[]) => teams?.join(' vs ') },
  ]

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <Select
          style={{ width: 220 }}
          value={selectedSeason ?? undefined}
          onChange={(v) => {
            setSelectedSeason(v)
            loadData(v)
          }}
          options={seasons.map((s) => ({
            value: s.id,
            label: `${s.name}${s.currentSeason ? ' (当前)' : ''}`,
          }))}
          placeholder="选择赛季"
        />
      </div>

      <Spin spinning={loading}>
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="战队数量"
                value={teamCount}
                prefix={<TeamOutlined style={{ color: '#1677ff' }} />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="选手数量"
                value={playerCount}
                prefix={<UserOutlined style={{ color: '#52c41a' }} />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="比赛场次"
                value={schedule.length}
                prefix={<CalendarOutlined style={{ color: '#faad14' }} />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="得分记录"
                value={recordCount}
                prefix={<TrophyOutlined style={{ color: '#eb2f96' }} />}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Card title="战队总分排行榜" size="small">
              <Table
                rowKey="teamId"
                columns={teamColumns}
                dataSource={teamTotal}
                pagination={false}
                size="small"
              />
            </Card>
          </Col>
          <Col span={12}>
            <Card title="战队均分排行榜" size="small">
              <Table
                rowKey="teamId"
                columns={teamColumns}
                dataSource={teamAvg}
                pagination={false}
                size="small"
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={16} style={{ marginTop: 16 }}>
          <Col span={12}>
            <Card title="选手总分排行榜" size="small">
              <Table
                rowKey="playerId"
                columns={playerColumns}
                dataSource={playerTotal}
                pagination={false}
                size="small"
              />
            </Card>
          </Col>
          <Col span={12}>
            <Card title="赛季赛程" size="small">
              <Table
                rowKey={(r) => `${r.stage}-${r.roundNumber}-${r.matchDate}`}
                columns={scheduleColumns}
                dataSource={schedule}
                pagination={{ pageSize: 6, size: 'small' }}
                size="small"
              />
            </Card>
          </Col>
        </Row>
      </Spin>

      <div style={{ marginTop: 16, color: '#999', fontSize: 12 }}>
        <Space>
          <Tag color="gold">MVP</Tag>
          <Tag color="blue">SVP</Tag>
          <Tag color="red">背锅</Tag>
        </Space>
        当前赛季 ID：{currentSeasonId ?? '未配置'}
      </div>
    </div>
  )
}

export default Dashboard

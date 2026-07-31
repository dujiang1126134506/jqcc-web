import { useState, useEffect } from 'react'
import { Row, Col, Card, Statistic, Select, Table, List, Tag, Empty, Spin } from 'antd'
import {
  TrophyOutlined,
  TeamOutlined,
  UserOutlined,
  CalendarOutlined,
} from '@ant-design/icons'
import { appApi, seasonApi } from '@/api'
import type { TeamRanking, PlayerRanking, ScheduleItem } from '@/api'
import type { Season } from '@/types'
import { stageLabel } from '@/types'

export default function Dashboard() {
  const [seasons, setSeasons] = useState<Season[]>([])
  const [currentSeasonId, setCurrentSeasonId] = useState<number | undefined>()
  const [selectedSeason, setSelectedSeason] = useState<number | undefined>()

  const [teamTotal, setTeamTotal] = useState<TeamRanking[]>([])
  const [teamAvg, setTeamAvg] = useState<TeamRanking[]>([])
  const [playerTotal, setPlayerTotal] = useState<PlayerRanking[]>([])
  const [schedule, setSchedule] = useState<ScheduleItem[]>([])
  const [loading, setLoading] = useState(false)

  // 加载基础数据
  useEffect(() => {
    const init = async () => {
      const [seasonsData, currentId] = await Promise.all([
        seasonApi.list(),
        appApi.currentSeasonId().catch(() => null),
      ])
      setSeasons(seasonsData)
      if (currentId) {
        setCurrentSeasonId(currentId)
        setSelectedSeason(currentId)
      } else if (seasonsData.length > 0) {
        setSelectedSeason(seasonsData[0].id)
      }
    }
    init()
  }, [])

  // 加载排行数据
  useEffect(() => {
    if (!selectedSeason) return
    setLoading(true)
    Promise.all([
      appApi.teamTotalRanking(selectedSeason),
      appApi.teamAverageRanking(selectedSeason),
      appApi.playerTotalRanking(selectedSeason),
      appApi.schedule(selectedSeason),
    ])
      .then(([t1, t2, p, s]) => {
        setTeamTotal(t1)
        setTeamAvg(t2)
        setPlayerTotal(p)
        setSchedule(s)
      })
      .finally(() => setLoading(false))
  }, [selectedSeason])

  const top3Style = (rank: number) => {
    const colors = ['#faad14', '#d9d9d9', '#d46b08']
    return rank <= 3 ? { color: colors[rank - 1], fontWeight: 600 } : {}
  }

  const teamColumns = [
    {
      title: '排名',
      dataIndex: 'rank',
      width: 60,
      render: (v: number) => <span style={top3Style(v)}>#{v}</span>,
    },
    {
      title: '战队',
      dataIndex: 'teamName',
      render: (v: string, record: TeamRanking) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {record.teamLogo ? (
            <img
              src={record.teamLogo}
              alt=""
              style={{ width: 24, height: 24, borderRadius: '50%' }}
            />
          ) : (
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: '#f0f0f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 10,
              }}
            >
              战
            </div>
          )}
          {v}
        </div>
      ),
    },
    {
      title: '分数',
      dataIndex: 'score',
      align: 'right' as const,
      render: (v: number) => <strong>{v}</strong>,
    },
  ]

  const playerColumns = [
    {
      title: '排名',
      dataIndex: 'rank',
      width: 60,
      render: (v: number) => <span style={top3Style(v)}>#{v}</span>,
    },
    {
      title: '选手',
      dataIndex: 'playerName',
      render: (v: string, record: PlayerRanking) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {record.playerAvatar ? (
            <img
              src={record.playerAvatar}
              alt=""
              style={{ width: 24, height: 24, borderRadius: '50%' }}
            />
          ) : (
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: '#f0f0f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 10,
              }}
            >
              选
            </div>
          )}
          <div>
            <div>{v}</div>
            {record.teamName && (
              <div style={{ fontSize: 11, color: '#999' }}>{record.teamName}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: '总分',
      dataIndex: 'score',
      align: 'right' as const,
      render: (v: number) => <strong style={{ color: '#1677ff' }}>{v}</strong>,
    },
  ]

  return (
    <div>
      {/* 顶部统计卡片 + 赛季切换 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="赛季数"
              value={seasons.length}
              prefix={<TrophyOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="战队数"
              value={teamTotal.length}
              prefix={<TeamOutlined style={{ color: '#13c2c2' }} />}
              valueStyle={{ color: '#13c2c2' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="选手数"
              value={playerTotal.length}
              prefix={<UserOutlined style={{ color: '#1677ff' }} />}
              valueStyle={{ color: '#1677ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="赛赛场次"
              value={schedule.length}
              prefix={<CalendarOutlined style={{ color: '#fa8c16' }} />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 赛季切换 */}
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 16, fontWeight: 500 }}>数据概览</div>
        <Select
          style={{ width: 200 }}
          value={selectedSeason}
          onChange={setSelectedSeason}
          options={seasons.map((s) => ({
            label: s.name + (s.id === currentSeasonId ? '（当前赛季）' : ''),
            value: s.id,
          }))}
        />
      </div>

      <Spin spinning={loading}>
        <Row gutter={16}>
          {/* 战队总分排行 */}
          <Col span={8}>
            <Card title="战队总分排行" bordered={false} size="small">
              {teamTotal.length > 0 ? (
                <Table<TeamRanking>
                  size="small"
                  rowKey="teamId"
                  columns={teamColumns}
                  dataSource={teamTotal}
                  pagination={false}
                  showHeader={false}
                />
              ) : (
                <Empty description="暂无数据" />
              )}
            </Card>
          </Col>

          {/* 战队均分排行 */}
          <Col span={8}>
            <Card title="战队均分排行" bordered={false} size="small">
              {teamAvg.length > 0 ? (
                <Table<TeamRanking>
                  size="small"
                  rowKey="teamId"
                  columns={teamColumns}
                  dataSource={teamAvg}
                  pagination={false}
                  showHeader={false}
                />
              ) : (
                <Empty description="暂无数据" />
              )}
            </Card>
          </Col>

          {/* 选手总分排行 */}
          <Col span={8}>
            <Card title="选手总分排行" bordered={false} size="small">
              {playerTotal.length > 0 ? (
                <Table<PlayerRanking>
                  size="small"
                  rowKey="playerId"
                  columns={playerColumns}
                  dataSource={playerTotal.slice(0, 10)}
                  pagination={false}
                  showHeader={false}
                />
              ) : (
                <Empty description="暂无数据" />
              )}
            </Card>
          </Col>
        </Row>

        {/* 赛程 */}
        <Card
          title="本赛季赛程"
          bordered={false}
          size="small"
          style={{ marginTop: 16 }}
        >
          {schedule.length > 0 ? (
            <List
              size="small"
              dataSource={schedule}
              renderItem={(item) => (
                <List.Item
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Tag color="blue">{stageLabel(item.stage)}</Tag>
                    <span>第 {item.roundNumber} 轮</span>
                    <span style={{ color: '#999', fontSize: 13 }}>{item.matchDate}</span>
                  </div>
                  <div>
                    {item.teams.map((t, i) => (
                      <span key={i}>
                        {i > 0 && <span style={{ color: '#ccc', margin: '0 8px' }}>VS</span>}
                        <span style={{ fontWeight: 500 }}>{t}</span>
                      </span>
                    ))}
                  </div>
                </List.Item>
              )}
            />
          ) : (
            <Empty description="暂无赛程数据" />
          )}
        </Card>
      </Spin>
    </div>
  )
}

import React, { useEffect, useState } from 'react'
import {
  Button,
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Switch,
  Table,
  Modal,
  message,
  Popconfirm,
  Tag,
  Card,
  Row,
  Col,
  Space,
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { getSeasons, getTeams } from '@/api'
import type { Season, Team } from '@/types'
import { STAGE_OPTIONS, stageToLabel } from '@/types'

// 后端 /api/player-scores 接口类型
interface ScoreVO {
  id: number
  seasonId: number
  teamId: number
  teamName: string
  teamLogo?: string
  playerId: number
  playerName: string
  playerAvatar?: string
  stage: string
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

interface PageResult<T> {
  list: T[]
  total: number
  pageNum: number
  pageSize: number
}

const ScorePage: React.FC = () => {
  const [list, setList] = useState<ScoreVO[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [pageNum, setPageNum] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [seasons, setSeasons] = useState<Season[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [queryForm] = Form.useForm()
  const [form] = Form.useForm()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<ScoreVO | null>(null)
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])

  const fetchList = async (page = pageNum, size = pageSize) => {
    setLoading(true)
    try {
      const values = await queryForm.validateFields()
      const params = new URLSearchParams()
      if (values.seasonId) params.append('seasonId', values.seasonId)
      if (values.teamId) params.append('teamId', values.teamId)
      if (values.playerId) params.append('playerId', values.playerId)
      if (values.stage) params.append('stage', values.stage)
      if (values.roundNumber) params.append('roundNumber', values.roundNumber)
      if (values.startDate) params.append('startDate', values.startDate.format('YYYY-MM-DD'))
      if (values.endDate) params.append('endDate', values.endDate.format('YYYY-MM-DD'))
      params.append('pageNum', String(page))
      params.append('pageSize', String(size))

      const res = await fetch(`/api/player-scores/page?${params.toString()}`)
      const json = await res.json()
      if (json.code === 200) {
        const data: PageResult<ScoreVO> = json.data
        setList(data.list || [])
        setTotal(data.total)
      } else {
        message.error(json.message || '查询失败')
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  const fetchSeasons = async () => {
    try {
      const data = await getSeasons()
      setSeasons(Array.isArray(data) ? data : [])
    } catch {
      // ignore
    }
  }

  const fetchTeams = async () => {
    try {
      const data = await getTeams()
      setTeams(Array.isArray(data) ? data : [])
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    fetchSeasons()
    fetchTeams()
    fetchList(1, 20)
  }, [])

  const openCreate = () => {
    setEditing(null)
    form.resetFields()
    form.setFieldsValue({
      roundNumber: 1,
      winLoseScore: 0,
      voteScore: 0,
      skillScore: 0,
      penaltyScore: 0,
      extraScore: 0,
      mvp: false,
      svp: false,
      scapegoat: false,
      stage: 'REGULAR',
      matchDate: dayjs(),
    })
    setModalOpen(true)
  }

  const openEdit = async (row: ScoreVO) => {
    setEditing(row)
    // 先加载当前战队的选手列表
    form.setFieldsValue({
      seasonId: row.seasonId,
      teamId: row.teamId,
      playerId: row.playerId,
      stage: row.stage,
      roundNumber: row.roundNumber,
      matchDate: dayjs(row.matchDate),
      identity: row.identity,
      version: row.version,
      winLoseScore: row.winLoseScore,
      voteScore: row.voteScore,
      skillScore: row.skillScore,
      penaltyScore: row.penaltyScore,
      extraScore: row.extraScore,
      mvp: row.mvp,
      svp: row.svp,
      scapegoat: row.scapegoat,
    })
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const payload = {
        seasonId: values.seasonId,
        teamId: values.teamId,
        playerId: values.playerId,
        stage: values.stage,
        roundNumber: values.roundNumber,
        matchDate: values.matchDate.format('YYYY-MM-DD'),
        identity: values.identity,
        version: values.version,
        winLoseScore: values.winLoseScore ?? 0,
        voteScore: values.voteScore ?? 0,
        skillScore: values.skillScore ?? 0,
        penaltyScore: values.penaltyScore ?? 0,
        extraScore: values.extraScore ?? 0,
        mvp: values.mvp ?? false,
        svp: values.svp ?? false,
        scapegoat: values.scapegoat ?? false,
      }

      const url = editing ? `/api/player-scores/${editing.id}` : '/api/player-scores'
      const method = editing ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (json.code === 200) {
        message.success(editing ? '更新成功' : '创建成功')
        setModalOpen(false)
        fetchList()
      } else {
        message.error(json.message || '操作失败')
      }
    } catch {
      // ignore
    }
  }

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/player-scores/${id}`, { method: 'DELETE' })
      const json = await res.json()
      if (json.code === 200) {
        message.success('删除成功')
        fetchList()
      } else {
        message.error(json.message || '删除失败')
      }
    } catch {
      // ignore
    }
  }

  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要删除的记录')
      return
    }
    try {
      const res = await fetch('/api/player-scores/batch', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedRowKeys),
      })
      const json = await res.json()
      if (json.code === 200) {
        message.success(`已删除 ${selectedRowKeys.length} 条记录`)
        setSelectedRowKeys([])
        fetchList()
      } else {
        message.error(json.message || '删除失败')
      }
    } catch {
      // ignore
    }
  }

  const columns: ColumnsType<ScoreVO> = [
    { title: 'ID', dataIndex: 'id', width: 70 },
    { title: '战队', dataIndex: 'teamName', width: 120 },
    { title: '选手', dataIndex: 'playerName', width: 120 },
    {
      title: '阶段',
      dataIndex: 'stage',
      width: 100,
      render: (v: string) => v ? stageToLabel(v) : '-',
    },
    { title: '场次', dataIndex: 'roundNumber', width: 70 },
    { title: '比赛日期', dataIndex: 'matchDate', width: 110 },
    { title: '身份', dataIndex: 'identity', width: 80 },
    { title: '版型', dataIndex: 'version', width: 80 },
    { title: '胜负分', dataIndex: 'winLoseScore', width: 70, align: 'right' },
    { title: '投票分', dataIndex: 'voteScore', width: 70, align: 'right' },
    { title: '技能分', dataIndex: 'skillScore', width: 70, align: 'right' },
    { title: '违规分', dataIndex: 'penaltyScore', width: 70, align: 'right' },
    { title: '额外分', dataIndex: 'extraScore', width: 70, align: 'right' },
    {
      title: '总得分',
      dataIndex: 'totalScore',
      width: 90,
      align: 'right',
      render: (v: number) => <b style={{ color: '#1677ff' }}>{v}</b>,
    },
    {
      title: '奖项',
      key: 'awards',
      width: 130,
      render: (_, row) => (
        <div>
          {row.mvp && <Tag color="gold">MVP</Tag>}
          {row.svp && <Tag color="blue">SVP</Tag>}
          {row.scapegoat && <Tag color="red">背锅</Tag>}
        </div>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 140,
      fixed: 'right',
      render: (_, row) => (
        <>
          <Button type="link" icon={<EditOutlined />} onClick={() => openEdit(row)}>
            编辑
          </Button>
          <Popconfirm title="确定删除这条记录吗？" onConfirm={() => handleDelete(row.id)}>
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ]

  return (
    <div>
      <Card style={{ marginBottom: 16 }} size="small">
        <Form form={queryForm} layout="inline" onFinish={() => fetchList(1, pageSize)}>
          <Form.Item name="seasonId" label="赛季">
            <Select
              placeholder="请选择赛季"
              allowClear
              style={{ width: 160 }}
              options={seasons.map((s) => ({ value: s.id, label: s.name }))}
            />
          </Form.Item>
          <Form.Item name="teamId" label="战队">
            <Select
              placeholder="请选择战队"
              allowClear
              style={{ width: 160 }}
              options={teams.map((t) => ({ value: t.id, label: t.name }))}
            />
          </Form.Item>
          <Form.Item name="stage" label="阶段">
            <Select
              placeholder="请选择阶段"
              allowClear
              style={{ width: 120 }}
              options={STAGE_OPTIONS.map((s) => ({ value: s.value, label: s.label }))}
            />
          </Form.Item>
          <Form.Item name="roundNumber" label="场次">
            <InputNumber placeholder="第几轮" min={1} style={{ width: 100 }} />
          </Form.Item>
          <Form.Item name="startDate" label="开始日期">
            <DatePicker placeholder="开始日期" />
          </Form.Item>
          <Form.Item name="endDate" label="结束日期">
            <DatePicker placeholder="结束日期" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
              查询
            </Button>
            <Button
              style={{ marginLeft: 8 }}
              onClick={() => {
                queryForm.resetFields()
                fetchList(1, pageSize)
              }}
            >
              重置
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between' }}>
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            新增记录
          </Button>
          <Popconfirm
            title={`确定删除选中的 ${selectedRowKeys.length} 条记录吗？`}
            onConfirm={handleBatchDelete}
          >
            <Button danger icon={<DeleteOutlined />} disabled={selectedRowKeys.length === 0}>
              批量删除
            </Button>
          </Popconfirm>
        </Space>
        <div style={{ color: '#888' }}>共 {total} 条</div>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={list}
        loading={loading}
        scroll={{ x: 1500 }}
        rowSelection={{
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys(keys),
        }}
        pagination={{
          current: pageNum,
          pageSize,
          total,
          showSizeChanger: true,
          onChange: (page, size) => {
            setPageNum(page)
            setPageSize(size)
            fetchList(page, size)
          },
        }}
      />

      <Modal
        title={editing ? '编辑得分记录' : '新增得分记录'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        width={720}
        destroyOnClose
        maskClosable={false}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 8 }}>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="赛季"
                name="seasonId"
                rules={[{ required: true, message: '请选择赛季' }]}
              >
                <Select
                  placeholder="请选择赛季"
                  options={seasons.map((s) => ({ value: s.id, label: s.name }))}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="战队"
                name="teamId"
                rules={[{ required: true, message: '请选择战队' }]}
              >
                <Select
                  placeholder="请选择战队"
                  options={teams.map((t) => ({ value: t.id, label: t.name }))}
                  showSearch
                  optionFilterProp="children"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="选手ID"
                name="playerId"
                rules={[{ required: true, message: '请输入选手ID' }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} placeholder="选手ID" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="赛程阶段"
                name="stage"
                rules={[{ required: true, message: '请选择阶段' }]}
              >
                <Select
                  options={STAGE_OPTIONS.map((s) => ({ value: s.value, label: s.label }))}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="场次（第几轮）"
                name="roundNumber"
                rules={[{ required: true, message: '请输入场次' }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="比赛日期"
                name="matchDate"
                rules={[{ required: true, message: '请选择日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="身份" name="identity">
                <Input placeholder="如：队长" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="版型" name="version">
                <Input placeholder="如：标准版" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="胜负分" name="winLoseScore">
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="投票分" name="voteScore">
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="技能分" name="skillScore">
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="违规分（负为扣分）" name="penaltyScore">
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="额外分" name="extraScore">
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label=" " colon={false}>
                <div style={{ padding: '4px 0', fontWeight: 500 }}>
                  <Form.Item noStyle shouldUpdate>
                    {() => {
                      const v = form.getFieldsValue()
                      const total =
                        Number(v.winLoseScore || 0) +
                        Number(v.voteScore || 0) +
                        Number(v.skillScore || 0) +
                        Number(v.penaltyScore || 0) +
                        Number(v.extraScore || 0)
                      return (
                        <span>
                          总得分：<span style={{ color: '#1677ff', fontSize: 16 }}>{total}</span>
                        </span>
                      )
                    }}
                  </Form.Item>
                </div>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="是否MVP" name="mvp" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="是否SVP" name="svp" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="是否背锅" name="scapegoat" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  )
}

export default ScorePage

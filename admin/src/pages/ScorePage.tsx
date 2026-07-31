import { useState, useEffect, useMemo } from 'react'
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Switch,
  Tag,
  message,
  Popconfirm,
  Row,
  Col,
  Card,
  Tooltip,
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  TrophyOutlined,
  FireOutlined,
  FrownOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { playerScoreApi, seasonApi, teamApi, playerApi } from '@/api'
import type { PlayerScoreVO, Season, Team, Player, StageEnum } from '@/types'
import { STAGE_OPTIONS, stageLabel } from '@/types'

const { RangePicker } = DatePicker

export default function ScorePage() {
  const [list, setList] = useState<PlayerScoreVO[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [pageNum, setPageNum] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [seasons, setSeasons] = useState<Season[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [players, setPlayers] = useState<Player[]>([])

  // 过滤条件
  const [searchForm] = Form.useForm()
  const [filters, setFilters] = useState<Record<string, any>>({})

  // 编辑弹窗
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<PlayerScoreVO | null>(null)
  const [form] = Form.useForm()

  // 选中行
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])

  // 基础数据
  useEffect(() => {
    seasonApi.list().then(setSeasons)
    teamApi.list().then(setTeams)
    playerApi.list().then(setPlayers)
  }, [])

  const fetchList = async () => {
    setLoading(true)
    try {
      const params: any = { ...filters, pageNum, pageSize }
      if (filters.dateRange && filters.dateRange.length === 2) {
        params.startDate = filters.dateRange[0].format('YYYY-MM-DD')
        params.endDate = filters.dateRange[1].format('YYYY-MM-DD')
        delete params.dateRange
      }
      const data = await playerScoreApi.page(params)
      setList(data.list)
      setTotal(data.total)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (seasons.length > 0) fetchList()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seasons, pageNum, pageSize, filters])

  const handleSearch = () => {
    const values = searchForm.getFieldsValue()
    setPageNum(1)
    setFilters(values)
  }

  const handleReset = () => {
    searchForm.resetFields()
    setPageNum(1)
    setFilters({})
  }

  const handleAdd = () => {
    setEditing(null)
    form.resetFields()
    form.setFieldsValue({
      stage: 'REGULAR',
      roundNumber: 1,
      winLoseScore: 0,
      voteScore: 0,
      skillScore: 0,
      penaltyScore: 0,
      extraScore: 0,
      mvp: false,
      svp: false,
      scapegoat: false,
      matchDate: dayjs(),
    })
    setModalOpen(true)
  }

  const handleEdit = (record: PlayerScoreVO) => {
    setEditing(record)
    form.setFieldsValue({
      ...record,
      matchDate: dayjs(record.matchDate),
    })
    setModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    await playerScoreApi.delete(id)
    message.success('删除成功')
    fetchList()
  }

  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) return
    await playerScoreApi.deleteBatch(selectedRowKeys as number[])
    message.success(`已删除 ${selectedRowKeys.length} 条记录`)
    setSelectedRowKeys([])
    fetchList()
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()
    const payload = {
      ...values,
      matchDate: values.matchDate.format('YYYY-MM-DD'),
    }
    if (editing?.id) {
      await playerScoreApi.update(editing.id, payload)
      message.success('修改成功')
    } else {
      await playerScoreApi.create(payload)
      message.success('新增成功')
    }
    setModalOpen(false)
    fetchList()
  }

  // 实时计算总得分（弹窗内）
  const totalPreview = useMemo(() => {
    const v = form.getFieldsValue()
    const sum =
      Number(v.winLoseScore || 0) +
      Number(v.voteScore || 0) +
      Number(v.skillScore || 0) +
      Number(v.penaltyScore || 0) +
      Number(v.extraScore || 0)
    return sum
  }, [form])

  const columns: ColumnsType<PlayerScoreVO> = [
    { title: 'ID', dataIndex: 'id', width: 60, fixed: 'left' },
    {
      title: '赛季',
      dataIndex: 'seasonId',
      width: 120,
      render: (v) => seasons.find((s) => s.id === v)?.name || '-',
    },
    {
      title: '战队',
      dataIndex: 'teamName',
      width: 120,
      render: (v, record) => (
        <Space size={6}>
          {record.teamLogo ? (
            <img
              src={record.teamLogo}
              alt=""
              style={{ width: 20, height: 20, borderRadius: '50%' }}
            />
          ) : null}
          <span>{v}</span>
        </Space>
      ),
    },
    {
      title: '选手',
      dataIndex: 'playerName',
      width: 110,
      render: (v, record) => (
        <Space size={6}>
          {record.playerAvatar ? (
            <img
              src={record.playerAvatar}
              alt=""
              style={{ width: 20, height: 20, borderRadius: '50%' }}
            />
          ) : null}
          <span>{v}</span>
        </Space>
      ),
    },
    { title: '阶段', dataIndex: 'stage', width: 80, render: (v) => stageLabel(v) },
    { title: '场次', dataIndex: 'roundNumber', width: 70 },
    { title: '比赛日期', dataIndex: 'matchDate', width: 110 },
    { title: '身份', dataIndex: 'identity', width: 80 },
    { title: '版型', dataIndex: 'version', width: 80 },
    { title: '胜负分', dataIndex: 'winLoseScore', width: 80, align: 'right' },
    { title: '投票分', dataIndex: 'voteScore', width: 80, align: 'right' },
    { title: '技能分', dataIndex: 'skillScore', width: 80, align: 'right' },
    {
      title: '违规分',
      dataIndex: 'penaltyScore',
      width: 80,
      align: 'right',
      render: (v) =>
        v < 0 ? <span style={{ color: '#ff4d4f' }}>{v}</span> : v,
    },
    { title: '额外分', dataIndex: 'extraScore', width: 80, align: 'right' },
    {
      title: '总得分',
      dataIndex: 'totalScore',
      width: 90,
      align: 'right',
      render: (v) => <strong style={{ color: '#1677ff' }}>{v}</strong>,
    },
    {
      title: '荣誉',
      key: 'honor',
      width: 120,
      render: (_, record) => (
        <Space size={4}>
          {record.mvp && (
            <Tooltip title="MVP">
              <Tag color="gold" icon={<TrophyOutlined />}>
                MVP
              </Tag>
            </Tooltip>
          )}
          {record.svp && (
            <Tooltip title="SVP">
              <Tag color="blue" icon={<FireOutlined />}>
                SVP
              </Tag>
            </Tooltip>
          )}
          {record.scapegoat && (
            <Tooltip title="背锅">
              <Tag color="red" icon={<FrownOutlined />}>
                背锅
              </Tag>
            </Tooltip>
          )}
        </Space>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 140,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确定删除该记录？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <Card size="small" style={{ marginBottom: 16 }}>
        <Form form={searchForm} layout="inline" onFinish={handleSearch}>
          <Form.Item name="seasonId" label="赛季">
            <Select
              style={{ width: 140 }}
              placeholder="全部"
              allowClear
              options={seasons.map((s) => ({ label: s.name, value: s.id }))}
            />
          </Form.Item>
          <Form.Item name="teamId" label="战队">
            <Select
              style={{ width: 140 }}
              placeholder="全部"
              allowClear
              options={teams.map((t) => ({ label: t.name, value: t.id }))}
            />
          </Form.Item>
          <Form.Item name="playerId" label="选手">
            <Select
              style={{ width: 140 }}
              placeholder="全部"
              allowClear
              showSearch
              optionFilterProp="label"
              options={players.map((p) => ({ label: p.name, value: p.id }))}
            />
          </Form.Item>
          <Form.Item name="stage" label="阶段">
            <Select
              style={{ width: 120 }}
              placeholder="全部"
              allowClear
              options={STAGE_OPTIONS}
            />
          </Form.Item>
          <Form.Item name="roundNumber" label="场次">
            <InputNumber style={{ width: 100 }} placeholder="第几轮" min={1} />
          </Form.Item>
          <Form.Item name="dateRange" label="日期">
            <RangePicker />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" icon={<SearchOutlined />} htmlType="submit">
                查询
              </Button>
              <Button icon={<ReloadOutlined />} onClick={handleReset}>
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <div
        style={{
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增记录
          </Button>
          <Popconfirm
            title={`确定删除选中的 ${selectedRowKeys.length} 条记录？`}
            onConfirm={handleBatchDelete}
            disabled={selectedRowKeys.length === 0}
            okText="确定"
            cancelText="取消"
          >
            <Button danger icon={<DeleteOutlined />} disabled={selectedRowKeys.length === 0}>
              批量删除
            </Button>
          </Popconfirm>
          {selectedRowKeys.length > 0 && (
            <span style={{ color: '#666', fontSize: 13 }}>
              已选择 <strong>{selectedRowKeys.length}</strong> 项
            </span>
          )}
        </Space>
        <span style={{ color: '#999', fontSize: 13 }}>共 {total} 条记录</span>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={list}
        loading={loading}
        scroll={{ x: 1400 }}
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
        }}
        pagination={{
          current: pageNum,
          pageSize,
          total,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`,
          onChange: (p, ps) => {
            setPageNum(p)
            setPageSize(ps)
          },
        }}
      />

      <Modal
        title={editing ? '编辑得分记录' : '新增得分记录'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        okText="确定"
        cancelText="取消"
        width={720}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          style={{ marginTop: 8 }}
          onValuesChange={() => {
            // 触发 totalPreview 重计算
            form.setFieldsValue({})
          }}
        >
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="赛季"
                name="seasonId"
                rules={[{ required: true, message: '请选择赛季' }]}
              >
                <Select
                  placeholder="请选择赛季"
                  options={seasons.map((s) => ({ label: s.name, value: s.id }))}
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
                  options={teams.map((t) => ({ label: t.name, value: t.id }))}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="选手"
                name="playerId"
                rules={[{ required: true, message: '请选择选手' }]}
              >
                <Select
                  placeholder="请选择选手"
                  showSearch
                  optionFilterProp="label"
                  options={players.map((p) => ({ label: p.name, value: p.id }))}
                />
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
                <Select options={STAGE_OPTIONS} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="场次（第几轮）"
                name="roundNumber"
                rules={[{ required: true, message: '请输入场次' }]}
              >
                <InputNumber style={{ width: '100%' }} min={1} />
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
                <Input placeholder="如：队长、队员" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="版型" name="version">
                <Input placeholder="如：标准版" />
              </Form.Item>
            </Col>
          </Row>

          <div
            style={{
              margin: '8px 0 12px',
              padding: '10px 16px',
              background: '#f6ffed',
              border: '1px solid #b7eb8f',
              borderRadius: 6,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ color: '#389e0d' }}>
              得分公式：胜负分 + 投票分 + 技能分 + 违规分 + 额外分
            </span>
            <span style={{ color: '#389e0d', fontWeight: 600 }}>
              总得分预览：<span style={{ fontSize: 18 }}>{totalPreview}</span>
            </span>
          </div>

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
              <Form.Item label="违规分（扣分填负数）" name="penaltyScore">
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="额外分" name="extraScore">
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="是否MVP" name="mvp" valuePropName="checked">
                <Switch checkedChildren="是" unCheckedChildren="否" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="是否SVP" name="svp" valuePropName="checked">
                <Switch checkedChildren="是" unCheckedChildren="否" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="是否背锅" name="scapegoat" valuePropName="checked">
                <Switch checkedChildren="是" unCheckedChildren="否" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  )
}

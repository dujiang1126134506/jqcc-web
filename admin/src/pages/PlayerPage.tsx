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
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import {
  getPlayerList,
  createPlayer,
  updatePlayer,
  deletePlayer,
  getSeasons,
} from '@/api'
import { STAGE_OPTIONS, stageToLabel, type PlayerRecordVO, type Season } from '@/types'

const PlayerPage: React.FC = () => {
  const [list, setList] = useState<PlayerRecordVO[]>([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<PlayerRecordVO | null>(null)
  const [form] = Form.useForm()
  const [queryForm] = Form.useForm()
  const [seasons, setSeasons] = useState<Season[]>([])

  const fetchList = async () => {
    setLoading(true)
    try {
      const values = await queryForm.validateFields()
      const data = await getPlayerList(values)
      setList(Array.isArray(data?.list) ? data.list : [])
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

  useEffect(() => {
    fetchSeasons()
    fetchList()
  }, [])

  const openCreate = () => {
    setEditing(null)
    form.resetFields()
    form.setFieldsValue({
      round: 1,
      voteScore: 0,
      winScore: 0,
      skillScore: 0,
      penaltyScore: 0,
      extraScore: 0,
      isMvp: false,
      isSvp: false,
      isBlame: false,
      stage: 'REGULAR',
      date: dayjs(),
    })
    setModalOpen(true)
  }

  const openEdit = async (row: PlayerRecordVO) => {
    setEditing(row)
    form.setFieldsValue({
      playerName: row.playerName,
      playerAvatar: row.playerAvatar,
      teamName: row.teamName,
      teamLogo: row.teamLogo,
      season: row.season,
      stage: row.stage,
      round: row.round,
      date: dayjs(row.date),
      identity: row.identity,
      role: row.role,
      voteScore: row.voteScore,
      winScore: row.winScore,
      skillScore: row.skillScore,
      penaltyScore: row.penaltyScore,
      extraScore: row.extraScore,
      isMvp: row.isMvp,
      isSvp: row.isSvp,
      isBlame: row.isBlame,
    })
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const payload = {
        playerName: values.playerName,
        playerAvatar: values.playerAvatar,
        teamName: values.teamName,
        teamLogo: values.teamLogo,
        season: values.season,
        stage: values.stage,
        round: values.round,
        date: values.date.format('YYYY-MM-DD'),
        identity: values.identity,
        role: values.role,
        voteScore: values.voteScore ?? 0,
        winScore: values.winScore ?? 0,
        skillScore: values.skillScore ?? 0,
        penaltyScore: values.penaltyScore ?? 0,
        extraScore: values.extraScore ?? 0,
        isMvp: values.isMvp ?? false,
        isSvp: values.isSvp ?? false,
        isBlame: values.isBlame ?? false,
      }
      if (editing) {
        await updatePlayer(editing.id, payload)
        message.success('更新成功')
      } else {
        await createPlayer(payload)
        message.success('创建成功')
      }
      setModalOpen(false)
      fetchList()
    } catch {
      // ignore
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deletePlayer(id)
      message.success('删除成功')
      fetchList()
    } catch {
      // ignore
    }
  }

  const columns: ColumnsType<PlayerRecordVO> = [
    { title: 'ID', dataIndex: 'id', width: 70 },
    { title: '赛季', dataIndex: 'season', width: 110 },
    {
      title: '阶段',
      dataIndex: 'stage',
      width: 100,
      render: (v: string) => stageToLabel(v),
    },
    { title: '场次', dataIndex: 'round', width: 70 },
    { title: '日期', dataIndex: 'date', width: 110 },
    { title: '战队', dataIndex: 'teamName', width: 120 },
    { title: '选手', dataIndex: 'playerName', width: 120 },
    { title: '身份', dataIndex: 'identity', width: 80 },
    { title: '版型', dataIndex: 'role', width: 80 },
    { title: '胜负分', dataIndex: 'winScore', width: 70, align: 'right' },
    { title: '投票分', dataIndex: 'voteScore', width: 70, align: 'right' },
    { title: '技能分', dataIndex: 'skillScore', width: 70, align: 'right' },
    { title: '违规分', dataIndex: 'penaltyScore', width: 70, align: 'right' },
    { title: '额外分', dataIndex: 'extraScore', width: 70, align: 'right' },
    {
      title: '总得分',
      dataIndex: 'score',
      width: 90,
      align: 'right',
      render: (v: number) => <b style={{ color: '#1677ff' }}>{v}</b>,
    },
    {
      title: '奖项',
      key: 'awards',
      width: 120,
      render: (_, row) => (
        <div>
          {row.isMvp && <Tag color="gold">MVP</Tag>}
          {row.isSvp && <Tag color="blue">SVP</Tag>}
          {row.isBlame && <Tag color="red">背锅</Tag>}
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
        <Form form={queryForm} layout="inline" onFinish={fetchList}>
          <Form.Item name="season" label="赛季">
            <Select
              placeholder="请选择赛季"
              allowClear
              style={{ width: 160 }}
              options={seasons.map((s) => ({ value: s.name, label: s.name }))}
            />
          </Form.Item>
          <Form.Item name="stage" label="阶段">
            <Select
              placeholder="请选择阶段"
              allowClear
              style={{ width: 140 }}
              options={STAGE_OPTIONS.map((s) => ({ value: s.value, label: s.label }))}
            />
          </Form.Item>
          <Form.Item name="keyword" label="关键字">
            <Input placeholder="选手名/战队名" style={{ width: 180 }} allowClear />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
              查询
            </Button>
            <Button
              style={{ marginLeft: 8 }}
              onClick={() => {
                queryForm.resetFields()
                fetchList()
              }}
            >
              重置
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'flex-end' }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          新增记录
        </Button>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={list}
        loading={loading}
        scroll={{ x: 1400 }}
        pagination={{ pageSize: 20, showSizeChanger: true }}
      />

      <Modal
        title={editing ? '编辑选手数据' : '新增选手数据'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        width={720}
        destroyOnClose
        maskClosable={false}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 8 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="赛季"
                name="season"
                rules={[{ required: true, message: '请输入赛季' }]}
              >
                <Input placeholder="如：2024春季赛" />
              </Form.Item>
            </Col>
            <Col span={12}>
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
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="战队名称"
                name="teamName"
                rules={[{ required: true, message: '请输入战队名' }]}
              >
                <Input placeholder="如：战神战队" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="战队Logo" name="teamLogo">
                <Input placeholder="战队Logo URL" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="选手名称"
                name="playerName"
                rules={[{ required: true, message: '请输入选手名' }]}
              >
                <Input placeholder="如：小明" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="选手头像" name="playerAvatar">
                <Input placeholder="选手头像URL" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="场次（第几轮）" name="round">
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="比赛日期"
                name="date"
                rules={[{ required: true, message: '请选择日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="身份" name="identity">
                <Input placeholder="如：队长" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="版型" name="role">
                <Input placeholder="如：标准版" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="胜负分" name="winScore">
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
              <Form.Item label="违规分（负数为扣分）" name="penaltyScore">
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
                        Number(v.winScore || 0) +
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
              <Form.Item label="是否MVP" name="isMvp" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="是否SVP" name="isSvp" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="是否背锅" name="isBlame" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  )
}

export default PlayerPage

import React, { useState, useEffect } from 'react'
import { Table, Button, Modal, Form, Input, Select, Image, Space, Popconfirm, message, Upload } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons'
import type { Team, Season } from '@/types'
import { getTeams, getSeasons, uploadImage } from '@/api'
import getImageUrl from '@/utils/imageUrl'

interface PlayerInfo {
  id: number
  name: string
  avatar?: string
  teamId: number
  position?: string
  createTime?: string
  updateTime?: string
}

const PlayerInfoPage: React.FC = () => {
  const [data, setData] = useState<PlayerInfo[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [seasons, setSeasons] = useState<Season[]>([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<PlayerInfo | null>(null)
  const [form] = Form.useForm()
  const [teamFilter, setTeamFilter] = useState<number | undefined>()
  const [seasonFilter, setSeasonFilter] = useState<number | undefined>()
  const [formSeasonId, setFormSeasonId] = useState<number | undefined>()

  const [formAvatarUrl, setFormAvatarUrl] = useState<string | undefined>(undefined)

  // 根据赛季过滤后的战队列表
  const filteredTeams = seasonFilter
    ? teams.filter((t) => t.seasonId === seasonFilter)
    : teams
  const formTeams = formSeasonId
    ? teams.filter((t) => t.seasonId === formSeasonId)
    : teams

  const fetchSeasons = async () => {
    try {
      const list = await getSeasons()
      setSeasons(list || [])
    } catch {
      // ignore
    }
  }

  const fetchTeams = async () => {
    try {
      const list = await getTeams()
      setTeams(list || [])
    } catch {
      // ignore
    }
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (teamFilter) params.append('teamId', String(teamFilter))
      const res = await fetch(`/api/player-info/list?${params.toString()}`)
      const json = await res.json()
      if (json.code === 200) {
        setData(json.data || [])
      }
    } catch {
      message.error('获取选手列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSeasons()
    fetchTeams()
  }, [])

  useEffect(() => {
    fetchData()
  }, [teamFilter])

  // 赛季筛选变化时清空战队筛选
  useEffect(() => {
    setTeamFilter(undefined)
  }, [seasonFilter])

  const handleAdd = () => {
    setEditing(null)
    form.resetFields()
    setFormSeasonId(undefined)
    setFormAvatarUrl(undefined)
    setModalOpen(true)
  }

  const handleEdit = (record: PlayerInfo) => {
    setEditing(record)
    const team = teams.find((t) => t.id === record.teamId)
    setFormSeasonId(team?.seasonId)
    setFormAvatarUrl(record.avatar)
    form.setFieldsValue({
      name: record.name,
      avatar: record.avatar,
      teamId: record.teamId,
      position: record.position,
      seasonId: team?.seasonId,
    })
    setModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/player-info/${id}`, { method: 'DELETE' })
      const json = await res.json()
      if (json.code === 200) {
        message.success('删除成功')
        fetchData()
      } else {
        message.error(json.message || '删除失败')
      }
    } catch {
      message.error('删除失败')
    }
  }

  const handleAvatarUpload = async (file: File) => {
    try {
      const res = await uploadImage(file)
      const url = typeof res === 'string' ? res : res.url
      setFormAvatarUrl(url)
      form.setFieldsValue({ avatar: url })
      message.success('头像上传成功')
    } catch {
      message.error('头像上传失败')
    }
    return false // 阻止自动上传
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const url = editing ? `/api/player-info/${editing.id}` : '/api/player-info'
      const method = editing ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      const json = await res.json()
      if (json.code === 200) {
        message.success(editing ? '修改成功' : '新增成功')
        setModalOpen(false)
        fetchData()
      } else {
        message.error(json.message || '操作失败')
      }
    } catch {
      message.error('操作失败')
    }
  }

  const getTeamName = (teamId: number) => {
    return teams.find((t) => t.id === teamId)?.name || '-'
  }

  const getSeasonName = (teamId: number) => {
    const team = teams.find((t) => t.id === teamId)
    return seasons.find((s) => s.id === team?.seasonId)?.name || '-'
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 70,
    },
    {
      title: '头像',
      dataIndex: 'avatar',
      width: 80,
      render: (avatar: string) =>
        avatar ? (
          <Image
            width={36}
            height={36}
            src={getImageUrl(avatar)}
            style={{ borderRadius: '50%', objectFit: 'cover' }}
          />
        ) : (
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: '#e8e8e8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
              color: '#999',
            }}
          >
            ?
          </div>
        ),
    },
    {
      title: '选手姓名',
      dataIndex: 'name',
      width: 140,
    },
    {
      title: '所属赛季',
      dataIndex: 'teamId',
      width: 140,
      render: (teamId: number) => getSeasonName(teamId),
    },
    {
      title: '所属战队',
      dataIndex: 'teamId',
      width: 140,
      render: (teamId: number) => getTeamName(teamId),
    },
    {
      title: '位置/身份',
      dataIndex: 'position',
      width: 120,
      render: (pos: string) => pos || '-',
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      width: 180,
      render: (t: string) => t?.replace('T', ' ').slice(0, 19) || '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      fixed: 'right' as const,
      render: (_: unknown, record: PlayerInfo) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确认删除该选手？"
            onConfirm={() => handleDelete(record.id)}
            okText="删除"
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
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ color: '#666' }}>赛季筛选：</span>
          <Select
            style={{ width: 180 }}
            placeholder="全部赛季"
            allowClear
            value={seasonFilter}
            onChange={(v) => setSeasonFilter(v)}
            options={seasons.map((s) => ({ label: s.name, value: s.id }))}
          />
          <span style={{ color: '#666' }}>战队筛选：</span>
          <Select
            style={{ width: 180 }}
            placeholder="全部战队"
            allowClear
            value={teamFilter}
            onChange={setTeamFilter}
            options={filteredTeams.map((t) => ({ label: t.name, value: t.id }))}
          />
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增选手
        </Button>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={{ pageSize: 10, showSizeChanger: true }}
        scroll={{ x: 1000 }}
      />

      <Modal
        title={editing ? '编辑选手' : '新增选手'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        okText="确定"
        cancelText="取消"
        width={500}
        destroyOnHidden
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="赛季"
            name="seasonId"
            rules={[{ required: true, message: '请选择赛季' }]}
          >
            <Select
              placeholder="请选择赛季"
              onChange={(v) => {
                setFormSeasonId(v)
                form.setFieldsValue({ teamId: undefined })
              }}
              options={seasons.map((s) => ({ label: s.name, value: s.id }))}
            />
          </Form.Item>
          <Form.Item
            name="teamId"
            label="所属战队"
            rules={[{ required: true, message: '请选择所属战队' }]}
          >
            <Select
              placeholder="请先选择赛季"
              disabled={!formSeasonId}
              options={formTeams.map((t) => ({ label: t.name, value: t.id }))}
            />
          </Form.Item>
          <Form.Item
            name="name"
            label="选手姓名"
            rules={[{ required: true, message: '请输入选手姓名' }]}
          >
            <Input placeholder="请输入选手姓名" />
          </Form.Item>
          <Form.Item label="选手头像" name="avatar">
            <div>
              <Upload
                beforeUpload={handleAvatarUpload}
                listType="picture-card"
                maxCount={1}
                showUploadList={false}
                accept="image/*"
              >
                {formAvatarUrl ? (
                <img
                  src={getImageUrl(formAvatarUrl)}
                  alt="头像"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                />
              ) : (
                <div style={{ marginTop: 8, fontSize: 22, color: '#999' }}>
                  <UploadOutlined />
                  <div style={{ marginTop: 4, fontSize: 12 }}>上传头像</div>
                </div>
              )}
            </Upload>
            </div>
          </Form.Item>
          <Form.Item name="position" label="位置/身份">
            <Input placeholder="如：队长、队员、中单等" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default PlayerInfoPage

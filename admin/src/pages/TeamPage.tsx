import React, { useEffect, useState } from 'react'
import {
  Button,
  Form,
  Input,
  Upload,
  Table,
  Modal,
  message,
  Popconfirm,
  Avatar,
  Select,
  Space,
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { getTeams, createTeam, updateTeam, deleteTeam, uploadImage, getSeasons } from '@/api'
import type { Team, Season } from '@/types'

const TeamPage: React.FC = () => {
  const [list, setList] = useState<Team[]>([])
  const [seasons, setSeasons] = useState<Season[]>([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Team | null>(null)
  const [filterSeasonId, setFilterSeasonId] = useState<number | null>(null)
  const [form] = Form.useForm()

  const fetchSeasons = async () => {
    try {
      const data = await getSeasons()
      setSeasons(Array.isArray(data) ? data : [])
    } catch {
      // ignore
    }
  }

  const fetchList = async () => {
    setLoading(true)
    try {
      const data = await getTeams()
      let teams = Array.isArray(data) ? data : []
      if (filterSeasonId) {
        teams = teams.filter((t) => t.seasonId === filterSeasonId)
      }
      setList(teams)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSeasons()
  }, [])

  useEffect(() => {
    fetchList()
  }, [filterSeasonId])

  const openCreate = () => {
    setEditing(null)
    form.resetFields()
    if (filterSeasonId) {
      form.setFieldsValue({ seasonId: filterSeasonId })
    }
    setModalOpen(true)
  }

  const openEdit = (row: Team) => {
    setEditing(row)
    form.setFieldsValue({
      seasonId: row.seasonId,
      name: row.name,
      logo: row.logo,
      description: row.description,
    })
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const payload: Partial<Team> = {
        seasonId: values.seasonId,
        name: values.name,
        logo: values.logo,
        description: values.description,
      }
      if (editing) {
        await updateTeam(editing.id, payload)
        message.success('更新成功')
      } else {
        await createTeam(payload)
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
      await deleteTeam(id)
      message.success('删除成功')
      fetchList()
    } catch {
      // ignore
    }
  }

  const handleLogoUpload = async (file: File) => {
    try {
      const res = await uploadImage(file)
      form.setFieldsValue({ logo: res.url })
      message.success('上传成功')
    } catch {
      // ignore
    }
    return false // 阻止自动上传
  }

  const getSeasonName = (seasonId: number | undefined) => {
    return seasons.find((s) => s.id === seasonId)?.name || '-'
  }

  const columns: ColumnsType<Team> = [
    {
      title: 'Logo',
      dataIndex: 'logo',
      width: 80,
      render: (logo: string | undefined) =>
        logo ? (
          <Avatar size={40} src={logo} />
        ) : (
          <Avatar size={40} icon={<TeamOutlined />} />
        ),
    },
    { title: 'ID', dataIndex: 'id', width: 80 },
    { title: '所属赛季', dataIndex: 'seasonId', width: 140, render: (v) => getSeasonName(v) },
    { title: '战队名称', dataIndex: 'name', width: 200 },
    { title: '简介', dataIndex: 'description' },
    {
      title: '操作',
      key: 'action',
      width: 160,
      render: (_, row) => (
        <>
          <Button type="link" icon={<EditOutlined />} onClick={() => openEdit(row)}>
            编辑
          </Button>
          <Popconfirm title="确定删除该战队吗？" onConfirm={() => handleDelete(row.id)}>
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
      <div
        style={{
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Space>
          <span style={{ color: '#666' }}>赛季筛选：</span>
          <Select
            style={{ width: 200 }}
            allowClear
            placeholder="选择赛季"
            value={filterSeasonId ?? undefined}
            onChange={(v) => setFilterSeasonId(v ?? null)}
            options={seasons.map((s) => ({ value: s.id, label: s.name }))}
          />
        </Space>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          新增战队
        </Button>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={list}
        loading={loading}
        pagination={false}
      />

      <Modal
        title={editing ? '编辑战队' : '新增战队'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" style={{ marginTop: 8 }}>
          <Form.Item
            label="所属赛季"
            name="seasonId"
            rules={[{ required: true, message: '请选择赛季' }]}
          >
            <Select placeholder="请选择赛季" options={seasons.map((s) => ({ value: s.id, label: s.name }))} />
          </Form.Item>
          <Form.Item
            label="战队名称"
            name="name"
            rules={[{ required: true, message: '请输入战队名称' }]}
          >
            <Input placeholder="请输入战队名称" />
          </Form.Item>
          <Form.Item label="战队 Logo" name="logo">
            <Input placeholder="Logo URL" style={{ marginBottom: 8 }} />
            <Upload beforeUpload={handleLogoUpload} showUploadList={false} accept="image/*">
              <Button icon={<UploadOutlined />}>上传图片</Button>
            </Upload>
          </Form.Item>
          <Form.Item label="简介" name="description">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default TeamPage

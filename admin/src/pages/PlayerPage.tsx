import { useState, useEffect } from 'react'
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  message,
  Popconfirm,
  Image,
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { playerApi, teamApi } from '@/api'
import type { Player, Team } from '@/types'

export default function PlayerPage() {
  const [list, setList] = useState<Player[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Player | null>(null)
  const [form] = Form.useForm<Player>()

  const fetchList = async () => {
    setLoading(true)
    try {
      const data = await playerApi.list()
      setList(data)
    } finally {
      setLoading(false)
    }
  }

  const fetchTeams = async () => {
    const data = await teamApi.list()
    setTeams(data)
  }

  useEffect(() => {
    fetchList()
    fetchTeams()
  }, [])

  const handleAdd = () => {
    setEditing(null)
    form.resetFields()
    setModalOpen(true)
  }

  const handleEdit = (record: Player) => {
    setEditing(record)
    form.setFieldsValue(record)
    setModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    await playerApi.delete(id)
    message.success('删除成功')
    fetchList()
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()
    if (editing?.id) {
      await playerApi.update(editing.id, values)
      message.success('修改成功')
    } else {
      await playerApi.create(values)
      message.success('新增成功')
    }
    setModalOpen(false)
    fetchList()
  }

  const getTeamName = (teamId: number) => {
    return teams.find((t) => t.id === teamId)?.name || '-'
  }

  const columns: ColumnsType<Player> = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    {
      title: '头像',
      dataIndex: 'avatar',
      width: 80,
      render: (v: string) =>
        v ? (
          <Image
            src={v}
            width={32}
            height={32}
            style={{ borderRadius: '50%', objectFit: 'cover' }}
            preview={false}
          />
        ) : (
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: '#f0f0f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              color: '#999',
            }}
          >
            暂无
          </div>
        ),
    },
    { title: '选手名称', dataIndex: 'name', width: 140 },
    { title: '所属战队', dataIndex: 'teamId', width: 140, render: (v) => getTeamName(v) },
    { title: '位置/身份', dataIndex: 'position', width: 120 },
    {
      title: '操作',
      key: 'action',
      width: 160,
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确定删除该选手？"
            onConfirm={() => record.id && handleDelete(record.id)}
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
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增选手
        </Button>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={list}
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editing ? '编辑选手' : '新增选手'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        okText="确定"
        cancelText="取消"
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 8 }}>
          <Form.Item
            label="选手名称"
            name="name"
            rules={[{ required: true, message: '请输入选手名称' }]}
          >
            <Input placeholder="请输入选手姓名/昵称" />
          </Form.Item>
          <Form.Item
            label="所属战队"
            name="teamId"
            rules={[{ required: true, message: '请选择所属战队' }]}
          >
            <Select
              placeholder="请选择战队"
              options={teams.map((t) => ({ label: t.name, value: t.id }))}
            />
          </Form.Item>
          <Form.Item label="头像地址" name="avatar">
            <Input placeholder="图片 URL（可选）" />
          </Form.Item>
          <Form.Item label="位置/身份" name="position">
            <Input placeholder="如：队长、队员、替补等" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

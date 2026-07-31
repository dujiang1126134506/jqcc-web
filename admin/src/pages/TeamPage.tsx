import { useState, useEffect } from 'react'
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  message,
  Popconfirm,
  Image,
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { teamApi } from '@/api'
import type { Team } from '@/types'

export default function TeamPage() {
  const [list, setList] = useState<Team[]>([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Team | null>(null)
  const [form] = Form.useForm<Team>()

  const fetchList = async () => {
    setLoading(true)
    try {
      const data = await teamApi.list()
      setList(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchList()
  }, [])

  const handleAdd = () => {
    setEditing(null)
    form.resetFields()
    setModalOpen(true)
  }

  const handleEdit = (record: Team) => {
    setEditing(record)
    form.setFieldsValue(record)
    setModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    await teamApi.delete(id)
    message.success('删除成功')
    fetchList()
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()
    if (editing?.id) {
      await teamApi.update(editing.id, values)
      message.success('修改成功')
    } else {
      await teamApi.create(values)
      message.success('新增成功')
    }
    setModalOpen(false)
    fetchList()
  }

  const columns: ColumnsType<Team> = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    {
      title: '战队Logo',
      dataIndex: 'logo',
      width: 80,
      render: (v: string) =>
        v ? (
          <Image
            src={v}
            width={36}
            height={36}
            style={{ borderRadius: '50%', objectFit: 'cover' }}
            preview={false}
          />
        ) : (
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: '#f0f0f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              color: '#999',
            }}
          >
            暂无
          </div>
        ),
    },
    { title: '战队名称', dataIndex: 'name', width: 160 },
    { title: '战队简介', dataIndex: 'description' },
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
            title="确定删除该战队？"
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
          新增战队
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
        title={editing ? '编辑战队' : '新增战队'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        okText="确定"
        cancelText="取消"
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 8 }}>
          <Form.Item
            label="战队名称"
            name="name"
            rules={[{ required: true, message: '请输入战队名称' }]}
          >
            <Input placeholder="请输入战队名称" />
          </Form.Item>
          <Form.Item label="Logo 地址" name="logo">
            <Input placeholder="图片 URL（可选）" />
          </Form.Item>
          <Form.Item label="战队简介" name="description">
            <Input.TextArea rows={3} placeholder="战队简介（可选）" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { Table, Button, Space, Modal, Form, Input, DatePicker, Switch, message, Popconfirm, Tag } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { seasonApi } from '@/api'
import type { Season } from '@/types'

export default function SeasonPage() {
  const [list, setList] = useState<Season[]>([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Season | null>(null)
  const [form] = Form.useForm<Season>()

  const fetchList = async () => {
    setLoading(true)
    try {
      const data = await seasonApi.list()
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
    form.setFieldsValue({ currentSeason: false })
    setModalOpen(true)
  }

  const handleEdit = (record: Season) => {
    setEditing(record)
    form.setFieldsValue({
      ...record,
      startDate: record.startDate ? (dayjs(record.startDate) as any) : undefined,
      endDate: record.endDate ? (dayjs(record.endDate) as any) : undefined,
    } as any)
    setModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    await seasonApi.delete(id)
    message.success('删除成功')
    fetchList()
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()
    const payload: Season = {
      ...values,
      startDate: values.startDate ? (values.startDate as any).format('YYYY-MM-DD') : undefined,
      endDate: values.endDate ? (values.endDate as any).format('YYYY-MM-DD') : undefined,
    }
    if (editing?.id) {
      await seasonApi.update(editing.id, payload)
      message.success('修改成功')
    } else {
      await seasonApi.create(payload)
      message.success('新增成功')
    }
    setModalOpen(false)
    fetchList()
  }

  const columns: ColumnsType<Season> = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: '赛季名称', dataIndex: 'name', width: 160 },
    {
      title: '当前赛季',
      dataIndex: 'currentSeason',
      width: 100,
      render: (v) =>
        v ? <Tag color="green">是</Tag> : <Tag color="default">否</Tag>,
    },
    { title: '开始日期', dataIndex: 'startDate', width: 120 },
    { title: '结束日期', dataIndex: 'endDate', width: 120 },
    { title: '描述', dataIndex: 'description' },
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
            title="确定删除该赛季？"
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
          新增赛季
        </Button>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={list}
        loading={loading}
        pagination={{ pageSize: 10, showSizeChanger: false }}
      />

      <Modal
        title={editing ? '编辑赛季' : '新增赛季'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        okText="确定"
        cancelText="取消"
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 8 }}>
          <Form.Item
            label="赛季名称"
            name="name"
            rules={[{ required: true, message: '请输入赛季名称' }]}
          >
            <Input placeholder="如：2024春季赛" />
          </Form.Item>
          <Form.Item label="描述" name="description">
            <Input.TextArea rows={3} placeholder="赛季描述（可选）" />
          </Form.Item>
          <div style={{ display: 'flex', gap: 12 }}>
            <Form.Item label="开始日期" name="startDate" style={{ flex: 1 }}>
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item label="结束日期" name="endDate" style={{ flex: 1 }}>
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </div>
          <Form.Item label="设为当前赛季" name="currentSeason" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

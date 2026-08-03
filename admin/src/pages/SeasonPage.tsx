import React, { useEffect, useState } from 'react'
import { Button, Form, Input, DatePicker, Switch, Table, Modal, message, Popconfirm } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import { getSeasons, createSeason, updateSeason, deleteSeason } from '@/api'
import type { Season } from '@/types'

const SeasonPage: React.FC = () => {
  const [list, setList] = useState<Season[]>([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Season | null>(null)
  const [form] = Form.useForm()

  const fetchList = async () => {
    setLoading(true)
    try {
      const data = await getSeasons()
      setList(Array.isArray(data) ? data : [])
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchList()
  }, [])

  const openCreate = () => {
    setEditing(null)
    form.resetFields()
    setModalOpen(true)
  }

  const openEdit = (row: Season) => {
    setEditing(row)
    form.setFieldsValue({
      name: row.name,
      description: row.description,
      startDate: row.startDate ? dayjs(row.startDate) : undefined,
      endDate: row.endDate ? dayjs(row.endDate) : undefined,
      currentSeason: row.currentSeason ?? false,
    })
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const payload: Partial<Season> = {
        name: values.name,
        description: values.description,
        startDate: values.startDate
          ? (values.startDate as Dayjs).format('YYYY-MM-DD')
          : undefined,
        endDate: values.endDate ? (values.endDate as Dayjs).format('YYYY-MM-DD') : undefined,
        currentSeason: values.currentSeason,
      }
      if (editing) {
        await updateSeason(editing.id, payload)
        message.success('更新成功')
      } else {
        await createSeason(payload)
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
      await deleteSeason(id)
      message.success('删除成功')
      fetchList()
    } catch {
      // ignore
    }
  }

  const columns: ColumnsType<Season> = [
    { title: 'ID', dataIndex: 'id', width: 80 },
    { title: '赛季名称', dataIndex: 'name', width: 200 },
    { title: '描述', dataIndex: 'description' },
    {
      title: '开始日期',
      dataIndex: 'startDate',
      width: 120,
    },
    {
      title: '结束日期',
      dataIndex: 'endDate',
      width: 120,
    },
    {
      title: '当前赛季',
      dataIndex: 'currentSeason',
      width: 100,
      render: (v: boolean) => (v ? '是' : '否'),
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      render: (_, row) => (
        <>
          <Button type="link" icon={<EditOutlined />} onClick={() => openEdit(row)}>
            编辑
          </Button>
          <Popconfirm title="确定删除该赛季吗？" onConfirm={() => handleDelete(row.id)}>
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
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          新增赛季
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
        title={editing ? '编辑赛季' : '新增赛季'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
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
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item label="开始日期" name="startDate">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="结束日期" name="endDate">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="设为当前赛季" name="currentSeason" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default SeasonPage

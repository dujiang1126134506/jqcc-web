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
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { getTeams, createTeam, updateTeam, deleteTeam, uploadImage } from '@/api'
import type { Team } from '@/types'

const TeamPage: React.FC = () => {
  const [list, setList] = useState<Team[]>([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Team | null>(null)
  const [form] = Form.useForm()

  const fetchList = async () => {
    setLoading(true)
    try {
      const data = await getTeams()
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

  const openEdit = (row: Team) => {
    setEditing(row)
    form.setFieldsValue({
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
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
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

import { useState } from 'react'
import {
  Card,
  Row,
  Col,
  Form,
  Select,
  DatePicker,
  InputNumber,
  Button,
  Table,
  Input,
  Space,
  Upload,
  message,
  Divider,
  Tag,
  Modal,
  Typography,
} from 'antd'
import {
  UploadOutlined,
  PlusOutlined,
  DeleteOutlined,
  SaveOutlined,
  EyeOutlined,
  FileImageOutlined,
} from '@ant-design/icons'
import type { UploadProps } from 'antd'
import dayjs from 'dayjs'
import { getDefaultSeason, getTeams, importPlayers } from '@/api'
import { getImageUrl } from '@/utils/imageUrl'
import type { PlayerRecordDTO, Team, ImportResultVO } from '@/types'

const { Title, Text } = Typography
const { Option } = Select

interface ScoreRow {
  key: string
  teamName: string
  playerName: string
  identity: string
  version: string
  winScore: number
  voteScore: number
  skillScore: number
  penaltyScore: number
  extraScore: number
  isMvp: boolean
  isSvp: boolean
  isBlame: boolean
}

const STAGE_OPTIONS = ['常规赛', '复活赛', '季后赛', '总决赛']

const BattleReportPage = () => {
  const [form] = Form.useForm()
  const [imageUrl, setImageUrl] = useState<string>('')
  const [teams, setTeams] = useState<Team[]>([])
  const [defaultSeasonName, setDefaultSeasonName] = useState<string>('')
  const [rows, setRows] = useState<ScoreRow[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [previewVisible, setPreviewVisible] = useState(false)
  // 初始化：加载默认赛季和战队列表
  useState(() => {
    getDefaultSeason()
      .then((res) => {
        const name = (res as any)?.name || ''
        setDefaultSeasonName(name)
        form.setFieldsValue({ season: name })
        // 加载该赛季的战队
        return getTeams()
      })
      .then((res) => {
        setTeams((res as any) || [])
      })
      .catch(() => {})
  })

  // 计算总分
  const calcTotal = (row: ScoreRow) => {
    return (
      (row.winScore || 0) +
      (row.voteScore || 0) +
      (row.skillScore || 0) +
      (row.penaltyScore || 0) +
      (row.extraScore || 0)
    )
  }

  // 上传战报图片
  const uploadProps: UploadProps = {
    showUploadList: false,
    accept: 'image/*',
    beforeUpload: (file) => {
      const isImage = file.type.startsWith('image/')
      if (!isImage) {
        message.error('只能上传图片文件！')
        return false
      }
      const isLt10M = file.size / 1024 / 1024 < 10
      if (!isLt10M) {
        message.error('图片大小不能超过 10MB！')
        return false
      }
      const reader = new FileReader()
      reader.onload = (e) => {
        setImageUrl(e.target?.result as string)
      }
      reader.readAsDataURL(file)
      return false // 不上传到服务器，只做预览
    },
  }

  // 添加一行
  const addRow = () => {
    const newRow: ScoreRow = {
      key: Date.now().toString(),
      teamName: '',
      playerName: '',
      identity: '',
      version: '',
      winScore: 0,
      voteScore: 0,
      skillScore: 0,
      penaltyScore: 0,
      extraScore: 0,
      isMvp: false,
      isSvp: false,
      isBlame: false,
    }
    setRows([...rows, newRow])
  }

  // 删除一行
  const deleteRow = (key: string) => {
    setRows(rows.filter((r) => r.key !== key))
  }

  // 更新某行字段
  const updateRow = (key: string, field: keyof ScoreRow, value: any) => {
    setRows(
      rows.map((r) =>
        r.key === key ? { ...r, [field]: value } : r
      )
    )
  }

  // 批量提交
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()

      if (rows.length === 0) {
        message.warning('请至少添加一条选手数据！')
        return
      }

      // 校验每行数据
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i]
        if (!row.teamName) {
          message.error(`第 ${i + 1} 行：战队名称不能为空`)
          return
        }
        if (!row.playerName) {
          message.error(`第 ${i + 1} 行：选手姓名不能为空`)
          return
        }
      }

      setSubmitting(true)

      // 转换为后端需要的格式
      const data: PlayerRecordDTO[] = rows.map((row) => ({
        playerName: row.playerName,
        teamName: row.teamName,
        season: values.season,
        stage: values.stage,
        round: values.round,
        date: values.date.format('YYYY-MM-DD'),
        identity: row.identity,
        version: row.version,
        winScore: row.winScore,
        voteScore: row.voteScore,
        skillScore: row.skillScore,
        penaltyScore: row.penaltyScore,
        extraScore: row.extraScore,
        isMvp: row.isMvp,
        isSvp: row.isSvp,
        isBlame: row.isBlame,
      }))

      const res = await importPlayers(data)

      if (res) {
        const { successCount, failCount, skipCount } = res as ImportResultVO
        Modal.success({
          title: '导入完成',
          content: (
            <div>
              <p>成功：<Tag color="success">{successCount} 条</Tag></p>
              <p>失败：<Tag color="error">{failCount} 条</Tag></p>
              <p>跳过：<Tag color="default">{skipCount} 条</Tag></p>
            </div>
          ),
          onOk: () => {
            setRows([])
          },
        })
      }
    } catch (err: any) {
      message.error(err?.message || '导入失败')
    } finally {
      setSubmitting(false)
    }
  }

  // 清空表格
  const clearAll = () => {
    Modal.confirm({
      title: '确认清空',
      content: '确定要清空所有已录入的数据吗？',
      onOk: () => {
        setRows([])
      },
    })
  }

  // 表格列定义
  const columns = [
    {
      title: '序号',
      key: 'index',
      width: 60,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: '战队名称',
      dataIndex: 'teamName',
      width: 140,
      render: (_: any, record: ScoreRow) => (
        <Select
          size="small"
          style={{ width: 120 }}
          value={record.teamName || undefined}
          onChange={(val) => updateRow(record.key, 'teamName', val)}
          showSearch
          placeholder="选择战队"
          optionFilterProp="children"
        >
          {teams.map((t) => (
            <Option key={t.id} value={t.name}>
              {t.name}
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: '选手姓名',
      dataIndex: 'playerName',
      width: 120,
      render: (_: any, record: ScoreRow) => (
        <Input
          size="small"
          value={record.playerName}
          onChange={(e) => updateRow(record.key, 'playerName', e.target.value)}
          placeholder="选手姓名"
        />
      ),
    },
    {
      title: '身份',
      dataIndex: 'identity',
      width: 100,
      render: (_: any, record: ScoreRow) => (
        <Input
          size="small"
          value={record.identity}
          onChange={(e) => updateRow(record.key, 'identity', e.target.value)}
          placeholder="如：队长"
        />
      ),
    },
    {
      title: '版型',
      dataIndex: 'version',
      width: 100,
      render: (_: any, record: ScoreRow) => (
        <Input
          size="small"
          value={record.version}
          onChange={(e) => updateRow(record.key, 'version', e.target.value)}
          placeholder="如：标准版"
        />
      ),
    },
    {
      title: '胜负分',
      dataIndex: 'winScore',
      width: 90,
      render: (_: any, record: ScoreRow) => (
        <InputNumber
          size="small"
          style={{ width: 70 }}
          value={record.winScore}
          onChange={(val) => updateRow(record.key, 'winScore', val || 0)}
        />
      ),
    },
    {
      title: '投票分',
      dataIndex: 'voteScore',
      width: 90,
      render: (_: any, record: ScoreRow) => (
        <InputNumber
          size="small"
          style={{ width: 70 }}
          value={record.voteScore}
          onChange={(val) => updateRow(record.key, 'voteScore', val || 0)}
        />
      ),
    },
    {
      title: '技能分',
      dataIndex: 'skillScore',
      width: 90,
      render: (_: any, record: ScoreRow) => (
        <InputNumber
          size="small"
          style={{ width: 70 }}
          value={record.skillScore}
          onChange={(val) => updateRow(record.key, 'skillScore', val || 0)}
        />
      ),
    },
    {
      title: '违规分',
      dataIndex: 'penaltyScore',
      width: 90,
      render: (_: any, record: ScoreRow) => (
        <InputNumber
          size="small"
          style={{ width: 70 }}
          value={record.penaltyScore}
          onChange={(val) => updateRow(record.key, 'penaltyScore', val || 0)}
          placeholder="扣分填负数"
        />
      ),
    },
    {
      title: '额外分',
      dataIndex: 'extraScore',
      width: 90,
      render: (_: any, record: ScoreRow) => (
        <InputNumber
          size="small"
          style={{ width: 70 }}
          value={record.extraScore}
          onChange={(val) => updateRow(record.key, 'extraScore', val || 0)}
        />
      ),
    },
    {
      title: 'MVP',
      dataIndex: 'isMvp',
      width: 70,
      align: 'center' as const,
      render: (_: any, record: ScoreRow) => (
        <Tag
          color={record.isMvp ? 'gold' : 'default'}
          style={{ cursor: 'pointer' }}
          onClick={() => updateRow(record.key, 'isMvp', !record.isMvp)}
        >
          {record.isMvp ? '是' : '否'}
        </Tag>
      ),
    },
    {
      title: 'SVP',
      dataIndex: 'isSvp',
      width: 70,
      align: 'center' as const,
      render: (_: any, record: ScoreRow) => (
        <Tag
          color={record.isSvp ? 'blue' : 'default'}
          style={{ cursor: 'pointer' }}
          onClick={() => updateRow(record.key, 'isSvp', !record.isSvp)}
        >
          {record.isSvp ? '是' : '否'}
        </Tag>
      ),
    },
    {
      title: '背锅',
      dataIndex: 'isBlame',
      width: 70,
      align: 'center' as const,
      render: (_: any, record: ScoreRow) => (
        <Tag
          color={record.isBlame ? 'red' : 'default'}
          style={{ cursor: 'pointer' }}
          onClick={() => updateRow(record.key, 'isBlame', !record.isBlame)}
        >
          {record.isBlame ? '是' : '否'}
        </Tag>
      ),
    },
    {
      title: '总分',
      dataIndex: 'total',
      width: 80,
      align: 'center' as const,
      render: (_: any, record: ScoreRow) => (
        <Text strong style={{ color: '#1677ff' }}>
          {calcTotal(record)}
        </Text>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 70,
      align: 'center' as const,
      render: (_: any, record: ScoreRow) => (
        <Button
          type="text"
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => deleteRow(record.key)}
        />
      ),
    },
  ]

  return (
    <div>
      <Row gutter={16}>
        {/* 左侧：战报图片预览 */}
        <Col xs={24} lg={10}>
          <Card
            title={
              <Space>
                <FileImageOutlined />
                <span>战报图片</span>
              </Space>
            }
            extra={
              <Upload {...uploadProps}>
                <Button icon={<UploadOutlined />}>上传战报图片</Button>
              </Upload>
            }
            style={{ position: 'sticky', top: 16 }}
          >
            {imageUrl ? (
              <div style={{ textAlign: 'center' }}>
                <img
                  src={getImageUrl(imageUrl)}
                  alt="战报"
                  style={{
                    maxWidth: '100%',
                    maxHeight: 'calc(100vh - 200px)',
                    borderRadius: 8,
                    cursor: 'pointer',
                  }}
                  onClick={() => setPreviewVisible(true)}
                />
                <div style={{ marginTop: 8, color: '#999', fontSize: 12 }}>
                  <EyeOutlined /> 点击图片可放大查看
                </div>
              </div>
            ) : (
              <div
                style={{
                  textAlign: 'center',
                  padding: '60px 20px',
                  color: '#999',
                  border: '2px dashed #d9d9d9',
                  borderRadius: 8,
                }}
              >
                <FileImageOutlined style={{ fontSize: 48, marginBottom: 12 }} />
                <p>上传战报图片后在此对照录入</p>
              </div>
            )}
          </Card>
        </Col>

        {/* 右侧：数据录入表格 */}
        <Col xs={24} lg={14}>
          <Card
            title={
              <Space>
                <SaveOutlined />
                <span>数据录入</span>
              </Space>
            }
          >
            {/* 基本信息 */}
            <Form form={form} layout="inline" style={{ marginBottom: 16 }}>
              <Form.Item
                label="赛季"
                name="season"
                rules={[{ required: true, message: '请选择赛季' }]}
              >
                <Select style={{ width: 180 }} placeholder="选择赛季">
                  {teams.length > 0 && defaultSeasonName && (
                    <Option value={defaultSeasonName}>
                      {defaultSeasonName}
                    </Option>
                  )}
                </Select>
              </Form.Item>
              <Form.Item
                label="阶段"
                name="stage"
                rules={[{ required: true, message: '请选择阶段' }]}
                initialValue="常规赛"
              >
                <Select style={{ width: 120 }}>
                  {STAGE_OPTIONS.map((s) => (
                    <Option key={s} value={s}>
                      {s}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                label="场次"
                name="round"
                rules={[{ required: true, message: '请输入场次' }]}
                initialValue={1}
              >
                <InputNumber min={1} style={{ width: 80 }} />
              </Form.Item>
              <Form.Item
                label="日期"
                name="date"
                rules={[{ required: true, message: '请选择日期' }]}
                initialValue={dayjs()}
              >
                <DatePicker style={{ width: 150 }} />
              </Form.Item>
            </Form>

            <Divider orientation="horizontal">选手得分数据</Divider>

            {/* 操作栏 */}
            <div
              style={{
                marginBottom: 12,
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <Space>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={addRow}
                >
                  添加一行
                </Button>
                <Button danger onClick={clearAll} disabled={rows.length === 0}>
                  清空全部
                </Button>
              </Space>
              <Text type="secondary">共 {rows.length} 条数据</Text>
            </div>

            {/* 表格 */}
            <div style={{ overflowX: 'auto' }}>
              <Table
                columns={columns}
                dataSource={rows}
                rowKey="key"
                pagination={false}
                size="small"
                scroll={{ x: 1300 }}
                locale={{ emptyText: '暂无数据，点击"添加一行"开始录入' }}
              />
            </div>

            {/* 提交按钮 */}
            <div
              style={{
                marginTop: 20,
                textAlign: 'right',
                paddingTop: 16,
                borderTop: '1px solid #f0f0f0',
              }}
            >
              <Space>
                <Button onClick={clearAll} disabled={rows.length === 0}>
                  重置
                </Button>
                <Button
                  type="primary"
                  size="large"
                  icon={<SaveOutlined />}
                  onClick={handleSubmit}
                  loading={submitting}
                  disabled={rows.length === 0}
                >
                  批量提交入库
                </Button>
              </Space>
            </div>
          </Card>

          {/* 格式说明 */}
          <Card
            title={<Title level={5} style={{ margin: 0 }}>字段说明</Title>}
            style={{ marginTop: 16 }}
            size="small"
          >
            <div style={{ fontSize: 13, lineHeight: 1.8, color: '#666' }}>
              <p>• <Text strong>胜负分</Text>：比赛胜负所得分数</p>
              <p>• <Text strong>投票分</Text>：观众/评委投票得分</p>
              <p>• <Text strong>技能分</Text>：技能表现得分</p>
              <p>• <Text strong>违规分</Text>：违规扣分为负数，如 -1、-3</p>
              <p>• <Text strong>额外分</Text>：彩蛋/特殊表现等加/减分</p>
              <p>• <Text strong>总分</Text> = 胜负分 + 投票分 + 技能分 + 违规分 + 额外分</p>
              <p>• <Tag color="gold">MVP</Tag> / <Tag color="blue">SVP</Tag> / <Tag color="red">背锅</Tag>：点击标签可切换状态</p>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 图片预览弹窗 */}
      <Modal
        open={previewVisible}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        width="80%"
        styles={{ body: { textAlign: 'center' } }}
      >
        {imageUrl && (
          <img
            src={getImageUrl(imageUrl)}
            alt="战报预览"
            style={{ maxWidth: '100%', maxHeight: '80vh' }}
          />
        )}
      </Modal>
    </div>
  )
}

export default BattleReportPage

import { useState, useEffect } from 'react'
import {
  Card,
  Form,
  Select,
  Switch,
  Upload,
  Button,
  message,
  Statistic,
  Row,
  Col,
  Table,
  Alert,
  Typography,
  Divider,
  Tabs,
} from 'antd'
import {
  UploadOutlined,
  InboxOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons'
import type { UploadFile } from 'antd/es/upload/interface'
import { importApi, seasonApi } from '@/api'
import type { Season, ImportResultVO, ImportFailRow } from '@/types'

const { Dragger } = Upload
const { Title, Text, Paragraph } = Typography

const TEMPLATE_COLUMNS = [
  '战队名称',
  '选手名称',
  '赛程阶段',
  '场次',
  '日期 (yyyy-MM-dd)',
  '身份（可选）',
  '版型（可选）',
  '胜负分',
  '投票分',
  '技能分',
  '违规分（扣分填负数）',
  '额外分',
  '是否MVP（是/否）',
  '是否SVP（是/否）',
  '是否背锅（是/否）',
]

export default function ImportPage() {
  const [seasons, setSeasons] = useState<Season[]>([])
  const [form] = Form.useForm()
  const [result, setResult] = useState<ImportResultVO | null>(null)
  const [loading, setLoading] = useState(false)
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [activeTab, setActiveTab] = useState('excel')

  useEffect(() => {
    seasonApi.list().then(setSeasons)
  }, [])

  const handleImport = async () => {
    const { seasonId, skipDuplicate } = form.getFieldsValue()
    if (!seasonId) {
      message.warning('请选择赛季')
      return
    }
    if (fileList.length === 0 || !fileList[0].originFileObj) {
      message.warning('请先选择文件')
      return
    }
    const file = fileList[0].originFileObj
    setLoading(true)
    setResult(null)
    try {
      const res =
        activeTab === 'excel'
          ? await importApi.excel(file, seasonId, skipDuplicate)
          : await importApi.csv(file, seasonId, skipDuplicate)
      setResult(res)
      message.success('导入完成')
    } catch (e) {
      // 错误已由拦截器提示
    } finally {
      setLoading(false)
    }
  }

  const failColumns = [
    { title: '行号', dataIndex: 'rowNum', width: 80 },
    { title: '失败原因', dataIndex: 'reason' },
    { title: '原始数据', dataIndex: 'rowData', ellipsis: true },
  ]

  const beforeUpload = (file: UploadFile) => {
    setFileList([file])
    setResult(null)
    return false // 阻止自动上传
  }

  const uploadProps = {
    fileList,
    beforeUpload,
    onRemove: () => {
      setFileList([])
      setResult(null)
    },
    maxCount: 1,
    accept: activeTab === 'excel' ? '.xlsx' : '.csv',
  }

  return (
    <div>
      <Row gutter={24}>
        <Col span={16}>
          <Card title="数据导入" bordered={false}>
            <Form form={form} layout="vertical" initialValues={{ skipDuplicate: true }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="目标赛季"
                    name="seasonId"
                    rules={[{ required: true, message: '请选择赛季' }]}
                  >
                    <Select
                      placeholder="请选择要导入到哪个赛季"
                      options={seasons.map((s) => ({
                        label: s.name + (s.currentSeason ? '（当前赛季）' : ''),
                        value: s.id,
                      }))}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="跳过重复数据" name="skipDuplicate" valuePropName="checked">
                    <Switch checkedChildren="开启" unCheckedChildren="关闭" />
                  </Form.Item>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    重复判断依据：赛季 + 阶段 + 场次 + 日期 + 选手
                  </Text>
                </Col>
              </Row>

              <Divider style={{ margin: '8px 0 16px' }} />

              <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={[
                  { key: 'excel', label: 'Excel 导入 (.xlsx)' },
                  { key: 'csv', label: 'CSV 导入 (.csv)' },
                ]}
              />

              <Dragger {...uploadProps as any} style={{ marginTop: 16 }}>
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">
                  点击或拖拽文件到此处上传
                </p>
                <p className="ant-upload-hint">
                  支持 {activeTab === 'excel' ? '.xlsx 格式的 Excel 文件' : '.csv 格式文件'}，
                  单文件不超过 10MB
                </p>
              </Dragger>

              <div style={{ marginTop: 20, textAlign: 'right' }}>
                <Button type="primary" loading={loading} onClick={handleImport} icon={<UploadOutlined />}>
                  开始导入
                </Button>
              </div>
            </Form>

            {result && (
              <div style={{ marginTop: 24 }}>
                <Divider style={{ borderColor: '#f0f0f0' }}>导入结果</Divider>
                <Row gutter={16}>
                  <Col span={6}>
                    <Card bordered={false} style={{ background: '#fafafa' }}>
                      <Statistic title="总条数" value={result.total} />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card bordered={false} style={{ background: '#f6ffed' }}>
                      <Statistic
                        title="成功"
                        value={result.successCount}
                        valueStyle={{ color: '#52c41a' }}
                        prefix={<CheckCircleOutlined />}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card bordered={false} style={{ background: '#fff2f0' }}>
                      <Statistic
                        title="失败"
                        value={result.failCount}
                        valueStyle={{ color: '#ff4d4f' }}
                        prefix={<CloseCircleOutlined />}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card bordered={false} style={{ background: '#e6f7ff' }}>
                      <Statistic
                        title="跳过（重复）"
                        value={result.skipCount}
                        valueStyle={{ color: '#1677ff' }}
                        prefix={<InfoCircleOutlined />}
                      />
                    </Card>
                  </Col>
                </Row>

                {result.failRows && result.failRows.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <Alert
                      message={`有 ${result.failRows.length} 行数据导入失败`}
                      type="error"
                      showIcon
                    />
                    <Table<ImportFailRow>
                      style={{ marginTop: 12 }}
                      size="small"
                      rowKey="rowNum"
                      columns={failColumns}
                      dataSource={result.failRows}
                      pagination={{ pageSize: 10 }}
                    />
                  </div>
                )}
              </div>
            )}
          </Card>
        </Col>

        <Col span={8}>
          <Card title="导入模板说明" bordered={false} type="inner">
            <Alert
              type="info"
              showIcon
              message="首次使用请按以下列顺序准备数据"
              description="战队和选手如不存在会自动创建；违规分请填负数表示扣分。"
              style={{ marginBottom: 16 }}
            />
            <Title level={5} style={{ marginTop: 0 }}>
              列顺序
            </Title>
            <ol style={{ paddingLeft: 20, lineHeight: '2' }}>
              {TEMPLATE_COLUMNS.map((col, i) => (
                <li key={i}>
                  <Text strong>{col}</Text>
                  {i < 5 && <Text type="danger"> *必填</Text>}
                </li>
              ))}
            </ol>

            <Divider style={{ margin: '16px 0' }} />

            <Title level={5}>得分公式</Title>
            <Paragraph>
              <Text code>总得分 = 胜负分 + 投票分 + 技能分 + 违规分 + 额外分</Text>
            </Paragraph>

            <Title level={5}>赛程阶段可选值</Title>
            <div>
              {['常规赛', '复活赛', '季后赛', '总决赛'].map((s) => (
                <span key={s} style={{ marginRight: 8 }}>
                  {s}
                </span>
              ))}
            </div>

            <Divider style={{ margin: '16px 0' }} />

            <Title level={5}>是/否 字段填写</Title>
            <Paragraph>
              MVP / SVP / 背锅 列填 <Text code>是</Text> 或 <Text code>否</Text>，
              不填默认否。
            </Paragraph>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

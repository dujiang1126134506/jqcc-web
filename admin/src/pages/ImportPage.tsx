import React, { useEffect, useState } from 'react'
import {
  Card,
  Row,
  Col,
  Select,
  Upload,
  Switch,
  Statistic,
  Table,
  message,
  Alert,
  Divider,
  Tag,
} from 'antd'
import { InboxOutlined, FileExcelOutlined } from '@ant-design/icons'
import type { UploadProps } from 'antd/es/upload/interface'
import type { ColumnsType } from 'antd/es/table'
import { getSeasons, importExcel, importCsv } from '@/api'
import type { Season, ImportResultVO, ImportFailRow } from '@/types'

const { Dragger } = Upload

const ImportPage: React.FC = () => {
  const [seasons, setSeasons] = useState<Season[]>([])
  const [seasonId, setSeasonId] = useState<number | null>(null)
  const [skipDuplicate, setSkipDuplicate] = useState(true)
  const [result, setResult] = useState<ImportResultVO | null>(null)
  const [importing, setImporting] = useState(false)

  useEffect(() => {
    getSeasons()
      .then((data) => {
        setSeasons(Array.isArray(data) ? data : [])
        if (data?.length) {
          const cur = data.find((s: Season) => s.currentSeason)
          setSeasonId(cur?.id ?? data[0].id)
        }
      })
      .catch(() => {})
  }, [])

  const customRequest: UploadProps['customRequest'] = async (options) => {
    const { file } = options
    if (!seasonId) {
      message.error('请先选择赛季')
      return
    }
    const fileName = (file as File).name || ''
    const isExcel = /\.(xlsx|xls)$/i.test(fileName)
    const isCsv = /\.csv$/i.test(fileName)
    if (!isExcel && !isCsv) {
      message.error('仅支持 .xlsx 和 .csv 文件')
      return
    }
    setImporting(true)
    setResult(null)
    try {
      const res = isExcel
        ? await importExcel(file as File, seasonId, skipDuplicate)
        : await importCsv(file as File, seasonId, skipDuplicate)
      setResult(res)
      message.success('导入完成')
    } catch {
      message.error('导入失败')
    } finally {
      setImporting(false)
    }
  }

  const failColumns: ColumnsType<ImportFailRow> = [
    { title: '行号', dataIndex: 'rowNum', width: 80 },
    { title: '失败原因', dataIndex: 'reason' },
    { title: '原始数据', dataIndex: 'rowData' },
  ]

  return (
    <div>
      <Row gutter={16}>
        <Col span={12}>
          <Card title="导入设置">
            <div style={{ marginBottom: 16 }}>
              <div style={{ marginBottom: 8, fontWeight: 500 }}>选择赛季</div>
              <Select
                style={{ width: '100%' }}
                value={seasonId ?? undefined}
                onChange={(v) => setSeasonId(v)}
                options={seasons.map((s) => ({
                  value: s.id,
                  label: `${s.name}${s.currentSeason ? ' (当前)' : ''}`,
                }))}
                placeholder="请选择赛季"
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ marginBottom: 8, fontWeight: 500, display: 'flex', alignItems: 'center' }}>
                <span>跳过重复数据</span>
                <Switch
                  style={{ marginLeft: 12 }}
                  checked={skipDuplicate}
                  onChange={setSkipDuplicate}
                />
              </div>
              <div style={{ color: '#888', fontSize: 12 }}>
                同一赛季下，相同 阶段+场次+日期+选手 的数据视为重复
              </div>
            </div>

            <Divider orientation="horizontal" titlePlacement="start">
              <span style={{ fontSize: 14 }}>上传文件</span>
            </Divider>

            <Dragger
              name="file"
              multiple={false}
              accept=".xlsx,.xls,.csv"
              customRequest={customRequest}
              showUploadList={false}
              disabled={!seasonId || importing}
              beforeUpload={() => false}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">点击或拖拽文件到此处上传</p>
              <p className="ant-upload-hint">
                支持 Excel (.xlsx) 和 CSV 文件，请确保列顺序正确
              </p>
            </Dragger>

            <div style={{ marginTop: 16 }}>
              <Alert
                type="info"
                showIcon
                message="文件格式要求"
                description={
                  <div style={{ fontSize: 12, lineHeight: 1.8 }}>
                    列顺序：战队名称 / 选手名称 / 赛程阶段 / 场次 / 日期 / 身份 / 版型 /
                    胜负分 / 投票分 / 技能分 / 违规分 / 额外分 / 是否MVP / 是否SVP / 是否背锅
                    <br />
                    日期格式：yyyy-MM-dd
                    <br />
                    赛程阶段：常规赛 / 复活赛 / 季后赛 / 总决赛
                    <br />
                    是否MVP/SVP/背锅：是 / 否
                  </div>
                }
              />
            </div>
          </Card>
        </Col>

        <Col span={12}>
          <Card title="导入结果" extra={importing ? '导入中...' : ''}>
            {!result && !importing && (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#bbb' }}>
                <FileExcelOutlined style={{ fontSize: 48, marginBottom: 12 }} />
                <div>暂无导入记录</div>
              </div>
            )}
            {importing && (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <img
                  alt="loading"
                  src="https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg"
                  width={64}
                />
                <div style={{ marginTop: 8, color: '#888' }}>正在导入，请稍候...</div>
              </div>
            )}
            {result && (
              <>
                <Row gutter={16} style={{ marginBottom: 16 }}>
                  <Col span={6}>
                    <Statistic title="总条数" value={result.total} />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="成功"
                      value={result.successCount}
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="失败"
                      value={result.failCount}
                      valueStyle={{ color: '#ff4d4f' }}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="跳过(重复)"
                      value={result.skipCount}
                      valueStyle={{ color: '#faad14' }}
                    />
                  </Col>
                </Row>

                {result.failRows && result.failRows.length > 0 && (
                  <div>
                    <div style={{ marginBottom: 8, fontWeight: 500 }}>
                      <Tag color="red">失败明细</Tag>
                    </div>
                    <Table
                      rowKey="rowNum"
                      size="small"
                      columns={failColumns}
                      dataSource={result.failRows}
                      pagination={{ pageSize: 5, size: 'small' }}
                    />
                  </div>
                )}
              </>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default ImportPage

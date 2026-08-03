import React from 'react'
import { Layout, Menu, theme } from 'antd'
import {
  DashboardOutlined,
  TeamOutlined,
  TrophyOutlined,
  UserOutlined,
  FileTextOutlined,
  UploadOutlined,
} from '@ant-design/icons'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'

const { Header, Sider, Content } = Layout

const menuItems = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: '数据概览' },
  { key: '/seasons', icon: <TrophyOutlined />, label: '赛季管理' },
  { key: '/teams', icon: <TeamOutlined />, label: '战队管理' },
  { key: '/players', icon: <UserOutlined />, label: '选手数据' },
  { key: '/scores', icon: <FileTextOutlined />, label: '得分记录' },
  { key: '/import', icon: <UploadOutlined />, label: '数据导入' },
]

const AdminLayout: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken()

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={220} theme="dark">
        <div
          style={{
            height: 60,
            lineHeight: '60px',
            textAlign: 'center',
            color: '#fff',
            fontSize: 18,
            fontWeight: 600,
            letterSpacing: 2,
          }}
        >
          积分管理系统
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key as string)}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: '0 24px',
            background: colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 500 }}>
            {menuItems.find((m) => m.key === location.pathname)?.label || '管理后台'}
          </div>
          <div style={{ color: '#888' }}>Admin</div>
        </Header>
        <Content
          style={{
            margin: 16,
            padding: 24,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            minHeight: 'calc(100vh - 92px)',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default AdminLayout

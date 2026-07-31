import { Layout, Menu, theme } from 'antd'
import {
  DashboardOutlined,
  TrophyOutlined,
  TeamOutlined,
  UserOutlined,
  FileExcelOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import { useState } from 'react'

const { Header, Sider, Content } = Layout

const menuItems = [
  {
    key: '/dashboard',
    icon: <DashboardOutlined />,
    label: '数据概览',
  },
  {
    key: '/seasons',
    icon: <TrophyOutlined />,
    label: '赛季管理',
  },
  {
    key: '/teams',
    icon: <TeamOutlined />,
    label: '战队管理',
  },
  {
    key: '/players',
    icon: <UserOutlined />,
    label: '选手管理',
  },
  {
    key: '/scores',
    icon: <SettingOutlined />,
    label: '得分记录',
  },
  {
    key: '/import',
    icon: <FileExcelOutlined />,
    label: '数据导入',
  },
]

export default function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken()

  const selectedKey = menuItems.find(
    (item) => location.pathname.startsWith(item.key) || item.key === location.pathname,
  )?.key

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={220}
        style={{ background: '#001529' }}
      >
        <div
          style={{
            height: 64,
            margin: 16,
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: collapsed ? 14 : 18,
            fontWeight: 600,
            letterSpacing: 1,
          }}
        >
          {collapsed ? '积分' : '积分管理系统'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={selectedKey ? [selectedKey] : []}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ borderRight: 0 }}
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
            boxShadow: '0 1px 4px rgba(0, 21, 41, 0.08)',
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 500, color: '#1f1f1f' }}>
            {menuItems.find((m) => m.key === selectedKey)?.label || '管理后台'}
          </div>
          <div style={{ color: '#666' }}>管理员</div>
        </Header>
        <Content
          style={{
            margin: '24px',
            padding: 24,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            minHeight: 280,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

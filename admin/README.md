# 积分管理后台 (admin)

基于 **React 18 + TypeScript + Vite + Ant Design** 的积分查询系统后台管理前端。

## 功能模块

- **数据概览** - 赛季/战队/选手/场次统计，三大排行榜，赛季赛程
- **赛季管理** - 赛季的增删改查
- **战队管理** - 战队的增删改查
- **选手管理** - 选手的增删改查
- **得分记录** - 选手得分的多条件查询、分页、新增/编辑/删除/批量删除
- **数据导入** - Excel (.xlsx) / CSV 批量导入，支持重复跳过与失败明细

## 技术栈

- React 18 + TypeScript
- Vite 5
- Ant Design 5
- React Router v6
- Axios
- Day.js
- @ant-design/icons

## 开发环境

```bash
# 安装依赖
pnpm install

# 启动开发服务器 (端口 8700)
pnpm dev

# 构建生产版本
pnpm build

# 类型检查
pnpm type-check
```

## 端口与代理

- 前端开发端口：**8700**
- API 代理：`/api` → `http://localhost:5000`（后端 Spring Boot 服务）
- Swagger 文档：`/swagger-ui.html` → 后端

> 确保后端 Spring Boot 服务在 5000 端口运行。

## 目录结构

```
src/
├── api/             # 接口封装
│   └── index.ts
├── layouts/         # 布局组件
│   └── AdminLayout.tsx
├── pages/           # 页面
│   ├── Dashboard.tsx
│   ├── SeasonPage.tsx
│   ├── TeamPage.tsx
│   ├── PlayerPage.tsx
│   ├── ScorePage.tsx
│   └── ImportPage.tsx
├── types/           # 类型定义
│   └── index.ts
├── utils/           # 工具函数
│   └── request.ts
├── App.tsx
├── main.tsx
└── index.css
```

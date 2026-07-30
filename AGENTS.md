# AGENTS.md

> 积分查询系统后端 API — 项目速查指南

## 项目概览

基于 **Spring Boot 3.2 + Spring Data JPA** 的积分查询后端服务，为小程序提供数据接口，同时为后端管理提供选手得分数据的 CRUD 和批量导入能力。

- **语言**：Java 17
- **框架**：Spring Boot 3.2.5
- **数据库**：默认 H2（内存），可切换 MySQL
- **ORM**：Spring Data JPA + Hibernate
- **接口文档**：springdoc-openapi（Swagger UI）
- **构建工具**：Maven

## 目录结构

```
src/main/java/com/score/
├── ScoreApplication.java         # 启动类
├── common/                       # 公共类
│   ├── Result.java               # 统一响应封装
│   └── StageEnum.java            # 赛程阶段枚举
├── config/                       # 配置
│   ├── CorsConfig.java           # 跨域配置
│   ├── GlobalExceptionHandler.java # 全局异常处理
│   └── OpenApiConfig.java        # Swagger 配置
├── controller/                   # REST 控制层
│   ├── AppController.java        # 小程序端接口
│   ├── ImportController.java     # 数据导入接口
│   ├── PlayerController.java     # 选手管理
│   ├── PlayerScoreController.java # 选手得分 CRUD
│   ├── SeasonController.java     # 赛季管理
│   └── TeamController.java       # 战队管理
├── dto/                          # 数据传输对象
│   ├── ImportResultVO.java       # 导入结果
│   ├── PageResult.java           # 分页结果
│   ├── PlayerScoreDTO.java       # 得分请求 DTO
│   ├── PlayerScoreQuery.java     # 查询条件
│   ├── PlayerScoreVO.java        # 得分响应 VO
│   └── RankingVO.java            # 排行榜/赛程 VO
├── entity/                       # 数据库实体
│   ├── Player.java               # 选手
│   ├── PlayerScore.java          # 选手得分记录（核心表）
│   ├── Season.java               # 赛季
│   └── Team.java                 # 战队
├── repository/                   # 数据访问层
│   ├── PlayerRepository.java
│   ├── PlayerScoreRepository.java
│   ├── SeasonRepository.java
│   └── TeamRepository.java
└── service/                      # 业务层
    ├── ImportService.java
    ├── PlayerScoreService.java
    ├── RankingService.java
    └── impl/
        ├── DataResolveService.java   # 名称解析（导入用）
        ├── ImportServiceImpl.java
        ├── PlayerScoreServiceImpl.java
        └── RankingServiceImpl.java

src/main/resources/
├── application.yml              # 应用配置
└── data.sql                     # 初始化示例数据
```

## 构建和运行命令

### 本地开发
```bash
# 编译
mvn clean compile -DskipTests

# 运行（默认 5000 端口）
mvn spring-boot:run

# 打包
mvn clean package -DskipTests

# 运行 jar
java -jar target/score-api.jar
```

### 接口文档
启动后访问：
- Swagger UI: `http://localhost:5000/swagger-ui.html`
- OpenAPI JSON: `http://localhost:5000/api-docs`

### 切换 MySQL
修改 `application.yml` 或设置环境变量：
```bash
SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/scoredb?useUnicode=true&characterEncoding=utf8
SPRING_DATASOURCE_USERNAME=root
SPRING_DATASOURCE_PASSWORD=xxx
SPRING_DRIVER=com.mysql.cj.jdbc.Driver
SPRING_JPA_DIALECT=org.hibernate.dialect.MySQLDialect
```

## 接口清单

### 小程序端（`/api/app/**`）
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/app/seasons` | 赛季列表 |
| GET | `/api/app/current-season` | 当前赛季ID |
| GET | `/api/app/ranking/team-total` | 战队总分排行榜 |
| GET | `/api/app/ranking/team-average` | 战队均分排行榜 |
| GET | `/api/app/ranking/player-total` | 选手总分排行榜 |
| GET | `/api/app/schedule` | 赛季赛程 |

### 选手得分 CRUD（`/api/player-scores/**`）
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/player-scores` | 新增得分记录 |
| PUT | `/api/player-scores/{id}` | 修改得分记录 |
| DELETE | `/api/player-scores/{id}` | 删除单条 |
| DELETE | `/api/player-scores/batch` | 批量删除 |
| GET | `/api/player-scores/{id}` | 查询详情 |
| GET | `/api/player-scores/page` | 分页查询 |

### 数据导入（`/api/import/**`）
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/import/excel` | 导入 Excel (.xlsx) |
| POST | `/api/import/csv` | 导入 CSV |

### 基础数据管理
| 方法 | 路径 | 说明 |
|------|------|------|
| CRUD | `/api/seasons` | 赛季管理 |
| CRUD | `/api/teams` | 战队管理 |

### 选手数据（`/api/players/**`，扁平结构，供小程序端"赛事积分管理"页面使用）
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/players` | 查询选手数据列表，支持 `season`/`stage`/`keyword` 筛选 |
| GET | `/api/players/{id}` | 查询单条选手数据 |
| POST | `/api/players` | 新增选手数据 |
| PUT | `/api/players/{id}` | 修改选手数据 |
| DELETE | `/api/players/{id}` | 删除选手数据 |
| POST | `/api/players/import` | 批量导入（JSON） |

请求/响应字段为扁平结构（`playerName`/`teamName`/`season`/`stage` 等均为名称字符串，一条记录对应一场比赛的得分），
底层仍按 `Season`/`Team`/`Player`/`PlayerScore` 分表存储：`PlayerRecordServiceImpl` 通过 `DataResolveService` 按名称
自动查找或创建赛季/战队/选手，再读写 `PlayerScore`。与 `/api/player-scores`（按 ID 操作、供后台管理更细粒度使用）是两套面向不同调用方的接口，共享同一份底层数据。

## 核心业务规则

### 得分计算公式
```
总得分 = 胜负分 + 投票分 + 技能分 + 违规分 + 额外分
```
- 违规分用**负数**表示扣分
- 计算在 `PlayerScore.calculateTotalScore()` 中执行，结果持久化到 `total_score` 字段，便于排序

### 赛程阶段枚举（StageEnum）
- `REGULAR` → 常规赛
- `REVIVAL` → 复活赛
- `PLAYOFF` → 季后赛
- `FINAL` → 总决赛

### 排行榜逻辑
- 战队总分：同一赛季下按 `team_id` 分组，`SUM(total_score)` 降序
- 战队均分：同一赛季下按 `team_id` 分组，`AVG(total_score)` 降序
- 选手总分：同一赛季下按 `player_id` 分组，`SUM(total_score)` 降序

## 数据导入规范

### Excel / CSV 列顺序
| 序号 | 列名 | 说明 | 必填 |
|------|------|------|------|
| 0 | 战队名称 | 导入时自动匹配，不存在则创建 | 是 |
| 1 | 选手名称 | 导入时自动匹配，不存在则创建 | 是 |
| 2 | 赛程阶段 | 常规赛/复活赛/季后赛/总决赛 | 是 |
| 3 | 场次 | 数字（第几轮） | 是 |
| 4 | 日期 | yyyy-MM-dd 格式 | 是 |
| 5 | 身份 | 如：队长 / 队员 | 否 |
| 6 | 版型 | 如：标准版 | 否 |
| 7 | 胜负分 | 数字 | 否(默认0) |
| 8 | 投票分 | 数字 | 否(默认0) |
| 9 | 技能分 | 数字 | 否(默认0) |
| 10 | 违规分 | 数字（扣分填负数） | 否(默认0) |
| 11 | 额外分 | 数字 | 否(默认0) |
| 12 | 是否MVP | 是/否 | 否(默认否) |
| 13 | 是否SVP | 是/否 | 否(默认否) |
| 14 | 是否背锅 | 是/否 | 否(默认否) |

### 去重规则
唯一键：`赛季ID + 赛程阶段 + 场次 + 日期 + 选手ID`
导入时可选 `skipDuplicate=true` 跳过重复项。

## 代码修改速查

| 需求 | 修改位置 |
|------|----------|
| 新增字段 | `entity/PlayerScore.java` + `dto/PlayerScoreDTO.java` + `dto/PlayerScoreVO.java`（`/api/player-scores`）或 `dto/PlayerRecordDTO.java` + `dto/PlayerRecordVO.java`（`/api/players`） |
| 修改得分公式 | `entity/PlayerScore.java#calculateTotalScore()` |
| 新增排行榜 | `service/RankingService.java` + `repository/PlayerScoreRepository.java` + `controller/AppController.java` |
| 修改导入列 | `service/impl/ImportServiceImpl.java#parseExcelRow/parseCsvRow` |
| 切换数据库 | `application.yml` 或环境变量 |

## 安全注意事项

1. 管理端接口（CRUD/导入）未加鉴权，生产环境必须加登录校验（如 JWT / Session）
2. 小程序端接口都是 GET 查询，建议按业务加限流
3. 文件导入限制 10MB，可在 `application.yml` 调整
4. SQL 注入：全部使用 JPA / JPQL，无拼接 SQL 风险

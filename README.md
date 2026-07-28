# 积分查询系统 - 后端 API

基于 Spring Boot 3 的积分查询后端服务，支持选手得分数据管理、批量导入、战队/选手排行榜、赛程查询等功能。

## 技术栈

- Java 17 + Spring Boot 3.2.5
- Spring Data JPA + Hibernate
- H2（默认）/ MySQL
- springdoc-openapi (Swagger UI)
- Apache POI（Excel 导入）

## 快速开始

### 前置条件
- JDK 17+
- Maven 3.8+

### 本地运行
```bash
# 编译
mvn clean compile -DskipTests

# 启动（端口可通过 DEPLOY_RUN_PORT 环境变量指定，默认 5000）
mvn spring-boot:run
```

### 访问地址
- 应用根路径：http://localhost:5000
- Swagger 文档：http://localhost:5000/swagger-ui.html
- H2 控制台：默认关闭，可通过配置开启

### 打包部署
```bash
# 构建 jar
mvn clean package -DskipTests

# 运行
java -jar target/score-api.jar --server.port=5000
```

## 数据库配置

默认使用 H2 内存数据库（启动时自动执行 `data.sql` 初始化示例数据）。

切换 MySQL：
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/scoredb?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai
    username: root
    password: xxx
    driver-class-name: com.mysql.cj.jdbc.Driver
  jpa:
    hibernate:
      ddl-auto: update
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQLDialect
```

或使用环境变量：
```bash
SPRING_DATASOURCE_URL=jdbc:mysql://... \
SPRING_DATASOURCE_USERNAME=root \
SPRING_DATASOURCE_PASSWORD=xxx \
SPRING_DRIVER=com.mysql.cj.jdbc.Driver \
SPRING_JPA_DIALECT=org.hibernate.dialect.MySQLDialect \
java -jar target/score-api.jar
```

## 主要功能

### 1. 选手得分 CRUD
- 新增/修改/删除/批量删除/详情/分页查询
- 自动计算总得分：`胜负分 + 投票分 + 技能分 + 违规分 + 额外分`

### 2. 数据导入
- 支持 Excel (.xlsx) 和 CSV 格式
- 自动创建不存在的战队和选手
- 支持重复数据跳过
- 返回成功/失败/跳过明细

### 3. 排行榜（小程序端）
- 战队总分排行榜
- 战队均分排行榜
- 选手总分排行榜
- 支持按赛季切换

### 4. 赛程查询
- 按赛季返回赛程列表
- 包含每场次的参赛战队

### 5. 基础数据管理
- 赛季管理（CRUD）
- 战队管理（CRUD）
- 选手管理（CRUD）

## 接口示例

### 新增选手得分记录
```bash
curl -X POST http://localhost:5000/api/player-scores \
  -H 'Content-Type: application/json' \
  -d '{
    "seasonId": 1,
    "teamId": 1,
    "playerId": 1,
    "stage": "REGULAR",
    "roundNumber": 1,
    "matchDate": "2024-03-10",
    "identity": "队长",
    "version": "标准版",
    "winLoseScore": 3,
    "voteScore": 5,
    "skillScore": 2,
    "penaltyScore": 0,
    "extraScore": 0,
    "mvp": true,
    "svp": false,
    "scapegoat": false
  }'
```

### 战队总分排行榜
```bash
curl http://localhost:5000/api/app/ranking/team-total?seasonId=1
```

### Excel 导入
```bash
curl -X POST http://localhost:5000/api/import/excel \
  -F "file=@scores.xlsx" \
  -F "seasonId=1" \
  -F "skipDuplicate=true"
```

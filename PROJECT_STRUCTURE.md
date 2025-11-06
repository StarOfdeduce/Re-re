# AI内容检测系统 - 项目结构

```
workspace/
├── ai-detector-backend/                 # 后端服务目录
│   ├── src/
│   │   ├── controllers/
│   │   │   └── detectionController.ts   # 检测控制器，处理API请求
│   │   ├── services/
│   │   │   ├── aiDetectionService.ts    # AI检测核心算法（400+行）
│   │   │   └── fileProcessorService.ts  # 文件处理服务（PDF/Word/文本）
│   │   ├── routes/
│   │   │   └── detectionRoutes.ts       # API路由配置
│   │   └── index.ts                     # 后端应用入口
│   ├── prisma/
│   │   ├── schema.prisma                # 数据库模型定义
│   │   └── migrations/                  # 数据库迁移文件
│   │       └── 20241106000000_init/
│   │           └── migration.sql        # 初始化SQL
│   ├── uploads/                         # 临时文件上传目录
│   │   └── .gitkeep
│   ├── package.json                     # 后端依赖配置
│   ├── tsconfig.json                    # TypeScript配置
│   ├── Dockerfile                       # 后端Docker镜像
│   └── .env.example                     # 环境变量模板
│
├── ai-detector-frontend/                # 前端应用目录
│   ├── src/
│   │   ├── components/
│   │   │   ├── FileUpload.tsx          # 文件上传组件（拖拽支持）
│   │   │   ├── TextInput.tsx           # 文本输入组件
│   │   │   ├── ResultDisplay.tsx       # 结果展示组件（200+行）
│   │   │   └── HistoryList.tsx         # 历史记录组件
│   │   ├── lib/
│   │   │   └── api.ts                  # API客户端封装
│   │   ├── types/
│   │   │   └── api.ts                  # TypeScript类型定义
│   │   ├── App.tsx                     # 主应用组件（250+行）
│   │   ├── main.tsx                    # 应用入口
│   │   └── index.css                   # 全局样式
│   ├── public/                         # 静态资源
│   ├── package.json                    # 前端依赖配置
│   ├── tsconfig.json                   # TypeScript配置
│   ├── tailwind.config.js              # Tailwind CSS配置
│   ├── vite.config.ts                  # Vite构建配置
│   ├── Dockerfile                      # 前端Docker镜像
│   ├── nginx.conf                      # Nginx配置
│   └── .env.example                    # 环境变量模板
│
├── docker-compose.yml                  # Docker编排配置
├── .gitignore                          # Git忽略文件
├── start.sh                            # 快速启动脚本
│
└── 文档/
    ├── README.md                       # 项目说明文档
    ├── DEPLOYMENT.md                   # 详细部署指南（560+行）
    ├── API_TESTING.md                  # API测试指南
    └── PROJECT_DELIVERY.md             # 项目交付文档
```

## 核心文件说明

### 后端核心文件

1. **aiDetectionService.ts** (406行)
   - 完整的AI检测算法实现
   - 6大类检测特征
   - 综合评分系统

2. **detectionController.ts** (264行)
   - API接口实现
   - 文件上传处理
   - 数据库操作

3. **schema.prisma**
   - PostgreSQL数据库模型
   - User表和Detection表
   - 索引和关系定义

### 前端核心文件

1. **App.tsx** (255行)
   - 主应用布局
   - 标签页切换
   - 状态管理

2. **ResultDisplay.tsx** (229行)
   - 结果可视化
   - 指标卡片
   - 详细统计展示

3. **api.ts**
   - 完整的API客户端
   - 错误处理
   - TypeScript类型支持

### 部署配置

1. **docker-compose.yml**
   - 三服务编排（DB + 后端 + 前端）
   - 网络和卷配置
   - 健康检查

2. **Dockerfile**（前后端各一个）
   - 多阶段构建
   - 生产环境优化

## 代码统计

### 后端
- TypeScript源代码: ~1000行
- 核心算法: 406行
- API接口: 264行
- 路由配置: 41行

### 前端
- React组件: ~850行
- 主应用: 255行
- 结果展示: 229行
- 历史记录: 158行
- 工具库: ~150行

### 文档
- README.md: 261行
- DEPLOYMENT.md: 564行
- API_TESTING.md: 163行
- PROJECT_DELIVERY.md: 287行

### 配置文件
- Docker配置: ~150行
- TypeScript配置: ~40行
- 数据库模型: ~60行

## 技术栈版本

### 后端
- Node.js: 20 LTS
- Express: 4.18
- TypeScript: 5.3
- Prisma: 5.7
- Natural: 6.10
- Compromise: 14.10

### 前端
- React: 18.3
- TypeScript: 5.6
- Vite: 6.0
- Tailwind CSS: 3.4
- Lucide React: 最新版

### 基础设施
- PostgreSQL: 16
- Docker: 20.10+
- Nginx: Alpine版本
- PM2: 最新版（可选）

## 环境变量

### 后端 (.env)
```
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://...
JWT_SECRET=...
MAX_FILE_SIZE=10485760
```

### 前端 (.env.production)
```
VITE_API_URL=http://localhost:3001/api
```

## 数据库表结构

### User表
- id (UUID, 主键)
- email (唯一)
- password
- name
- createdAt, updatedAt

### Detection表
- id (UUID, 主键)
- userId (外键, 可选)
- fileName, fileSize, fileType
- content (文本内容)
- aiScore (AI概率分数)
- 各项检测指标 (perplexity, burstiness等)
- details (JSON, 详细统计)
- createdAt

## API端点

```
GET  /health                     # 健康检查
POST /api/detect/file            # 文件检测
POST /api/detect/text            # 文本检测
GET  /api/history                # 历史记录
GET  /api/detection/:id          # 检测详情
DELETE /api/detection/:id        # 删除记录
```

## 部署端口

- 前端: 80 (HTTP)
- 后端: 3001
- 数据库: 5432 (仅内部访问)

## 开发命令

### 后端
```bash
pnpm dev              # 开发服务器
pnpm build            # 构建
pnpm start            # 生产服务器
pnpm prisma:generate  # 生成Prisma Client
pnpm prisma:migrate   # 运行迁移
```

### 前端
```bash
pnpm dev              # 开发服务器
pnpm build            # 构建
pnpm preview          # 预览构建
```

### Docker
```bash
./start.sh            # 快速启动
docker-compose up -d  # 启动所有服务
docker-compose down   # 停止所有服务
docker-compose logs   # 查看日志
```

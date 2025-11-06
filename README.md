# AI内容检测系统

一个基于多维度语言学特征分析的AI内容检测Web应用，用于检测文档中AI生成内容的比例。

## 功能特性

### 核心功能
- 文件上传检测（PDF、Word、文本文件）
- 在线文本内容检测
- 实时检测进度显示
- 检测历史记录管理
- 详细结果可视化

### AI检测指标

系统基于以下多维度语言学特征进行综合分析：

#### 1. 文本复杂度
- **Perplexity（困惑度）**: 衡量文本的不确定性和复杂度，人类写作通常表现出更高的困惑度
- **Burstiness（突发性）**: 分析句子长度的变化模式，人类写作更具变化性

#### 2. 词汇多样性
- **TTR (Type-Token Ratio)**: 独特词汇占总词汇的比例
- **MTLD (Measure of Textual Lexical Diversity)**: 更稳定的词汇多样性度量
- **VocD (Vocabulary Diversity)**: 基于随机采样的词汇多样性估算

#### 3. 句法复杂度
- **MLT (Mean Length of T-Unit)**: 平均T单元长度
- **DC/T (Dependent Clauses per T-Unit)**: 每个T单元的从句数量

#### 4. 可读性指标
- **Flesch-Kincaid Grade Level**: 估算阅读理解所需的教育年级
- **Gunning Fog Index**: 文本的易读性指数

#### 5. 词汇复杂度
- **Lexical Sophistication**: 词汇的高级程度和复杂性

## 技术架构

### 前端
- **框架**: React 18 + TypeScript
- **构建工具**: Vite 6
- **UI框架**: Tailwind CSS 3.4
- **图标库**: Lucide React
- **状态管理**: React Hooks

### 后端
- **运行时**: Node.js 20
- **框架**: Express 4
- **语言**: TypeScript 5
- **文件处理**: pdf-parse, mammoth
- **NLP库**: natural, compromise, syllable

### 数据库
- **数据库**: PostgreSQL 16
- **ORM**: Prisma 5

### 部署
- **容器化**: Docker + Docker Compose
- **Web服务器**: Nginx
- **进程管理**: PM2

## 快速开始

### 使用Docker Compose（推荐）

```bash
# 1. 配置环境变量
cp ai-detector-backend/.env.example ai-detector-backend/.env
cp ai-detector-frontend/.env.example ai-detector-frontend/.env.production

# 2. 编辑环境变量文件，设置数据库密码等配置

# 3. 启动所有服务
docker-compose up -d

# 4. 访问应用
# 前端: http://localhost
# 后端API: http://localhost:3001
```

### 本地开发

#### 后端

```bash
cd ai-detector-backend

# 安装依赖
pnpm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件

# 运行数据库迁移
pnpm prisma:generate
pnpm prisma:migrate

# 启动开发服务器
pnpm dev
```

#### 前端

```bash
cd ai-detector-frontend

# 安装依赖
pnpm install

# 配置环境变量
cp .env.example .env

# 启动开发服务器
pnpm dev
```

## 项目结构

```
.
├── ai-detector-backend/          # 后端服务
│   ├── src/
│   │   ├── controllers/          # 控制器
│   │   ├── services/            # 业务逻辑
│   │   │   ├── aiDetectionService.ts    # AI检测核心算法
│   │   │   └── fileProcessorService.ts  # 文件处理
│   │   ├── routes/              # 路由
│   │   ├── models/              # 数据模型
│   │   └── index.ts             # 入口文件
│   ├── prisma/                  # 数据库schema
│   ├── uploads/                 # 上传文件临时目录
│   └── package.json
│
├── ai-detector-frontend/         # 前端应用
│   ├── src/
│   │   ├── components/          # React组件
│   │   │   ├── FileUpload.tsx
│   │   │   ├── TextInput.tsx
│   │   │   ├── ResultDisplay.tsx
│   │   │   └── HistoryList.tsx
│   │   ├── lib/                 # 工具库
│   │   │   └── api.ts           # API客户端
│   │   ├── types/               # TypeScript类型
│   │   └── App.tsx              # 主应用组件
│   └── package.json
│
├── docker-compose.yml           # Docker编排配置
├── DEPLOYMENT.md                # 详细部署指南
└── README.md                    # 项目说明
```

## API接口

### 文件检测
```
POST /api/detect/file
Content-Type: multipart/form-data

参数:
- file: 上传的文件（PDF/Word/文本）

返回: 检测结果JSON
```

### 文本检测
```
POST /api/detect/text
Content-Type: application/json

{
  "text": "要检测的文本内容"
}

返回: 检测结果JSON
```

### 获取历史记录
```
GET /api/history?page=1&limit=20

返回: 历史记录列表
```

### 获取检测详情
```
GET /api/detection/:id

返回: 单个检测记录详情
```

### 删除检测记录
```
DELETE /api/detection/:id

返回: 删除成功确认
```

## 检测结果说明

系统返回一个综合AI分数（0-100）：
- **0-30**: 人类写作可能性高
- **30-50**: AI生成可能性较低
- **50-70**: AI生成可能性中等
- **70-80**: AI生成可能性高
- **80-100**: AI生成可能性极高

同时提供详细的各项指标分析和文本统计信息。

## 使用限制

- 单个文件大小：最大 10MB
- 文本长度：最大 100,000 字符
- 建议最小长度：至少 50 个单词以获得准确结果
- 支持格式：PDF、Word (.doc/.docx)、文本文件 (.txt/.md)

## 注意事项

1. **检测准确性**: 结果基于语言学特征分析，仅供参考，不应作为唯一判断依据
2. **隐私保护**: 上传的文件仅保存部分内容用于历史记录，完整内容不会永久存储
3. **性能考虑**: 大文件检测可能需要较长时间，建议合理分段检测
4. **持续改进**: AI技术不断进步，检测算法会定期更新优化

## 部署指南

详细的部署说明请参考 [DEPLOYMENT.md](./DEPLOYMENT.md)，包括：
- Docker一键部署
- 本地开发环境配置
- 生产环境部署
- 常见问题解决
- 性能优化建议
- 安全配置指南

## 开发者

**MiniMax Agent**

## 许可证

MIT License

Copyright (c) 2024 MiniMax Agent

## 更新日志

### v1.0.0 (2024-11)
- 初始版本发布
- 实现完整的AI检测算法
- 支持多种文件格式
- 提供历史记录管理
- 完整的部署文档

## 致谢

本项目使用了以下优秀的开源库：
- Natural (NLP处理)
- Compromise (文本分析)
- Syllable (音节统计)
- PDF-parse (PDF解析)
- Mammoth (Word文档解析)

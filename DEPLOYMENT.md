# AI内容检测系统 - 完整部署指南

## 项目概述

AI内容检测系统是一个基于多维度语言学特征分析的Web应用，用于检测文档中AI生成内容的比例。

### 技术栈

- **前端**: React 18 + TypeScript + Tailwind CSS + Vite
- **后端**: Node.js + Express + TypeScript
- **数据库**: PostgreSQL 16
- **容器化**: Docker + Docker Compose
- **Web服务器**: Nginx

### 核心功能

1. 文件上传检测（支持PDF、Word、文本文件）
2. 在线文本检测
3. 多维度AI检测指标
   - Perplexity（困惑度）
   - Burstiness（突发性）
   - 词汇多样性（TTR、MTLD、VocD）
   - 句法复杂度（MLT、DC/T）
   - 可读性指标（Flesch-Kincaid、Gunning Fog）
   - 词汇复杂度
4. 检测历史记录管理
5. 详细结果可视化

---

## 快速开始（使用Docker Compose）

### 前提条件

- Docker 20.10+
- Docker Compose 2.0+
- 至少2GB可用内存
- 至少5GB可用磁盘空间

### 一键部署

1. **克隆或下载项目**

```bash
# 确保你在项目根目录
cd /workspace
```

2. **配置环境变量**

```bash
# 创建后端环境变量文件
cp ai-detector-backend/.env.example ai-detector-backend/.env

# 编辑环境变量
nano ai-detector-backend/.env
```

修改以下配置：
```env
NODE_ENV=production
PORT=3001
DATABASE_URL="postgresql://aidetector:your_secure_password@postgres:5432/ai_detector?schema=public"
JWT_SECRET=your-very-secure-jwt-secret-key
```

3. **创建前端环境变量**

```bash
cp ai-detector-frontend/.env.example ai-detector-frontend/.env.production
```

修改为：
```env
VITE_API_URL=http://your-server-ip:3001/api
```

4. **启动所有服务**

```bash
docker-compose up -d
```

5. **查看服务状态**

```bash
docker-compose ps
```

应该看到三个服务都在运行：
- ai-detector-db（PostgreSQL）
- ai-detector-backend（后端API）
- ai-detector-frontend（前端界面）

6. **访问应用**

打开浏览器访问：`http://your-server-ip`

---

## 本地开发部署

### 后端开发部署

#### 1. 安装依赖

```bash
cd ai-detector-backend

# 使用pnpm（推荐）
npm install -g pnpm
pnpm install

# 或使用npm
npm install
```

#### 2. 配置数据库

**安装PostgreSQL**

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# macOS
brew install postgresql
brew services start postgresql

# 创建数据库和用户
sudo -u postgres psql
```

在PostgreSQL shell中执行：
```sql
CREATE DATABASE ai_detector;
CREATE USER aidetector WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE ai_detector TO aidetector;
\q
```

#### 3. 配置环境变量

```bash
cp .env.example .env
```

编辑 `.env` 文件：
```env
NODE_ENV=development
PORT=3001
DATABASE_URL="postgresql://aidetector:your_password@localhost:5432/ai_detector?schema=public"
JWT_SECRET=dev-secret-key
```

#### 4. 运行数据库迁移

```bash
# 生成Prisma Client
pnpm prisma:generate

# 运行迁移
pnpm prisma:migrate
```

#### 5. 启动开发服务器

```bash
pnpm dev
```

后端服务将在 `http://localhost:3001` 运行

### 前端开发部署

#### 1. 安装依赖

```bash
cd ai-detector-frontend
pnpm install
```

#### 2. 配置环境变量

```bash
cp .env.example .env
```

编辑 `.env`：
```env
VITE_API_URL=http://localhost:3001/api
```

#### 3. 启动开发服务器

```bash
pnpm dev
```

前端开发服务器将在 `http://localhost:5173` 运行

---

## 生产环境部署

### 方案一：Docker部署（推荐）

已在"快速开始"部分说明，适合大多数场景。

### 方案二：手动部署到云服务器

#### 准备服务器

- Ubuntu 20.04 LTS 或更高版本
- 至少2GB RAM
- 至少10GB可用磁盘空间

#### 1. 安装必要软件

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 安装pnpm
npm install -g pnpm

# 安装PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# 安装Nginx
sudo apt install -y nginx

# 安装PM2（进程管理器）
npm install -g pm2
```

#### 2. 配置PostgreSQL

```bash
sudo -u postgres psql

CREATE DATABASE ai_detector;
CREATE USER aidetector WITH ENCRYPTED PASSWORD 'secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE ai_detector TO aidetector;
\q
```

#### 3. 部署后端

```bash
# 复制代码到服务器
cd /var/www
sudo mkdir ai-detector-backend
sudo chown $USER:$USER ai-detector-backend
cd ai-detector-backend

# 上传代码（使用git、scp或其他方式）
# 这里假设代码已上传

# 安装依赖
pnpm install --prod

# 配置环境变量
nano .env
# 填入生产环境配置

# 构建
pnpm build

# 运行数据库迁移
pnpm prisma:generate
pnpm prisma:migrate

# 使用PM2启动
pm2 start dist/index.js --name ai-detector-api
pm2 save
pm2 startup
```

#### 4. 部署前端

```bash
cd /var/www
sudo mkdir ai-detector-frontend
sudo chown $USER:$USER ai-detector-frontend
cd ai-detector-frontend

# 上传代码

# 安装依赖
pnpm install

# 配置生产环境变量
nano .env.production
# VITE_API_URL=http://your-domain.com/api

# 构建
pnpm build

# 复制构建产物到nginx目录
sudo cp -r dist/* /var/www/html/
```

#### 5. 配置Nginx

```bash
sudo nano /etc/nginx/sites-available/ai-detector
```

添加以下配置：
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    # 前端
    location / {
        root /var/www/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
    
    # API代理
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        root /var/www/html;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

启用配置：
```bash
sudo ln -s /etc/nginx/sites-available/ai-detector /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 6. 配置SSL（可选但推荐）

```bash
# 安装Certbot
sudo apt install -y certbot python3-certbot-nginx

# 获取SSL证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo certbot renew --dry-run
```

---

## 常见问题

### 1. 后端无法连接数据库

**问题**: `Error: connect ECONNREFUSED`

**解决方案**:
- 检查PostgreSQL是否运行：`sudo systemctl status postgresql`
- 检查数据库URL配置是否正确
- 确保数据库用户有正确权限

### 2. 文件上传失败

**问题**: 上传文件时报错

**解决方案**:
- 检查 `uploads/` 目录是否存在且有写入权限
- 检查文件大小限制（默认10MB）
- 查看后端日志：`pm2 logs ai-detector-api`

### 3. 前端无法连接后端

**问题**: API请求失败

**解决方案**:
- 检查 `.env` 中的 `VITE_API_URL` 配置
- 确保后端服务正在运行
- 检查CORS配置
- 查看浏览器控制台错误信息

### 4. Docker容器无法启动

**问题**: `docker-compose up` 失败

**解决方案**:
- 检查Docker是否正常运行：`docker info`
- 查看容器日志：`docker-compose logs`
- 确保端口未被占用：`sudo netstat -tulpn | grep :3001`
- 清理并重新构建：`docker-compose down -v && docker-compose up --build`

---

## 维护与监控

### 查看日志

**Docker部署**:
```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

**PM2部署**:
```bash
pm2 logs ai-detector-api
pm2 monit
```

### 备份数据库

```bash
# Docker环境
docker-compose exec postgres pg_dump -U aidetector ai_detector > backup_$(date +%Y%m%d).sql

# 本地环境
pg_dump -U aidetector -h localhost ai_detector > backup_$(date +%Y%m%d).sql
```

### 恢复数据库

```bash
# Docker环境
docker-compose exec -T postgres psql -U aidetector ai_detector < backup.sql

# 本地环境
psql -U aidetector -h localhost ai_detector < backup.sql
```

### 更新应用

**Docker部署**:
```bash
# 拉取最新代码
git pull

# 重新构建并启动
docker-compose down
docker-compose up --build -d
```

**手动部署**:
```bash
# 后端更新
cd /var/www/ai-detector-backend
git pull
pnpm install
pnpm build
pm2 restart ai-detector-api

# 前端更新
cd /var/www/ai-detector-frontend
git pull
pnpm install
pnpm build
sudo cp -r dist/* /var/www/html/
```

---

## 性能优化建议

1. **数据库优化**
   - 定期清理旧的检测记录
   - 添加适当的索引
   - 配置连接池

2. **后端优化**
   - 启用响应压缩
   - 实现请求限流
   - 添加缓存层（Redis）

3. **前端优化**
   - 启用CDN
   - 实现代码分割
   - 优化图片资源

4. **服务器配置**
   - 配置防火墙
   - 设置监控告警
   - 定期备份数据

---

## 安全建议

1. **环境变量**
   - 使用强密码
   - 不要将 `.env` 文件提交到版本控制
   - 定期更新密钥

2. **数据库安全**
   - 限制数据库访问
   - 使用SSL连接
   - 定期备份

3. **应用安全**
   - 保持依赖更新
   - 实现请求验证
   - 添加HTTPS支持
   - 配置CORS策略

4. **服务器安全**
   - 使用防火墙
   - 禁用不必要的服务
   - 定期更新系统
   - 配置fail2ban

---

## 技术支持

如遇到问题，请检查：

1. 应用日志
2. 系统资源使用情况
3. 网络连接状态
4. 配置文件正确性

---

## 许可证

MIT License

---

## 更新日志

### v1.0.0 (2024-11)
- 初始版本发布
- 实现核心AI检测功能
- 支持多种文件格式
- 完整的部署文档

---

**开发者**: MiniMax Agent  
**最后更新**: 2024-11

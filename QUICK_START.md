# AI内容检测系统 - 快速开始指南

## 最快速启动（3步）

### 1. 启动服务

```bash
# 在项目根目录执行
./start.sh
```

### 2. 等待服务就绪

首次启动需要3-5分钟构建Docker镜像。查看启动日志：

```bash
docker-compose logs -f
```

看到以下信息表示服务已就绪：
- `postgres` 显示 "database system is ready to accept connections"
- `backend` 显示 "服务器运行在端口 3001"
- `frontend` 显示 Nginx启动信息

### 3. 访问应用

打开浏览器访问：**http://localhost**

## 测试检测功能

### 方法1: 在线文本检测

1. 点击"文本输入"标签
2. 粘贴以下测试文本：

```
Artificial intelligence is transforming various industries at an unprecedented pace. Machine learning algorithms can now analyze vast amounts of data to identify patterns and make accurate predictions. Deep learning, a subset of machine learning, utilizes neural networks with multiple layers to process complex information. Natural language processing enables computers to understand and generate human language effectively. Computer vision technology allows machines to interpret and analyze visual information from the world around them. These advancements are revolutionizing healthcare, finance, transportation, and many other sectors.
```

3. 点击"开始检测"
4. 等待几秒钟查看结果

### 方法2: 文件上传检测

1. 创建测试文件：

```bash
cat > test.txt << 'TESTEOF'
The impact of artificial intelligence on modern society cannot be overstated. AI systems are becoming increasingly sophisticated, capable of performing tasks that once required human intelligence. From autonomous vehicles to medical diagnosis, AI is revolutionizing how we live and work. However, this rapid advancement also raises important questions about ethics, privacy, and the future of employment. As AI continues to evolve, it is crucial that we develop appropriate guidelines and regulations to ensure its responsible use.
TESTEOF
```

2. 点击"文件上传"标签
3. 拖拽或选择 `test.txt` 文件
4. 查看检测结果

## 检查服务状态

### 查看所有容器

```bash
docker-compose ps
```

应该看到三个容器都在运行（Up）状态。

### 测试后端API

```bash
curl http://localhost:3001/health
```

应该返回：`{"status":"ok","timestamp":"..."}`

### 查看日志

```bash
# 查看所有服务日志
docker-compose logs

# 查看特定服务
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres
```

## 常用操作

### 停止服务

```bash
docker-compose down
```

### 重启服务

```bash
docker-compose restart
```

### 更新代码后重新构建

```bash
docker-compose down
docker-compose up --build -d
```

### 清理所有数据（包括数据库）

```bash
docker-compose down -v
```

## 故障排除

### 端口被占用

如果80或3001端口被占用，编辑 `docker-compose.yml` 修改端口映射：

```yaml
ports:
  - "8080:80"  # 前端改为8080端口
  - "3002:3001"  # 后端改为3002端口
```

### 数据库连接失败

等待更长时间让PostgreSQL完全启动，或查看数据库日志：

```bash
docker-compose logs postgres
```

### 前端无法连接后端

检查 `ai-detector-frontend/.env.production` 中的API地址配置。

## 下一步

- 查看 [README.md](./README.md) 了解功能详情
- 阅读 [DEPLOYMENT.md](./DEPLOYMENT.md) 了解生产部署
- 参考 [API_TESTING.md](./API_TESTING.md) 测试API接口
- 查看 [PROJECT_DELIVERY.md](./PROJECT_DELIVERY.md) 了解技术实现

## 获取帮助

如遇到问题：

1. 查看日志：`docker-compose logs -f`
2. 检查容器状态：`docker-compose ps`
3. 重启服务：`docker-compose restart`
4. 查看详细文档：`DEPLOYMENT.md`

---

**祝使用愉快！**

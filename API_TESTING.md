# API测试指南

## 使用curl测试API

### 1. 健康检查

```bash
curl http://localhost:3001/health
```

### 2. 文本检测

```bash
curl -X POST http://localhost:3001/api/detect/text \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Artificial intelligence is transforming the way we work and live. Machine learning algorithms can analyze vast amounts of data to identify patterns and make predictions. Deep learning, a subset of machine learning, uses neural networks with multiple layers to process complex information. Natural language processing enables computers to understand and generate human language. Computer vision allows machines to interpret and analyze visual information from the world around them."
  }'
```

### 3. 文件检测

```bash
# 创建测试文本文件
echo "This is a sample text for AI detection. Artificial intelligence and machine learning are revolutionizing various industries. Natural language processing helps computers understand human language." > test.txt

# 上传检测
curl -X POST http://localhost:3001/api/detect/file \
  -F "file=@test.txt"
```

### 4. 获取历史记录

```bash
curl http://localhost:3001/api/history?page=1&limit=10
```

### 5. 获取检测详情

```bash
# 替换 {id} 为实际的检测记录ID
curl http://localhost:3001/api/detection/{id}
```

### 6. 删除检测记录

```bash
# 替换 {id} 为实际的检测记录ID
curl -X DELETE http://localhost:3001/api/detection/{id}
```

## 使用Postman测试

1. 导入以下环境变量：
   - `BASE_URL`: `http://localhost:3001`
   - `API_URL`: `http://localhost:3001/api`

2. 创建请求集合：

### 文本检测
- Method: POST
- URL: `{{API_URL}}/detect/text`
- Headers: `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "text": "Your text content here..."
}
```

### 文件上传
- Method: POST
- URL: `{{API_URL}}/detect/file`
- Body: form-data
  - Key: `file`
  - Value: 选择文件

## 预期响应格式

### 成功响应示例

```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "fileName": "test.txt",
    "aiScore": 65.4,
    "metrics": {
      "perplexity": 45.2,
      "burstiness": 38.7,
      "ttr": 72.5,
      "mtld": 85.3,
      "vocd": 68.9,
      "mlt": 15.4,
      "dct": 0.8,
      "fleschKincaid": 12.3,
      "gunningFog": 14.5,
      "lexicalSophistication": 55.8
    },
    "details": {
      "wordCount": 150,
      "sentenceCount": 8,
      "paragraphCount": 2,
      "avgSentenceLength": 18.75,
      "avgWordLength": 5.2,
      "complexWords": 25,
      "uniqueWords": 98,
      "sentenceLengthVariance": 12.4
    },
    "createdAt": "2024-11-06T12:00:00.000Z"
  }
}
```

### 错误响应示例

```json
{
  "error": "文本内容不能为空"
}
```

## 性能测试

### 使用Apache Bench (ab)

```bash
# 安装ab (如果未安装)
sudo apt-get install apache2-utils

# 测试健康检查端点
ab -n 1000 -c 10 http://localhost:3001/health
```

### 使用wrk

```bash
# 安装wrk
sudo apt-get install wrk

# 性能测试
wrk -t4 -c100 -d30s http://localhost:3001/health
```

## 常见问题

### 1. 连接被拒绝
确保后端服务正在运行：
```bash
docker-compose ps
# 或
curl http://localhost:3001/health
```

### 2. 文件上传失败
检查文件大小（最大10MB）和格式（PDF/Word/文本）

### 3. 检测超时
大文件可能需要更长时间，建议设置更长的超时时间：
```bash
curl --max-time 60 ...
```

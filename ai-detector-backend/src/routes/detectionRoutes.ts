import { Router } from 'express';
import multer from 'multer';
import { DetectionController } from '../controllers/detectionController';

const router = Router();
const detectionController = new DetectionController();

// 配置文件上传
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

// 文件检测
router.post('/detect/file', upload.single('file'), (req, res) => {
  detectionController.detectFile(req, res);
});

// 文本检测
router.post('/detect/text', (req, res) => {
  detectionController.detectText(req, res);
});

// 获取历史记录
router.get('/history', (req, res) => {
  detectionController.getHistory(req, res);
});

// 获取检测详情
router.get('/detection/:id', (req, res) => {
  detectionController.getDetectionById(req, res);
});

// 删除检测记录
router.delete('/detection/:id', (req, res) => {
  detectionController.deleteDetection(req, res);
});

export default router;

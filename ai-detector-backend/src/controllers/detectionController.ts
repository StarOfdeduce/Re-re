import { Request, Response } from 'express';
import { AIDetectionService } from '../services/aiDetectionService';
import { FileProcessorService } from '../services/fileProcessorService';
import { PrismaClient } from '@prisma/client';
import { promises as fs } from 'fs';

const prisma = new PrismaClient();
const aiDetectionService = new AIDetectionService();
const fileProcessorService = new FileProcessorService();

export class DetectionController {
  /**
   * 上传文件并进行AI检测
   */
  async detectFile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ error: '未上传文件' });
        return;
      }

      const { originalname, size, mimetype, path } = req.file;

      // 验证文件
      fileProcessorService.validateFileSize(size);
      fileProcessorService.validateFileType(mimetype);

      // 提取文本内容
      const text = await fileProcessorService.extractText(path, mimetype);

      // 执行AI检测
      const result = await aiDetectionService.detectAIContent(text);

      // 保存检测记录
      const detection = await prisma.detection.create({
        data: {
          userId: req.body.userId || null,
          fileName: originalname,
          fileSize: size,
          fileType: mimetype,
          content: text.substring(0, 5000), // 只保存前5000字符
          aiScore: result.aiScore,
          perplexity: result.perplexity,
          burstiness: result.burstiness,
          ttr: result.ttr,
          mtld: result.mtld,
          vocd: result.vocd,
          mlt: result.mlt,
          dct: result.dct,
          fleschKincaid: result.fleschKincaid,
          gunningFog: result.gunningFog,
          lexicalSophistication: result.lexicalSophistication,
          details: result.details
        }
      });

      // 删除临时文件
      await fs.unlink(path);

      res.json({
        success: true,
        data: {
          id: detection.id,
          fileName: detection.fileName,
          aiScore: result.aiScore,
          metrics: {
            perplexity: result.perplexity,
            burstiness: result.burstiness,
            ttr: result.ttr,
            mtld: result.mtld,
            vocd: result.vocd,
            mlt: result.mlt,
            dct: result.dct,
            fleschKincaid: result.fleschKincaid,
            gunningFog: result.gunningFog,
            lexicalSophistication: result.lexicalSophistication
          },
          details: result.details,
          createdAt: detection.createdAt
        }
      });
    } catch (error) {
      // 清理临时文件
      if (req.file?.path) {
        try {
          await fs.unlink(req.file.path);
        } catch (unlinkError) {
          console.error('清理临时文件失败:', unlinkError);
        }
      }

      console.error('检测失败:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : '检测失败'
      });
    }
  }

  /**
   * 检测文本内容
   */
  async detectText(req: Request, res: Response): Promise<void> {
    try {
      const { text, userId } = req.body;

      if (!text || typeof text !== 'string' || text.trim().length === 0) {
        res.status(400).json({ error: '文本内容不能为空' });
        return;
      }

      if (text.length > 100000) {
        res.status(400).json({ error: '文本长度不能超过100000字符' });
        return;
      }

      // 执行AI检测
      const result = await aiDetectionService.detectAIContent(text);

      // 保存检测记录
      const detection = await prisma.detection.create({
        data: {
          userId: userId || null,
          fileName: '文本输入',
          fileSize: Buffer.byteLength(text, 'utf8'),
          fileType: 'text/plain',
          content: text.substring(0, 5000),
          aiScore: result.aiScore,
          perplexity: result.perplexity,
          burstiness: result.burstiness,
          ttr: result.ttr,
          mtld: result.mtld,
          vocd: result.vocd,
          mlt: result.mlt,
          dct: result.dct,
          fleschKincaid: result.fleschKincaid,
          gunningFog: result.gunningFog,
          lexicalSophistication: result.lexicalSophistication,
          details: result.details
        }
      });

      res.json({
        success: true,
        data: {
          id: detection.id,
          fileName: detection.fileName,
          aiScore: result.aiScore,
          metrics: {
            perplexity: result.perplexity,
            burstiness: result.burstiness,
            ttr: result.ttr,
            mtld: result.mtld,
            vocd: result.vocd,
            mlt: result.mlt,
            dct: result.dct,
            fleschKincaid: result.fleschKincaid,
            gunningFog: result.gunningFog,
            lexicalSophistication: result.lexicalSophistication
          },
          details: result.details,
          createdAt: detection.createdAt
        }
      });
    } catch (error) {
      console.error('检测失败:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : '检测失败'
      });
    }
  }

  /**
   * 获取检测历史记录
   */
  async getHistory(req: Request, res: Response): Promise<void> {
    try {
      const { userId, page = 1, limit = 20 } = req.query;

      const skip = (Number(page) - 1) * Number(limit);

      const where = userId ? { userId: String(userId) } : {};

      const [detections, total] = await Promise.all([
        prisma.detection.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: Number(limit),
          select: {
            id: true,
            fileName: true,
            fileType: true,
            aiScore: true,
            createdAt: true
          }
        }),
        prisma.detection.count({ where })
      ]);

      res.json({
        success: true,
        data: {
          detections,
          pagination: {
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / Number(limit))
          }
        }
      });
    } catch (error) {
      console.error('获取历史记录失败:', error);
      res.status(500).json({ error: '获取历史记录失败' });
    }
  }

  /**
   * 获取单个检测详情
   */
  async getDetectionById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const detection = await prisma.detection.findUnique({
        where: { id }
      });

      if (!detection) {
        res.status(404).json({ error: '检测记录不存在' });
        return;
      }

      res.json({
        success: true,
        data: detection
      });
    } catch (error) {
      console.error('获取检测详情失败:', error);
      res.status(500).json({ error: '获取检测详情失败' });
    }
  }

  /**
   * 删除检测记录
   */
  async deleteDetection(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await prisma.detection.delete({
        where: { id }
      });

      res.json({
        success: true,
        message: '删除成功'
      });
    } catch (error) {
      console.error('删除检测记录失败:', error);
      res.status(500).json({ error: '删除检测记录失败' });
    }
  }
}

import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import { promises as fs } from 'fs';

export class FileProcessorService {
  /**
   * 处理上传的文件并提取文本内容
   */
  async extractText(filePath: string, mimeType: string): Promise<string> {
    try {
      if (mimeType === 'application/pdf') {
        return await this.extractPDF(filePath);
      } else if (
        mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        mimeType === 'application/msword'
      ) {
        return await this.extractWord(filePath);
      } else if (mimeType.startsWith('text/')) {
        return await this.extractText文件(filePath);
      } else {
        throw new Error('不支持的文件格式');
      }
    } catch (error) {
      throw new Error(`文件处理失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 提取PDF文本
   */
  private async extractPDF(filePath: string): Promise<string> {
    const dataBuffer = await fs.readFile(filePath);
    const data = await pdf(dataBuffer);
    
    if (!data.text || data.text.trim().length === 0) {
      throw new Error('PDF文件不包含可提取的文本内容');
    }
    
    return data.text;
  }

  /**
   * 提取Word文档文本
   */
  private async extractWord(filePath: string): Promise<string> {
    const buffer = await fs.readFile(filePath);
    const result = await mammoth.extractRawText({ buffer });
    
    if (!result.value || result.value.trim().length === 0) {
      throw new Error('Word文档不包含可提取的文本内容');
    }
    
    return result.value;
  }

  /**
   * 读取纯文本文件
   */
  private async extractText文件(filePath: string): Promise<string> {
    const content = await fs.readFile(filePath, 'utf-8');
    
    if (!content || content.trim().length === 0) {
      throw new Error('文本文件为空');
    }
    
    return content;
  }

  /**
   * 验证文件大小
   */
  validateFileSize(size: number, maxSize: number = 10 * 1024 * 1024): void {
    if (size > maxSize) {
      throw new Error(`文件大小超过限制 (最大 ${maxSize / 1024 / 1024}MB)`);
    }
  }

  /**
   * 验证文件类型
   */
  validateFileType(mimeType: string): void {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain',
      'text/markdown'
    ];

    if (!allowedTypes.includes(mimeType)) {
      throw new Error('不支持的文件类型');
    }
  }
}

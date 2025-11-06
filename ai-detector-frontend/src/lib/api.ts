import { DetectionResponse, HistoryResponse } from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export class APIClient {
  /**
   * 上传文件进行检测
   */
  static async detectFile(file: File): Promise<DetectionResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/detect/file`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '文件检测失败');
    }

    return response.json();
  }

  /**
   * 检测文本内容
   */
  static async detectText(text: string): Promise<DetectionResponse> {
    const response = await fetch(`${API_BASE_URL}/detect/text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '文本检测失败');
    }

    return response.json();
  }

  /**
   * 获取历史记录
   */
  static async getHistory(page: number = 1, limit: number = 20): Promise<HistoryResponse> {
    const response = await fetch(`${API_BASE_URL}/history?page=${page}&limit=${limit}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '获取历史记录失败');
    }

    return response.json();
  }

  /**
   * 获取检测详情
   */
  static async getDetectionById(id: string): Promise<DetectionResponse> {
    const response = await fetch(`${API_BASE_URL}/detection/${id}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '获取检测详情失败');
    }

    return response.json();
  }

  /**
   * 删除检测记录
   */
  static async deleteDetection(id: string): Promise<{ success: boolean }> {
    const response = await fetch(`${API_BASE_URL}/detection/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '删除失败');
    }

    return response.json();
  }
}

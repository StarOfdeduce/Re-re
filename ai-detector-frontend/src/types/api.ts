// API响应类型
export interface DetectionResult {
  id: string;
  fileName: string;
  aiScore: number;
  metrics: {
    perplexity: number;
    burstiness: number;
    ttr: number;
    mtld: number | null;
    vocd: number | null;
    mlt: number | null;
    dct: number | null;
    fleschKincaid: number;
    gunningFog: number;
    lexicalSophistication: number | null;
  };
  details: {
    wordCount: number;
    sentenceCount: number;
    paragraphCount: number;
    avgSentenceLength: number;
    avgWordLength: number;
    complexWords: number;
    uniqueWords: number;
    sentenceLengthVariance: number;
  };
  createdAt: string;
}

export interface HistoryItem {
  id: string;
  fileName: string;
  fileType: string;
  aiScore: number;
  createdAt: string;
}

export interface DetectionResponse {
  success: boolean;
  data: DetectionResult;
}

export interface HistoryResponse {
  success: boolean;
  data: {
    detections: HistoryItem[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface ErrorResponse {
  error: string;
}

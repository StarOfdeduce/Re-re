import natural from 'natural';
import compromise from 'compromise';
import syllable from 'syllable';

interface DetectionResult {
  aiScore: number;
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
}

export class AIDetectionService {
  private tokenizer: natural.WordTokenizer;
  private sentenceTokenizer: natural.SentenceTokenizer;

  constructor() {
    this.tokenizer = new natural.WordTokenizer();
    this.sentenceTokenizer = new natural.SentenceTokenizer();
  }

  /**
   * 主检测函数
   */
  async detectAIContent(text: string): Promise<DetectionResult> {
    // 预处理文本
    const cleanedText = this.preprocessText(text);
    
    // 基础文本分析
    const words = this.tokenizer.tokenize(cleanedText.toLowerCase());
    const sentences = this.sentenceTokenizer.tokenize(cleanedText);
    const paragraphs = cleanedText.split(/\n\n+/).filter(p => p.trim().length > 0);
    
    if (!words || words.length === 0) {
      throw new Error('文本内容为空或无法分析');
    }

    // 计算各项指标
    const perplexity = this.calculatePerplexity(words);
    const burstiness = this.calculateBurstiness(sentences);
    const ttr = this.calculateTTR(words);
    const mtld = this.calculateMTLD(words);
    const vocd = this.calculateVocD(words);
    
    const { mlt, dct } = this.calculateSyntacticComplexity(cleanedText);
    
    const fleschKincaid = this.calculateFleschKincaid(cleanedText, words, sentences);
    const gunningFog = this.calculateGunningFog(words, sentences);
    const lexicalSophistication = this.calculateLexicalSophistication(words);
    
    // 计算详细信息
    const uniqueWords = new Set(words).size;
    const avgSentenceLength = words.length / sentences.length;
    const avgWordLength = words.reduce((sum, w) => sum + w.length, 0) / words.length;
    const complexWords = this.countComplexWords(words);
    const sentenceLengthVariance = this.calculateVariance(
      sentences.map(s => this.tokenizer.tokenize(s)?.length || 0)
    );

    // 综合计算AI分数
    const aiScore = this.calculateAIScore({
      perplexity,
      burstiness,
      ttr,
      sentenceLengthVariance,
      fleschKincaid,
      lexicalSophistication: lexicalSophistication || 0
    });

    return {
      aiScore,
      perplexity,
      burstiness,
      ttr,
      mtld,
      vocd,
      mlt,
      dct,
      fleschKincaid,
      gunningFog,
      lexicalSophistication,
      details: {
        wordCount: words.length,
        sentenceCount: sentences.length,
        paragraphCount: paragraphs.length,
        avgSentenceLength,
        avgWordLength,
        complexWords,
        uniqueWords,
        sentenceLengthVariance
      }
    };
  }

  /**
   * 预处理文本
   */
  private preprocessText(text: string): string {
    return text
      .replace(/\r\n/g, '\n')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * 计算困惑度 (Perplexity)
   * 基于n-gram模型估算文本的不确定性
   * 人类写作通常有更高且更多变的perplexity
   */
  private calculatePerplexity(words: string[]): number {
    if (words.length < 2) return 0;

    const bigrams = new Map<string, number>();
    const unigramCounts = new Map<string, number>();
    
    // 统计unigram和bigram
    for (let i = 0; i < words.length - 1; i++) {
      const bigram = `${words[i]}_${words[i + 1]}`;
      bigrams.set(bigram, (bigrams.get(bigram) || 0) + 1);
      unigramCounts.set(words[i], (unigramCounts.get(words[i]) || 0) + 1);
    }
    
    // 计算平均对数概率
    let logProbSum = 0;
    let count = 0;
    
    for (let i = 0; i < words.length - 1; i++) {
      const bigram = `${words[i]}_${words[i + 1]}`;
      const bigramCount = bigrams.get(bigram) || 0;
      const unigramCount = unigramCounts.get(words[i]) || 0;
      
      if (unigramCount > 0) {
        const probability = bigramCount / unigramCount;
        if (probability > 0) {
          logProbSum += Math.log2(probability);
          count++;
        }
      }
    }
    
    const avgLogProb = count > 0 ? logProbSum / count : 0;
    const perplexity = Math.pow(2, -avgLogProb);
    
    // 归一化到0-100范围
    return Math.min(100, perplexity * 5);
  }

  /**
   * 计算突发性 (Burstiness)
   * 衡量句子长度的变化程度
   * AI生成的文本通常更均匀，人类写作更具突发性
   */
  private calculateBurstiness(sentences: string[]): number {
    if (sentences.length < 2) return 0;

    const lengths = sentences.map(s => {
      const words = this.tokenizer.tokenize(s);
      return words ? words.length : 0;
    });
    
    const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    const variance = this.calculateVariance(lengths);
    const stdDev = Math.sqrt(variance);
    
    // 变异系数
    const cv = mean > 0 ? stdDev / mean : 0;
    
    // 归一化到0-100
    return Math.min(100, cv * 100);
  }

  /**
   * 计算Type-Token Ratio (TTR)
   * 词汇多样性指标
   */
  private calculateTTR(words: string[]): number {
    if (words.length === 0) return 0;
    const uniqueWords = new Set(words).size;
    return (uniqueWords / words.length) * 100;
  }

  /**
   * 计算MTLD (Measure of Textual Lexical Diversity)
   * 更稳定的词汇多样性指标
   */
  private calculateMTLD(words: string[]): number | null {
    if (words.length < 50) return null;

    const threshold = 0.72;
    let factor = 0;
    let types = new Set<string>();
    let tokens = 0;

    for (const word of words) {
      types.add(word);
      tokens++;
      
      const ttr = types.size / tokens;
      
      if (ttr < threshold) {
        factor++;
        types = new Set();
        tokens = 0;
      }
    }

    return factor > 0 ? words.length / factor : words.length;
  }

  /**
   * 计算VocD (Vocabulary Diversity)
   * 使用随机采样估算词汇多样性
   */
  private calculateVocD(words: string[]): number | null {
    if (words.length < 50) return null;

    const sampleSizes = [35, 40, 45, 50];
    const trials = 3;
    let avgTTR = 0;

    for (const size of sampleSizes) {
      let sumTTR = 0;
      
      for (let t = 0; t < trials; t++) {
        const sample = this.randomSample(words, size);
        const uniqueCount = new Set(sample).size;
        sumTTR += uniqueCount / size;
      }
      
      avgTTR += sumTTR / trials;
    }

    return (avgTTR / sampleSizes.length) * 100;
  }

  /**
   * 计算句法复杂度
   * MLT: Mean Length of T-Unit
   * DC/T: Dependent Clauses per T-Unit
   */
  private calculateSyntacticComplexity(text: string): { mlt: number | null; dct: number | null } {
    try {
      const doc = compromise(text);
      const sentences = doc.sentences().out('array');
      
      if (sentences.length === 0) {
        return { mlt: null, dct: null };
      }

      let totalWords = 0;
      let totalClauses = 0;

      sentences.forEach((sent: string) => {
        const sentDoc = compromise(sent);
        const words = sentDoc.terms().out('array');
        totalWords += words.length;
        
        // 简单估算从句数量（通过连词和关系代词）
        const conjunctions = sentDoc.match('(that|which|who|whom|whose|when|where|while|although|because|if|unless)').out('array').length;
        totalClauses += conjunctions;
      });

      const mlt = totalWords / sentences.length;
      const dct = totalClauses / sentences.length;

      return { mlt, dct };
    } catch (error) {
      return { mlt: null, dct: null };
    }
  }

  /**
   * 计算Flesch-Kincaid可读性等级
   */
  private calculateFleschKincaid(text: string, words: string[], sentences: string[]): number {
    if (sentences.length === 0 || words.length === 0) return 0;

    const totalSyllables = words.reduce((sum, word) => sum + syllable(word), 0);
    const avgSentenceLength = words.length / sentences.length;
    const avgSyllablesPerWord = totalSyllables / words.length;

    const grade = 0.39 * avgSentenceLength + 11.8 * avgSyllablesPerWord - 15.59;
    
    return Math.max(0, grade);
  }

  /**
   * 计算Gunning Fog指数
   */
  private calculateGunningFog(words: string[], sentences: string[]): number {
    if (sentences.length === 0 || words.length === 0) return 0;

    const complexWords = this.countComplexWords(words);
    const avgSentenceLength = words.length / sentences.length;
    const complexWordRatio = complexWords / words.length;

    const fog = 0.4 * (avgSentenceLength + 100 * complexWordRatio);
    
    return Math.max(0, fog);
  }

  /**
   * 计算词汇复杂度 (Lexical Sophistication)
   */
  private calculateLexicalSophistication(words: string[]): number | null {
    if (words.length === 0) return null;

    // 使用词长和复杂词比例作为词汇复杂度的估算
    const avgWordLength = words.reduce((sum, w) => sum + w.length, 0) / words.length;
    const complexWords = this.countComplexWords(words);
    const complexRatio = complexWords / words.length;

    const sophistication = (avgWordLength * 10 + complexRatio * 100) / 2;
    
    return Math.min(100, sophistication);
  }

  /**
   * 统计复杂词（3个或以上音节）
   */
  private countComplexWords(words: string[]): number {
    return words.filter(word => syllable(word) >= 3).length;
  }

  /**
   * 计算方差
   */
  private calculateVariance(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    
    const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
    const squaredDiffs = numbers.map(n => Math.pow(n - mean, 2));
    
    return squaredDiffs.reduce((a, b) => a + b, 0) / numbers.length;
  }

  /**
   * 随机采样
   */
  private randomSample<T>(array: T[], size: number): T[] {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, size);
  }

  /**
   * 综合计算AI分数
   * 基于多个指标的加权组合
   * 返回0-100的分数，越高表示越可能是AI生成
   */
  private calculateAIScore(metrics: {
    perplexity: number;
    burstiness: number;
    ttr: number;
    sentenceLengthVariance: number;
    fleschKincaid: number;
    lexicalSophistication: number;
  }): number {
    // AI生成的文本特征：
    // - 较低的perplexity（更可预测）
    // - 较低的burstiness（更均匀）
    // - 中等的TTR
    // - 较低的句子长度方差
    // - 较低的可读性等级（更简单）
    
    // 归一化和加权
    const perplexityScore = Math.max(0, 100 - metrics.perplexity); // 低perplexity = 高AI分数
    const burstinessScore = Math.max(0, 100 - metrics.burstiness); // 低burstiness = 高AI分数
    const ttrScore = Math.abs(metrics.ttr - 50); // 接近50 = 中等多样性 = 高AI分数
    const varianceScore = Math.max(0, 100 - Math.min(100, metrics.sentenceLengthVariance * 10)); // 低方差 = 高AI分数
    const readabilityScore = Math.max(0, 100 - metrics.fleschKincaid * 5); // 低可读性等级 = 高AI分数
    
    // 加权平均
    const weights = {
      perplexity: 0.25,
      burstiness: 0.25,
      ttr: 0.15,
      variance: 0.20,
      readability: 0.15
    };

    const aiScore = 
      perplexityScore * weights.perplexity +
      burstinessScore * weights.burstiness +
      ttrScore * weights.ttr +
      varianceScore * weights.variance +
      readabilityScore * weights.readability;

    return Math.min(100, Math.max(0, aiScore));
  }
}

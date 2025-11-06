import React from 'react';
import { DetectionResult } from '../types/api';
import { 
  AlertTriangle, 
  CheckCircle, 
  Info,
  TrendingUp,
  BarChart3,
  FileText,
  BookOpen
} from 'lucide-react';

interface ResultDisplayProps {
  result: DetectionResult;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ result }) => {
  const { aiScore, metrics, details } = result;

  const getScoreColor = (score: number): string => {
    if (score >= 70) return 'text-red-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getScoreBgColor = (score: number): string => {
    if (score >= 70) return 'bg-red-50 border-red-200';
    if (score >= 40) return 'bg-yellow-50 border-yellow-200';
    return 'bg-green-50 border-green-200';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 70) return <AlertTriangle className="w-8 h-8" />;
    if (score >= 40) return <Info className="w-8 h-8" />;
    return <CheckCircle className="w-8 h-8" />;
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 80) return 'AI生成可能性极高';
    if (score >= 70) return 'AI生成可能性高';
    if (score >= 50) return 'AI生成可能性中等';
    if (score >= 30) return 'AI生成可能性较低';
    return '人类写作可能性高';
  };

  const MetricCard = ({ 
    title, 
    value, 
    description, 
    icon: Icon 
  }: { 
    title: string; 
    value: number | null; 
    description: string; 
    icon: React.ElementType;
  }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-blue-50 rounded-lg">
          <Icon className="w-5 h-5 text-blue-600" />
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">{title}</h4>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {value !== null ? value.toFixed(2) : 'N/A'}
          </p>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full space-y-6">
      {/* 主要得分卡片 */}
      <div className={`border-2 rounded-xl p-8 ${getScoreBgColor(aiScore)}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={getScoreColor(aiScore)}>
              {getScoreIcon(aiScore)}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">检测结果</h3>
              <p className={`text-3xl font-bold mt-1 ${getScoreColor(aiScore)}`}>
                {aiScore.toFixed(1)}%
              </p>
              <p className="text-sm text-gray-700 mt-1">
                {getScoreLabel(aiScore)}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-sm text-gray-600">文件名</p>
            <p className="font-medium text-gray-900 mt-1">{result.fileName}</p>
            <p className="text-xs text-gray-500 mt-1">
              {new Date(result.createdAt).toLocaleString('zh-CN')}
            </p>
          </div>
        </div>
      </div>

      {/* 详细指标 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          AI检测指标
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MetricCard
            title="困惑度 (Perplexity)"
            value={metrics.perplexity}
            description="文本的不确定性和复杂度，人类写作通常更高"
            icon={TrendingUp}
          />
          <MetricCard
            title="突发性 (Burstiness)"
            value={metrics.burstiness}
            description="句子长度的变化程度，人类写作更具变化性"
            icon={TrendingUp}
          />
          <MetricCard
            title="词汇多样性 (TTR)"
            value={metrics.ttr}
            description="独特词汇占比，反映词汇丰富程度"
            icon={BookOpen}
          />
          {metrics.mtld && (
            <MetricCard
              title="词汇多样性 (MTLD)"
              value={metrics.mtld}
              description="更稳定的词汇多样性指标"
              icon={BookOpen}
            />
          )}
        </div>
      </div>

      {/* 可读性指标 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          可读性指标
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MetricCard
            title="Flesch-Kincaid等级"
            value={metrics.fleschKincaid}
            description="可读性年级水平，数值越高越难"
            icon={FileText}
          />
          <MetricCard
            title="Gunning Fog指数"
            value={metrics.gunningFog}
            description="估算理解文本所需的教育年限"
            icon={FileText}
          />
          {metrics.lexicalSophistication && (
            <MetricCard
              title="词汇复杂度"
              value={metrics.lexicalSophistication}
              description="词汇的高级程度"
              icon={BookOpen}
            />
          )}
        </div>
      </div>

      {/* 文本统计 */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">文本统计信息</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600">总词数</p>
            <p className="text-xl font-bold text-gray-900">{details.wordCount}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">句子数</p>
            <p className="text-xl font-bold text-gray-900">{details.sentenceCount}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">段落数</p>
            <p className="text-xl font-bold text-gray-900">{details.paragraphCount}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">独特词汇</p>
            <p className="text-xl font-bold text-gray-900">{details.uniqueWords}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">平均句长</p>
            <p className="text-xl font-bold text-gray-900">
              {details.avgSentenceLength.toFixed(1)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">平均词长</p>
            <p className="text-xl font-bold text-gray-900">
              {details.avgWordLength.toFixed(1)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">复杂词数</p>
            <p className="text-xl font-bold text-gray-900">{details.complexWords}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">句长方差</p>
            <p className="text-xl font-bold text-gray-900">
              {details.sentenceLengthVariance.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* 说明 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-2">关于检测结果</p>
            <p>
              此检测基于多项语言学特征分析，包括文本复杂度、词汇多样性、句法结构等。
              结果仅供参考，不应作为唯一判断依据。AI技术在不断进步，检测准确性可能因文本类型和写作风格而异。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

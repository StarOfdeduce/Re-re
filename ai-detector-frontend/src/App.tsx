import React, { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { TextInput } from './components/TextInput';
import { ResultDisplay } from './components/ResultDisplay';
import { HistoryList } from './components/HistoryList';
import { APIClient } from './lib/api';
import { DetectionResult } from './types/api';
import { Brain, Upload, FileText, History, Github } from 'lucide-react';

type TabType = 'file' | 'text' | 'history';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('file');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (file: File) => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const response = await APIClient.detectFile(file);
      setResult(response.data);
      
      // 切换到结果视图
      setTimeout(() => {
        document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : '检测失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleTextSubmit = async (text: string) => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const response = await APIClient.detectText(text);
      setResult(response.data);
      
      // 切换到结果视图
      setTimeout(() => {
        document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : '检测失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleHistorySelect = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await APIClient.getDetectionById(id);
      setResult(response.data);
      setActiveTab('file'); // 切换到主视图显示结果
      
      setTimeout(() => {
        document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载记录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* 导航栏 */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">AI内容检测系统</h1>
                <p className="text-xs text-gray-500">基于多维度语言学特征分析</p>
              </div>
            </div>
            
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              <Github className="w-5 h-5" />
              <span className="hidden sm:inline">GitHub</span>
            </a>
          </div>
        </div>
      </nav>

      {/* 主要内容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 标签切换 */}
        <div className="flex gap-2 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('file')}
            className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors border-b-2 ${
              activeTab === 'file'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Upload className="w-5 h-5" />
            文件上传
          </button>
          
          <button
            onClick={() => setActiveTab('text')}
            className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors border-b-2 ${
              activeTab === 'text'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <FileText className="w-5 h-5" />
            文本输入
          </button>
          
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors border-b-2 ${
              activeTab === 'history'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <History className="w-5 h-5" />
            历史记录
          </button>
        </div>

        {/* 内容区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧主要操作区 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-8">
              {activeTab === 'file' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">上传文件检测</h2>
                  <FileUpload onFileSelect={handleFileSelect} isLoading={loading} />
                </div>
              )}

              {activeTab === 'text' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">文本内容检测</h2>
                  <TextInput onTextSubmit={handleTextSubmit} isLoading={loading} />
                </div>
              )}

              {activeTab === 'history' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">检测历史</h2>
                  <HistoryList onSelectDetection={handleHistorySelect} />
                </div>
              )}

              {/* 加载状态 */}
              {loading && (
                <div className="mt-8 flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
                  <p className="text-gray-600 font-medium">正在分析中，请稍候...</p>
                  <p className="text-sm text-gray-500 mt-2">这可能需要几秒钟时间</p>
                </div>
              )}

              {/* 错误提示 */}
              {error && (
                <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600">{error}</p>
                </div>
              )}
            </div>
          </div>

          {/* 右侧信息栏 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
              <h3 className="font-semibold text-gray-900 mb-4">检测说明</h3>
              <div className="space-y-4 text-sm text-gray-600">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">支持格式</h4>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>PDF文档</li>
                    <li>Word文档 (.doc, .docx)</li>
                    <li>纯文本文件 (.txt)</li>
                    <li>直接输入文本</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">检测指标</h4>
                  <ul className="space-y-1">
                    <li>困惑度：文本复杂度和不确定性</li>
                    <li>突发性：句子长度的变化程度</li>
                    <li>词汇多样性：独特词汇的丰富程度</li>
                    <li>句法复杂度：句子结构的复杂性</li>
                    <li>可读性：文本的易读程度</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">使用建议</h4>
                  <ul className="space-y-1">
                    <li>建议文本长度至少50个单词</li>
                    <li>单个文件不超过10MB</li>
                    <li>结果仅供参考，不作为唯一依据</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 结果展示区 */}
        {result && !loading && (
          <div id="results" className="mt-8">
            <div className="bg-white rounded-xl shadow-sm p-8">
              <ResultDisplay result={result} />
            </div>
          </div>
        )}
      </main>

      {/* 页脚 */}
      <footer className="mt-16 py-8 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600">
          <p className="text-sm">
            AI内容检测系统 © 2024 · 由 MiniMax Agent 开发
          </p>
          <p className="text-xs mt-2 text-gray-500">
            检测结果基于语言学特征分析，仅供参考
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;

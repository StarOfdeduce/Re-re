import React, { useState } from 'react';
import { FileText, AlertCircle } from 'lucide-react';

interface TextInputProps {
  onTextSubmit: (text: string) => void;
  isLoading: boolean;
}

export const TextInput: React.FC<TextInputProps> = ({ onTextSubmit, isLoading }) => {
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!text.trim()) {
      setError('请输入要检测的文本内容');
      return;
    }

    if (text.length > 100000) {
      setError('文本长度不能超过 100,000 字符');
      return;
    }

    if (text.trim().split(/\s+/).length < 50) {
      setError('文本内容太短，至少需要 50 个单词以进行准确分析');
      return;
    }

    setError(null);
    onTextSubmit(text);
  };

  const wordCount = text.trim().split(/\s+/).filter(w => w.length > 0).length;
  const charCount = text.length;

  return (
    <div className="w-full">
      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="在此粘贴或输入要检测的文本内容..."
          className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          disabled={isLoading}
        />
        
        <div className="absolute bottom-3 right-3 text-xs text-gray-500 bg-white px-2 py-1 rounded">
          {wordCount} 词 / {charCount} 字符
        </div>
      </div>

      {error && (
        <div className="mt-3 flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="mt-4 flex justify-between items-center">
        <p className="text-sm text-gray-600">
          <FileText className="inline w-4 h-4 mr-1" />
          建议至少 50 个单词以获得准确结果
        </p>
        
        <button
          onClick={handleSubmit}
          disabled={isLoading || !text.trim()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? '检测中...' : '开始检测'}
        </button>
      </div>
    </div>
  );
};

# 中文文本检测支持说明

## ⚠️ 重要提示

**当前版本（v1.0.0）主要优化支持英文文本检测。**

## 当前状态

### 支持情况
- ✅ **可以运行**：系统可以处理中文文本输入
- ⚠️ **准确性有限**：检测准确性未针对中文优化
- ❌ **部分指标不适用**：某些英文特有的指标对中文无意义

### 技术原因

系统使用的NLP库主要针对英文设计：

1. **natural** - 英文自然语言处理库
   - 分词器基于英文空格分隔
   - n-gram模型针对英文训练

2. **compromise** - 英文文本分析库
   - 句法分析针对英文语法
   - 词性标注基于英文规则

3. **syllable** - 英文音节统计库
   - 音节计算规则仅适用于英文
   - 中文没有音节概念

### 对中文的影响

#### 1. 可用但不准确的指标

**Perplexity（困惑度）**
- 问题：基于英文空格分词，中文需要专门分词
- 影响：计算结果偏差较大

**词汇多样性（TTR、MTLD、VocD）**
- 问题：中文分词不准确
- 影响：词汇统计不准确

**句法复杂度（MLT、DC/T）**
- 问题：基于英文语法规则
- 影响：对中文语法结构识别不准

#### 2. 不适用的指标

**Flesch-Kincaid Grade Level**
- 完全不适用中文
- 基于英文音节和句子长度

**Gunning Fog Index**
- 完全不适用中文
- 基于英文复杂词定义

**音节统计相关功能**
- 中文没有音节概念
- 结果无意义

---

## 中文支持改进方案

如果您的主要用户是中文用户，建议进行以下改进：

### 方案一：基础中文适配（工作量：中等）

#### 1. 集成中文分词库

```bash
# 安装中文NLP库
pnpm add nodejieba
```

```typescript
// 修改 aiDetectionService.ts
import jieba from 'nodejieba';

// 中文分词
private tokenizeChinese(text: string): string[] {
  return jieba.cut(text);
}

// 检测语言并选择分词器
private tokenize(text: string): string[] {
  const isChinese = /[\u4e00-\u9fa5]/.test(text);
  
  if (isChinese) {
    return this.tokenizeChinese(text);
  } else {
    return this.tokenizer.tokenize(text.toLowerCase());
  }
}
```

#### 2. 调整指标计算

```typescript
// 词汇多样性 - 适配中文
private calculateTTR(words: string[]): number {
  // 中文词汇长度通常较短
  const effectiveWords = words.filter(w => w.length >= 1);
  const uniqueWords = new Set(effectiveWords).size;
  return (uniqueWords / effectiveWords.length) * 100;
}

// 句子复杂度 - 中文标点
private getSentences(text: string): string[] {
  const isChinese = /[\u4e00-\u9fa5]/.test(text);
  
  if (isChinese) {
    // 中文标点分句
    return text.split(/[。！？；]/).filter(s => s.trim().length > 0);
  } else {
    return this.sentenceTokenizer.tokenize(text);
  }
}
```

#### 3. 移除不适用的指标

```typescript
// 对中文文本，不计算以下指标
if (isChinese) {
  return {
    fleschKincaid: null,  // 不适用
    gunningFog: null,     // 不适用
    lexicalSophistication: null,  // 需要重新设计
    // ... 其他可用指标
  };
}
```

### 方案二：完整中文支持（工作量：大）

#### 1. 使用专业中文NLP库

```bash
pnpm add @nlpjs/lang-zh
pnpm add @nlpjs/core
```

#### 2. 重新设计检测指标

**中文特有指标：**

```typescript
// 1. 字词比（Character-Word Ratio）
private calculateCWR(text: string): number {
  const words = jieba.cut(text);
  const chars = text.replace(/\s/g, '').length;
  return words.length / chars;
}

// 2. 平均词长
private calculateAverageWordLength(words: string[]): number {
  return words.reduce((sum, w) => sum + w.length, 0) / words.length;
}

// 3. 标点使用频率
private calculatePunctuationFrequency(text: string): number {
  const punctuation = text.match(/[，。！？；：、""''（）【】]/g) || [];
  const chars = text.length;
  return (punctuation.length / chars) * 100;
}

// 4. 成语使用频率
private calculateIdiomFrequency(text: string): number {
  // 需要成语词库
  const idioms = this.detectIdioms(text);
  const words = jieba.cut(text);
  return (idioms.length / words.length) * 100;
}
```

#### 3. 训练中文AI检测模型

```typescript
// 使用机器学习模型
import * as tf from '@tensorflow/tfjs-node';

// 基于大量中文AI生成文本和人类文本训练模型
private async detectChineseAI(text: string): Promise<number> {
  // 特征提取
  const features = this.extractChineseFeatures(text);
  
  // 模型预测
  const prediction = await this.chineseModel.predict(features);
  
  return prediction;
}
```

### 方案三：双语支持（推荐）

```typescript
export class AIDetectionService {
  private language: 'en' | 'zh';
  
  async detectAIContent(text: string): Promise<DetectionResult> {
    // 自动检测语言
    this.language = this.detectLanguage(text);
    
    if (this.language === 'zh') {
      return this.detectChinese(text);
    } else {
      return this.detectEnglish(text);
    }
  }
  
  private detectLanguage(text: string): 'en' | 'zh' {
    const chineseChars = text.match(/[\u4e00-\u9fa5]/g) || [];
    const chineseRatio = chineseChars.length / text.length;
    
    return chineseRatio > 0.3 ? 'zh' : 'en';
  }
  
  private detectChinese(text: string): DetectionResult {
    // 中文检测逻辑
  }
  
  private detectEnglish(text: string): DetectionResult {
    // 当前的英文检测逻辑
  }
}
```

---

## 实施建议

### 短期方案（1-2周）

1. **添加语言检测**
   - 在前端添加语言选择器
   - 在后端自动识别文本语言
   - 对中文文本显示准确性警告

2. **禁用不适用指标**
   - 对中文文本，不显示音节相关指标
   - 显示"该指标不适用于中文"提示

3. **调整评分算法**
   - 为中文文本使用不同的权重
   - 降低不准确指标的影响

### 中期方案（1-2月）

1. **集成中文分词**
   - 使用jieba或其他中文分词库
   - 重新实现词汇多样性计算

2. **适配中文特征**
   - 设计中文特有的检测指标
   - 调整句子复杂度算法

3. **优化用户体验**
   - 添加中文示例
   - 提供中文检测说明

### 长期方案（3-6月）

1. **训练中文模型**
   - 收集中文AI生成文本样本
   - 训练专门的中文检测模型
   - 集成深度学习框架

2. **完整双语支持**
   - 实现自动语言切换
   - 为两种语言提供相同质量的检测

3. **持续优化**
   - 收集用户反馈
   - 定期更新模型
   - 跟进最新AI技术

---

## 临时解决方案

在完成中文适配之前，可以：

### 1. 前端添加语言警告

```typescript
// src/components/TextInput.tsx
const handleSubmit = () => {
  const isChinese = /[\u4e00-\u9fa5]/.test(text);
  
  if (isChinese) {
    const confirmed = confirm(
      '检测到中文文本。当前版本主要优化支持英文检测，' +
      '中文检测准确性可能较低。是否继续？'
    );
    
    if (!confirmed) return;
  }
  
  onTextSubmit(text);
};
```

### 2. 结果页面添加说明

```typescript
// src/components/ResultDisplay.tsx
{isChinese && (
  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
    <p className="text-sm text-yellow-800">
      ⚠️ 注意：当前版本主要优化支持英文文本。
      中文检测结果仅供参考，准确性可能较低。
    </p>
  </div>
)}
```

### 3. 文档中明确说明

在 README.md 中添加：

```markdown
## 语言支持

- ✅ **英文**：完全支持，检测准确性高
- ⚠️ **中文**：可以使用，但准确性有限
- ❌ **其他语言**：暂不支持

**中文用户请注意**：
当前版本的AI检测算法主要针对英文优化。
如需要高准确度的中文检测，建议等待后续版本更新。
```

---

## 总结

### 当前状态
- **英文文本**：完全支持 ✅
- **中文文本**：功能可用但准确性有限 ⚠️

### 建议
1. **如果主要用户是英文用户**：当前版本可以直接使用
2. **如果主要用户是中文用户**：建议实施中文适配方案
3. **如果是双语用户**：建议实施双语支持方案

### 工作量估算
- 基础中文适配：2-3周
- 完整中文支持：2-3月
- 双语支持：3-4月

---

**需要帮助实施中文支持？**

可以按照上述方案逐步改进，或者联系开发者获取定制化支持。

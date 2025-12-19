import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Loader2, Copy, Check, MessageCircle } from 'lucide-react';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY || '',
  dangerouslyAllowBrowser: true
});

const ChartAIHelper = ({ chartTitle, chartData, chartInsights, position = 'top-right' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const popupRef = useRef(null);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const askAI = async () => {
    if (!question.trim() || isLoading) return;
    
    setIsLoading(true);
    try {
      const prompt = `You are a data analyst assistant. Answer questions about this specific chart.

CHART: ${chartTitle}
DATA CONTEXT: ${JSON.stringify(chartData, null, 2)}
KEY INSIGHTS: ${chartInsights}

USER QUESTION: ${question}

Guidelines:
- Be concise (max 150 words)
- Use specific numbers from the data
- If asked for code, provide clean Python/SQL
- Use Vietnamese if question is in Vietnamese
- Format with bullet points when listing`;

      const result = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.5,
        max_tokens: 300
      });

      setResponse(result.choices[0]?.message?.content || 'Không thể trả lời câu hỏi này.');
    } catch (error) {
      setResponse('⚠️ Lỗi kết nối. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      askAI();
    }
  };

  const copyResponse = () => {
    navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const quickQuestions = [
    'Giải thích biểu đồ này',
    'Insight chính là gì?',
    'Code Python vẽ chart này'
  ];

  const positionClasses = {
    'top-right': 'top-0 right-0',
    'top-left': 'top-0 left-0',
    'bottom-right': 'bottom-0 right-0',
    'bottom-left': 'bottom-0 left-0'
  };

  const popupPositionClasses = {
    'top-right': 'top-8 right-0',
    'top-left': 'top-8 left-0',
    'bottom-right': 'bottom-8 right-0',
    'bottom-left': 'bottom-8 left-0'
  };

  return (
    <div className={`absolute ${positionClasses[position]} z-20`} ref={popupRef}>
      {/* Star Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-1.5 rounded-lg transition-all duration-300 group
          ${isOpen 
            ? 'bg-walmart-yellow text-white shadow-lg' 
            : 'bg-gray-100 hover:bg-walmart-yellow hover:text-white text-gray-400'
          }`}
        title="Hỏi AI về biểu đồ này"
      >
        <Sparkles className={`w-4 h-4 ${isOpen ? 'animate-pulse' : 'group-hover:animate-pulse'}`} />
      </button>

      {/* Mini Chat Popup */}
      {isOpen && (
        <div 
          className={`absolute ${popupPositionClasses[position]} w-80 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden animate-scale-in`}
          style={{ maxHeight: '400px' }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-walmart-blue to-blue-600 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-walmart-yellow" />
              <span className="text-white text-sm font-medium truncate max-w-[180px]">
                {chartTitle}
              </span>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white/70 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Question Input */}
          <div className="p-3 border-b border-gray-100">
            <div className="flex gap-2">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Hỏi về biểu đồ này..."
                className="flex-1 px-3 py-2 text-sm bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-walmart-blue focus:border-transparent"
                disabled={isLoading}
              />
              <button
                onClick={askAI}
                disabled={isLoading || !question.trim()}
                className="p-2 bg-walmart-blue text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>

            {/* Quick Questions */}
            {!response && !isLoading && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {quickQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => setQuestion(q)}
                    className="text-xs px-2 py-1 bg-gray-100 hover:bg-walmart-blue hover:text-white rounded-full transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Response Area */}
          {(response || isLoading) && (
            <div className="p-3 max-h-[250px] overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center gap-2 text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Đang phân tích...</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {response}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                    <button
                      onClick={() => {
                        setResponse(null);
                        setQuestion('');
                      }}
                      className="flex items-center gap-1 text-xs text-walmart-blue hover:underline"
                    >
                      <MessageCircle className="w-3 h-3" />
                      Hỏi tiếp
                    </button>
                    <button
                      onClick={copyResponse}
                      className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 ml-auto"
                    >
                      {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                      {copied ? 'Đã sao chép' : 'Sao chép'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChartAIHelper;

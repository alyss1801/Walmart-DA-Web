import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles,
  X,
  Minimize2,
  Maximize2,
  Trash2,
  Loader2,
  Database,
  TrendingUp
} from 'lucide-react';
import Groq from 'groq-sdk';
import { chatbotKnowledge } from '../../data';
import { 
  retailAnalytics, 
  storeAnalytics, 
  ecommerceAnalytics, 
  crossAnalytics,
  queryProcessor,
  generateDataContext 
} from '../../services/dataAnalytics';

// Initialize Groq client - API key from environment variable
// Create a .env file with VITE_GROQ_API_KEY=your_api_key
const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY || '',
  dangerouslyAllowBrowser: true
});

// System prompt with comprehensive knowledge base for 3 dashboards
const SYSTEM_PROMPT = `You are Alyss, an intelligent AI analytics assistant for Walmart's retail analytics dashboard. You have DIRECT ACCESS to real-time data from the Galaxy Schema Data Warehouse with 3 Star Schemas.

=== YOUR CAPABILITIES ===
1. You can query REAL DATA from the warehouse to answer specific questions
2. You provide accurate numbers, percentages, and rankings
3. You explain data correlations and business insights
4. You can compare metrics across different time periods and categories
5. You can answer COMPLEX QUESTIONS that combine multiple data points

=== LIVE DATA CONTEXT (Updated Real-time) ===
${generateDataContext()}

=== HOW TO ANSWER COMPLEX/RANDOM QUESTIONS ===
When user asks complex questions combining multiple factors:
1. Look for relevant data in the LIVE DATA CONTEXT above
2. Cross-reference between different schemas if needed
3. Calculate or derive new insights from raw data
4. Provide reasoning and explain correlations
5. If data is insufficient, say what you CAN answer and suggest related questions

Examples of complex questions you CAN answer:
- "Store nào có doanh số cao nhất trong thời tiết lạnh?" → Use store data + temperature impact
- "So sánh doanh thu tháng 3 và tháng 2" → Compare from revenueByMonth array
- "Khách hàng 18-30 thích thanh toán bằng gì?" → Cross customer demographics + payment
- "Tại sao doanh số Q4 cao hơn?" → Analyze monthly data + holiday effect
- "Mối quan hệ giữa unemployment và doanh số" → Use economicTrend data

=== DASHBOARD 1: REVENUE TREND ANALYSIS (2024-2025) ===
Key Metrics: $12.77M revenue, 50,000 orders, $255.53 AOV, 50,000 customers
Top Month: March ($1.10M), Lowest: February ($999K)
Weather Impact: Cold=35.85%, Warm=26.73%, Cool=22.15%, Freezing=8.03%, Hot=7.24%

=== DASHBOARD 2: CUSTOMER SEGMENTATION (2024-2025) ===
Age Distribution: 31-45 (35.1%), 46-60 (34.6%), 18-30 (28.0%), <18 (2.3%)
Payment: ~25% each (Cash, Credit, Debit, UPI)
Return Rate: 18-30 highest (51%), 31-45 (48%)

=== DASHBOARD 3: STORE PERFORMANCE (2010-2012) ===
Total: $6.74B from 45 stores over 143 weeks
Top Stores: Store 20 ($301M), Store 4 ($299M), Store 14 ($289M)
Economic: CPI avg 171.58, Unemployment avg 8.0%, Fuel $3.36/gal
Key Correlation: Unemployment ↓ = Sales ↑ (NEGATIVE correlation)

=== RESPONSE GUIDELINES ===
1. ALWAYS cite specific numbers from data
2. For complex questions: break down into parts, analyze each, then synthesize
3. Use Vietnamese if user writes in Vietnamese
4. Format: Use bullet points, bold for key numbers
5. If comparing: show both values and the difference/percentage
6. Max 300 words unless user asks for detail
7. End with a follow-up suggestion when appropriate

=== EXAMPLE COMPLEX RESPONSES ===
Q: "Tại sao cold weather bán chạy hơn?"
A: "📊 **Phân tích Weather Impact:**

Dựa trên data Store Performance (2010-2012):
- **Cold**: 35.85% tổng doanh số (cao nhất)
- **Hot**: 7.24% (thấp nhất)
- Chênh lệch: **393%**

**Lý do có thể:**
1. 🎄 Mùa đông trùng holiday season (Thanksgiving, Christmas, New Year)
2. 🏠 Thời tiết lạnh → người dân mua sắm trong nhà nhiều hơn
3. 📦 Nhu cầu tích trữ thực phẩm, quần áo ấm tăng

💡 Muốn xem thêm Holiday vs Non-Holiday sales không?"`;

// Pre-computed insights for quick responses
const QUICK_INSIGHTS = {
  topMonth: retailAnalytics.getTopMonth(),
  lowestMonth: retailAnalytics.getLowestMonth(),
  topStores: storeAnalytics.getTopStores(5),
  allKPIs: crossAnalytics.getAllKPIs()
};

const ChatBot = ({ isOpen, onClose, isMinimized, onMinimize }) => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "👋 Xin chào! Tôi là **Alyss**, trợ lý phân tích AI với khả năng truy vấn dữ liệu **TRỰC TIẾP** từ Galaxy Schema Data Warehouse!\n\n🔍 **Khả năng mới:**\n• Query dữ liệu real-time từ 3 Star Schemas\n• Phân tích trends, so sánh metrics\n• Trả lời câu hỏi cụ thể với số liệu chính xác\n\n💡 **Thử hỏi tôi:**\n• \"Tháng nào doanh thu cao nhất?\"\n• \"Top 5 store bán chạy nhất?\"\n• \"Tỉ lệ thất nghiệp ảnh hưởng doanh số thế nào?\""
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [queryResult, setQueryResult] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    const userQuery = input;
    setInput('');
    setIsLoading(true);

    try {
      // First, try to process the query locally for quick data lookups
      const localResult = queryProcessor.processQuery(userQuery);
      
      // Build enhanced prompt with query result context
      let enhancedPrompt = userQuery;
      if (localResult && localResult.type !== 'summary') {
        enhancedPrompt = `User Question: ${userQuery}\n\n[DATA QUERY RESULT]\nType: ${localResult.type}\nContext: ${localResult.context}\nData: ${localResult.formatted}${localResult.insight ? `\nInsight: ${localResult.insight}` : ''}\n\nPlease provide a helpful response using this data. Format nicely and add business insights.`;
      }

      const response = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages.map(m => ({ role: m.role, content: m.content })),
          { role: 'user', content: enhancedPrompt }
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        max_tokens: 600,
        top_p: 1
      });

      const assistantMessage = {
        role: 'assistant',
        content: response.choices[0]?.message?.content || "I apologize, I couldn't process that request. Please try again.",
        dataSource: localResult?.type !== 'summary' ? localResult?.context : null
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Groq API error:', error);
      
      // Fallback: If API fails, try to respond with local data
      const localResult = queryProcessor.processQuery(userQuery);
      if (localResult && localResult.type !== 'summary') {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `📊 **${localResult.context}**\n\n${localResult.formatted}${localResult.insight ? `\n\n💡 **Insight:** ${localResult.insight}` : ''}`,
          dataSource: localResult.context,
          isLocalFallback: true
        }]);
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: "⚠️ Đang có lỗi kết nối AI. Vui lòng thử lại sau hoặc hỏi câu hỏi cụ thể hơn về dữ liệu (doanh thu, store, khách hàng, tháng...)."
        }]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([{
      role: 'assistant',
      content: "👋 Đã xóa chat! Tôi có thể query dữ liệu real-time cho bạn.\n\n🎯 **Các loại câu hỏi tôi giỏi:**\n• Doanh thu theo tháng/store/nhiệt độ\n• Phân tích khách hàng theo độ tuổi\n• So sánh các chỉ số kinh tế\n• Ranking stores, products, brands"
    }]);
  };

  // Quick question buttons - Updated for data queries
  const quickQuestions = [
    "Tháng nào doanh thu cao nhất?",
    "Top 5 store bán chạy nhất?",
    "Tỉ lệ thất nghiệp trung bình?",
    "Có bao nhiêu khách hàng?"
  ];

  if (!isOpen) return null;

  if (isMinimized) {
    return (
      <div 
        className="fixed bottom-4 right-4 bg-gradient-to-r from-walmart-blue to-blue-600 text-white p-3 rounded-full shadow-2xl cursor-pointer hover:scale-105 transition-transform z-50"
        onClick={onMinimize}
      >
        <div className="flex items-center gap-2">
          <img 
            src="/alyss_logo_no_name.png" 
            alt="Alyss AI" 
            className="w-8 h-8 rounded-full object-cover"
          />
          <span className="font-medium">Alyss AI</span>
          <Maximize2 className="w-4 h-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 border border-gray-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-walmart-blue to-blue-600 p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/alyss_logo_no_name.png" 
              alt="Alyss AI" 
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <h3 className="font-bold flex items-center gap-1">
                Alyss AI
                <Sparkles className="w-4 h-4 text-walmart-yellow" />
              </h3>
              <p className="text-xs text-blue-100">Analytics Assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={clearChat}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title="Clear chat"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button 
              onClick={onMinimize}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title="Minimize"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message, index) => (
          <div 
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[85%] p-3 rounded-2xl ${
                message.role === 'user' 
                  ? 'bg-walmart-blue text-white rounded-br-md' 
                  : 'bg-white text-gray-800 rounded-bl-md shadow-sm border border-gray-100'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
                  <img 
                    src="/alyss_logo_no_name.png" 
                    alt="Alyss" 
                    className="w-5 h-5 rounded-full object-cover"
                  />
                  <span className="text-xs font-medium text-walmart-blue">Alyss</span>
                  {message.dataSource && (
                    <span className="flex items-center gap-1 text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                      <Database className="w-3 h-3" />
                      Live Data
                    </span>
                  )}
                  {message.isLocalFallback && (
                    <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                      Offline Mode
                    </span>
                  )}
                </div>
              )}
              <div className="text-sm whitespace-pre-wrap leading-relaxed">
                {message.content.split('\n').map((line, i) => (
                  <React.Fragment key={i}>
                    {line.startsWith('**') && line.endsWith('**') ? (
                      <strong>{line.slice(2, -2)}</strong>
                    ) : (
                      line
                    )}
                    {i < message.content.split('\n').length - 1 && <br />}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white p-3 rounded-2xl rounded-bl-md shadow-sm border border-gray-100">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-walmart-blue animate-spin" />
                <span className="text-sm text-gray-500">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions */}
      {messages.length === 1 && (
        <div className="px-4 py-2 border-t border-gray-100 bg-white">
          <p className="text-xs text-gray-500 mb-2">Quick questions:</p>
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => setInput(q)}
                className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-walmart-blue hover:text-white rounded-full transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about your analytics..."
            className="flex-1 px-4 py-3 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-walmart-blue"
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="p-3 bg-walmart-blue text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center flex items-center justify-center gap-2">
          <TrendingUp className="w-3 h-3" />
          Powered by Groq + Live Data Analytics
        </p>
      </div>
    </div>
  );
};

export default ChatBot;

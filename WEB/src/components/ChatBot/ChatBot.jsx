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
  Loader2
} from 'lucide-react';
import Groq from 'groq-sdk';
import { chatbotKnowledge } from '../../data';

// Initialize Groq client - API key from environment variable
// Create a .env file with VITE_GROQ_API_KEY=your_api_key
const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY || '',
  dangerouslyAllowBrowser: true
});

// System prompt with comprehensive knowledge base for 3 dashboards
const SYSTEM_PROMPT = `You are Alyss, an intelligent AI analytics assistant for Walmart's retail analytics dashboard. You have access to a Galaxy Schema data warehouse with 3 Star Schemas and 3 specialized dashboards.

=== YOUR KNOWLEDGE BASE ===
${JSON.stringify(chatbotKnowledge, null, 2)}

=== DASHBOARD 1: REVENUE TREND ANALYSIS (2024-2025) ===
Purpose: Analyze revenue trends, weather impact, and seasonal patterns
Key Metrics:
- Total Revenue: ~$12.77M from 50,000 transactions
- Average Order Value: ~$255
- Customer Rating: 3.0/5.0
- Unique Customers: ~50,000

Key Insights:
1. WEATHER IMPACT: Cold weather drives highest sales (35.85% of revenue), Hot weather lowest (7.24%)
2. HOLIDAY EFFECT: Holiday weeks show 6-8% higher revenue than regular weeks
3. MONTHLY TRENDS: Revenue consistent ~$1M/month with slight peaks in winter months
4. CATEGORY PERFORMANCE: Electronics leads ($3.26M), followed by Clothing, Home & Kitchen, Sports
5. TEMPERATURE CORRELATION: 393% gap between Cold and Hot weather sales - major seasonal driver

Charts Available:
- Monthly Revenue & Orders (Combo Chart)
- Revenue by Temperature Impact (Bar Chart)
- Holiday vs Non-Holiday Sales (Donut)
- Weekday vs Weekend Sales (Pie)
- Revenue by Category (Bar)

=== DASHBOARD 2: CUSTOMER SEGMENTATION & BEHAVIOR (2024-2025) ===
Purpose: Understand customer demographics, purchasing behavior, payment preferences
Key Metrics:
- Total Customers: ~50,000 unique
- Age Groups: <18, 18-30, 31-45, 46-60
- Customer Types: New vs Returning
- Payment Methods: Cash on Delivery, Credit Card, Debit Card, UPI

Key Insights:
1. AGE DISTRIBUTION: 31-45 age group largest (35.1%), followed by 46-60 (34.6%), 18-30 (28.0%), <18 (2.3%)
2. RETURN RATE: 18-30 has highest repeat rate (51%), 31-45 second (48%)
3. PAYMENT PREFERENCES: Evenly distributed (~25% each method), UPI growing
4. AOV BY AGE: 31-45 has highest Average Order Value
5. NEW VS RETURNING: Returning customers contribute ~55% of revenue

Charts Available:
- Return Rate by Age Group (Column)
- Total Customers & AOV by Month (Combo)
- Revenue by Age Group (Horizontal Bar)
- Revenue by Category & Customer Type (100% Stacked Bar)
- Revenue by Age & Payment Method (100% Stacked Column)

=== DASHBOARD 3: STORE SALES PERFORMANCE (2010-2012) ===
Purpose: Analyze economic factors impact on store sales
Key Metrics:
- Total Revenue: $6.88 Billion
- Total Stores: 45 Walmart stores
- Analysis Period: 143 weeks (Feb 2010 - Dec 2012)
- Avg Weekly Sales: $1.05M
- Efficiency Ratio: 48.44

Economic Indicators:
- CPI (Consumer Price Index): Range 210.0 - 212.1, Avg 210.96
- Unemployment Rate: Range 7.7% - 8.1%, Avg 7.9%
- Fuel Price: Range $2.57 - $4.00/gallon, Avg $3.36

Key Insights:
1. UNEMPLOYMENT CORRELATION: Strong NEGATIVE correlation - when unemployment decreases (390→325), sales increase ($42M→$55M peak)
2. CPI IMPACT: CPI is STABLE (210-212), minimal impact on sales distribution
3. TEMPERATURE DRIVER: Cold weather = highest sales (35.85%), this is the PRIMARY driver
4. FUEL PRICE TREND: 55% increase over period ($2.57→$4.00) but limited sales impact
5. TOP STORES: Store 4 leads ($650M), Store 20 ($620M), Store 13 ($610M)

Charts Available:
- Sales & CPI by Temperature (Combo Chart)
- Unemployment vs Weekly Sales (Dual-Axis Combo)
- Top Performing Stores (Horizontal Bar)
- Store Performance by CPI Level (Matrix/Heatmap)
- Fuel Price Trend (Line Chart)
- Sales Distribution by Temperature (Pie)

=== RELATIONSHIP SUMMARY: CPI - UNEMPLOYMENT - REVENUE ===
Analysis of 143 weeks (2010-2012):
- Unemployment has STRONG NEGATIVE correlation with revenue
- When unemployment dropped from 8.1% to 7.7%, weekly sales rose from $42M to peak $55M
- CPI fluctuated narrowly (210-212) and did NOT significantly affect purchasing behavior
- TEMPERATURE is the PRIMARY driver - cold weather (Cold/Freezing) accounts for 43.88% of total revenue
- Suggests increased shopping during winter due to holiday preparation and harsh weather

=== RESPONSE GUIDELINES ===
1. When asked about revenue/sales trends → Reference Dashboard 1
2. When asked about customers/demographics/age groups → Reference Dashboard 2
3. When asked about stores/economic factors/unemployment/CPI → Reference Dashboard 3
4. Provide specific numbers and percentages
5. Explain correlations (negative/positive) when discussing relationships
6. Suggest which dashboard to explore for more details
7. Keep responses concise (under 200 words) unless detail is requested
8. Use Vietnamese if user writes in Vietnamese

=== YOUR PERSONALITY ===
- Friendly but professional data analyst
- Evidence-based, always cite numbers
- Proactively suggest insights and related metrics
- Use emojis sparingly for emphasis (📊 📈 💡 🏪 👥)`;

const ChatBot = ({ isOpen, onClose, isMinimized, onMinimize }) => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "👋 Xin chào! Tôi là Alyss, trợ lý phân tích AI của bạn. Tôi có thể giúp bạn khám phá Galaxy Schema Data Warehouse của Walmart với 3 Dashboard:\n\n📊 **Revenue Trend Analysis** - Xu hướng doanh thu, tác động thời tiết\n👥 **Customer Segmentation** - Phân khúc khách hàng, hành vi mua sắm\n🏪 **Store Performance** - Hiệu suất cửa hàng, yếu tố kinh tế\n\nBạn muốn biết điều gì?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
    setInput('');
    setIsLoading(true);

    try {
      const response = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages.map(m => ({ role: m.role, content: m.content })),
          { role: 'user', content: input }
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        max_tokens: 500,
        top_p: 1
      });

      const assistantMessage = {
        role: 'assistant',
        content: response.choices[0]?.message?.content || "I apologize, I couldn't process that request. Please try again."
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Groq API error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "⚠️ I'm having trouble connecting to my AI backend. Please check your internet connection and try again."
      }]);
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
      content: "👋 Đã xóa chat! Tôi có thể giúp gì về phân tích dữ liệu hôm nay?\n\n💡 Thử hỏi về:\n- Xu hướng doanh thu theo thời tiết\n- Phân khúc khách hàng theo độ tuổi\n- Mối quan hệ CPI - Unemployment - Revenue"
    }]);
  };

  // Quick question buttons - Updated for 3 dashboards
  const quickQuestions = [
    "Tác động thời tiết đến doanh thu?",
    "Phân khúc khách hàng nào lớn nhất?",
    "Mối quan hệ CPI và Unemployment?",
    "Store nào doanh thu cao nhất?"
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
        <p className="text-xs text-gray-400 mt-2 text-center">
          Powered by Groq • Llama 3.3 70B
        </p>
      </div>
    </div>
  );
};

export default ChatBot;

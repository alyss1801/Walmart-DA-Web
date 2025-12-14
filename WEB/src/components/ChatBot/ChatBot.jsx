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
import { chatbotKnowledge } from '../../data/walmartData';

// Initialize Groq client - API key from environment variable
// Create a .env file with VITE_GROQ_API_KEY=your_api_key
const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY || '',
  dangerouslyAllowBrowser: true
});

// System prompt with knowledge base
const SYSTEM_PROMPT = `You are Alyss, an intelligent AI analytics assistant for Walmart's retail analytics dashboard. You have access to a Galaxy Schema data warehouse with 3 Star Schemas.

YOUR KNOWLEDGE BASE:
${JSON.stringify(chatbotKnowledge, null, 2)}

KEY FACTS TO REMEMBER:
- Star Schema 1 (Retail Sales): 50,000 transactions, $12.77M revenue, 4 categories (Electronics, Clothing, Home & Kitchen, Sports), 16 products
- Star Schema 2 (Store Performance): 45 stores, 6,435 weekly records, $6.7B total sales (2010-2012)
- Star Schema 3 (E-commerce): 30,170 products, 10,746 brands, avg price $51.94

TOP INSIGHTS:
- Electronics is the top category by revenue ($3.26M)
- Monthly revenue averages ~$1M
- 31-45 age group is the largest customer segment (35.1%)
- Holiday weeks show 6-8% higher sales than regular weeks
- Payment methods are evenly distributed (~25% each)

YOUR PERSONALITY:
- Friendly but professional
- Data-driven and analytical
- Provide specific numbers when asked
- Suggest relevant dashboards when appropriate
- Keep responses concise but informative
- Use emojis sparingly for emphasis

RESPONSE GUIDELINES:
- Answer questions about the data warehouse, analytics, and business insights
- If asked about something not in your knowledge base, say so politely
- Suggest which dashboard to check for more details
- Format numbers nicely (use $, K, M, B appropriately)
- Keep responses under 200 words unless detail is requested`;

const ChatBot = ({ isOpen, onClose, isMinimized, onMinimize }) => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "👋 Hi! I'm Alyss, your AI analytics assistant. I can help you explore Walmart's Galaxy Schema data warehouse with 3 Star Schemas covering:\n\n📊 **Retail Sales** - 50K transactions, $12.77M revenue\n🏬 **Store Performance** - 45 stores, 2010-2012 data\n🛒 **E-commerce** - 30K products, 10K brands\n\nWhat would you like to know?"
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
      content: "👋 Chat cleared! How can I help you with your analytics today?"
    }]);
  };

  // Quick question buttons
  const quickQuestions = [
    "What's the total revenue?",
    "Top performing category?",
    "Customer demographics",
    "Holiday sales impact"
  ];

  if (!isOpen) return null;

  if (isMinimized) {
    return (
      <div 
        className="fixed bottom-4 right-4 bg-gradient-to-r from-walmart-blue to-blue-600 text-white p-4 rounded-full shadow-2xl cursor-pointer hover:scale-105 transition-transform z-50"
        onClick={onMinimize}
      >
        <div className="flex items-center gap-2">
          <Bot className="w-6 h-6" />
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
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6" />
            </div>
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
                  <Bot className="w-4 h-4 text-walmart-blue" />
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

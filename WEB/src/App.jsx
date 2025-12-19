import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Bot, Sparkles } from 'lucide-react';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import RevenueTrendAnalysis from './components/Dashboards/RevenueTrendAnalysis';
import CustomerSegmentation from './components/Dashboards/CustomerSegmentation';
import StoreSalesPerformance from './components/Dashboards/StoreSalesPerformance';
import ReportsPage from './components/Reports/ReportsPage';
import LoginPage from './components/Auth/LoginPage';
import WelcomeScreen from './components/Welcome/WelcomeScreen';
import DashboardSelector from './components/Welcome/DashboardSelector';
import ChatBot from './components/ChatBot/ChatBot';

function App() {
  const [currentDashboard, setCurrentDashboard] = useState('Revenue Trend');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isChatMinimized, setIsChatMinimized] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showDashboardSelector, setShowDashboardSelector] = useState(false);
  const [user, setUser] = useState(null);

  // Check for saved session
  useEffect(() => {
    const savedUser = localStorage.getItem('walmart_user');
    const savedSidebarState = localStorage.getItem('sidebar_collapsed');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
    if (savedSidebarState) {
      setIsSidebarCollapsed(JSON.parse(savedSidebarState));
    }
  }, []);

  // Save sidebar state
  const handleSidebarToggle = (collapsed) => {
    setIsSidebarCollapsed(collapsed);
    localStorage.setItem('sidebar_collapsed', JSON.stringify(collapsed));
  };

  const handleLogin = (userData) => {
    setUser(userData);
    setShowWelcome(true); // Show welcome screen after login
    localStorage.setItem('walmart_user', JSON.stringify(userData));
  };

  const handleWelcomeComplete = () => {
    setShowWelcome(false);
    setShowDashboardSelector(true); // Show dashboard selector after welcome
  };

  const handleDashboardSelected = () => {
    setShowDashboardSelector(false);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('walmart_user');
  };

  const toggleChat = () => {
    if (isChatMinimized) {
      setIsChatMinimized(false);
    } else {
      setIsChatOpen(!isChatOpen);
    }
  };

  // Show login page if not authenticated
  if (!isAuthenticated && !showWelcome && !showDashboardSelector) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // Show welcome screen after login
  if (showWelcome) {
    return <WelcomeScreen user={user} onComplete={handleWelcomeComplete} />;
  }

  // Show dashboard selector after welcome
  if (showDashboardSelector) {
    return (
      <Router>
        <DashboardSelector onComplete={handleDashboardSelected} />
      </Router>
    );
  }

  return (
    <Router>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <Sidebar 
          currentDashboard={currentDashboard} 
          setCurrentDashboard={setCurrentDashboard}
          user={user}
          onLogout={handleLogout}
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={handleSidebarToggle}
        />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <Header user={user} onLogout={handleLogout} />
          
          {/* Dashboard Content */}
          <main className="flex-1 overflow-y-auto p-6" id="dashboard-content">
            <Routes>
              <Route path="/" element={<RevenueTrendAnalysis />} />
              <Route path="/segmentation" element={<CustomerSegmentation />} />
              <Route path="/store-performance" element={<StoreSalesPerformance />} />
              <Route path="/reports" element={<ReportsPage />} />
            </Routes>
          </main>
        </div>

        {/* Chat Toggle Button */}
        {!isChatOpen && (
          <button
            onClick={toggleChat}
            className="fixed bottom-6 right-6 bg-gradient-to-r from-walmart-blue to-blue-600 text-white p-4 rounded-full shadow-2xl hover:shadow-xl hover:scale-105 transition-all z-40 group"
          >
            <div className="flex items-center gap-2">
              <Bot className="w-6 h-6" />
              <span className="hidden group-hover:inline font-medium pr-1">Ask Alyss</span>
              <Sparkles className="w-4 h-4 text-walmart-yellow" />
            </div>
          </button>
        )}

        {/* AI Chatbot */}
        <ChatBot 
          isOpen={isChatOpen} 
          onClose={() => setIsChatOpen(false)}
          isMinimized={isChatMinimized}
          onMinimize={() => setIsChatMinimized(!isChatMinimized)}
        />
      </div>
    </Router>
  );
}

export default App;

'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Send, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { APP_ROUTES } from '@/lib/constants';
import api from '@/lib/api';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  action?: () => void;
  actionLabel?: string;
}

const QUICK_ACTIONS = [
  { label: 'Dashboard', command: 'dashboard' },
  { label: 'Internships', command: 'internships' },
  { label: 'Profile', command: 'profile' },
  { label: 'Projects', command: 'projects' },
];

export default function ChatWidget() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `Hi! I am your SkillGenie, your AI career companion. I can help you navigate, find internships, and answer questions. What would you like to do?`,
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const navigateTo = (route: string) => {
    router.push(route);
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Call backend AI chat API
      const response = await api.post('/api/v1/chat/message', {
        message: text.trim(),
      });

      const data = response.data;
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response || "I can help you navigate and learn! What would you like to do?",
        sender: 'bot',
        timestamp: new Date(),
      };

      // Add action if provided
      if (data.action === 'navigate' && data.actionData?.route) {
        botMessage.action = () => navigateTo(data.actionData.route);
        botMessage.actionLabel = data.actionLabel || 'Go';
      }

      if (data.action === 'verify_skill' && data.actionData?.skillName) {
        const skillName = data.actionData.skillName;
        botMessage.action = () => navigateTo(`/skillgenie?skill=${encodeURIComponent(skillName)}`);
        botMessage.actionLabel = data.actionLabel || `Verify ${skillName}`;
      }

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      // Fallback to local response
      const botMessage: Message = getBotResponse(text);
      setMessages((prev) => [...prev, botMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const getBotResponse = (userText: string): Message => {
    const lowerText = userText.toLowerCase();
    
    if (lowerText.includes('dashboard') || lowerText.includes('home')) {
      return {
        id: (Date.now() + 1).toString(),
        text: "Let me take you to the dashboard!",
        sender: 'bot',
        timestamp: new Date(),
        action: () => navigateTo(APP_ROUTES.DASHBOARD),
        actionLabel: 'Go to Dashboard',
      };
    }
    
    if (lowerText.includes('internship')) {
      return {
        id: (Date.now() + 1).toString(),
        text: "I'll show you all available internships matched to your skills!",
        sender: 'bot',
        timestamp: new Date(),
        action: () => navigateTo(APP_ROUTES.INTERNSHIPS),
        actionLabel: 'View Internships',
      };
    }
    
    if (lowerText.includes('profile') || lowerText.includes('skill')) {
      return {
        id: (Date.now() + 1).toString(),
        text: "Let's check your profile and skills!",
        sender: 'bot',
        timestamp: new Date(),
        action: () => navigateTo(APP_ROUTES.PROFILE),
        actionLabel: 'Go to Profile',
      };
    }
    
    if (lowerText.includes('project') || lowerText.includes('generate')) {
      return {
        id: (Date.now() + 1).toString(),
        text: "Ready to build something? Let's generate a project!",
        sender: 'bot',
        timestamp: new Date(),
        action: () => navigateTo(APP_ROUTES.PROJECTS),
        actionLabel: 'Generate Project',
      };
    }
    
    if (lowerText.includes('resume') || lowerText.includes('upload')) {
      return {
        id: (Date.now() + 1).toString(),
        text: "Upload your resume and I'll extract your skills!",
        sender: 'bot',
        timestamp: new Date(),
        action: () => navigateTo(APP_ROUTES.PROFILE),
        actionLabel: 'Upload Resume',
      };
    }

    if (lowerText.includes('help')) {
      return {
        id: (Date.now() + 1).toString(),
        text: "I can help you navigate, find internships, build skills, and more. Try: 'show internships' or 'go to dashboard'",
        sender: 'bot',
        timestamp: new Date(),
      };
    }
    
    return {
      id: (Date.now() + 1).toString(),
      text: "I can help you navigate the platform. Try asking me to 'show internships' or 'go to dashboard'!",
      sender: 'bot',
      timestamp: new Date(),
    };
  };

  const handleQuickAction = (command: string) => {
    const routes: Record<string, string> = {
      dashboard: APP_ROUTES.DASHBOARD,
      internships: APP_ROUTES.INTERNSHIPS,
      profile: APP_ROUTES.PROFILE,
      projects: APP_ROUTES.PROJECTS,
    };
    
    if (routes[command]) {
      navigateTo(routes[command]);
    }
  };

  return (
    <>
      {/* Chat Button - SG Logo */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 group"
          aria-label="Open SkillGenie chat"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-2xl blur-xl opacity-60"></div>
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-2xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-indigo-500/50">
              <span className="text-2xl font-bold text-white">SG</span>
              {/* Notification dot */}
              <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-white animate-pulse"></div>
            </div>
          </div>
          
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <div className="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap">
              Chat with SkillGenie
              <div className="absolute top-full right-4 -mt-1 border-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={cn(
            'fixed bottom-6 right-6 z-50 flex flex-col bg-white rounded-2xl shadow-2xl border-2 border-indigo-100 transition-all duration-300',
            isMinimized ? 'h-16 w-80' : 'h-[600px] w-96'
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between rounded-t-2xl bg-gradient-to-r from-indigo-600 to-purple-600 p-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                <span className="text-lg font-bold text-white">SG</span>
              </div>
              <div>
                <h3 className="font-semibold text-white">SkillGenie</h3>
                <p className="text-xs text-indigo-100">Your AI Career Guide</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="rounded-lg p-1.5 hover:bg-white/20 transition-colors"
                aria-label="Minimize"
              >
                <Minimize2 className="h-4 w-4 text-white" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 hover:bg-white/20 transition-colors"
                aria-label="Close chat"
              >
                <X className="h-4 w-4 text-white" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-indigo-50/30 to-white">
                {messages.map((message) => (
                  <div key={message.id}>
                    <div
                      className={cn(
                        'flex',
                        message.sender === 'user' ? 'justify-end' : 'justify-start'
                      )}
                    >
                      <div
                        className={cn(
                          'max-w-[80%] rounded-2xl px-4 py-2.5 shadow-sm',
                          message.sender === 'user'
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-sm'
                            : 'bg-white border border-gray-200 text-gray-900 rounded-bl-sm'
                        )}
                      >
                        <p className="text-sm leading-relaxed">{message.text}</p>
                        <p
                          className={cn(
                            'mt-1 text-xs',
                            message.sender === 'user'
                              ? 'text-indigo-100'
                              : 'text-gray-400'
                          )}
                        >
                          {message.timestamp.toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                    
                    {/* Action Button */}
                    {message.action && message.actionLabel && (
                      <div className="flex justify-start mt-2">
                        <button
                          onClick={message.action}
                          className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
                        >
                          {message.actionLabel}
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                      <div className="flex gap-1">
                        <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce"></div>
                        <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Actions */}
              {messages.length === 1 && (
                <div className="border-t border-gray-200 bg-gray-50 p-3">
                  <p className="text-xs font-medium text-gray-600 mb-2">Quick navigation:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {QUICK_ACTIONS.map((action) => (
                      <button
                        key={action.label}
                        onClick={() => handleQuickAction(action.command)}
                        className="rounded-lg border border-indigo-200 bg-white px-3 py-2 text-xs font-medium text-indigo-700 hover:bg-indigo-50 hover:border-indigo-300 transition-colors text-left"
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="border-t border-gray-200 bg-white p-4 rounded-b-2xl">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage(inputValue);
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ask me anything..."
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-20"
                  />
                  <button
                    type="submit"
                    disabled={!inputValue.trim()}
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}

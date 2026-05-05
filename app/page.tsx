"use client";

import React, { useState } from 'react';
import { 
  Bot, Code, Search, Image as ImageIcon, Mic, Save, FolderOpen, 
  Trash2, User, Zap, ArrowRight 
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'tool';
  content: string;
  isTool?: boolean;
}

interface Persona {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
}

const PERSONAS: Persona[] = [
  { id: 'epic', name: 'Epic Tech AI', icon: <Bot className="w-4 h-4" />, description: 'Elite & Futuristic' },
  { id: 'coder', name: 'Code Master', icon: <Code className="w-4 h-4" />, description: 'Software Engineer' },
  { id: 'researcher', name: 'Deep Researcher', icon: <Search className="w-4 h-4" />, description: 'World-class Analyst' },
  { id: 'creative', name: 'Creative Genius', icon: <ImageIcon className="w-4 h-4" />, description: 'Visionary Creator' },
];

export default function EpicTechAI() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Welcome to **EPIC TECH AI v2**. I'm the most powerful AI assistant available. I can search the web, execute code, generate media, and adapt to any persona.\n\nWhat would you like to create today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPersona, setCurrentPersona] = useState('epic');
  const [currentModel, setCurrentModel] = useState('llama-3.3-70b-versatile');
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);

  const currentPersonaData = PERSONAS.find(p => p.id === currentPersona)!;

  const addMessage = (role: 'user' | 'assistant' | 'tool', content: string, isTool = false) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role,
      content,
      isTool
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    addMessage('user', userMessage);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          persona: currentPersona,
          model: currentModel,
          history: messages.slice(-8)
        })
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      
      addMessage('assistant', data.content);

      // Voice output
      if (voiceEnabled && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(data.content.substring(0, 300));
        utterance.rate = 1.1;
        speechSynthesis.speak(utterance);
      }

    } catch (error) {
      toast.error('Failed to connect to Epic Tech AI');
      addMessage('assistant', 'I apologize, but I encountered an error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const switchPersona = (personaId: string) => {
    setCurrentPersona(personaId);
    const persona = PERSONAS.find(p => p.id === personaId)!;
    
    addMessage('assistant', `**Persona switched to ${persona.name}**. ${persona.description} mode activated.`);
    toast.success(`Switched to ${persona.name}`);
  };

  const useTool = (tool: string) => {
    if (tool === 'web_search') {
      setInput('search ');
    } else if (tool === 'code_execution') {
      setInput('run code: ');
    } else {
      addMessage('assistant', `**${tool}** tool activated. How can I help you with files today?`);
    }
  };

  const generateMedia = async () => {
    setShowMediaModal(false);
    addMessage('assistant', 'Generating media with Flux... This may take a moment.', true);

    try {
      const response = await fetch('/api/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'cyberpunk samurai in neon Tokyo', type: 'image' })
      });
      
      const data = await response.json();
      addMessage('assistant', `![Generated Image](${data.url})\n\n**Generated with Flux** • 1024×1024 • ${data.time}s`, true);
    } catch (error) {
      addMessage('assistant', 'Media generation is currently in demo mode. Full Replicate integration coming soon.');
    }
  };

  const clearChat = () => {
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: "Chat cleared. How can I assist you now?"
    }]);
    toast.info('Conversation cleared');
  };

  const saveConversation = () => {
    const data = JSON.stringify(messages);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `epic-tech-ai-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    toast.success('Conversation saved');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Top Navigation */}
      <nav className="border-b border-white/10 bg-black/60 backdrop-blur-2xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#00f3ff] to-[#ff00aa] flex items-center justify-center">
              <Zap className="w-5 h-5 text-black" />
            </div>
            <div>
              <span className="font-display text-2xl font-semibold tracking-[-2px]">EPIC TECH</span>
              <span className="font-display text-2xl font-semibold tracking-[-2px] text-[#00f3ff]">AI</span>
            </div>
            <div className="px-3 py-1 text-xs rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              v2.0 • ULTIMATE
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Model Selector */}
            <select 
              value={currentModel}
              onChange={(e) => setCurrentModel(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-2xl px-4 py-2 text-sm focus:outline-none focus:border-[#00f3ff]"
            >
              <option value="llama-3.3-70b-versatile">Llama 3.3 70B (Best)</option>
              <option value="mixtral-8x7b-32768">Mixtral 8x7B</option>
              <option value="gemma2-9b-it">Gemma 2 9B</option>
            </select>

            <button 
              onClick={() => setShowMediaModal(true)}
              className="flex items-center gap-2 px-5 py-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm transition-all"
            >
              <ImageIcon className="w-4 h-4" />
              Generate Media
            </button>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-emerald-500/10 text-emerald-400 text-xs">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              Groq Connected
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 pt-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Sidebar */}
          <div className="lg:col-span-3">
            <div className="glass rounded-3xl p-6 border border-white/10 sticky top-20">
              {/* Persona Section */}
              <div className="mb-6">
                <div className="text-xs tracking-[3px] text-white/50 font-medium mb-3 px-1">PERSONA</div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#00f3ff] to-[#ff00aa] flex items-center justify-center">
                    {currentPersonaData.icon}
                  </div>
                  <div>
                    <div className="font-semibold text-lg">{currentPersonaData.name}</div>
                    <div className="text-xs text-white/60">{currentPersonaData.description}</div>
                  </div>
                </div>

                <div className="space-y-1">
                  {PERSONAS.map((persona) => (
                    <button
                      key={persona.id}
                      onClick={() => switchPersona(persona.id)}
                      className={`persona-btn w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all ${
                        currentPersona === persona.id ? 'active' : 'hover:bg-white/5'
                      }`}
                    >
                      {persona.icon}
                      <div className="font-medium text-sm">{persona.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tools */}
              <div>
                <div className="text-xs tracking-[3px] text-white/50 font-medium mb-3 px-1">TOOLS</div>
                <div className="space-y-1 text-sm">
                  <button onClick={() => useTool('web_search')} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-white/5 text-left">
                    <Search className="w-4 h-4 text-[#00f3ff]" /> Web Search
                  </button>
                  <button onClick={() => useTool('code_execution')} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-white/5 text-left">
                    <Code className="w-4 h-4 text-[#00f3ff]" /> Code Execution
                  </button>
                  <button onClick={() => useTool('file')} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-white/5 text-left">
                    <FolderOpen className="w-4 h-4 text-[#00f3ff]" /> File Operations
                  </button>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10 space-y-2">
                <button onClick={saveConversation} className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-white/20 hover:bg-white/5 text-sm">
                  <Save className="w-4 h-4" /> Save Conversation
                </button>
                <button onClick={clearChat} className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-white/20 hover:bg-white/5 text-sm text-red-400">
                  <Trash2 className="w-4 h-4" /> Clear Chat
                </button>
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-6">
            <div className="glass rounded-3xl border border-white/10 flex flex-col h-[620px]">
              {/* Chat Header */}
              <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
                <div>
                  <div className="font-semibold">Live Session • {currentPersonaData.name}</div>
                  <div className="text-xs text-white/50">{currentModel}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setVoiceEnabled(!voiceEnabled)}
                    className={`px-4 py-2 rounded-2xl text-xs flex items-center gap-2 border ${voiceEnabled ? 'border-[#00f3ff] text-[#00f3ff]' : 'border-white/20'}`}
                  >
                    <Mic className="w-4 h-4" /> Voice
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 p-6 overflow-y-auto custom-scroll space-y-6 text-sm">
                <AnimatePresence>
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`message max-w-[85%] ${msg.role === 'user' ? 'user-message' : 'ai-message'} px-5 py-4 rounded-3xl ${msg.role === 'user' ? 'rounded-br-none' : 'rounded-bl-none'}`}>
                        {msg.role === 'assistant' && (
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-[#00f3ff] text-xs font-bold tracking-widest">EPIC TECH AI</span>
                            {msg.isTool && <span className="text-[10px] px-2 py-px rounded bg-[#ff00aa]/20 text-[#ff00aa]">TOOL</span>}
                          </div>
                        )}
                        <div className="leading-relaxed whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, '<br/>') }} />
                      </div>
                    </div>
                  ))}
                </AnimatePresence>

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="px-5 py-4 rounded-3xl bg-[#111] border-l-4 border-[#00f3ff]">
                      <div className="flex items-center gap-2 text-sm text-white/70">
                        <div className="animate-pulse">Thinking</div>
                        <div className="flex gap-1">
                          <div className="w-1 h-1 bg-[#00f3ff] rounded-full animate-bounce" />
                          <div className="w-1 h-1 bg-[#00f3ff] rounded-full animate-bounce delay-100" />
                          <div className="w-1 h-1 bg-[#00f3ff] rounded-full animate-bounce delay-200" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="p-4 border-t border-white/10">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Ask anything... (try 'search latest AI models' or 'write a FastAPI auth system')"
                    className="chat-input flex-1 px-6 py-4 rounded-2xl text-sm placeholder:text-white/40"
                    disabled={isLoading}
                  />
                  <button 
                    onClick={sendMessage}
                    disabled={isLoading || !input.trim()}
                    className="neon-btn px-8 rounded-2xl bg-gradient-to-r from-[#00f3ff] to-[#ff00aa] text-black font-semibold disabled:opacity-50 flex items-center justify-center"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
                <div className="text-center mt-2 text-[10px] text-white/40">
                  Powered by Groq • Llama 3.3 70B • Real-time intelligence
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="lg:col-span-3">
            <div className="glass rounded-3xl p-6 border border-white/10 h-full">
              <div className="text-xs tracking-[3px] text-white/50 font-medium mb-4">CAPABILITIES</div>
              
              <div className="space-y-4 text-sm">
                {[
                  { icon: <Search className="w-4 h-4" />, title: "Real-time Web Search", desc: "DuckDuckGo powered" },
                  { icon: <Code className="w-4 h-4" />, title: "Secure Code Execution", desc: "Python sandbox" },
                  { icon: <ImageIcon className="w-4 h-4" />, title: "Media Generation", desc: "Flux • SD3 ready" },
                  { icon: <Bot className="w-4 h-4" />, title: "Multi-Persona System", desc: "4 expert modes" },
                ].map((item, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="text-[#00f3ff] mt-0.5">{item.icon}</div>
                    <div>
                      <div className="font-medium">{item.title}</div>
                      <div className="text-xs text-white/60">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-white/10">
                <div className="text-xs text-white/50 mb-3">QUICK ACTIONS</div>
                <div className="grid grid-cols-1 gap-2 text-xs">
                  <button onClick={() => setInput("Explain quantum computing like I'm 15")} className="px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-left">Explain like I'm 15</button>
                  <button onClick={() => setInput("Build a FastAPI JWT auth system")} className="px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-left">Build FastAPI Auth</button>
                  <button onClick={() => setInput("generate image of cyberpunk city")} className="px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-left">Generate Cyberpunk Art</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Media Modal */}
      <AnimatePresence>
        {showMediaModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[100] flex items-center justify-center p-6" onClick={() => setShowMediaModal(false)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass w-full max-w-md rounded-3xl p-8 border border-white/10"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between mb-6">
                <div>
                  <div className="font-display text-2xl">Media Generation</div>
                  <div className="text-xs text-white/50">Powered by Flux + Replicate</div>
                </div>
                <button onClick={() => setShowMediaModal(false)} className="text-white/60">✕</button>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-xs text-white/50 mb-2">PROMPT</div>
                  <textarea 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm h-24 resize-none" 
                    placeholder="A cyberpunk samurai standing in neon Tokyo at night, cinematic lighting"
                  />
                </div>
                <button onClick={generateMedia} className="neon-btn w-full py-4 bg-gradient-to-r from-[#00f3ff] to-[#ff00aa] text-black font-semibold rounded-2xl flex items-center justify-center gap-2">
                  <Zap className="w-4 h-4" /> GENERATE WITH FLUX
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

"use client";

import React, { useState } from 'react';
import { 
  Bot, Code, Search, Image as ImageIcon, Mic, Save, FolderOpen, 
  Trash2, User, Zap, ArrowRight, Menu, X, HelpCircle 
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
      content: "Welcome to **EPIC TECH AI v2**. I'm the most powerful AI assistant available.\n\n**Quick commands:**\n• Type `/help` to see all commands\n• `/persona coder` to switch modes\n• `/model llama-3.3-70b-versatile`\n\nWhat would you like to create today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPersona, setCurrentPersona] = useState('epic');
  const [currentModel, setCurrentModel] = useState('llama-3.3-70b-versatile');
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [showLeftDrawer, setShowLeftDrawer] = useState(false);
  const [showRightDrawer, setShowRightDrawer] = useState(false);

  const currentPersonaData = PERSONAS.find(p => p.id === currentPersona)!;

  const toggleVoice = () => {
    const newState = !voiceEnabled;
    setVoiceEnabled(newState);
    addMessage('assistant', newState ? 'Voice output enabled.' : 'Voice output disabled.');
  };

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

  // Handle / commands
  const handleCommand = (cmd: string) => {
    const parts = cmd.toLowerCase().split(' ');
    const command = parts[0];

    if (command === '/help') {
      addMessage('assistant', `**Available Commands**\n\n• \`/persona epic|code|researcher|creative\`\n• \`/model llama-3.3-70b-versatile\`\n• \`/voice\` — Toggle voice output\n• \`/clear\` — Clear chat\n• \`/save\` — Save conversation\n• \`/media\` — Open media generator`);
    } 
    else if (command === '/persona' && parts[1]) {
      const p = parts[1];
      if (PERSONAS.find(x => x.id === p)) {
        switchPersona(p);
      } else {
        addMessage('assistant', `Persona not found. Available: epic, coder, researcher, creative`);
      }
    } 
    else if (command === '/model' && parts[1]) {
      setCurrentModel(parts[1]);
      addMessage('assistant', `Model switched to **${parts[1]}**`);
    } 
    else if (command === '/voice') {
      toggleVoice();
    } 
    else if (command === '/clear') {
      clearChat();
    } 
    else if (command === '/save') {
      saveConversation();
    } 
    else if (command === '/media') {
      setShowMediaModal(true);
    } 
    else {
      addMessage('assistant', `Unknown command. Type **/help** to see all commands.`);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');

    // Handle slash commands
    if (userMessage.startsWith('/')) {
      handleCommand(userMessage);
      return;
    }

    addMessage('user', userMessage);
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
      {/* Top Navigation - Cleaner */}
      <nav className="border-b border-white/10 bg-black/70 backdrop-blur-2xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#00f3ff] to-[#ff00aa] flex items-center justify-center">
              <Zap className="w-5 h-5 text-black" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-display text-2xl font-semibold tracking-[-2px]">EPIC TECH</span>
              <span className="font-display text-2xl font-semibold tracking-[-2px] text-[#00f3ff]">AI</span>
            </div>
            <div className="hidden md:block px-3 py-1 text-xs rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              v2.0 • ULTIMATE
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select 
              value={currentModel}
              onChange={(e) => setCurrentModel(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-2xl px-4 py-2 text-sm focus:outline-none"
            >
              <option value="llama-3.3-70b-versatile">Llama 3.3 70B</option>
              <option value="mixtral-8x7b-32768">Mixtral 8x7B</option>
              <option value="gemma2-9b-it">Gemma 2 9B</option>
            </select>

            <button onClick={() => setShowMediaModal(true)} className="hidden md:flex items-center gap-2 px-5 py-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm">
              <ImageIcon className="w-4 h-4" /> Media
            </button>

            <button onClick={() => setShowLeftDrawer(true)} className="lg:hidden p-2 rounded-2xl bg-white/5">
              <Menu className="w-5 h-5" />
            </button>
            
            <div className="px-3 py-1.5 rounded-2xl bg-emerald-500/10 text-emerald-400 text-xs flex items-center gap-1.5">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" /> Groq
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 pt-8 pb-12">
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Main Chat - Much Larger */}
          <div className="flex-1 lg:w-3/5">
            <div className="glass rounded-3xl border border-white/10 flex flex-col h-[680px] shadow-2xl">
              {/* Chat Header */}
              <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-[#00f3ff] to-[#ff00aa] flex items-center justify-center">
                    {currentPersonaData.icon}
                  </div>
                  <div>
                    <div className="font-semibold text-lg">{currentPersonaData.name}</div>
                    <div className="text-xs text-white/50">{currentModel}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={() => setShowLeftDrawer(true)} className="lg:hidden p-2 rounded-xl bg-white/5">
                    <Menu className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={toggleVoice}
                    className={`px-4 py-2 rounded-2xl text-xs flex items-center gap-2 border transition-all ${voiceEnabled ? 'border-[#00f3ff] text-[#00f3ff]' : 'border-white/20'}`}
                  >
                    <Mic className="w-4 h-4" /> Voice
                  </button>
                  <button onClick={() => setShowRightDrawer(true)} className="lg:hidden p-2 rounded-xl bg-white/5">
                    <HelpCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Messages - Bigger Area */}
              <div className="flex-1 p-8 overflow-y-auto custom-scroll space-y-8 text-[15px]">
                <AnimatePresence>
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`message max-w-[92%] ${msg.role === 'user' ? 'user-message' : 'ai-message'} px-6 py-4 rounded-3xl ${msg.role === 'user' ? 'rounded-br-none' : 'rounded-bl-none'}`}>
                        {msg.role === 'assistant' && (
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[#00f3ff] text-xs font-bold tracking-[2px]">EPIC TECH AI</span>
                            {msg.isTool && <span className="text-[10px] px-2 py-0.5 rounded bg-[#ff00aa]/20 text-[#ff00aa]">TOOL</span>}
                          </div>
                        )}
                        <div className="leading-relaxed whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, '<br/>') }} />
                      </div>
                    </div>
                  ))}
                </AnimatePresence>

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="px-6 py-4 rounded-3xl bg-[#111] border-l-4 border-[#00f3ff]">
                      <div className="flex items-center gap-3 text-sm text-white/70">
                        <div>Thinking</div>
                        <div className="flex gap-1">
                          <div className="w-1.5 h-1.5 bg-[#00f3ff] rounded-full animate-bounce" />
                          <div className="w-1.5 h-1.5 bg-[#00f3ff] rounded-full animate-bounce delay-100" />
                          <div className="w-1.5 h-1.5 bg-[#00f3ff] rounded-full animate-bounce delay-200" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input - More Prominent */}
              <div className="p-5 border-t border-white/10 bg-black/20">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message or /help for commands..."
                    className="chat-input flex-1 px-6 py-4 rounded-2xl text-base placeholder:text-white/40"
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
                <div className="text-center mt-2 text-xs text-white/40">
                  Press <span className="font-mono">Enter</span> to send • Type <span className="font-mono">/help</span> for commands
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Side Panels - Hidden on mobile, shown on lg+ */}
          <div className="hidden lg:block lg:w-1/5">
            <div className="glass rounded-3xl p-6 border border-white/10 sticky top-20">
              <div className="text-xs tracking-[3px] text-white/50 font-medium mb-4">PERSONAS</div>
              <div className="space-y-1 mb-8">
                {PERSONAS.map((persona) => (
                  <button key={persona.id} onClick={() => switchPersona(persona.id)} className={`persona-btn w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left text-sm ${currentPersona === persona.id ? 'active' : 'hover:bg-white/5'}`}>
                    {persona.icon} <span>{persona.name}</span>
                  </button>
                ))}
              </div>

              <div className="text-xs tracking-[3px] text-white/50 font-medium mb-4">TOOLS</div>
              <div className="space-y-1 text-sm">
                <button onClick={() => useTool('web_search')} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl hover:bg-white/5 text-left"><Search className="w-4 h-4 text-[#00f3ff]" /> Web Search</button>
                <button onClick={() => useTool('code_execution')} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl hover:bg-white/5 text-left"><Code className="w-4 h-4 text-[#00f3ff]" /> Code Execution</button>
              </div>
            </div>
          </div>

          <div className="hidden lg:block lg:w-1/5">
            <div className="glass rounded-3xl p-6 border border-white/10 sticky top-20">
              <div className="text-xs tracking-[3px] text-white/50 font-medium mb-4">CAPABILITIES</div>
              <div className="space-y-4 text-sm">
                <div className="flex gap-3"><Search className="w-4 h-4 text-[#00f3ff] mt-1" /><div><div className="font-medium">Web Search</div><div className="text-xs text-white/60">Real-time results</div></div></div>
                <div className="flex gap-3"><Code className="w-4 h-4 text-[#00f3ff] mt-1" /><div><div className="font-medium">Code Sandbox</div><div className="text-xs text-white/60">Secure execution</div></div></div>
                <div className="flex gap-3"><ImageIcon className="w-4 h-4 text-[#00f3ff] mt-1" /><div><div className="font-medium">Media Gen</div><div className="text-xs text-white/60">Flux ready</div></div></div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10 text-xs text-white/50">Type <span className="font-mono text-white/70">/help</span> in chat for commands</div>
            </div>
          </div>
        </div>
      </div>

      {/* Left Drawer - Personas & Tools */}
      <AnimatePresence>
        {showLeftDrawer && (
          <div className="fixed inset-0 z-[100] lg:hidden" onClick={() => setShowLeftDrawer(false)}>
            <div className="absolute inset-0 bg-black/70" />
            <motion.div 
              initial={{ x: -100 }}
              animate={{ x: 0 }}
              exit={{ x: -100 }}
              className="absolute left-0 top-0 h-full w-80 glass border-r border-white/10 p-6"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <div className="font-semibold text-xl">Personas & Tools</div>
                <button onClick={() => setShowLeftDrawer(false)}><X /></button>
              </div>
              {/* Persona list + Tools here (same as desktop) */}
              <div className="space-y-1">
                {PERSONAS.map(p => (
                  <button key={p.id} onClick={() => { switchPersona(p.id); setShowLeftDrawer(false); }} className={`persona-btn w-full flex items-center gap-3 px-4 py-3 rounded-2xl ${currentPersona === p.id ? 'active' : ''}`}>
                    {p.icon} {p.name}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Right Drawer - Help & Capabilities */}
      <AnimatePresence>
        {showRightDrawer && (
          <div className="fixed inset-0 z-[100] lg:hidden" onClick={() => setShowRightDrawer(false)}>
            <div className="absolute inset-0 bg-black/70" />
            <motion.div 
              initial={{ x: 100 }}
              animate={{ x: 0 }}
              exit={{ x: 100 }}
              className="absolute right-0 top-0 h-full w-80 glass border-l border-white/10 p-6"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <div className="font-semibold text-xl">Help & Commands</div>
                <button onClick={() => setShowRightDrawer(false)}><X /></button>
              </div>
              <div className="text-sm space-y-2">
                <div>Type <span className="font-mono bg-white/10 px-1.5 py-0.5 rounded">/help</span> for all commands</div>
                <div>Type <span className="font-mono bg-white/10 px-1.5 py-0.5 rounded">/persona coder</span></div>
                <div className="pt-4 text-white/50">This makes the interface clean and spacious on all devices.</div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Media Modal */}
      <AnimatePresence>
        {showMediaModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[100] flex items-center justify-center p-6" onClick={() => setShowMediaModal(false)}>
            <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} className="glass w-full max-w-md rounded-3xl p-8 border border-white/10">
              <div className="flex justify-between mb-6">
                <div>
                  <div className="font-display text-2xl">Media Generation</div>
                  <div className="text-xs text-white/50">Powered by Flux</div>
                </div>
                <button onClick={() => setShowMediaModal(false)}><X /></button>
              </div>
              <button onClick={generateMedia} className="neon-btn w-full py-4 bg-gradient-to-r from-[#00f3ff] to-[#ff00aa] text-black font-semibold rounded-2xl flex items-center justify-center gap-2">
                <Zap className="w-4 h-4" /> GENERATE IMAGE
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

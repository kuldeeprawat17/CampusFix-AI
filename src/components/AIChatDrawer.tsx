import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, Loader2, Wrench, ShieldAlert, ArrowRight } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

interface AIChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onPreFillComplaint: (title: string, description: string) => void;
}

export const AIChatDrawer: React.FC<AIChatDrawerProps> = ({
  isOpen,
  onClose,
  onPreFillComplaint,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'model',
      text: "Namaste! I'm CampusFix Bot, your 24/7 college campus maintenance assistant. Are you having trouble with fans, classroom projectors, Wi-Fi connectivity, lights, or water leakage? Ask me to help troubleshoot or file an official ticket!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isSending]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isSending) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputText('');
    setIsSending(true);

    try {
      // Send conversation thread to backend /api/ai/chat
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            text: m.text,
          })),
        }),
      });

      const data = await response.json();
      const botMsg: ChatMessage = {
        id: `m-${Date.now()}`,
        role: 'model',
        text: data.reply || "I've noted that issue. You can quickly raise a complaint ticket using the 'Report Issue' button!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: `m-${Date.now()}`,
        role: 'model',
        text: "Temporary network delay. If this is an urgent electrical or plumbing issue, please use the '+ Report Issue' button right away!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsSending(false);
    }
  };

  const quickQuestions = [
    'Classroom projector showing No Signal / HDMI disconnected',
    'Ceiling fan making clicking sound on high speed',
    'Campus Wi-Fi authentication timeout in library',
    'Washroom water pipe leaking and floor is wet',
  ];

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col text-white">
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/30 text-indigo-400 border border-indigo-500/40 flex items-center justify-center">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>CampusFix AI Assistant</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Live
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">Troubleshooting & Campus Maintenance Bot</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Message Thread (Scrollable) */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs sm:text-sm">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-emerald-600 text-white rounded-br-xs'
                  : 'bg-slate-800/80 border border-slate-700/80 text-slate-200 rounded-bl-xs'
              }`}
            >
              <p className="whitespace-pre-line">{msg.text}</p>
            </div>
            <span className="text-[10px] text-slate-500 mt-1 px-1">{msg.timestamp}</span>
          </div>
        ))}

        {isSending && (
          <div className="flex items-center gap-2 text-slate-400 text-xs py-1">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
            <span>CampusFix Bot is analyzing...</span>
          </div>
        )}
      </div>

      {/* Quick Prompts */}
      <div className="p-2 border-t border-slate-800/80 bg-slate-950/60 flex items-center gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
        {quickQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(q)}
            className="flex-shrink-0 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition truncate max-w-[200px]"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 border-t border-slate-800 bg-slate-900 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask about fan, projector, Wi-Fi, leak..."
          className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isSending}
          className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

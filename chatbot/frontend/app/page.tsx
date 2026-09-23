"use client";

import { BotIcon, UserIcon } from "@/components/icons";
import { Markdown } from "@/components/markdown";
import { useEffect, useRef, useState, FormEvent, KeyboardEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isError?: boolean;
}

type ChatbotId = "groq" | "v3";

const GROQ_STORAGE_KEY = "groq_chat_history";
const V3_STORAGE_KEY = "v3_chat_history";
const CHATBOT_PREF_KEY = "selected_chatbot";
const MAX_HISTORY = 50;

// ─── Chatbot definitions ──────────────────────────────────────────────────────
const CHATBOTS = [
  {
    id: "groq" as ChatbotId,
    label: "Groq Assistant",
    shortLabel: "Groq",
    description: "Powered by Llama-3.3 70B · Indian Legal Specialist",
    gradient: "from-orange-500 to-amber-500",
    glowColor: "shadow-orange-500/20",
    badge: "⚡",
  },
  {
    id: "v3" as ChatbotId,
    label: "CodeLegalist V3",
    shortLabel: "V3",
    description: "Legal Assistant · Local Integration",
    gradient: "from-violet-500 to-fuchsia-600",
    glowColor: "shadow-violet-500/20",
    badge: "🤖",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateId(): string {
  return Math.random().toString(36).slice(2, 9);
}

function loadHistory(key: string): ChatMessage[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return parsed.map((m: Omit<ChatMessage, "timestamp"> & { timestamp: string }) => ({
      ...m,
      timestamp: new Date(m.timestamp),
    }));
  } catch {
    return [];
  }
}

function saveHistory(key: string, messages: ChatMessage[]) {
  try {
    const toStore = messages.slice(-MAX_HISTORY);
    localStorage.setItem(key, JSON.stringify(toStore));
  } catch {
    // quota exceeded — ignore
  }
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// ─── Chatbot Selector ─────────────────────────────────────────────────────────

function ChatbotSelector({
  selected,
  onChange,
}: {
  selected: ChatbotId;
  onChange: (id: ChatbotId) => void;
}) {
  return (
    <div className="flex items-center gap-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full p-0.5">
      {CHATBOTS.map((bot) => (
        <button
          key={bot.id}
          id={`chatbot-select-${bot.id}`}
          onClick={() => onChange(bot.id)}
          title={bot.description}
          className={`px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 ${
            selected === bot.id
              ? `bg-gradient-to-r ${bot.gradient} text-white shadow-sm`
              : "text-zinc-400 hover:text-white"
          }`}
        >
          {bot.badge} {bot.shortLabel}
        </button>
      ))}
    </div>
  );
}

// ─── Typing Indicator ─────────────────────────────────────────────────────────

function TypingIndicator({ chatbot }: { chatbot: ChatbotId }) {
  const isGroq = chatbot === "groq";
  const bgGradient = isGroq 
    ? "from-orange-500 to-amber-500" 
    : "from-violet-500 to-fuchsia-600";
  const dotColor = isGroq ? "bg-orange-400" : "bg-violet-400";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="flex items-end gap-3 px-4 py-2"
    >
      <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br ${bgGradient} flex items-center justify-center shadow-md`}>
        <BotIcon className="text-white w-4 h-4" />
      </div>
      <div className="bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700/50 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className={`w-2 h-2 rounded-full ${dotColor} block`}
              animate={{ y: [0, -6, 0] }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.15,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Message Bubble ───────────────────────────────────────────────────────────

function MessageBubble({ message, chatbot }: { message: ChatMessage; chatbot: ChatbotId }) {
  const isUser = message.role === "user";
  const isGroq = chatbot === "groq";

  const userGradient = isGroq
    ? "from-orange-500 to-amber-500"
    : "from-violet-500 to-fuchsia-600";
  const userRingColor = isGroq ? "focus:ring-orange-500/40" : "focus:ring-violet-500/40";
  const avatarGradient = isUser
    ? userGradient
    : "bg-gradient-to-br from-slate-600 to-slate-800 dark:from-slate-500 dark:to-slate-700";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`flex items-end gap-3 px-4 py-1 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-md ${avatarGradient}`}
      >
        {isUser ? (
          <UserIcon className="text-white w-4 h-4" />
        ) : (
          <BotIcon className="text-white w-4 h-4" />
        )}
      </div>

      {/* Bubble */}
      <div className={`flex flex-col gap-1 max-w-[80%] md:max-w-[70%] ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`px-4 py-3 rounded-2xl shadow-sm text-[14.5px] leading-relaxed ${
            isUser
              ? `bg-gradient-to-br ${userGradient} text-white rounded-tr-none`
              : message.isError
              ? "bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 rounded-bl-none"
              : "bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700/50 text-zinc-800 dark:text-zinc-200 rounded-bl-none"
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className={`prose prose-sm dark:prose-invert max-w-none prose-headings:font-semibold prose-headings:text-zinc-800 dark:prose-headings:text-zinc-100 ${
              isGroq ? "prose-a:text-orange-600 dark:prose-a:text-orange-400" : "prose-a:text-violet-600 dark:prose-a:text-violet-400"
            }`}>
              <Markdown>{message.content}</Markdown>
            </div>
          )}
        </div>
        <span className="text-[11px] text-zinc-400 dark:text-zinc-500 px-1">
          {formatTime(message.timestamp)}
        </span>
      </div>
    </motion.div>
  );
}

// ─── Empty States ───────────────────────────────────────────────────────────

const GROQ_SUGGESTED_QUERIES = [
  "What are my rights if arrested in India?",
  "Explain Section 103 of the BNS",
  "How to file an FIR online?",
  "What is anticipatory bail?",
];

const V3_SUGGESTED_QUERIES = [
  "What is theft under BNS?",
  "How to file an FIR?",
  "Draft FIR for theft of mobile",
  "Can WhatsApp chats be used as evidence?",
];

function EmptyState({ chatbot, onQuery }: { chatbot: ChatbotId; onQuery: (q: string) => void }) {
  const isGroq = chatbot === "groq";
  const queries = isGroq ? GROQ_SUGGESTED_QUERIES : V3_SUGGESTED_QUERIES;
  const gradient = isGroq ? "from-orange-500 via-amber-500 to-yellow-500" : "from-violet-500 to-fuchsia-600";
  const shadow = isGroq ? "shadow-orange-500/25" : "shadow-violet-500/25";
  const title = isGroq ? "⚡ Groq Assistant" : "🤖 CodeLegalist V3";
  const desc = isGroq
    ? "Your AI-powered Indian legal consultant. Powered by Llama-3.3 70B via Groq."
    : "Local AI Legal Assistant powered by BNS, BNSS, and BSA 2023 datasets + FAISS.";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center h-full px-6 py-16 text-center gap-8"
    >
      {/* Logo */}
      <div className="flex flex-col items-center gap-4">
        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-xl ${shadow}`}>
          <BotIcon className="text-white w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{title}</h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
            {desc}
          </p>
        </div>
      </div>

      {/* Suggested queries */}
      <div className="w-full max-w-lg">
        <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-3">
          Try asking
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {queries.map((q) => (
            <button
              key={q}
              id={`suggested-query-${q.slice(0, 20).replace(/\s+/g, '-').toLowerCase()}`}
              onClick={() => onQuery(q)}
              className={`text-left px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 transition-all duration-200 text-sm text-zinc-700 dark:text-zinc-300 group ${
                isGroq
                  ? "hover:bg-orange-50 dark:hover:bg-orange-950/30 hover:border-orange-300 dark:hover:border-orange-700"
                  : "hover:bg-violet-50 dark:hover:bg-violet-950/30 hover:border-violet-300 dark:hover:border-violet-700"
              }`}
            >
              <span className={`transition-colors ${isGroq ? "group-hover:text-orange-600 dark:group-hover:text-orange-400" : "group-hover:text-violet-600 dark:group-hover:text-violet-400"}`}>
                {q}
              </span>
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-zinc-400 dark:text-zinc-600 max-w-sm">
        ⚖️ For educational and informational purposes only. Always consult a qualified advocate for legal advice.
      </p>
    </motion.div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function Home() {
  const [selectedChatbot, setSelectedChatbot] = useState<ChatbotId>("groq");

  // Independent message histories
  const [groqMessages, setGroqMessages] = useState<ChatMessage[]>([]);
  const [v3Messages, setV3Messages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // ── Load persisted chatbot preference ─────────────────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem(CHATBOT_PREF_KEY) as ChatbotId | null;
    if (saved && (saved === "groq" || saved === "v3")) {
      setSelectedChatbot(saved);
    }
    // Load Groq history
    const groqHist = loadHistory(GROQ_STORAGE_KEY);
    if (groqHist.length > 0) setGroqMessages(groqHist);

    // Load V3 history
    const v3Hist = loadHistory(V3_STORAGE_KEY);
    if (v3Hist.length > 0) setV3Messages(v3Hist);
  }, []);

  // ── Persist histories ───────────────────────────────────────────────────
  useEffect(() => {
    if (groqMessages.length > 0) {
      saveHistory(GROQ_STORAGE_KEY, groqMessages);
    } else {
      localStorage.removeItem(GROQ_STORAGE_KEY);
    }
  }, [groqMessages]);

  useEffect(() => {
    if (v3Messages.length > 0) {
      saveHistory(V3_STORAGE_KEY, v3Messages);
    } else {
      localStorage.removeItem(V3_STORAGE_KEY);
    }
  }, [v3Messages]);

  // ── Persist chatbot preference ─────────────────────────────────────────────
  const handleChatbotSwitch = (id: ChatbotId) => {
    setSelectedChatbot(id);
    localStorage.setItem(CHATBOT_PREF_KEY, id);
    setError(null);
  };

  // ── Scroll to bottom on new messages ──────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [groqMessages, v3Messages, isLoading]);

  // ── Auto-resize textarea ───────────────────────────────────────────────────
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 160)}px`;
    }
  }, [input]);

  // ── Send a message to backend ──────────────────────────────────────────────
  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    setInput("");
    setError(null);

    const userMsg: ChatMessage = {
      id: generateId(),
      role: "user",
      content: trimmed,
      timestamp: new Date(),
    };

    const currentMessages = selectedChatbot === "groq" ? groqMessages : v3Messages;
    const updatedMessages = [...currentMessages, userMsg];

    if (selectedChatbot === "groq") {
      setGroqMessages(updatedMessages);
    } else {
      setV3Messages(updatedMessages);
    }
    setIsLoading(true);

    try {
      const payload = {
        messages: updatedMessages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        chatbot: selectedChatbot
      };

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const responseText = await res.text();

      const botMsg: ChatMessage = {
        id: generateId(),
        role: "assistant",
        content: responseText || "Sorry, I received an empty response. Please try again.",
        timestamp: new Date(),
        isError: !responseText,
      };

      if (selectedChatbot === "groq") {
        setGroqMessages((prev) => [...prev, botMsg]);
      } else {
        setV3Messages((prev) => [...prev, botMsg]);
      }
    } catch (err) {
      console.error("Chat fetch error:", err);
      const errMsg: ChatMessage = {
        id: generateId(),
        role: "assistant",
        content:
          "### ❌ Connection Error\n\nUnable to reach the Legal AI engine. Please check your connection and try again.",
        timestamp: new Date(),
        isError: true,
      };
      if (selectedChatbot === "groq") {
        setGroqMessages((prev) => [...prev, errMsg]);
      } else {
        setV3Messages((prev) => [...prev, errMsg]);
      }
      setError("Failed to connect to the AI backend.");
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const clearActiveHistory = () => {
    if (selectedChatbot === "groq") {
      setGroqMessages([]);
    } else {
      setV3Messages([]);
    }
    inputRef.current?.focus();
  };

  const activeChatbot = CHATBOTS.find((b) => b.id === selectedChatbot)!;
  const activeMessages = selectedChatbot === "groq" ? groqMessages : v3Messages;
  const inputRingColor = selectedChatbot === "groq" ? "focus:ring-orange-500/40" : "focus:ring-violet-500/40";
  const inputBorderFocus = selectedChatbot === "groq" ? "focus:border-orange-400" : "focus:border-violet-400";
  const sendButtonColor = selectedChatbot === "groq" 
    ? "from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-orange-500/20" 
    : "from-violet-500 to-fuchsia-600 hover:from-violet-600 hover:to-fuchsia-700 shadow-violet-500/20";

  return (
    <div className="flex flex-col h-dvh bg-zinc-50 dark:bg-zinc-950">

      {/* ── Header ── */}
      <header className="flex-shrink-0 z-20 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-200/60 dark:border-zinc-800/60">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${activeChatbot.gradient} flex items-center justify-center shadow-md ${activeChatbot.glowColor}`}>
              <BotIcon className="text-white w-4 h-4" />
            </div>
            <div className="leading-tight hidden sm:block">
              <p className="font-bold text-sm text-zinc-900 dark:text-zinc-50">Code Legalist</p>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium uppercase tracking-wider">
                {activeChatbot.description}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {activeMessages.length > 0 && (
              <button
                id="clear-history-btn"
                onClick={clearActiveHistory}
                title={`Clear ${selectedChatbot === "groq" ? "Groq" : "V3"} conversation`}
                className="text-xs text-zinc-400 hover:text-red-500 dark:hover:text-red-400 transition-colors px-2 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30"
              >
                Clear
              </button>
            )}
            <ChatbotSelector selected={selectedChatbot} onChange={handleChatbotSwitch} />
          </div>
        </div>
      </header>

      {/* ── Body: Active Chat View ── */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto"
        style={{ scrollbarWidth: "thin", scrollbarColor: "#d1d5db transparent" }}
      >
        <div className="max-w-4xl mx-auto py-4">
          {activeMessages.length === 0 ? (
            <EmptyState chatbot={selectedChatbot} onQuery={(q) => { setInput(q); sendMessage(q); }} />
          ) : (
            <div className="flex flex-col gap-1 pb-4">
              {activeMessages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} chatbot={selectedChatbot} />
              ))}
              <AnimatePresence>
                {isLoading && <TypingIndicator key="typing" chatbot={selectedChatbot} />}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* ── Error Banner ── */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex-shrink-0 bg-red-50 dark:bg-red-950/40 border-t border-red-200 dark:border-red-800/50 px-4 py-2 flex items-center justify-between"
          >
            <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-xs text-red-400 hover:text-red-600 ml-4 font-medium"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Input Area ── */}
      <div className="flex-shrink-0 border-t border-zinc-200/60 dark:border-zinc-800/60 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl">
        <form
          onSubmit={handleSubmit}
          className="max-w-4xl mx-auto px-4 py-3 flex items-end gap-3"
        >
          <div className="flex-1 relative">
            <textarea
              id="chat-input"
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your legal matter… (Enter to send, Shift+Enter for newline)"
              rows={1}
              disabled={isLoading}
              className={`w-full resize-none rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-4 py-3 pr-16 text-sm text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 outline-none focus:ring-2 ${inputRingColor} ${inputBorderFocus} disabled:opacity-60 transition-all duration-200 shadow-sm`}
              style={{ minHeight: "48px", maxHeight: "160px" }}
            />
          </div>

          <button
            id="send-message-btn"
            type="submit"
            disabled={isLoading || !input.trim()}
            className={`flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br ${sendButtonColor} disabled:from-zinc-300 disabled:to-zinc-400 dark:disabled:from-zinc-700 dark:disabled:to-zinc-600 flex items-center justify-center shadow-md disabled:shadow-none transition-all duration-200 disabled:cursor-not-allowed`}
            aria-label="Send message"
          >
            <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 text-white">
              <path
                d="M1.5 8L8 1.5M8 1.5L14.5 8M8 1.5V14.5"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </form>

        <p className="text-center text-[10px] text-zinc-400 dark:text-zinc-600 pb-2">
          {activeChatbot.label} · For informational purposes only · Not a substitute for legal counsel
        </p>
      </div>
    </div>
  );
}
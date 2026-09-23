"use client";

import * as React from 'react';
import { Input } from "@/components/ui/input";
import { Message } from "ai";
import { useChat } from "ai/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ReactMarkdown, { Options } from "react-markdown";
import { LoadingIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Link from 'next/link';

export default function LawyerSearchPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/lawyer-chat',
    onError: (error) => {

      console.error('Chat error:', error);
      toast.error('Search failed. Please check your connection.');
    }
  });

  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length > 0) setIsExpanded(true);
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const awaitingResponse = useMemo(() => {
    if (!messages.length) return false;
    const lastMessage = messages[messages.length - 1];
    return isLoading && lastMessage.role === 'user';
  }, [isLoading, messages]);

  const userQuery: Message | undefined = messages
    .filter((m) => m.role === "user")
    .slice(-1)[0];

  const lastAssistantMessage: Message | undefined = messages
    .filter((m) => m.role !== "user")
    .slice(-1)[0];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-indigo-500/30">
      
      {/* ── Header ── */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <span className="text-white font-bold text-lg">L</span>
            </div>
            <span className="font-bold text-xl tracking-tight text-white group-hover:text-indigo-400 transition-colors">
              Code Legalist
            </span>
          </a>
          <nav className="hidden md:flex items-center gap-6">
            <a href="/chat" className="text-sm font-bold text-zinc-400 hover:text-white transition-colors">Consult AI</a>
            <a href="/forum" className="text-sm font-bold text-zinc-400 hover:text-white transition-colors">Forum</a>
            <div className="h-4 w-px bg-zinc-800" />
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">Lawyer Search</span>
          </nav>

        </div>
      </header>

      {/* ── Main content ── */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 pt-24 pb-12 relative overflow-hidden">
        
        {/* Background Gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="w-full max-w-2xl z-10 flex flex-col items-center">
          
          <AnimatePresence>
            {!isExpanded && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center mb-10"
              >
                <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight mb-4">
                  Find the Right Lawyer for Your Needs
                </h1>
                <p className="text-zinc-400 text-lg max-w-lg mx-auto">
                  Search across India's top legal professionals. Our AI matches you based on practice area, jurisdiction, and complexity.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            layout
            className={cn(
              "w-full rounded-2xl transition-all duration-500",
              isExpanded ? "mb-auto" : "max-w-xl"
            )}
          >
            {/* Search Box */}
            <div className="glass-panel p-2 rounded-2xl mb-6 shadow-2xl">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  className="flex-1 bg-transparent px-5 py-3 text-base text-white placeholder-zinc-500 font-medium focus:outline-none"
                  minLength={3}
                  required
                  value={input}
                  placeholder="e.g. Divorce lawyer in Mumbai or Corporate lawyer..."
                  onChange={handleInputChange}
                />
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="px-6 py-2.5 rounded-xl premium-gradient text-white font-bold text-sm shadow-lg shadow-indigo-500/20 hover:opacity-90 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isLoading ? "Searching..." : "Search"}
                </button>
              </form>
            </div>

            {/* Simple Suggestions */}
            {!isExpanded && (
              <div className="flex flex-wrap justify-center gap-2 px-4">
                {["Divorce lawyer in Mumbai", "Corporate IP Lawyer", "Property Dispute", "Constitutional Expert"].map((q) => (
                  <button 
                    key={q}
                    onClick={() => {
                        const target = { target: { value: q } } as any;
                        handleInputChange(target);
                    }}
                    className="text-xs font-bold text-zinc-500 bg-white/5 border border-white/5 px-3 py-1.5 rounded-full hover:bg-white/10 hover:text-zinc-300 transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Results Area */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col gap-6"
                >
                  {userQuery && (
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest ml-1">Your Query</span>
                      <div className="bg-zinc-900 border border-white/5 p-4 rounded-xl text-sm text-zinc-300">
                        {userQuery.content}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Recommendations</span>
                    <div className="glass-panel p-6 rounded-2xl shadow-xl min-h-[300px]">
                      {awaitingResponse ? (
                        <div className="flex items-center gap-4 py-4">
                          <div className="animate-spin text-indigo-500"><LoadingIcon /></div>
                          <span className="text-sm font-bold text-zinc-400">Analyzing thousands of professional profiles...</span>
                        </div>
                      ) : lastAssistantMessage ? (
                        <AssistantMessage message={lastAssistantMessage} />
                      ) : null}
                      <div ref={messagesEndRef} />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </main>

      <footer className="py-8 border-t border-white/5 bg-zinc-950 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.2em]">Code Legalist · India's Premier Legal Directory</p>
          <div className="flex gap-6">
            <a href="#" className="text-[10px] text-zinc-500 hover:text-white uppercase font-bold tracking-widest">Privacy</a>
            <a href="#" className="text-[10px] text-zinc-500 hover:text-white uppercase font-bold tracking-widest">Terms</a>
          </div>

        </div>
      </footer>
    </div>
  );
}

const AssistantMessage = ({ message }: { message: Message | undefined }) => {
  if (message === undefined) return null;

  return (
    <motion.div
      key={message.id}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-[14.5px] leading-relaxed text-zinc-300"
      id="markdown"
    >
      <MemoizedReactMarkdown>
        {message.content}
      </MemoizedReactMarkdown>
    </motion.div>
  );
};

const MemoizedReactMarkdown = React.memo(
  ReactMarkdown as React.FC<Options>,
  (prevProps: Options, nextProps: Options) =>
    prevProps.children === nextProps.children &&
    prevProps.className === nextProps.className
);

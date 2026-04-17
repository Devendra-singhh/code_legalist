/* eslint-disable @next/next/no-img-element */
"use client";

import {
  AttachmentIcon,
  BotIcon,
  UserIcon,
  VercelIcon,
} from "@/components/icons";
import { useChat } from "ai/react";
import { DragEvent, useEffect, useRef, useState, FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import Link from "next/link";
import { Markdown } from "@/components/markdown";

// Define extended interfaces for the Message type to support attachments
interface MessageAttachment {
  name: string;
  type: string;
  content: string;
  data?: File;
}

interface MessageWithAttachments {
  id: string;
  role: string;
  content: string;
  createdAt?: Date;
  experimental_attachments?: MessageAttachment[];
}

// Small model toggle component for top right corner
function ModelToggle({ currentModel, onChange }: { currentModel: string, onChange: (model: string) => void }) {
  return (
    <div className="bg-zinc-100 dark:bg-zinc-800 rounded-full p-0.5 flex items-center text-xs">
      <button
        onClick={() => onChange("mistral")}
        className={`px-2 py-0.5 rounded-full transition-all ${currentModel === "mistral"
          ? "bg-white dark:bg-zinc-700 shadow-sm"
          : "text-zinc-500 dark:text-zinc-400"
          }`}
      >
        M
      </button>
      <button
        onClick={() => onChange("gemini")}
        className={`px-2 py-0.5 rounded-full transition-all ${currentModel === "gemini"
          ? "bg-white dark:bg-zinc-700 shadow-sm"
          : "text-zinc-500 dark:text-zinc-400"
          }`}
      >
        G
      </button>
    </div>
  );
}

const getTextFromDataUrl = (dataUrl: string) => {
  const base64 = dataUrl.split(",")[1];
  return window.atob(base64);
};

function TextFilePreview({ file }: { file: File }) {
  const [content, setContent] = useState<string>("");

  useEffect(() => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      setContent(typeof text === "string" ? text.slice(0, 100) : "");
    };
    reader.readAsText(file);
  }, [file]);

  return (
    <div>
      {content}
      {content.length >= 100 && "..."}
    </div>
  );
}

// Debug component to display errors
function DebugInfo({ errorState }: { errorState: any }) {
  return (
    <div className="fixed bottom-4 right-4 bg-red-100 dark:bg-red-900 p-3 rounded-md max-w-md max-h-72 overflow-auto z-50">
      <h3 className="font-bold">Debug Info:</h3>
      <pre className="text-xs mt-2">
        {JSON.stringify(errorState, null, 2)}
      </pre>
    </div>
  );
}

export default function Home() {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [modelPreference, setModelPreference] = useState<string>("mistral");
  const [isLoading, setIsLoading] = useState(false);

  // Get current model preference on initial load
  useEffect(() => {
    fetch('/api/model-preference')
      .then(res => res.json())
      .then(data => {
        setModelPreference(data.model);
      })
      .catch(err => {
        console.error('Error fetching model preference:', err);
      });
  }, []);

  // Handle model toggle
  const handleModelChange = async (model: string) => {
    try {
      const response = await fetch('/api/model-preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ model }),
      });

      if (response.ok) {
        setModelPreference(model);
        toast.success(`Switched to ${model === 'mistral' ? 'Mistral AI' : 'Google Gemini'}`);
      } else {
        toast.error('Failed to switch AI model');
      }
    } catch (error) {
      console.error('Error changing model preference:', error);
      toast.error('Failed to switch AI model');
    }
  };

  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: "/api/chat",
    onError: (err: Error) => {
      console.error('Chat error:', err);
      setDebugInfo(err);
      toast.error(err.message || 'Failed to get response from the server');
      setIsLoading(false);
    },
    onResponse: (response) => {
      if (!response.ok) {
        response.text().then(text => {
          console.error('Response error:', text);
          setDebugInfo({ responseError: text, status: response.status });
        });
      } else {
        console.log('Chat response status:', response.status);
      }
      setIsLoading(false);
    }
  });

  const [files, setFiles] = useState<FileList | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null); // Reference for the hidden file input
  const [isDragging, setIsDragging] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Monitor scroll for header shadow
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handlePaste = (event: React.ClipboardEvent) => {
    const items = event.clipboardData?.items;

    if (items) {
      const files = Array.from(items)
        .map((item) => item.getAsFile())
        .filter((file): file is File => file !== null);

      if (files.length > 0) {
        const validFiles = files.filter(
          (file) =>
            file.type.startsWith("image/") || file.type.startsWith("text/")
        );

        if (validFiles.length === files.length) {
          const dataTransfer = new DataTransfer();
          validFiles.forEach((file) => dataTransfer.items.add(file));
          setFiles(dataTransfer.files);
        } else {
          toast.error("Only image and text files are allowed");
        }
      }
    }
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFiles = event.dataTransfer.files;
    const droppedFilesArray = Array.from(droppedFiles);
    if (droppedFilesArray.length > 0) {
      const validFiles = droppedFilesArray.filter(
        (file) =>
          file.type.startsWith("image/") || file.type.startsWith("text/")
      );

      if (validFiles.length === droppedFilesArray.length) {
        const dataTransfer = new DataTransfer();
        validFiles.forEach((file) => dataTransfer.items.add(file));
        setFiles(dataTransfer.files);
      } else {
        toast.error("Only image and text files are allowed!");
      }

      setFiles(droppedFiles);
    }
    setIsDragging(false);
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Function to handle file selection via the upload button
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Function to handle files selected from the file dialog
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles) {
      const validFiles = Array.from(selectedFiles).filter(
        (file) =>
          file.type.startsWith("image/") || file.type.startsWith("text/")
      );

      if (validFiles.length === selectedFiles.length) {
        const dataTransfer = new DataTransfer();
        validFiles.forEach((file) => dataTransfer.items.add(file));
        setFiles(dataTransfer.files);
      } else {
        toast.error("Only image and text files are allowed");
      }
    }
  };

  const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    handleSubmit(e);
  };

  return (
    <div
      className="flex flex-col justify-center pb-20 h-dvh bg-white dark:bg-zinc-900"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >

      {/* Professional Header */}
      <div className={`fixed top-0 left-0 right-0 z-20 transition-all duration-300 ${isScrolled ? "bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-sm border-b dark:border-zinc-800" : ""}`}>
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <BotIcon className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-zinc-900 dark:text-zinc-100 leading-none">Code Legalist</h1>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold mt-1">AI Legal Consultant</p>
            </div>
          </div>
          <ModelToggle currentModel={modelPreference} onChange={handleModelChange} />
        </div>
      </div>

      <AnimatePresence>
        {isDragging && (
          <motion.div
            className="fixed pointer-events-none dark:bg-zinc-900/90 h-dvh w-dvw z-10 flex flex-row justify-center items-center flex flex-col gap-1 bg-zinc-100/90"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div>Drag and drop files here</div>
            <div className="text-sm dark:text-zinc-400 text-zinc-500">
              {"(images and text)"}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col items-center justify-between h-full w-full max-w-3xl mx-auto">
        {messages.length > 0 ? (
          <div className="flex flex-col gap-2 h-full w-dvw items-center overflow-y-scroll">
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                className={`flex flex-col w-full max-w-3xl px-4 ${index === 0 ? "pt-24" : "pt-2"
                  } pb-2`}
                initial={{ y: 5, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
              >
                <div className={`flex w-full ${message.role === "assistant" ? "justify-start" : "justify-end"}`}>
                  <div
                    className={`max-w-[85%] md:max-w-[75%] p-4 rounded-2xl shadow-sm ${message.role === "assistant"
                      ? "bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700/50 text-zinc-800 dark:text-zinc-200 rounded-tl-none"
                      : "bg-indigo-600 text-white rounded-tr-none"
                      }`}
                  >
                    <div className="text-[15px] leading-relaxed">
                      <Markdown>{message.content}</Markdown>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {isLoading &&
              messages[messages.length - 1].role !== "assistant" && (
                <div className="flex flex-row gap-2 px-4 w-full md:w-[500px] md:px-0">
                  <div className="size-[24px] flex flex-col justify-center items-center flex-shrink-0 text-zinc-400">
                    <BotIcon />
                  </div>
                  <div className="flex flex-col gap-1 text-zinc-400">
                    <div>hmm...</div>
                  </div>
                </div>
              )}

            <div ref={messagesEndRef} />
          </div>
        ) : (
          <motion.div className="h-[350px] px-4 w-full md:w-[500px] md:px-0 pt-20">
            <div className="border rounded-lg p-6 flex flex-col gap-4 text-zinc-500 text-sm dark:text-zinc-400 dark:border-zinc-700">
              <p className="flex flex-row justify-center gap-4 items-center text-zinc-900 dark:text-zinc-50">
                Code Legalist
              </p>
              <p>
                Your assistant for Indian laws. Ask about rights, statutes, or cases. Note: This is general info, not legal advice. Verify details or consult a lawyer.
              </p>
            </div>
          </motion.div>
        )}

        <form
          className="flex flex-col gap-2 relative items-center"
          onSubmit={handleFormSubmit}
        >
          <AnimatePresence>
            {files && files.length > 0 && (
              <div className="flex flex-row gap-2 absolute bottom-12 px-4 w-full md:w-[500px] md:px-0">
                {Array.from(files).map((file) =>
                  file.type.startsWith("image") ? (
                    <div key={file.name}>
                      <motion.img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="rounded-md w-16"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{
                          y: -10,
                          scale: 1.1,
                          opacity: 0,
                          transition: { duration: 0.2 },
                        }}
                      />
                    </div>
                  ) : file.type.startsWith("text") ? (
                    <motion.div
                      key={file.name}
                      className="text-[8px] leading-1 w-28 h-16 overflow-hidden text-zinc-500 border p-2 rounded-lg bg-white dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-400"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{
                        y: -10,
                        scale: 1.1,
                        opacity: 0,
                        transition: { duration: 0.2 },
                      }}
                    >
                      <TextFilePreview file={file} />
                    </motion.div>
                  ) : null
                )}
              </div>
            )}
          </AnimatePresence>

          {/* Hidden file input */}
          <input
            type="file"
            multiple
            accept="image/*,text/*"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
          />

          <div className="flex items-center w-full md:max-w-[600px] max-w-[calc(100dvw-32px)] bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/50 shadow-inner rounded-2xl px-4 py-3">
            {/* Upload Button */}
            <button
              type="button"
              onClick={handleUploadClick}
              className="text-zinc-400 dark:text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mr-3"
              aria-label="Upload Files"
            >
              <AttachmentIcon />
            </button>

            {/* Message Input */}
            <input
              ref={inputRef}
              className="bg-transparent flex-grow outline-none text-zinc-800 dark:text-zinc-100 placeholder-zinc-500"
              placeholder="How can I help with your legal matter?"
              value={input}
              onChange={handleInputChange}
              onPaste={handlePaste}
            />
          </div>
        </form>
      </div>
    </div>
  );
}
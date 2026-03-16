"use client";

import { useState, useRef, useCallback } from "react";
import { Send, Loader2 } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled: boolean;
  placeholder?: string;
  isTyping?: boolean;
  suggestions?: string[];
}

export default function ChatInput({
  onSend,
  disabled,
  placeholder = "Ask a question about your data...",
  isTyping = false,
  suggestions = [],
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setInput("");
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }
  }, [input, disabled, onSend]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  return (
    <div className="flex flex-col gap-2">
      {/* Typing indicator */}
      {isTyping && (
        <div className="flex items-center gap-2 px-2">
          <div className="flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 shadow-sm backdrop-blur-sm border border-indigo-100">
            <span className="typing-dot" />
            <span className="typing-dot" />
            <span className="typing-dot" />
            <span className="ml-1.5 text-xs text-muted-foreground">Analyzing...</span>
          </div>
        </div>
      )}

      {/* Suggestion chips */}
      {suggestions.length > 0 && !input.trim() && !isTyping && (
        <div className="flex flex-wrap gap-2 px-1">
          {suggestions.slice(0, 3).map((s) => (
            <button
              key={s}
              onClick={() => {
                setInput(s);
                inputRef.current?.focus();
              }}
              className="rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 transition-all hover:bg-indigo-100 hover:scale-[1.02]"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="glass-card flex items-end gap-3 rounded-2xl p-3 shadow-lg shadow-indigo-100/40 transition-all focus-within:ring-2 focus-within:ring-indigo-400/30">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            e.target.style.height = "auto";
            e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground/70 disabled:cursor-not-allowed disabled:opacity-50"
        />
        <button
          onClick={handleSend}
          disabled={disabled || !input.trim()}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white transition-all hover:scale-105 hover:shadow-md hover:shadow-indigo-200 disabled:opacity-40 disabled:hover:scale-100"
        >
          {disabled ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}

"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Send, Loader2, Mic, MicOff } from "lucide-react";

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
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = "";
        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        setInput((prev) => {
          // Replace interim text with final + new interim
          const base = prev.replace(/\u200B.*$/, ""); // remove previous interim marker
          if (finalTranscript) {
            return base + finalTranscript;
          }
          if (interimTranscript) {
            return base + "\u200B" + interimTranscript;
          }
          return prev;
        });

        // Auto-resize textarea
        if (inputRef.current) {
          inputRef.current.style.height = "auto";
          inputRef.current.style.height =
            Math.min(inputRef.current.scrollHeight, 120) + "px";
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        // Clean up interim markers
        setInput((prev) => prev.replace(/\u200B/g, ""));
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      // Clean any leftover interim markers before starting
      setInput((prev) => prev.replace(/\u200B/g, ""));
      recognitionRef.current.start();
      setIsListening(true);
      inputRef.current?.focus();
    }
  }, [isListening]);

  const handleSend = useCallback(() => {
    // Stop listening when sending
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const trimmed = input.replace(/\u200B/g, "").trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setInput("");
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }
  }, [input, disabled, onSend, isListening]);

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

      {/* Listening indicator */}
      {isListening && (
        <div className="flex items-center gap-2 px-2">
          <div className="flex items-center gap-2 rounded-full bg-red-50 px-3 py-1.5 shadow-sm border border-red-200">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
            </span>
            <span className="text-xs font-medium text-red-600">Listening... speak now</span>
          </div>
        </div>
      )}

      {/* Input area */}
      <div className={`glass-card flex items-end gap-3 rounded-2xl p-3 shadow-lg shadow-indigo-100/40 transition-all focus-within:ring-2 focus-within:ring-indigo-400/30 ${isListening ? "ring-2 ring-red-300/50" : ""}`}>
        <textarea
          ref={inputRef}
          value={input.replace(/\u200B/g, "")}
          onChange={(e) => {
            setInput(e.target.value);
            e.target.style.height = "auto";
            e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
          }}
          onKeyDown={handleKeyDown}
          placeholder={isListening ? "Listening..." : placeholder}
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground/70 disabled:cursor-not-allowed disabled:opacity-50"
        />

        {/* Voice input button */}
        {speechSupported && (
          <button
            onClick={toggleListening}
            disabled={disabled}
            title={isListening ? "Stop listening" : "Voice input"}
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all hover:scale-105 disabled:opacity-40 disabled:hover:scale-100 ${
              isListening
                ? "bg-red-500 text-white shadow-md shadow-red-200 animate-pulse"
                : "bg-gray-100 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600"
            }`}
          >
            {isListening ? (
              <MicOff className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </button>
        )}

        <button
          onClick={handleSend}
          disabled={disabled || !input.replace(/\u200B/g, "").trim()}
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

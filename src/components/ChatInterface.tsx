
import React, { useState, useRef, useEffect } from 'react';
import { useChat, Message } from '@/context/ChatContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Send, Sparkles } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import MessageBubble from './MessageBubble';
import { cn } from '@/lib/utils';

export default function ChatInterface() {
  const { messages, isLoading, sendMessage, clearChat } = useChat();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    await sendMessage(input);
    setInput('');
  };
  
  const messageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { 
        delay: i * 0.1,
        duration: 0.3,
        ease: "easeOut"
      }
    })
  };
  
  return (
    <div className="flex flex-col w-full h-full overflow-hidden pt-16">
      {/* Welcome message */}
      {messages.length === 0 && (
        <motion.div 
          className="flex flex-col items-center justify-center flex-grow px-4 py-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <motion.div 
            className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.5 }}
          >
            <Sparkles className="w-10 h-10 text-primary" />
          </motion.div>
          <motion.h2 
            className="text-2xl font-bold mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Welcome to SwapSays
          </motion.h2>
          <motion.p 
            className="text-muted-foreground max-w-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            I'm here to assist with your questions. Try asking me something!
          </motion.p>
        </motion.div>
      )}
      
      {/* Messages */}
      {messages.length > 0 && (
        <motion.div 
          className="flex-grow overflow-y-auto p-4 pb-16 space-y-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <AnimatePresence>
            {messages.map((message, i) => (
              <MessageBubble 
                key={message.id} 
                message={message} 
                isLastMessage={i === messages.length - 1} 
              />
            ))}
          </AnimatePresence>
          
          {/* Loading indicator */}
          {isLoading && (
            <motion.div 
              className="flex items-start gap-2 max-w-[80%] md:max-w-[70%]"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                <Bot size={16} />
              </div>
              <div className="rounded-2xl rounded-tl-none px-4 py-3 text-sm bg-muted text-foreground">
                <div className="flex space-x-1 items-center h-5">
                  <div className="w-2 h-2 rounded-full bg-current animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 rounded-full bg-current animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 rounded-full bg-current animate-bounce"></div>
                </div>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </motion.div>
      )}
      
      {/* Input form */}
      <motion.div 
        className="p-4 border-t bg-background/80 backdrop-blur-sm"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 30 }}
      >
        <form onSubmit={handleSubmit} className="flex gap-2 items-center">
          {messages.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={clearChat}
              className="rounded-full flex-shrink-0"
              title="Clear chat"
            >
              <Trash2 size={18} />
              <span className="sr-only">Clear chat</span>
            </Button>
          )}
          
          <div className="relative flex-grow">
            <Input
              ref={inputRef}
              type="text"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className={cn(
                "pr-12 py-6 bg-muted border-none transition-all duration-200",
                "focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-primary/50",
                "rounded-full"
              )}
              disabled={isLoading}
            />
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              className={cn(
                "absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full",
                "bg-primary text-primary-foreground hover:bg-primary/90",
                "transition-all duration-200",
                "disabled:opacity-50"
              )}
              disabled={!input.trim() || isLoading}
            >
              <Send size={16} />
              <span className="sr-only">Send</span>
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// Helper component for the Bot icon
function Bot({ size = 24 }: { size?: number }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M12 8V4H8" />
      <rect width="16" height="12" x="4" y="8" rx="2" />
      <path d="M2 14h2" />
      <path d="M20 14h2" />
      <path d="M15 13v2" />
      <path d="M9 13v2" />
    </svg>
  );
}

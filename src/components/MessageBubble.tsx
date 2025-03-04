
import { Message } from '@/context/ChatContext';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Bot, User } from 'lucide-react';

type MessageBubbleProps = {
  message: Message;
  isLastMessage: boolean;
};

export default function MessageBubble({ message, isLastMessage }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  
  return (
    <motion.div
      className={cn(
        "flex w-full mb-4 max-w-full",
        isUser ? "justify-end" : "justify-start"
      )}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className={cn(
        "flex items-start gap-2 max-w-[80%] md:max-w-[70%]",
        isUser ? "flex-row-reverse" : "flex-row"
      )}>
        <div className={cn(
          "flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted"
        )}>
          {isUser ? <User size={16} /> : <Bot size={16} />}
        </div>
        
        <div className={cn(
          "rounded-2xl px-4 py-3 text-sm",
          isUser 
            ? "bg-primary text-primary-foreground rounded-tr-none" 
            : "bg-muted text-foreground rounded-tl-none",
          isLastMessage && isUser && "animate-bounce-in",
          isLastMessage && !isUser && "animate-bounce-in"
        )}>
          <div className="whitespace-pre-wrap break-words">{message.content}</div>
          <div className={cn(
            "text-xs mt-1 opacity-70 text-right",
            isUser ? "text-primary-foreground" : "text-muted-foreground"
          )}>
            {new Intl.DateTimeFormat('en-US', {
              hour: '2-digit',
              minute: '2-digit',
            }).format(message.timestamp)}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

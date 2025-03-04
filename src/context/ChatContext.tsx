
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { generateGeminiResponse } from '@/lib/gemini';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { v4 as uuidv4 } from 'uuid';

export type Message = {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
};

type ChatContextType = {
  messages: Message[];
  isLoading: boolean;
  sendMessage: (content: string) => Promise<void>;
  clearChat: () => void;
  sessionId: string;
  resetSession: () => void;
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Function to get or create a session ID
const getOrCreateSessionId = (): string => {
  let sessionId = localStorage.getItem('chat_session_id');
  if (!sessionId) {
    sessionId = uuidv4();
    localStorage.setItem('chat_session_id', sessionId);
  }
  return sessionId;
};

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [sessionId, setSessionId] = useState<string>(getOrCreateSessionId());
  const { user } = useAuth();

  // Function to reset session
  const resetSession = () => {
    const newSessionId = uuidv4();
    localStorage.setItem('chat_session_id', newSessionId);
    setSessionId(newSessionId);
    setMessages([]);
  };

  // Load messages from Supabase on initial render or when user/session changes
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('session_id', sessionId)
          .order('created_at', { ascending: true });
        
        if (error) {
          console.error('Error fetching messages:', error);
          return;
        }

        if (data && data.length > 0) {
          // Convert created_at timestamps to Date objects
          const formattedMessages = data.map(msg => ({
            id: msg.id,
            content: msg.content,
            role: msg.role as 'user' | 'assistant',
            timestamp: new Date(msg.created_at)
          }));
          
          setMessages(formattedMessages);
        } else {
          setMessages([]);
        }
      } catch (error) {
        console.error('Failed to fetch messages:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    fetchMessages();

    // Subscribe to realtime messages for the current session
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `session_id=eq.${sessionId}`
        },
        (payload) => {
          console.log('Realtime update received:', payload);
          if (payload.eventType === 'INSERT') {
            const newMessage = payload.new;
            setMessages(prev => {
              // Check if we already have this message
              if (prev.some(msg => msg.id === newMessage.id)) {
                return prev;
              }
              return [...prev, {
                id: newMessage.id,
                content: newMessage.content,
                role: newMessage.role,
                timestamp: new Date(newMessage.created_at)
              }];
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, sessionId]);

  const saveMessageToSupabase = async (message: { content: string; role: 'user' | 'assistant' }) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([
          {
            content: message.content,
            role: message.role,
            user_id: user?.id,
            session_id: sessionId
          }
        ])
        .select();

      if (error) {
        console.error('Error saving message to Supabase:', error);
        throw error;
      }

      return data[0];
    } catch (error) {
      console.error('Failed to save message:', error);
      throw error;
    }
  };

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;
    
    setIsLoading(true);
    
    try {
      // Save user message to Supabase
      const savedUserMessage = await saveMessageToSupabase({
        content,
        role: 'user',
      });
      
      // Generate AI response
      const response = await generateGeminiResponse(content);
      
      // Save assistant message to Supabase
      await saveMessageToSupabase({
        content: response,
        role: 'assistant',
      });
    } catch (error) {
      console.error('Error in message flow:', error);
      toast.error('Failed to send or receive message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const clearChat = async () => {
    try {
      // Delete all messages from the current session in Supabase
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('session_id', sessionId);
        
      if (error) {
        console.error('Error clearing messages from Supabase:', error);
        throw error;
      }
      
      setMessages([]);
      toast.success('Chat history cleared');
    } catch (error) {
      console.error('Failed to clear chat history:', error);
      toast.error('Failed to clear chat history. Please try again.');
    }
  };
  
  return (
    <ChatContext.Provider
      value={{
        messages,
        isLoading,
        sendMessage,
        clearChat,
        sessionId,
        resetSession,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

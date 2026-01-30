'use client';

import { useState, useTransition, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetDescription } from '@/components/ui/sheet';
import { Send, Loader2, Bot, User, MessageCircle, Volume2, VolumeX, Mic } from 'lucide-react';
import { chat, type ChatOutput } from '@/ai/flows/chat-flow';
import type { ChatInput } from '@/ai/flows/chat-types';
import type { Product } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import ChatProductCard from './chat-product-card';
import { useLanguage } from '@/context/language-context';
import { useToast } from '@/hooks/use-toast';

type Message = {
  role: 'user' | 'model';
  content: string;
  products?: Product[];
};

// Define SpeechRecognition type for window
interface IWindow extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

const AUTO_SEND_DELAY = 1000; // 1 second

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTtsEnabled, setIsTtsEnabled] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [isListening, setIsListening] = useState(false);
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const autoSendTimerRef = useRef<NodeJS.Timeout | null>(null);

  const { language } = useLanguage();
  const { toast } = useToast();

  const t = (key: 'GREETING' | 'AI_ASSISTANT' | 'ASSISTANT_DESCRIPTION' | 'THINKING' | 'PLACEHOLDER' | 'LISTENING') => {
      const translations = {
          GREETING: { en: "Hi! I'm REVO, your friendly marketplace assistant. How can I help you today?", hi: "नमस्ते! मैं रेवो हूँ, आपका मार्केटप्लेस सहायक। मैं आज आपकी क्या मदद कर सकता हूँ?" },
          AI_ASSISTANT: { en: 'AI Assistant', hi: 'एआई सहायक' },
          ASSISTANT_DESCRIPTION: { en: 'Your guide to the REVO marketplace.', hi: 'रेवो मार्केटप्लेस के लिए आपका गाइड।' },
          THINKING: { en: 'Thinking...', hi: 'सोच रहा हूँ...'},
          PLACEHOLDER: { en: 'Ask me anything...', hi: 'कुछ भी पूछें...'},
          LISTENING: { en: 'Listening...', hi: 'सुन रहा हूँ...'},
      }
      return translations[key][language];
  }

  // --- Core Message Sending Logic ---
  const handleSendMessage = useCallback((e?: React.FormEvent, messageContent?: string) => {
    if (e) e.preventDefault();
    
    const content = (messageContent || input).trim();
    if (!content || isPending) return;

    if (recognitionRef.current) recognitionRef.current.stop();
    window.speechSynthesis.cancel();
    
    if(autoSendTimerRef.current) clearTimeout(autoSendTimerRef.current);
    autoSendTimerRef.current = null;

    const userMessage: Message = { role: 'user', content };
    const currentMessages = [...messages, userMessage];
    setMessages(currentMessages);
    setInput('');

    startTransition(async () => {
      try {
        const chatInput: ChatInput = {
          history: currentMessages.filter(m => m.role !== 'model' || !m.content.startsWith('Sorry')).map(m => ({role: m.role, content: m.content})),
          message: content,
          language: language,
        };
        const result: ChatOutput = await chat(chatInput);
        const modelMessage: Message = { 
            role: 'model', 
            content: result.response,
            products: result.products
        };
        setMessages(prev => [...prev, modelMessage]);
      } catch (error: any) {
        const errorMessage: Message = { role: 'model', content: `Sorry, something went wrong: ${error.message}` };
        setMessages(prev => [...prev, errorMessage]);
      }
    });
  }, [input, isPending, messages, language]);

  const handleSendMessageRef = useRef(handleSendMessage);
  useEffect(() => {
    handleSendMessageRef.current = handleSendMessage;
  }, [handleSendMessage]);

  // --- Speech Recognition Setup ---
  useEffect(() => {
    const SpeechRecognition = (window as IWindow).SpeechRecognition || (window as IWindow).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language === 'hi' ? 'hi-IN' : 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => {
        setIsListening(false);
        const currentInput = (document.getElementById('chat-input') as HTMLInputElement)?.value;
        if (autoSendTimerRef.current) {
            clearTimeout(autoSendTimerRef.current);
            autoSendTimerRef.current = null;
        }
        if (currentInput && currentInput.trim()) {
            handleSendMessageRef.current(undefined, currentInput);
        }
    };
    recognition.onerror = (event: any) => {
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        toast({
          variant: "destructive",
          title: "Microphone permission denied",
          description: "Please allow microphone access in your browser settings to use voice input."
        })
      }
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        finalTranscript += event.results[i][0].transcript;
      }
      setInput(finalTranscript);
      
      if (autoSendTimerRef.current) clearTimeout(autoSendTimerRef.current);
      autoSendTimerRef.current = setTimeout(() => {
        recognition.stop();
      }, AUTO_SEND_DELAY);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (autoSendTimerRef.current) {
          clearTimeout(autoSendTimerRef.current);
      }
    };
  }, [language, toast]);

  // --- Mic Button Handler ---
  const handleMicClick = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setInput('');
      try {
        recognitionRef.current?.start();
      } catch(e) {
        console.error("Could not start recognition:", e);
      }
    }
  };

  // --- Effects for UI and Media ---
  useEffect(() => {
    if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({
            top: scrollAreaRef.current.scrollHeight,
            behavior: 'smooth'
        });
    }
  }, [messages]);

  useEffect(() => {
    if (isTtsEnabled && messages.length > 0 && !isListening) {
        const lastMessage = messages[messages.length - 1];
        if (lastMessage.role === 'model') {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(lastMessage.content);
            utterance.lang = language === 'hi' ? 'hi-IN' : 'en-US';
            window.speechSynthesis.speak(utterance);
        }
    }
  }, [messages, isTtsEnabled, language, isListening]);
  
  useEffect(() => {
      if (!isOpen) {
          window.speechSynthesis.cancel();
          if (recognitionRef.current) recognitionRef.current.stop();
      }
  }, [isOpen]);

  const formSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      handleSendMessageRef.current();
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          size="icon"
          className="fixed bottom-24 right-4 h-14 w-14 rounded-full shadow-lg z-50 animate-pulse-glow bg-primary hover:bg-primary/90"
        >
          <MessageCircle className="h-7 w-7" />
          <span className="sr-only">Open AI Chat</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col p-0">
        <SheetHeader className="p-6 pb-4">
          <div className="flex justify-between items-center">
            <div>
                <SheetTitle>{t('AI_ASSISTANT')}</SheetTitle>
                <SheetDescription>
                    {t('ASSISTANT_DESCRIPTION')}
                </SheetDescription>
            </div>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                         <Button variant="ghost" size="icon" onClick={() => setIsTtsEnabled(prev => !prev)}>
                            {isTtsEnabled ? <Volume2 className="h-5 w-5 text-primary" /> : <VolumeX className="h-5 w-5 text-muted-foreground" />}
                            <span className="sr-only">{isTtsEnabled ? 'Disable' : 'Enable'} voice</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{isTtsEnabled ? 'Disable' : 'Enable'} voice output</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
          </div>
        </SheetHeader>
        <ScrollArea className="flex-1 px-6" viewportRef={scrollAreaRef}>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
                <Avatar>
                    <AvatarFallback><Bot /></AvatarFallback>
                </Avatar>
                <div className="max-w-[75%] p-3 rounded-lg bg-muted">
                    <p>{t('GREETING')}</p>
                </div>
            </div>
            {messages.map((message, index) => (
                <div key={index} className={cn("flex items-start gap-4", message.role === 'user' ? 'justify-end' : '')}>
                    {message.role === 'model' && (
                        <Avatar>
                            <AvatarFallback><Bot /></AvatarFallback>
                        </Avatar>
                    )}
                    <div className={cn(
                        "max-w-[75%] rounded-lg", 
                        message.role === 'user' 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-muted"
                    )}>
                        <div className="p-3">
                            <ReactMarkdown className="prose prose-sm dark:prose-invert max-w-none">
                                {message.content}
                            </ReactMarkdown>
                        </div>
                        {message.products && message.products.length > 0 && (
                            <div className="px-3 pt-1 pb-3 border-t border-background/50">
                                <div className="flex gap-3 -mx-3 px-3 overflow-x-auto pb-2">
                                    {message.products.map(product => (
                                        <ChatProductCard key={product.id} product={product} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                      {message.role === 'user' && (
                        <Avatar>
                            <AvatarFallback><User /></AvatarFallback>
                        </Avatar>
                    )}
                </div>
            ))}
            {isPending && (
                  <div className="flex items-start gap-4">
                    <Avatar>
                        <AvatarFallback><Bot /></AvatarFallback>
                    </Avatar>
                    <div className="max-w-[75%] p-3 rounded-lg bg-muted flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{t('THINKING')}</span>
                    </div>
                </div>
            )}
          </div>
        </ScrollArea>
        <SheetFooter className="p-4 border-t bg-background">
          <form onSubmit={formSubmit} className="flex items-center gap-2 w-full">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button type="button" variant="ghost" size="icon" onClick={handleMicClick} disabled={isPending}>
                            <Mic className={cn("h-5 w-5", isListening && "text-primary animate-pulse")} />
                            <span className="sr-only">Use microphone</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Use microphone</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
            <Input
                id="chat-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isListening ? t('LISTENING') : t('PLACEHOLDER')}
                className="flex-1"
                disabled={isPending}
            />
            <Button type="submit" size="icon" disabled={isPending || !input.trim()}>
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                <span className="sr-only">Send</span>
            </Button>
          </form>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

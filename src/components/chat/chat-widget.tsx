'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetDescription } from '@/components/ui/sheet';
import { Send, Loader2, Bot, User, MessageCircle, Volume2, VolumeX } from 'lucide-react';
import { chat, type ChatOutput } from '@/ai/flows/chat-flow';
import type { ChatInput } from '@/ai/flows/chat-types';
import type { Product } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import ChatProductCard from './chat-product-card';

type Message = {
  role: 'user' | 'model';
  content: string;
  products?: Product[];
};

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTtsEnabled, setIsTtsEnabled] = useState(true);
  const [isPending, startTransition] = useTransition();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({
            top: scrollAreaRef.current.scrollHeight,
            behavior: 'smooth'
        });
    }
  }, [messages]);

  useEffect(() => {
    if (isTtsEnabled && messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        if (lastMessage.role === 'model') {
            window.speechSynthesis.cancel(); // Stop any previous speech
            const utterance = new SpeechSynthesisUtterance(lastMessage.content);
            window.speechSynthesis.speak(utterance);
        }
    }
  }, [messages, isTtsEnabled]);
  
  useEffect(() => {
      if (!isOpen) {
          window.speechSynthesis.cancel();
      }
  }, [isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isPending) return;

    const userMessage: Message = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    const currentInput = input;
    setInput('');

    startTransition(async () => {
      try {
        const chatInput: ChatInput = {
          history: messages.map(m => ({role: m.role, content: m.content})),
          message: currentInput,
        };
        const result: ChatOutput = await chat(chatInput);
        const modelMessage: Message = { 
            role: 'model', 
            content: result.response,
            products: result.products
        };
        setMessages([...newMessages, modelMessage]);
      } catch (error: any) {
        const errorMessage: Message = { role: 'model', content: `Sorry, something went wrong: ${error.message}` };
        setMessages([...newMessages, errorMessage]);
      }
    });
  };

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
                <SheetTitle>AI Assistant</SheetTitle>
                <SheetDescription>
                    Your guide to the REVO marketplace.
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
                    <p>Hi! I'm REVO, your friendly marketplace assistant. How can I help you today?</p>
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
                      <span>Thinking...</span>
                    </div>
                </div>
            )}
          </div>
        </ScrollArea>
        <SheetFooter className="p-4 border-t bg-background">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2 w-full">
            <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
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

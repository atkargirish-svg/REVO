'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetDescription } from '@/components/ui/sheet';
import { Send, Loader2, Bot, User, MessageCircle } from 'lucide-react';
import { chat } from '@/ai/flows/chat-flow';
import type { ChatInput } from '@/ai/flows/chat-types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';

type Message = {
  role: 'user' | 'model';
  content: string;
};

export default function ChatWidget() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
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
        const result = await chat(chatInput);
        const modelMessage: Message = { role: 'model', content: result.response };
        setMessages([...newMessages, modelMessage]);
      } catch (error: any) {
        const errorMessage: Message = { role: 'model', content: `Sorry, something went wrong: ${error.message}` };
        setMessages([...newMessages, errorMessage]);
      }
    });
  };

  return (
    <Sheet>
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
          <SheetTitle>AI Assistant</SheetTitle>
          <SheetDescription>
            I am REVO, an AI assistant created by Atharva Atkar. Ask me anything about the products!
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="flex-1 px-6" viewportRef={scrollAreaRef}>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
                <Avatar>
                    <AvatarFallback><Bot /></AvatarFallback>
                </Avatar>
                <div className="max-w-[75%] p-3 rounded-lg bg-muted">
                    <p>Hi! I'm REVO, your AI assistant. I was created by Atharva Atkar from Suryodaya College of Engineering, Nagpur. Ask me anything about the products on this platform!</p>
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
                        "max-w-[75%] p-3 rounded-lg", 
                        message.role === 'user' 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-muted"
                    )}>
                        <ReactMarkdown className="prose prose-sm dark:prose-invert max-w-none">
                            {message.content}
                        </ReactMarkdown>
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

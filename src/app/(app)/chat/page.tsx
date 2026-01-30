'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
import { PageTransitionWrapper } from '@/components/page-transition-wrapper';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Loader2, Bot, User } from 'lucide-react';
import { chat, type ChatInput } from '@/ai/flows/chat-flow';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';

type Message = {
  role: 'user' | 'model';
  content: string;
};

export default function ChatPage() {
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
    setInput('');

    startTransition(async () => {
      try {
        const chatInput: ChatInput = {
          history: messages.map(m => ({role: m.role, content: m.content})),
          message: input,
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
    <PageTransitionWrapper className="container py-10 h-[calc(100vh-150px)] flex flex-col">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold font-headline">AI Chat</h1>
            <p className="text-lg text-muted-foreground mt-2">Chat with Gemini 1.5 Pro</p>
        </div>
        <div className="flex-1 flex flex-col border rounded-lg bg-card overflow-hidden">
            <ScrollArea className="flex-1 p-4" viewportRef={scrollAreaRef}>
                <div className="space-y-6">
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
            <div className="p-4 border-t bg-background">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
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
            </div>
        </div>
    </PageTransitionWrapper>
  );
}

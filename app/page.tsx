'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface Message {
  content: string;
  isAI: boolean;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [scrollAreaRef]); //Corrected dependency

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    setIsLoading(true);
    setError(null);

    const userMessage: Message = { content: inputMessage, isAI: false };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: inputMessage }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const aiMessage: Message = { content: data.aiResponse, isAI: true };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error fetching AI response:', error);
      setError(
        error instanceof Error ? error.message : 'An unknown error occurred'
      );
    } finally {
      setIsLoading(false);
      setInputMessage('');
    }
  };

  return (
    <div className='flex flex-col h-screen max-w-2xl mx-auto p-4'>
      <Card className='flex-grow mb-4 overflow-hidden'>
        <CardContent className='p-0 h-full'>
          <ScrollArea className='h-full p-4' ref={scrollAreaRef}>
            {messages.length === 0 && (
              <div className='text-center text-muted-foreground p-4'>
                Start a conversation by typing a message below.
              </div>
            )}
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.isAI ? 'justify-start' : 'justify-end'
                } mb-4`}
              >
                <div
                  className={`flex items-start gap-2.5 ${
                    message.isAI ? 'flex-row' : 'flex-row-reverse'
                  }`}
                >
                  <Avatar
                    className={message.isAI ? 'bg-blue-500' : 'bg-green-500'}
                  >
                    <AvatarFallback>
                      {message.isAI ? 'AI' : 'You'}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`flex flex-col w-full max-w-[320px] leading-1.5 p-4 border-gray-200 ${
                      message.isAI ? 'bg-gray-100' : 'bg-blue-500 text-white'
                    } rounded-e-xl rounded-es-xl`}
                  >
                    <p className='text-sm font-normal'>{message.content}</p>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className='flex justify-start mb-4'>
                <div className='flex items-start gap-2.5'>
                  <Avatar className='bg-blue-500'>
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                  <div className='flex flex-col w-full max-w-[320px] leading-1.5 p-4 border-gray-200 bg-gray-100 rounded-e-xl rounded-es-xl'>
                    <div className='flex items-center gap-2'>
                      <Loader2 className='h-4 w-4 animate-spin' />
                      <p className='text-sm font-normal'>AI is thinking...</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
      {error && (
        <Alert variant='destructive' className='mb-4'>
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <form onSubmit={handleSubmit} ref={formRef} className='flex gap-2'>
        <Input
          type='text'
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder='Type your message...'
          className='flex-grow'
          disabled={isLoading}
        />
        <Button type='submit' disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Sending
            </>
          ) : (
            'Send'
          )}
        </Button>
      </form>
    </div>
  );
}

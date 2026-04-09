import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Send, Bot, User } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const AIHelper = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'AI Helper requires Lovable Cloud to be enabled for full AI capabilities. Once enabled, I can help you manage consignments, analyze data, and make changes across all sections. Please enable Lovable Cloud to activate this feature.'
      }]);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="p-6 flex flex-col h-[calc(100vh-2rem)]">
      <h1 className="page-header">AI Helper</h1>

      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <Bot className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-semibold">ADO AI Assistant</p>
            <p className="text-sm">Ask me anything about your consignments, loading lists, containers, or tracking.</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4 text-accent-foreground" />
              </div>
            )}
            <Card className={`max-w-[70%] ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : ''}`}>
              <CardContent className="p-3 text-sm">{msg.content}</CardContent>
            </Card>
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                <User className="h-4 w-4" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center"><Bot className="h-4 w-4 text-accent-foreground" /></div>
            <Card><CardContent className="p-3 text-sm text-muted-foreground">Thinking...</CardContent></Card>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Ask anything..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1"
        />
        <Button onClick={handleSend} disabled={loading}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default AIHelper;

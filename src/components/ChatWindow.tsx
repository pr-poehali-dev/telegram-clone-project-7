import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { Chat } from '@/pages/Index';

interface ChatWindowProps {
  chat: Chat;
  onClose: () => void;
  onVideoCall: () => void;
}

export default function ChatWindow({ chat, onClose, onVideoCall }: ChatWindowProps) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim()) {
      setMessage('');
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-background">
      <div className="h-16 px-6 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden">
            <Icon name="ArrowLeft" size={20} />
          </Button>
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xl">
            {chat.avatar}
          </div>
          <div>
            <h3 className="font-semibold">{chat.name}</h3>
            <p className="text-xs text-muted-foreground">
              {chat.online ? 'в сети' : 'был(а) недавно'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="hover:bg-muted">
            <Icon name="Phone" size={20} />
          </Button>
          <Button variant="ghost" size="icon" className="hover:bg-muted" onClick={onVideoCall}>
            <Icon name="Video" size={20} />
          </Button>
          <Button variant="ghost" size="icon" className="hover:bg-muted">
            <Icon name="MoreVertical" size={20} />
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {chat.messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'} animate-fade-in`}
          >
            <div
              className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                msg.sender === 'me'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground'
              }`}
            >
              {msg.type === 'text' && <p className="break-words">{msg.text}</p>}
              
              {msg.type === 'image' && msg.imageUrl && (
                <div className="space-y-2">
                  {msg.text && <p className="break-words">{msg.text}</p>}
                  <img 
                    src={msg.imageUrl} 
                    alt="Изображение" 
                    className="rounded-lg max-w-full"
                  />
                </div>
              )}
              
              {msg.type === 'voice' && (
                <div className="flex items-center gap-3 min-w-[200px]">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                    <Icon name="Play" size={16} />
                  </Button>
                  <div className="flex-1 h-1 bg-primary-foreground/20 rounded-full">
                    <div className="h-full w-2/3 bg-primary-foreground/60 rounded-full"></div>
                  </div>
                  <span className="text-xs">{msg.duration}</span>
                </div>
              )}
              
              <p className="text-xs opacity-70 mt-1">{msg.timestamp}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="hover:bg-muted">
            <Icon name="Paperclip" size={20} />
          </Button>
          
          <Input
            placeholder="Написать сообщение..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1"
          />
          
          <Button variant="ghost" size="icon" className="hover:bg-muted">
            <Icon name="Smile" size={20} />
          </Button>
          
          {message.trim() ? (
            <Button onClick={handleSend} size="icon" className="bg-primary text-primary-foreground">
              <Icon name="Send" size={20} />
            </Button>
          ) : (
            <Button variant="ghost" size="icon" className="hover:bg-muted">
              <Icon name="Mic" size={20} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

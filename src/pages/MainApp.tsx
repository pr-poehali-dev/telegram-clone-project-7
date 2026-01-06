import { useState, useEffect } from 'react';
import ChatList from '@/components/ChatList';
import ChatWindow from '@/components/ChatWindow';
import Sidebar from '@/components/Sidebar';
import VideoCall from '@/components/VideoCall';
import { getChats, getMessages, sendMessage, type Chat as APIChat, type Message as APIMessage, type User } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface DisplayChat {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  online: boolean;
  messages: DisplayMessage[];
}

interface DisplayMessage {
  id: string;
  text: string;
  sender: 'me' | 'other';
  timestamp: string;
  type: 'text' | 'image' | 'voice';
  imageUrl?: string;
  duration?: string;
}

export default function MainApp() {
  const [activeSection, setActiveSection] = useState<'chats' | 'contacts' | 'settings' | 'profile'>('chats');
  const [selectedChat, setSelectedChat] = useState<DisplayChat | null>(null);
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [chats, setChats] = useState<DisplayChat[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}') as User;

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Вчера';
    } else {
      return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
    }
  };

  const convertAPIMessageToDisplay = (msg: APIMessage): DisplayMessage => {
    return {
      id: msg.id.toString(),
      text: msg.message_text,
      sender: msg.sender_id === currentUser.id ? 'me' : 'other',
      timestamp: formatTimestamp(msg.created_at),
      type: msg.message_type,
      imageUrl: msg.media_url,
      duration: msg.duration ? `${Math.floor(msg.duration / 60)}:${(msg.duration % 60).toString().padStart(2, '0')}` : undefined,
    };
  };

  const loadChats = async () => {
    try {
      const apiChats = await getChats();
      const displayChats: DisplayChat[] = apiChats.map(chat => ({
        id: chat.id.toString(),
        name: chat.name || 'Чат',
        avatar: '👤',
        lastMessage: chat.last_message || 'Нет сообщений',
        timestamp: chat.last_message_time ? formatTimestamp(chat.last_message_time) : '',
        unread: chat.unread_count || 0,
        online: false,
        messages: [],
      }));
      setChats(displayChats);
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить чаты',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (chatId: string) => {
    try {
      const apiMessages = await getMessages(parseInt(chatId));
      const displayMessages = apiMessages.map(convertAPIMessageToDisplay);
      
      setChats(prevChats =>
        prevChats.map(chat =>
          chat.id === chatId ? { ...chat, messages: displayMessages } : chat
        )
      );
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить сообщения',
        variant: 'destructive',
      });
    }
  };

  const handleSelectChat = async (chat: DisplayChat) => {
    setSelectedChat(chat);
    if (chat.messages.length === 0) {
      await loadMessages(chat.id);
    }
  };

  const handleSendMessage = async (chatId: string, text: string) => {
    try {
      await sendMessage(parseInt(chatId), text);
      await loadMessages(chatId);
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить сообщение',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    loadChats();
  }, []);

  const filteredChats = chats.filter(chat => 
    chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentChatWithMessages = selectedChat 
    ? chats.find(c => c.id === selectedChat.id) || selectedChat
    : null;

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans">
      <Sidebar 
        activeSection={activeSection} 
        onSectionChange={setActiveSection}
      />
      
      {isVideoCall ? (
        <VideoCall onClose={() => setIsVideoCall(false)} chatName={selectedChat?.name || 'Видеозвонок'} />
      ) : (
        <div className="flex flex-1">
          <ChatList 
            chats={filteredChats}
            selectedChat={currentChatWithMessages}
            onSelectChat={handleSelectChat}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
          
          {currentChatWithMessages ? (
            <ChatWindow 
              chat={currentChatWithMessages}
              onClose={() => setSelectedChat(null)}
              onVideoCall={() => setIsVideoCall(true)}
              onSendMessage={handleSendMessage}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-muted/30">
              <div className="text-center text-muted-foreground">
                <div className="text-6xl mb-4">💬</div>
                <p className="text-lg">Выберите чат, чтобы начать общение</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

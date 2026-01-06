import { useState } from 'react';
import ChatList from '@/components/ChatList';
import ChatWindow from '@/components/ChatWindow';
import Sidebar from '@/components/Sidebar';
import VideoCall from '@/components/VideoCall';

export interface Message {
  id: string;
  text: string;
  sender: 'me' | 'other';
  timestamp: string;
  type: 'text' | 'image' | 'voice';
  imageUrl?: string;
  duration?: string;
}

export interface Chat {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  online: boolean;
  messages: Message[];
}

export default function Index() {
  const [activeSection, setActiveSection] = useState<'chats' | 'contacts' | 'settings' | 'profile'>('chats');
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const mockChats: Chat[] = [
    {
      id: '1',
      name: 'Анна Смирнова',
      avatar: '👩‍💼',
      lastMessage: 'Отлично, встретимся завтра!',
      timestamp: '14:23',
      unread: 2,
      online: true,
      messages: [
        { id: '1', text: 'Привет! Как дела?', sender: 'other', timestamp: '14:20', type: 'text' },
        { id: '2', text: 'Отлично! А у тебя?', sender: 'me', timestamp: '14:21', type: 'text' },
        { id: '3', text: 'Тоже хорошо! Встретимся завтра?', sender: 'other', timestamp: '14:22', type: 'text' },
        { id: '4', text: 'Отлично, встретимся завтра!', sender: 'me', timestamp: '14:23', type: 'text' },
      ]
    },
    {
      id: '2',
      name: 'Команда Разработки',
      avatar: '👥',
      lastMessage: 'Релиз запланирован на пятницу',
      timestamp: '13:45',
      unread: 0,
      online: false,
      messages: [
        { id: '1', text: 'Всем привет! Обсудим новый релиз', sender: 'other', timestamp: '13:40', type: 'text' },
        { id: '2', text: 'Когда планируем?', sender: 'me', timestamp: '13:42', type: 'text' },
        { id: '3', text: 'Релиз запланирован на пятницу', sender: 'other', timestamp: '13:45', type: 'text' },
      ]
    },
    {
      id: '3',
      name: 'Дмитрий Петров',
      avatar: '👨‍💻',
      lastMessage: 'Посмотри скриншот',
      timestamp: '12:30',
      unread: 1,
      online: true,
      messages: [
        { id: '1', text: 'Привет, нужна твоя помощь', sender: 'other', timestamp: '12:25', type: 'text' },
        { id: '2', text: 'Конечно, что случилось?', sender: 'me', timestamp: '12:27', type: 'text' },
        { id: '3', text: 'Посмотри скриншот', sender: 'other', timestamp: '12:30', type: 'text' },
        { id: '4', text: '', sender: 'other', timestamp: '12:30', type: 'image', imageUrl: '/placeholder.svg' },
      ]
    },
    {
      id: '4',
      name: 'Мария Иванова',
      avatar: '👩‍🎨',
      lastMessage: 'Голосовое сообщение',
      timestamp: 'Вчера',
      unread: 0,
      online: false,
      messages: [
        { id: '1', text: 'Как тебе новый дизайн?', sender: 'other', timestamp: 'Вчера', type: 'text' },
        { id: '2', text: '', sender: 'other', timestamp: 'Вчера', type: 'voice', duration: '0:45' },
      ]
    },
    {
      id: '5',
      name: 'Новости Tech',
      avatar: '📱',
      lastMessage: 'Новая версия React уже доступна',
      timestamp: 'Вчера',
      unread: 5,
      online: false,
      messages: [
        { id: '1', text: 'Новая версия React уже доступна', sender: 'other', timestamp: 'Вчера', type: 'text' },
      ]
    }
  ];

  const filteredChats = mockChats.filter(chat => 
    chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            selectedChat={selectedChat}
            onSelectChat={setSelectedChat}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
          
          {selectedChat ? (
            <ChatWindow 
              chat={selectedChat}
              onClose={() => setSelectedChat(null)}
              onVideoCall={() => setIsVideoCall(true)}
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
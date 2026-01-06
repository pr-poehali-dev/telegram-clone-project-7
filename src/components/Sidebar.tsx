import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  activeSection: 'chats' | 'contacts' | 'settings' | 'profile';
  onSectionChange: (section: 'chats' | 'contacts' | 'settings' | 'profile') => void;
}

export default function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const menuItems = [
    { id: 'chats' as const, icon: 'MessageSquare', label: 'Чаты' },
    { id: 'contacts' as const, icon: 'Users', label: 'Контакты' },
    { id: 'profile' as const, icon: 'User', label: 'Профиль' },
    { id: 'settings' as const, icon: 'Settings', label: 'Настройки' },
  ];

  return (
    <div className="w-20 bg-primary flex flex-col items-center py-6 gap-4">
      <div className="mb-8">
        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-2xl">
          ✈️
        </div>
      </div>
      
      {menuItems.map((item) => (
        <Button
          key={item.id}
          variant="ghost"
          size="icon"
          onClick={() => onSectionChange(item.id)}
          className={`w-12 h-12 rounded-xl transition-all ${
            activeSection === item.id 
              ? 'bg-white text-primary hover:bg-white hover:text-primary' 
              : 'text-white hover:bg-white/20 hover:text-white'
          }`}
          title={item.label}
        >
          <Icon name={item.icon} size={24} />
        </Button>
      ))}
    </div>
  );
}

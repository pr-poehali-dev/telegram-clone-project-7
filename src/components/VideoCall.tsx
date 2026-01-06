import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface VideoCallProps {
  onClose: () => void;
  chatName: string;
}

export default function VideoCall({ onClose, chatName }: VideoCallProps) {
  return (
    <div className="flex-1 bg-gradient-to-br from-slate-900 to-slate-800 relative overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center text-white animate-fade-in">
          <div className="w-32 h-32 rounded-full bg-primary/20 flex items-center justify-center text-6xl mb-6 mx-auto">
            👤
          </div>
          <h2 className="text-3xl font-semibold mb-2">{chatName}</h2>
          <p className="text-lg text-white/70">Соединение...</p>
        </div>
      </div>
      
      <div className="absolute top-6 right-6 w-48 h-36 bg-slate-700 rounded-2xl overflow-hidden shadow-2xl">
        <div className="w-full h-full flex items-center justify-center text-white/50">
          <Icon name="User" size={48} />
        </div>
      </div>
      
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          className="w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm"
        >
          <Icon name="Mic" size={24} />
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm"
        >
          <Icon name="Video" size={24} />
        </Button>
        
        <Button 
          onClick={onClose}
          size="icon" 
          className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white"
        >
          <Icon name="PhoneOff" size={28} />
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm"
        >
          <Icon name="MonitorUp" size={24} />
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm"
        >
          <Icon name="Users" size={24} />
        </Button>
      </div>
      
      <div className="absolute top-6 left-6">
        <div className="flex items-center gap-2 text-white bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium">00:00</span>
        </div>
      </div>
    </div>
  );
}

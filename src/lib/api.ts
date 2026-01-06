const API_BASE = {
  auth: 'https://functions.poehali.dev/1275f24e-2906-4206-b3bc-c25cb5595487',
  messages: 'https://functions.poehali.dev/bcee1c21-3cf7-4758-8663-662a0d9e7076',
  upload: 'https://functions.poehali.dev/4a9f0b49-2cf4-4445-9013-c0b96ae61cac',
};

export interface User {
  id: number;
  phone: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  bio?: string;
  online: boolean;
}

export interface Message {
  id: number;
  chat_id: number;
  sender_id: number;
  message_text: string;
  message_type: 'text' | 'image' | 'voice';
  media_url?: string;
  duration?: number;
  created_at: string;
  is_read: boolean;
  first_name?: string;
  last_name?: string;
  username?: string;
  avatar_url?: string;
}

export interface Chat {
  id: number;
  name?: string;
  is_group: boolean;
  avatar_url?: string;
  last_message?: string;
  last_message_time?: string;
  unread_count: number;
}

function getAuthHeaders(): HeadersInit {
  const user = localStorage.getItem('user');
  const token = localStorage.getItem('token');
  
  if (user) {
    const userData = JSON.parse(user);
    return {
      'Content-Type': 'application/json',
      'X-User-Id': userData.id.toString(),
      'X-Auth-Token': token || '',
    };
  }
  
  return {
    'Content-Type': 'application/json',
  };
}

export async function getChats(): Promise<Chat[]> {
  const response = await fetch(API_BASE.messages, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch chats');
  }
  
  return response.json();
}

export async function getMessages(chatId: number): Promise<Message[]> {
  const response = await fetch(`${API_BASE.messages}?chat_id=${chatId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch messages');
  }
  
  return response.json();
}

export async function sendMessage(
  chatId: number,
  messageText: string,
  messageType: 'text' | 'image' | 'voice' = 'text',
  mediaUrl?: string,
  duration?: number
): Promise<Message> {
  const response = await fetch(API_BASE.messages, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      action: 'send',
      chat_id: chatId,
      message_text: messageText,
      message_type: messageType,
      media_url: mediaUrl,
      duration,
    }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to send message');
  }
  
  return response.json();
}

export async function createChat(
  name: string,
  isGroup: boolean,
  memberIds: number[]
): Promise<Chat> {
  const response = await fetch(API_BASE.messages, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      action: 'create_chat',
      name,
      is_group: isGroup,
      member_ids: memberIds,
    }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create chat');
  }
  
  return response.json();
}

export async function uploadFile(
  file: File
): Promise<{ url: string; key: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async () => {
      try {
        const base64Data = reader.result?.toString().split(',')[1];
        
        const response = await fetch(API_BASE.upload, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            file: base64Data,
            file_name: file.name,
            content_type: file.type,
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to upload file');
        }
        
        const data = await response.json();
        resolve(data);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}
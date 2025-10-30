import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar } from './ui/avatar';
import { Badge } from './ui/badge';
import {
  ArrowLeft,
  Send,
  Image as ImageIcon,
  Clock,
} from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { toast } from 'sonner@2.0.3';

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: string;
  type: 'text' | 'image' | 'product';
  imageUrl?: string;
  isRead: boolean;
}

export interface ChatConversation {
  id: string;
  participantName: string;
  participantRole: 'buyer' | 'seller';
  orderId?: string;
  orderNumber?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
  avatar?: string;
}

interface ChatPageProps {
  conversation: ChatConversation;
  messages: ChatMessage[];
  currentUserId: string;
  currentUserName: string;
  onBack: () => void;
  onSendMessage: (message: string) => void;
}

export function ChatPage({
  conversation,
  messages: initialMessages,
  currentUserId,
  currentUserName,
  onBack,
  onSendMessage,
}: ChatPageProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto scroll to bottom when new messages arrive
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: currentUserId,
      senderName: currentUserName,
      message: inputMessage.trim(),
      timestamp: new Date().toISOString(),
      type: 'text',
      isRead: false,
    };

    setMessages([...messages, newMessage]);
    onSendMessage(inputMessage.trim());
    setInputMessage('');

    // Simulate typing indicator
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
    }, 1500);

    toast.success('Pesan terkirim');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        // In real app, upload to server and get URL
        toast.success('📷 Gambar berhasil dikirim');
        const imageUrl = URL.createObjectURL(file);
        const newMessage: ChatMessage = {
          id: `msg-${Date.now()}`,
          senderId: currentUserId,
          senderName: currentUserName,
          message: 'Mengirim gambar',
          timestamp: new Date().toISOString(),
          type: 'image',
          imageUrl,
          isRead: false,
        };
        setMessages([...messages, newMessage]);
      } else {
        toast.error('Hanya file gambar yang diperbolehkan');
      }
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    }
  };

  const groupMessagesByDate = (messages: ChatMessage[]) => {
    const groups: { [key: string]: ChatMessage[] } = {};
    messages.forEach((msg) => {
      const date = new Date(msg.timestamp).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(msg);
    });
    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <Card className="rounded-none border-b">
        <CardHeader className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button onClick={onBack} variant="ghost" size="sm" className="p-2">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white">
                  {conversation.participantName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4>{conversation.participantName}</h4>
                  {conversation.isOnline && (
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  {conversation.isOnline ? 'Online' : 'Terakhir dilihat baru saja'}
                </div>
                {conversation.orderNumber && (
                  <Badge variant="outline" className="text-xs mt-1">
                    📦 {conversation.orderNumber}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div ref={scrollRef} className="p-4 space-y-6">
            {Object.entries(messageGroups).map(([date, msgs]) => (
              <div key={date}>
                {/* Date Separator */}
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-gray-200 px-3 py-1 rounded-full text-xs text-gray-600">
                    {date}
                  </div>
                </div>

                {/* Messages */}
                <div className="space-y-3">
                  {msgs.map((msg) => {
                    const isCurrentUser = msg.senderId === currentUserId;
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] ${
                            isCurrentUser ? 'order-2' : 'order-1'
                          }`}
                        >
                          {!isCurrentUser && (
                            <div className="text-xs text-gray-600 mb-1 px-3">
                              {msg.senderName}
                            </div>
                          )}
                          <div
                            className={`rounded-2xl px-4 py-2 ${
                              isCurrentUser
                                ? 'bg-green-600 text-white rounded-br-md'
                                : 'bg-white text-gray-900 rounded-bl-md shadow-sm'
                            }`}
                          >
                            {msg.type === 'text' && <p className="text-sm">{msg.message}</p>}
                            {msg.type === 'image' && msg.imageUrl && (
                              <div>
                                <img
                                  src={msg.imageUrl}
                                  alt="Attachment"
                                  className="rounded-lg max-w-full mb-2"
                                />
                                <p className="text-sm">{msg.message}</p>
                              </div>
                            )}
                          </div>
                          <div
                            className={`text-xs text-gray-500 mt-1 px-3 flex items-center gap-1 ${
                              isCurrentUser ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            <Clock className="w-3 h-3" />
                            {formatTime(msg.timestamp)}
                            {isCurrentUser && msg.isRead && (
                              <span className="text-blue-500 ml-1">✓✓</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.2s' }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.4s' }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Input Area */}
      <Card className="rounded-none border-t">
        <CardContent className="p-4">
          <div className="flex items-end gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <Button
              onClick={handleImageUpload}
              variant="ghost"
              size="sm"
              className="p-2 flex-shrink-0"
            >
              <ImageIcon className="w-5 h-5 text-gray-600" />
            </Button>
            <div className="flex-1 relative">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ketik pesan..."
                className="pr-12 rounded-full"
              />
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim()}
              size="sm"
              className="p-3 rounded-full bg-green-600 hover:bg-green-700 flex-shrink-0"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
          <div className="text-xs text-gray-500 mt-2 text-center">
            💡 Pastikan komunikasi tetap sopan dan profesional
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Chat List Component
interface ChatListProps {
  conversations: ChatConversation[];
  onSelectConversation: (conversation: ChatConversation) => void;
  onBack: () => void;
}

export function ChatList({ conversations, onSelectConversation, onBack }: ChatListProps) {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredConversations = conversations.filter((conv) => {
    if (filter === 'unread') return conv.unreadCount > 0;
    return true;
  });

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Kemarin';
    } else {
      return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <Button onClick={onBack} variant="ghost" size="sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali
        </Button>
        <h2>💬 Pesan</h2>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-4">
        <Button
          onClick={() => setFilter('all')}
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          className={filter === 'all' ? 'bg-green-600 hover:bg-green-700' : ''}
        >
          Semua
        </Button>
        <Button
          onClick={() => setFilter('unread')}
          variant={filter === 'unread' ? 'default' : 'outline'}
          size="sm"
          className={filter === 'unread' ? 'bg-green-600 hover:bg-green-700' : ''}
        >
          Belum Dibaca ({conversations.filter((c) => c.unreadCount > 0).length})
        </Button>
      </div>

      {/* Conversations List */}
      <Card>
        <CardContent className="p-0">
          {filteredConversations.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-4xl mb-4">💬</div>
              <p className="text-gray-500">Belum ada percakapan</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => onSelectConversation(conv)}
                  className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                      <span className="text-white">
                        {conv.participantName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    {conv.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h5 className="truncate">{conv.participantName}</h5>
                      <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                        {formatTime(conv.lastMessageTime)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 truncate">{conv.lastMessage}</p>
                      {conv.unreadCount > 0 && (
                        <Badge className="ml-2 flex-shrink-0 bg-green-600">
                          {conv.unreadCount}
                        </Badge>
                      )}
                    </div>
                    {conv.orderNumber && (
                      <Badge variant="outline" className="text-xs mt-1">
                        📦 {conv.orderNumber}
                      </Badge>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

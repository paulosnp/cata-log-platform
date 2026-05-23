import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { StreamChat } from 'stream-chat';
import { useAuth } from './AuthContext';
import { chatService } from '../services/chatService';

const ChatContext = createContext(null);

const STREAM_API_KEY = import.meta.env.VITE_STREAM_CHAT_API_KEY;

export function ChatProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [chatClient, setChatClient] = useState(null);
  const [chatReady, setChatReady] = useState(false);
  const connectingRef = useRef(false);

  useEffect(() => {
    // Sem API Key → desabilita chat silenciosamente
    if (!STREAM_API_KEY) {
      console.warn('[ChatContext] VITE_STREAM_CHAT_API_KEY não configurada. Chat desabilitado.');
      return;
    }

    if (isAuthenticated && user?.id && !connectingRef.current) {
      connectingRef.current = true;

      const connect = async () => {
        try {
          const client = StreamChat.getInstance(STREAM_API_KEY);

          // Obter token do backend
          const { data } = await chatService.getToken();

          console.log('[ChatContext] Token recebido:', data.token?.substring(0, 30) + '...');
          console.log('[ChatContext] User ID:', String(user.id), '| Nome:', user.nome);

          // connectUser — userId deve coincidir com o backend: comprador_ + userId
          await client.connectUser(
            {
              id: `comprador_${user.id}`,
              name: user.nome,
            },
            data.token
          );

          console.log('[ChatContext] ✅ connectUser OK. Client user:', client.user?.id, '| Role:', client.user?.role);

          setChatClient(client);
          setChatReady(true);
        } catch (err) {
          console.error('[ChatContext] Erro ao conectar ao Stream Chat:', err);
        } finally {
          connectingRef.current = false;
        }
      };

      connect();
    }

    // Cleanup — desconectar quando desloga
    return () => {
      if (!isAuthenticated && chatClient) {
        chatClient.disconnectUser().then(() => {
          setChatClient(null);
          setChatReady(false);
          connectingRef.current = false;
        });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.id]);

  return (
    <ChatContext.Provider value={{ chatClient, chatReady }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat deve ser usado dentro de um <ChatProvider>');
  }
  return context;
}

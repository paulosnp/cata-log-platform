import { useState, useEffect } from 'react';
import { Chat, Channel, Window, MessageList, MessageComposer, ChannelHeader } from 'stream-chat-react';
import { useChat } from '../../contexts/ChatContext';
import Spinner from '../common/Spinner';

import 'stream-chat-react/dist/css/index.css';
import './ChatPanel.css';

export default function ChatPanel({ channelId }) {
  const { chatClient, chatReady } = useChat();
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!chatReady || !chatClient || !channelId) {
      setLoading(false);
      return;
    }

    const initChannel = async () => {
      try {
        const ch = chatClient.channel('messaging', channelId);
        await ch.watch();
        setChannel(ch);
      } catch (err) {
        console.error('[ChatPanel] Erro ao conectar ao canal:', err);
        setError('Não foi possível carregar o chat.');
      } finally {
        setLoading(false);
      }
    };

    initChannel();
  }, [chatReady, chatClient, channelId]);

  // Chat não configurado (sem API key)
  if (!chatReady && !loading) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-8 text-center">
        <div>
          <p className="text-sm font-semibold text-on-surface-variant">Chat indisponível</p>
          <p className="mt-1 text-xs text-on-surface-variant/60">
            O chat será ativado quando a integração com Stream Chat estiver configurada.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-8">
        <Spinner size="md" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-8 text-center">
        <p className="text-sm text-tertiary">{error}</p>
      </div>
    );
  }

  return (
    <div className="catalog-chat-wrapper h-full overflow-hidden rounded-xl border border-outline-variant/10">
      <Chat client={chatClient} theme="str-chat__theme-light">
        <Channel channel={channel}>
          <Window>
            <ChannelHeader />
            <MessageList />
            <MessageComposer />
          </Window>
        </Channel>
      </Chat>
    </div>
  );
}

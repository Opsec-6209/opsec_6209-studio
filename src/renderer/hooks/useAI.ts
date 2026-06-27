import { useState, useCallback, useRef, useEffect } from 'preact/hooks';
import { getAPI } from '../services/ipc-client';
import type { Settings } from '../../shared/types';

interface AIState {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  isLoading: boolean;
  streamingContent: string;
  error: string | null;
}

export function useAI(settings: Settings) {
  const [state, setState] = useState<AIState>({
    messages: [],
    isLoading: false,
    streamingContent: '',
    error: null,
  });

  const messagesRef = useRef(state.messages);
  messagesRef.current = state.messages;

  const streamCleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    return () => {
      if (streamCleanupRef.current) {
        streamCleanupRef.current();
        streamCleanupRef.current = null;
      }
    };
  }, []);

  const sendMessage = useCallback(async (content: string, context?: string) => {
    if (!settings.ai.apiKey) {
      setState(prev => ({ ...prev, error: 'No API key set. Configure in Settings.' }));
      return;
    }

    if (streamCleanupRef.current) {
      streamCleanupRef.current();
      streamCleanupRef.current = null;
    }

    const userMessage = { role: 'user' as const, content };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
      streamingContent: '',
      error: null,
    }));

    try {
      const api = getAPI();
      const systemMsg = context
        ? `You are an AI coding assistant. The user is working on this file content:\n\n\`\`\`\n${context}\n\`\`\``
        : 'You are an AI coding assistant. Help the user with their code.';

      const allMessages = [
        { role: 'system', content: systemMsg },
        ...messagesRef.current,
        userMessage,
      ];

      const stream = api.aiChatStream(
        allMessages as any,
        settings.ai.apiKey,
        settings.ai.model,
        settings.ai.endpoint
      );

      let fullResponse = '';
      let cancelled = false;

      streamCleanupRef.current = () => {
        cancelled = true;
        if (stream && typeof (stream as any).abort === 'function') (stream as any).abort();
        if (stream && typeof (stream as any).cancel === 'function') (stream as any).cancel();
      };

      stream.onData((chunk: string) => {
        if (cancelled) return;
        fullResponse += chunk;
        setState(prev => ({
          ...prev,
          streamingContent: fullResponse,
        }));
      });

      stream.onEnd(() => {
        if (cancelled) return;
        streamCleanupRef.current = null;
        setState(prev => ({
          ...prev,
          isLoading: false,
          streamingContent: '',
          messages: [...prev.messages, { role: 'assistant', content: fullResponse }],
        }));
      });
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err.message || 'Failed to send message',
      }));
    }
  }, [settings]);

  const clearChat = useCallback(() => {
    setState({ messages: [], isLoading: false, streamingContent: '', error: null });
  }, []);

  return { ...state, sendMessage, clearChat };
}

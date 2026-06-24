'use client';

import { useState, useCallback, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { API_ROUTES } from '@/lib/constants';

export interface SGMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  suggestions?: string[];
  actionTaken?: string | null;
  redirect?: string | null;
  mode?: string;
  created_at?: string;
  timestamp: Date;
}

export interface SGSession {
  session_id: string;
  title: string;
  mode: string;
  message_count: number;
  last_message?: string | null;
  last_message_role?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SGContext {
  name?: string;
  target_role?: string;
  readiness_score?: number | null;
  readiness_classification?: string | null;
  verified_skills?: number;
  total_skills?: number;
  top_gaps?: Array<{ skill: string; severity: string; current: number; required: number }>;
  top_missing?: string[];
}

interface ChatPayload {
  message: string;
  session_id?: string;
  mode?: string;
  skill_context?: string;
  internship_context?: string;
  page_context?: Record<string, unknown>;
}

export function useSkillGenieSessions() {
  const queryClient = useQueryClient();

  const { data: sessions = [], isLoading } = useQuery<SGSession[]>({
    queryKey: ['skillgenie-sessions'],
    queryFn: async () => {
      const res = await api.get<{ success: boolean; data: SGSession[] }>(
        API_ROUTES.SKILLGENIE_SESSIONS
      );
      return res.data.data || [];
    },
    staleTime: 30 * 1000,
  });

  const createMutation = useMutation({
    mutationFn: async (opts?: { title?: string; mode?: string }) => {
      const res = await api.post<{ success: boolean; data: SGSession }>(
        API_ROUTES.SKILLGENIE_SESSIONS,
        { title: opts?.title, mode: opts?.mode || 'general' }
      );
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skillgenie-sessions'] });
    },
  });

  const renameMutation = useMutation({
    mutationFn: async ({ sessionId, title }: { sessionId: string; title: string }) => {
      await api.patch(API_ROUTES.SKILLGENIE_SESSION(sessionId), { title });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skillgenie-sessions'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      await api.delete(API_ROUTES.SKILLGENIE_SESSION(sessionId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skillgenie-sessions'] });
    },
  });

  return {
    sessions,
    isLoading,
    createSession: createMutation.mutateAsync,
    renameSession: renameMutation.mutate,
    deleteSession: deleteMutation.mutate,
    isCreating: createMutation.isPending,
  };
}

export function useSkillGenie(initialMode?: string, initialSessionId?: string) {
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<SGMessage[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | undefined>(initialSessionId);
  // Keep a ref in sync so mutations always read the *current* value, not a stale closure
  const activeSessionIdRef = useRef<string | undefined>(initialSessionId);
  const [isTyping, setIsTyping] = useState(false);
  const messageIdRef = useRef(0);

  const nextId = () => {
    messageIdRef.current += 1;
    return `msg_${messageIdRef.current}`;
  };

  // Keep ref in sync with state
  const setSession = useCallback((id: string | undefined) => {
    activeSessionIdRef.current = id;
    setActiveSessionId(id);
  }, []);

  // Fetch user context for the context bar
  const { data: sgContext } = useQuery<SGContext>({
    queryKey: ['skillgenie-context'],
    queryFn: async () => {
      const res = await api.get<{ success: boolean; data: SGContext }>(
        API_ROUTES.SKILLGENIE_CONTEXT
      );
      return res.data.data;
    },
    staleTime: 2 * 60 * 1000,
  });

  // Fetch proactive suggestions
  const { data: suggestions } = useQuery<string[]>({
    queryKey: ['skillgenie-suggestions'],
    queryFn: async () => {
      const res = await api.get<{ success: boolean; data: { suggestions: string[] } }>(
        API_ROUTES.SKILLGENIE_SUGGESTIONS
      );
      return res.data.data.suggestions;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Load a specific session's messages
  const loadSession = useCallback(async (sessionId: string) => {
    try {
      const res = await api.get<{ success: boolean; data: { messages: SGMessage[]; title: string } }>(
        API_ROUTES.SKILLGENIE_SESSION(sessionId)
      );
      const data = res.data.data;
      const loaded: SGMessage[] = (data.messages || []).map((m: any) => ({
        id: m.id || nextId(),
        role: m.role,
        content: m.content,
        suggestions: [],
        timestamp: m.created_at ? new Date(m.created_at) : new Date(),
        created_at: m.created_at,
      }));
      setMessages(loaded);
      setSession(sessionId);
    } catch (e) {
      console.error('Failed to load session', e);
    }
  }, [setSession]);

  // Send message mutation
  const sendMutation = useMutation({
    mutationFn: async (payload: ChatPayload) => {
      const res = await api.post<{ success: boolean; data: Record<string, unknown> }>(
        API_ROUTES.SKILLGENIE_CHAT,
        payload
      );
      return res.data.data;
    },
    onSuccess: (data) => {
      // Update active session id if backend created/returned one (new chat)
      if (data.session_id && !activeSessionIdRef.current) {
        setSession(data.session_id as string);
      }

      const assistantMsg: SGMessage = {
        id: nextId(),
        role: 'assistant',
        content: (data.response as string) || "I'm here to help!",
        suggestions: (data.suggestions as string[]) || [],
        actionTaken: (data.action_taken as string) || null,
        redirect: (data.redirect as string) || null,
        mode: (data.mode as string) || 'general',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setIsTyping(false);

      // Refresh session list so sidebar updates
      queryClient.invalidateQueries({ queryKey: ['skillgenie-sessions'] });

      // Invalidate relevant queries if an action was taken
      if (data.action_taken) {
        queryClient.invalidateQueries({ queryKey: ['skills'] });
        queryClient.invalidateQueries({ queryKey: ['skillgenie-context'] });
        if (data.action_taken === 'skill_verified') {
          queryClient.invalidateQueries({ queryKey: ['readiness'] });
          queryClient.invalidateQueries({ queryKey: ['internships'] });
        }
      }
    },
    onError: () => {
      const errorMsg: SGMessage = {
        id: nextId(),
        role: 'assistant',
        content: "I'm having trouble right now. Please try again.",
        suggestions: ['Try again', 'Go to dashboard'],
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
      setIsTyping(false);
    },
  });

  const sendMessage = useCallback(
    (
      text: string,
      opts?: {
        mode?: string;
        skillContext?: string;
        internshipContext?: string;
        pageContext?: Record<string, unknown>;
      }
    ) => {
      if (!text.trim()) return;

      const userMsg: SGMessage = {
        id: nextId(),
        role: 'user',
        content: text.trim(),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setIsTyping(true);

      sendMutation.mutate({
        message: text.trim(),
        // Read from ref so we always get the current value — not a stale closure
        session_id: activeSessionIdRef.current,
        mode: opts?.mode || initialMode,
        skill_context: opts?.skillContext,
        internship_context: opts?.internshipContext,
        page_context: opts?.pageContext,
      });
    },
    [sendMutation, initialMode]
  );

  const startNewChat = useCallback(() => {
    setMessages([]);
    setSession(undefined); // clears both state and ref — next message gets no session_id
  }, [setSession]);

  return {
    messages,
    isTyping,
    sendMessage,
    startNewChat,
    loadSession,
    activeSessionId,
    sgContext,
    proactiveSuggestions: suggestions || [],
    isSending: sendMutation.isPending,
  };
}

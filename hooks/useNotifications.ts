import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { API_ROUTES } from '@/lib/constants';
import { useNotificationStore } from '@/lib/notifications';

export const notify = {
  success: (message: string) => useNotificationStore.getState().addNotification('success', message),
  error: (message: string) => useNotificationStore.getState().addNotification('error', message),
  warning: (message: string) => useNotificationStore.getState().addNotification('warning', message),
  info: (message: string) => useNotificationStore.getState().addNotification('info', message),
};

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export function useNotifications() {
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await api.get<{ success: boolean; data: AppNotification[] }>(API_ROUTES.NOTIFICATIONS);
      return res.data.data || [];
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // poll every 60s
  });

  const { data: countData } = useQuery({
    queryKey: ['notifications-count'],
    queryFn: async () => {
      const res = await api.get<{ success: boolean; data: { count: number } }>(API_ROUTES.NOTIFICATIONS_COUNT);
      return res.data.data?.count ?? 0;
    },
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      await api.post(API_ROUTES.NOTIFICATIONS_READ_ALL);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-count'] });
    },
  });

  const markOneReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.post(API_ROUTES.NOTIFICATION_READ(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-count'] });
    },
  });

  return {
    notifications,
    unreadCount: countData ?? 0,
    markAllRead: markAllReadMutation.mutate,
    markOneRead: markOneReadMutation.mutate,
  };
}

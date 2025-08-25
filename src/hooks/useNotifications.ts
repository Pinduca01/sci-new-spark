
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Notification {
  id: string;
  type: 'equipamento' | 'troca' | 'manutencao' | 'taf' | 'ptr' | 'sistema';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();

  // Simular notificações do sistema (em produção viria do Supabase)
  useEffect(() => {
    const generateSystemNotifications = () => {
      const systemNotifications: Notification[] = [
        {
          id: '1',
          type: 'equipamento',
          title: 'Extintores Vencendo',
          message: '5 extintores vencem nos próximos 7 dias',
          isRead: false,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2h atrás
          priority: 'high',
          actionUrl: '/equipamentos'
        },
        {
          id: '2',
          type: 'troca',
          title: 'Nova Troca Pendente',
          message: 'Soldado Silva solicitou troca de plantão',
          isRead: false,
          createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30min atrás
          priority: 'medium',
          actionUrl: '/escalas'
        },
        {
          id: '3',
          type: 'manutencao',
          title: 'Manutenção Viatura',
          message: 'Viatura ABM-01 precisa de revisão',
          isRead: true,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 dia atrás
          priority: 'medium',
          actionUrl: '/viaturas'
        },
        {
          id: '4',
          type: 'taf',
          title: 'TAF Pendente',
          message: '3 bombeiros com TAF vencendo este mês',
          isRead: false,
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4h atrás
          priority: 'medium',
          actionUrl: '/pessoal/taf'
        }
      ];

      setNotifications(systemNotifications);
      setUnreadCount(systemNotifications.filter(n => !n.isRead).length);
    };

    generateSystemNotifications();

    // Simular atualização de notificações a cada 30 segundos
    const interval = setInterval(() => {
      console.log('Verificando novas notificações...');
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true }
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
    setUnreadCount(0);
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      createdAt: new Date()
    };

    setNotifications(prev => [newNotification, ...prev]);
    if (!newNotification.isRead) {
      setUnreadCount(prev => prev + 1);
    }

    // Mostrar toast para notificações de alta prioridade
    if (notification.priority === 'high') {
      toast({
        title: notification.title,
        description: notification.message,
        variant: notification.priority === 'high' ? 'destructive' : 'default'
      });
    }
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    addNotification
  };
};

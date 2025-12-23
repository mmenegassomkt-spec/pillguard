import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configurar comportamento das notificações
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const NotificationService = {
  // Solicitar permissões
  async requestPermissions() {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      return false;
    }
    
    // Configurar canal de notificação para Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Alarmes de Medicamentos',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4A90E2',
        sound: 'default',
      });
      
      // Canal para alarmes críticos
      await Notifications.setNotificationChannelAsync('critical', {
        name: 'Alarmes Críticos',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 500, 250, 500],
        lightColor: '#D9534F',
        sound: 'default',
        enableVibrate: true,
      });
    }
    
    return true;
  },

  // Agendar notificação para um alarme
  async scheduleAlarmNotification(alarm: any, medications: any[]) {
    const [hours, minutes] = alarm.time.split(':').map(Number);
    
    // Criar título e corpo da notificação
    const medNames = medications
      .filter(med => alarm.medication_ids.includes(med.id))
      .map(med => med.name)
      .join(', ');
    
    const title = alarm.is_critical ? '🔴 ALARME CRÍTICO!' : '💊 Hora do Medicamento';
    const body = `${medNames}\n${medications.length > 1 ? 'Medicamentos' : 'Medicamento'} às ${alarm.time}`;
    
    // Configurar trigger baseado na frequência
    let trigger: any;
    
    if (alarm.frequency === 'daily') {
      // Todos os dias no horário especificado
      trigger = {
        hour: hours,
        minute: minutes,
        repeats: true,
      };
    } else if (alarm.frequency === 'specific' && alarm.specific_days) {
      // Dias específicos - agendar para cada dia
      const notificationIds: string[] = [];
      
      for (const weekday of alarm.specific_days) {
        const id = await Notifications.scheduleNotificationAsync({
          content: {
            title,
            body,
            data: { 
              alarmId: alarm.id, 
              medicationIds: alarm.medication_ids,
              isCritical: alarm.is_critical,
            },
            sound: true,
            priority: alarm.is_critical ? 'max' : 'high',
            categoryIdentifier: 'MEDICATION_ALARM',
          },
          trigger: {
            hour: hours,
            minute: minutes,
            weekday: weekday + 1, // expo-notifications usa 1-7 (Dom=1)
            repeats: true,
          },
        });
        
        notificationIds.push(id);
      }
      
      return notificationIds;
    }
    
    // Agendar notificação
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { 
          alarmId: alarm.id, 
          medicationIds: alarm.medication_ids,
          isCritical: alarm.is_critical,
        },
        sound: true,
        priority: alarm.is_critical ? 'max' : 'high',
        categoryIdentifier: 'MEDICATION_ALARM',
        badge: 1,
      },
      trigger,
    });
    
    return [notificationId];
  },

  // Cancelar notificação
  async cancelNotification(notificationId: string) {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  },

  // Cancelar todas as notificações de um alarme
  async cancelAlarmNotifications(alarm: any) {
    const allNotifications = await Notifications.getAllScheduledNotificationsAsync();
    
    for (const notification of allNotifications) {
      if (notification.content.data?.alarmId === alarm.id) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    }
  },

  // Reagendar alarme crítico (repetir após X minutos)
  async scheduleRepeatCriticalAlarm(alarm: any, medications: any[], delayMinutes: number) {
    const medNames = medications
      .filter(med => alarm.medication_ids.includes(med.id))
      .map(med => med.name)
      .join(', ');
    
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '🔴 ALARME CRÍTICO - LEMBRETE',
        body: `Você ainda precisa tomar: ${medNames}`,
        data: { 
          alarmId: alarm.id, 
          medicationIds: alarm.medication_ids,
          isCritical: true,
          isRepeat: true,
        },
        sound: true,
        priority: 'max',
        categoryIdentifier: 'MEDICATION_ALARM',
      },
      trigger: {
        seconds: delayMinutes * 60,
      },
    });
    
    return notificationId;
  },

  // Listar todas as notificações agendadas
  async getAllScheduledNotifications() {
    return await Notifications.getAllScheduledNotificationsAsync();
  },

  // Cancelar todas as notificações
  async cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  },
};

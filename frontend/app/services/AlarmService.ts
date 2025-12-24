import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configurar comportamento das notificações quando o app está em primeiro plano
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    priority: Notifications.AndroidNotificationPriority.MAX,
  }),
});

export const AlarmService = {
  // Inicializar o serviço de alarmes
  async initialize() {
    if (Platform.OS !== 'android') return true;

    try {
      // Criar canal para alarmes normais
      await Notifications.setNotificationChannelAsync('medication_alarms', {
        name: 'Alarmes de Medicamentos',
        description: 'Lembretes para tomar seus medicamentos',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4A90E2',
        sound: 'default',
        enableVibrate: true,
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        bypassDnd: false,
      });

      // Criar canal para alarmes críticos (máxima prioridade)
      await Notifications.setNotificationChannelAsync('critical_alarms', {
        name: 'Alarmes Críticos',
        description: 'Alarmes urgentes para medicamentos essenciais',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 500, 250, 500, 250, 500],
        lightColor: '#D9534F',
        sound: 'default',
        enableVibrate: true,
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        bypassDnd: true, // Ignora modo não perturbe
      });

      console.log('AlarmService: Canais de notificação criados com sucesso');
      return true;
    } catch (error) {
      console.error('AlarmService: Erro ao criar canais:', error);
      return false;
    }
  },

  // Solicitar permissões de notificação
  async requestPermissions() {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
            allowCriticalAlerts: true,
          },
          android: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
          },
        });
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('AlarmService: Permissão de notificação negada');
        return false;
      }
      
      console.log('AlarmService: Permissões concedidas');
      return true;
    } catch (error) {
      console.error('AlarmService: Erro ao solicitar permissões:', error);
      return false;
    }
  },

  // Agendar alarme de medicamento
  async scheduleAlarm(alarm: any, medications: any[]) {
    const [hours, minutes] = alarm.time.split(':').map(Number);
    
    // Criar título e corpo da notificação
    const alarmMeds = medications.filter(med => alarm.medication_ids.includes(med.id));
    const medNames = alarmMeds.map(med => `💊 ${med.name}`).join('\n');
    
    const title = alarm.is_critical 
      ? '🔴 ALARME CRÍTICO!' 
      : '💊 Hora do Medicamento';
    
    const body = medNames || 'Hora de tomar seus medicamentos';

    try {
      // Para frequência diária
      if (alarm.frequency === 'daily') {
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
            priority: Notifications.AndroidNotificationPriority.MAX,
            categoryIdentifier: 'MEDICATION_ALARM',
            badge: 1,
          },
          trigger: {
            hour: hours,
            minute: minutes,
            repeats: true,
            channelId: alarm.is_critical ? 'critical_alarms' : 'medication_alarms',
          },
        });
        
        console.log(`AlarmService: Alarme diário agendado - ${notificationId}`);
        return [notificationId];
      }
      
      // Para dias específicos (datas do calendário)
      if (alarm.frequency === 'specific' && alarm.specific_dates?.length > 0) {
        const notificationIds: string[] = [];
        const now = new Date();
        
        for (const dateStr of alarm.specific_dates) {
          const [year, month, day] = dateStr.split('-').map(Number);
          const triggerDate = new Date(year, month - 1, day, hours, minutes, 0, 0);
          
          // Só agendar se a data for futura
          if (triggerDate > now) {
            const notificationId = await Notifications.scheduleNotificationAsync({
              content: {
                title,
                body,
                data: { 
                  alarmId: alarm.id, 
                  medicationIds: alarm.medication_ids,
                  isCritical: alarm.is_critical,
                  specificDate: dateStr,
                },
                sound: true,
                priority: Notifications.AndroidNotificationPriority.MAX,
                categoryIdentifier: 'MEDICATION_ALARM',
                badge: 1,
              },
              trigger: {
                date: triggerDate,
                channelId: alarm.is_critical ? 'critical_alarms' : 'medication_alarms',
              },
            });
            
            notificationIds.push(notificationId);
            console.log(`AlarmService: Alarme agendado para ${dateStr} - ${notificationId}`);
          }
        }
        
        return notificationIds;
      }
      
      // Para dias alternados (a cada 2 dias)
      if (alarm.frequency === 'alternate') {
        // Calcular próximo horário de disparo
        const now = new Date();
        const trigger = new Date();
        trigger.setHours(hours, minutes, 0, 0);
        
        // Se o horário já passou hoje, agendar para amanhã
        if (trigger <= now) {
          trigger.setDate(trigger.getDate() + 1);
        }
        
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
            priority: Notifications.AndroidNotificationPriority.MAX,
            categoryIdentifier: 'MEDICATION_ALARM',
            badge: 1,
          },
          trigger: {
            date: trigger,
            channelId: alarm.is_critical ? 'critical_alarms' : 'medication_alarms',
          },
        });
        
        console.log(`AlarmService: Alarme alternado agendado - ${notificationId}`);
        return [notificationId];
      }
      
      return [];
    } catch (error) {
      console.error('AlarmService: Erro ao agendar alarme:', error);
      return [];
    }
  },

  // Cancelar alarme específico
  async cancelAlarm(alarmId: string) {
    try {
      const allNotifications = await Notifications.getAllScheduledNotificationsAsync();
      
      for (const notification of allNotifications) {
        if (notification.content.data?.alarmId === alarmId) {
          await Notifications.cancelScheduledNotificationAsync(notification.identifier);
          console.log(`AlarmService: Alarme cancelado - ${notification.identifier}`);
        }
      }
    } catch (error) {
      console.error('AlarmService: Erro ao cancelar alarme:', error);
    }
  },

  // Cancelar todos os alarmes
  async cancelAllAlarms() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('AlarmService: Todos os alarmes cancelados');
    } catch (error) {
      console.error('AlarmService: Erro ao cancelar todos alarmes:', error);
    }
  },

  // Listar todos os alarmes agendados
  async getAllScheduledAlarms() {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('AlarmService: Erro ao listar alarmes:', error);
      return [];
    }
  },

  // Reagendar alarme crítico (repetir após X minutos se não confirmado)
  async scheduleRepeatCriticalAlarm(alarm: any, medications: any[], delayMinutes: number) {
    const alarmMeds = medications.filter(med => alarm.medication_ids.includes(med.id));
    const medNames = alarmMeds.map(med => med.name).join(', ');

    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🔴 LEMBRETE CRÍTICO',
          body: `Você ainda precisa tomar: ${medNames}`,
          data: { 
            alarmId: alarm.id, 
            medicationIds: alarm.medication_ids,
            isCritical: true,
            isRepeat: true,
          },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.MAX,
          categoryIdentifier: 'MEDICATION_ALARM',
          badge: 1,
        },
        trigger: {
          seconds: delayMinutes * 60,
          channelId: 'critical_alarms',
        },
      });
      
      console.log(`AlarmService: Lembrete crítico agendado em ${delayMinutes} min - ${notificationId}`);
      return notificationId;
    } catch (error) {
      console.error('AlarmService: Erro ao agendar lembrete crítico:', error);
      return null;
    }
  },

  // Sincronizar todos os alarmes do perfil atual
  async syncAlarms(alarms: any[], medications: any[]) {
    console.log('AlarmService: Sincronizando alarmes...');
    
    // Cancelar todos os alarmes existentes
    await this.cancelAllAlarms();
    
    // Reagendar apenas alarmes ativos
    for (const alarm of alarms) {
      if (alarm.is_active) {
        await this.scheduleAlarm(alarm, medications);
      }
    }
    
    console.log(`AlarmService: ${alarms.filter(a => a.is_active).length} alarmes sincronizados`);
  },
};

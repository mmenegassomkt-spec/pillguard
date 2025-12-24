import notifee, { 
  AndroidImportance, 
  AndroidVisibility,
  TriggerType,
  RepeatFrequency,
  TimestampTrigger,
  AlarmType,
  EventType
} from '@notifee/react-native';
import { Platform } from 'react-native';

// Configuração dos canais de notificação para Android
export const NotificationService = {
  // Inicializar o serviço de notificações
  async initialize() {
    if (Platform.OS !== 'android') return;

    // Criar canal para alarmes normais
    await notifee.createChannel({
      id: 'medication_alarms',
      name: 'Alarmes de Medicamentos',
      description: 'Lembretes para tomar seus medicamentos',
      importance: AndroidImportance.HIGH,
      visibility: AndroidVisibility.PUBLIC,
      sound: 'default',
      vibration: true,
      vibrationPattern: [0, 250, 250, 250],
      lights: true,
      lightColor: '#4A90E2',
    });

    // Criar canal para alarmes críticos (máxima prioridade)
    await notifee.createChannel({
      id: 'critical_alarms',
      name: 'Alarmes Críticos',
      description: 'Alarmes urgentes que não podem ser ignorados',
      importance: AndroidImportance.HIGH,
      visibility: AndroidVisibility.PUBLIC,
      sound: 'default',
      vibration: true,
      vibrationPattern: [0, 500, 250, 500, 250, 500],
      lights: true,
      lightColor: '#D9534F',
      bypassDnd: true, // Ignora modo não perturbe
    });

    console.log('NotificationService: Canais criados com sucesso');
  },

  // Solicitar permissões
  async requestPermissions() {
    if (Platform.OS === 'android') {
      // Verificar permissão para alarmes exatos (Android 12+)
      const settings = await notifee.getNotificationSettings();
      
      if (settings.android.alarm !== 1) { // 1 = ENABLED
        // Direcionar usuário para configurações
        await notifee.openAlarmPermissionSettings();
      }

      // Solicitar permissão de notificações (Android 13+)
      await notifee.requestPermission();
    }
    
    return true;
  },

  // Agendar alarme de medicamento
  async scheduleAlarm(alarm: any, medications: any[]) {
    const [hours, minutes] = alarm.time.split(':').map(Number);
    
    // Criar título e corpo da notificação
    const medNames = medications
      .filter(med => alarm.medication_ids.includes(med.id))
      .map(med => `💊 ${med.name}`)
      .join('\n');
    
    const title = alarm.is_critical 
      ? '🔴 ALARME CRÍTICO!' 
      : '💊 Hora do Medicamento';
    
    const body = medNames;

    // Calcular próximo horário de disparo
    const now = new Date();
    const trigger = new Date();
    trigger.setHours(hours, minutes, 0, 0);
    
    // Se o horário já passou hoje, agendar para amanhã
    if (trigger <= now) {
      trigger.setDate(trigger.getDate() + 1);
    }

    // Configurar o trigger baseado na frequência
    let triggerConfig: TimestampTrigger;

    if (alarm.frequency === 'daily') {
      triggerConfig = {
        type: TriggerType.TIMESTAMP,
        timestamp: trigger.getTime(),
        repeatFrequency: RepeatFrequency.DAILY,
        alarmManager: {
          type: AlarmType.SET_EXACT_AND_ALLOW_WHILE_IDLE,
        },
      };
    } else if (alarm.frequency === 'specific' && alarm.specific_dates?.length > 0) {
      // Para datas específicas, agendar cada uma
      const notificationIds: string[] = [];
      
      for (const dateStr of alarm.specific_dates) {
        const [year, month, day] = dateStr.split('-').map(Number);
        const specificDate = new Date(year, month - 1, day, hours, minutes, 0, 0);
        
        // Só agendar se a data for futura
        if (specificDate > now) {
          const id = await notifee.createTriggerNotification(
            {
              id: `${alarm.id}_${dateStr}`,
              title,
              body,
              android: {
                channelId: alarm.is_critical ? 'critical_alarms' : 'medication_alarms',
                smallIcon: 'ic_notification',
                pressAction: {
                  id: 'default',
                  launchActivity: 'default',
                },
                actions: [
                  {
                    title: '✅ Já tomei',
                    pressAction: { id: 'taken' },
                  },
                  {
                    title: '⏭️ Pular',
                    pressAction: { id: 'skip' },
                  },
                ],
                data: {
                  alarmId: alarm.id,
                  medicationIds: JSON.stringify(alarm.medication_ids),
                  isCritical: alarm.is_critical ? 'true' : 'false',
                },
                importance: AndroidImportance.HIGH,
                visibility: AndroidVisibility.PUBLIC,
                fullScreenAction: alarm.is_critical ? { id: 'default' } : undefined,
              },
            },
            {
              type: TriggerType.TIMESTAMP,
              timestamp: specificDate.getTime(),
              alarmManager: {
                type: AlarmType.SET_EXACT_AND_ALLOW_WHILE_IDLE,
              },
            }
          );
          notificationIds.push(id);
        }
      }
      
      return notificationIds;
    } else {
      // Alarme único ou alternado
      triggerConfig = {
        type: TriggerType.TIMESTAMP,
        timestamp: trigger.getTime(),
        repeatFrequency: alarm.frequency === 'alternate' ? RepeatFrequency.WEEKLY : undefined,
        alarmManager: {
          type: AlarmType.SET_EXACT_AND_ALLOW_WHILE_IDLE,
        },
      };
    }

    // Criar a notificação agendada
    const notificationId = await notifee.createTriggerNotification(
      {
        id: alarm.id,
        title,
        body,
        android: {
          channelId: alarm.is_critical ? 'critical_alarms' : 'medication_alarms',
          smallIcon: 'ic_notification',
          pressAction: {
            id: 'default',
            launchActivity: 'default',
          },
          actions: [
            {
              title: '✅ Já tomei',
              pressAction: { id: 'taken' },
            },
            {
              title: '⏭️ Pular',
              pressAction: { id: 'skip' },
            },
          ],
          data: {
            alarmId: alarm.id,
            medicationIds: JSON.stringify(alarm.medication_ids),
            isCritical: alarm.is_critical ? 'true' : 'false',
          },
          importance: AndroidImportance.HIGH,
          visibility: AndroidVisibility.PUBLIC,
          // Tela cheia para alarmes críticos
          fullScreenAction: alarm.is_critical ? { id: 'default' } : undefined,
        },
      },
      triggerConfig
    );

    console.log(`Alarme agendado: ${notificationId} para ${trigger.toLocaleString()}`);
    return [notificationId];
  },

  // Cancelar alarme específico
  async cancelAlarm(alarmId: string) {
    await notifee.cancelNotification(alarmId);
    
    // Cancelar também notificações de datas específicas
    const notifications = await notifee.getTriggerNotifications();
    for (const notification of notifications) {
      if (notification.notification.id?.startsWith(`${alarmId}_`)) {
        await notifee.cancelNotification(notification.notification.id);
      }
    }
  },

  // Cancelar todos os alarmes
  async cancelAllAlarms() {
    await notifee.cancelAllNotifications();
  },

  // Listar todos os alarmes agendados
  async getAllScheduledAlarms() {
    return await notifee.getTriggerNotifications();
  },

  // Reagendar alarme crítico (repetir após X minutos)
  async scheduleRepeatCriticalAlarm(alarm: any, medications: any[], delayMinutes: number) {
    const medNames = medications
      .filter(med => alarm.medication_ids.includes(med.id))
      .map(med => med.name)
      .join(', ');

    const triggerTime = new Date(Date.now() + delayMinutes * 60 * 1000);

    const notificationId = await notifee.createTriggerNotification(
      {
        id: `${alarm.id}_repeat_${Date.now()}`,
        title: '🔴 LEMBRETE CRÍTICO',
        body: `Você ainda precisa tomar: ${medNames}`,
        android: {
          channelId: 'critical_alarms',
          smallIcon: 'ic_notification',
          pressAction: {
            id: 'default',
            launchActivity: 'default',
          },
          actions: [
            {
              title: '✅ Já tomei',
              pressAction: { id: 'taken' },
            },
            {
              title: '⏭️ Pular',
              pressAction: { id: 'skip' },
            },
          ],
          data: {
            alarmId: alarm.id,
            medicationIds: JSON.stringify(alarm.medication_ids),
            isCritical: 'true',
            isRepeat: 'true',
          },
          importance: AndroidImportance.HIGH,
          fullScreenAction: { id: 'default' },
        },
      },
      {
        type: TriggerType.TIMESTAMP,
        timestamp: triggerTime.getTime(),
        alarmManager: {
          type: AlarmType.SET_EXACT_AND_ALLOW_WHILE_IDLE,
        },
      }
    );

    return notificationId;
  },

  // Configurar listeners de eventos
  setupEventListeners(onTaken: (alarmId: string) => void, onSkip: (alarmId: string) => void) {
    return notifee.onForegroundEvent(({ type, detail }) => {
      if (type === EventType.ACTION_PRESS) {
        const alarmId = detail.notification?.android?.data?.alarmId as string;
        
        if (detail.pressAction?.id === 'taken' && alarmId) {
          onTaken(alarmId);
        } else if (detail.pressAction?.id === 'skip' && alarmId) {
          onSkip(alarmId);
        }
      }
    });
  },

  // Configurar handler para eventos em background
  setupBackgroundHandler(onTaken: (alarmId: string) => void, onSkip: (alarmId: string) => void) {
    notifee.onBackgroundEvent(async ({ type, detail }) => {
      if (type === EventType.ACTION_PRESS) {
        const alarmId = detail.notification?.android?.data?.alarmId as string;
        
        if (detail.pressAction?.id === 'taken' && alarmId) {
          onTaken(alarmId);
        } else if (detail.pressAction?.id === 'skip' && alarmId) {
          onSkip(alarmId);
        }
      }
    });
  },
};

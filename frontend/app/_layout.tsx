import { Stack, router } from 'expo-router';
import { COLORS } from '../src/utils/constants';
import { AppProvider } from '../src/context/AppContext';
import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configuração de notificações (deve estar fora do componente)
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export default function RootLayout() {
  useEffect(() => {
    // Só adiciona listener de notificações em plataformas nativas
    if (Platform.OS === 'web') return;
    
    let subscription: Notifications.EventSubscription | null = null;
    
    try {
      // Listener para quando o usuário toca na notificação
      subscription = Notifications.addNotificationResponseReceivedListener(response => {
        const data = response.notification.request.content.data;
        
        if (data?.alarmId) {
          // Usar setTimeout para garantir que o router esteja pronto
          setTimeout(() => {
            router.push(`/alarm-confirm?alarmId=${data.alarmId}`);
          }, 100);
        }
      });
    } catch (error) {
      console.log('Notifications not supported:', error);
    }

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  return (
    <AppProvider>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: COLORS.primary,
          },
          headerTintColor: COLORS.white,
          headerTitleStyle: {
            fontWeight: '700',
          },
        }}
      >
        <Stack.Screen 
          name="index" 
          options={{ 
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="create-profile" 
          options={{ 
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="add-medication" 
          options={{ 
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="add-alarm" 
          options={{ 
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="alarm-confirm" 
          options={{ 
            headerShown: false,
            presentation: 'fullScreenModal',
          }} 
        />
        <Stack.Screen 
          name="(tabs)" 
          options={{ 
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="medication/[id]" 
          options={{ 
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="alarm/[id]" 
          options={{ 
            headerShown: false,
          }} 
        />
      </Stack>
    </AppProvider>
  );
}

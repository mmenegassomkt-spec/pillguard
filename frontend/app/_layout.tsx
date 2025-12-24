import { Stack } from 'expo-router';
import { COLORS } from './_utils/constants';
import { AppProvider } from './_context/AppContext';
import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { Platform } from 'react-native';

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    // Só adiciona listener de notificações em plataformas nativas
    if (Platform.OS === 'web') return;
    
    try {
      // Listener para quando o usuário toca na notificação
      const subscription = Notifications.addNotificationResponseReceivedListener(response => {
        const data = response.notification.request.content.data;
        
        if (data.alarmId) {
          // Navegar para tela de confirmação
          router.push(`/alarm-confirm?alarmId=${data.alarmId}`);
        }
      });

      return () => subscription.remove();
    } catch (error) {
      console.log('Notifications not supported:', error);
    }
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

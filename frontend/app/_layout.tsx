import { Stack } from 'expo-router';
import { COLORS } from './utils/constants';
import { AppProvider } from './context/AppContext';

export default function RootLayout() {
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

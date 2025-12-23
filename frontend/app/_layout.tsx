import { Stack } from 'expo-router';
import { COLORS } from './utils/constants';

export default function RootLayout() {
  return (
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
    </Stack>
  );
}

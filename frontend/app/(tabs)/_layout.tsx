import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/constants';
import { Platform, View, Text, StyleSheet, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const LogoHeader = () => (
  <View style={styles.logoContainer}>
    <Image 
      source={require('../../assets/images/pillguard-logo.png')} 
      style={styles.logoImage}
      resizeMode="contain"
    />
  </View>
);

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          height: Platform.OS === 'android' ? 70 + insets.bottom : 60,
          paddingBottom: Platform.OS === 'android' ? 16 + insets.bottom : 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: COLORS.white,
        headerTitleStyle: {
          fontWeight: '700',
        },
        headerRight: () => <LogoHeader />,
      }}
    >
        <Tabs.Screen
          name="home"
          options={{
            title: 'Início',
            tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="medications"
          options={{
            title: 'Medicamentos',
            tabBarIcon: ({ color, size }) => <Ionicons name="medkit" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="alarms"
          options={{
            title: 'Alarmes',
            tabBarIcon: ({ color, size }) => <Ionicons name="alarm" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: 'Histórico',
            tabBarIcon: ({ color, size }) => <Ionicons name="time" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Config',
            tabBarIcon: ({ color, size }) => <Ionicons name="settings" size={size} color={color} />,
          }}
        />
      </Tabs>
  );
}

const styles = StyleSheet.create({
  logoContainer: {
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: 70,
    height: 56,
  },
});
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../_utils/constants';
import { useApp } from '../_context/AppContext';

export const ProfileHeader: React.FC = () => {
  const { currentProfile } = useApp();

  if (!currentProfile) return null;

  return (
    <View style={styles.container}>
      <View style={[styles.avatar, { backgroundColor: currentProfile.color }]}>
        <Ionicons name={currentProfile.avatar as any || 'person'} size={20} color={COLORS.white} />
      </View>
      <Text style={styles.greeting}>Olá, {currentProfile.name}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  greeting: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
});

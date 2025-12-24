import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Alarm, Medication } from '../_types';
import { COLORS } from '../_utils/constants';

interface AlarmCardProps {
  alarm: Alarm;
  medications: Medication[];
  onPress?: () => void;
}

export const AlarmCard: React.FC<AlarmCardProps> = ({ alarm, medications, onPress }) => {
  const alarmMeds = medications.filter(med => alarm.medication_ids.includes(med.id));

  const getFrequencyText = () => {
    switch (alarm.frequency) {
      case 'daily':
        return 'Todos os dias';
      case 'alternate':
        return 'Dias alternados';
      case 'specific':
        return 'Dias específicos';
      default:
        return alarm.frequency;
    }
  };

  return (
    <TouchableOpacity
      style={[styles.card, !alarm.is_active && styles.inactiveCard]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.timeContainer}>
          <Ionicons 
            name={alarm.is_critical ? "alarm" : "time"} 
            size={32} 
            color={alarm.is_critical ? COLORS.critical : COLORS.primary} 
          />
          <Text style={styles.time}>{alarm.time}</Text>
        </View>
        
        {alarm.is_critical && (
          <View style={[styles.badge, { backgroundColor: COLORS.critical }]}>
            <Text style={styles.badgeText}>CRÍTICO</Text>
          </View>
        )}
      </View>

      <Text style={styles.frequency}>{getFrequencyText()}</Text>

      <View style={styles.medicationsContainer}>
        {alarmMeds.map((med, index) => (
          <View key={med.id} style={styles.medItem}>
            <Ionicons name="medical" size={16} color={COLORS.primary} />
            <Text style={styles.medName}>
              {med.name} ({med.dosage})
            </Text>
          </View>
        ))}
      </View>

      {!alarm.is_active && (
        <Text style={styles.inactiveText}>Alarme desativado</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inactiveCard: {
    opacity: 0.6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  time: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.text,
    marginLeft: 12,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  frequency: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 12,
  },
  medicationsContainer: {
    gap: 8,
  },
  medItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  medName: {
    fontSize: 16,
    color: COLORS.text,
  },
  inactiveText: {
    marginTop: 8,
    fontSize: 14,
    color: COLORS.warning,
    fontStyle: 'italic',
  },
});
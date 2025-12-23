import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from './context/AppContext';
import { COLORS } from './utils/constants';
import { api } from './utils/api';
import { Button } from './components/Button';
import { NotificationService } from './services/NotificationService';

export default function AlarmConfirmScreen() {
  const { alarmId } = useLocalSearchParams();
  const router = useRouter();
  const { medications, alarms, refreshMedications, refreshStats } = useApp();
  
  const [alarm, setAlarm] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAlarm();
  }, [alarmId]);

  const loadAlarm = async () => {
    try {
      const alarmData = alarms.find(a => a.id === alarmId);
      if (!alarmData) {
        const data = await api.getAlarm(alarmId as string);
        setAlarm(data);
      } else {
        setAlarm(alarmData);
      }
    } catch (error) {
      console.error('Error loading alarm:', error);
      Alert.alert('Erro', 'Não foi possível carregar o alarme');
      router.back();
    }
  };

  const handleConfirm = async (status: 'taken' | 'skipped') => {
    if (!alarm) return;
    
    setLoading(true);
    try {
      // Registrar no histórico
      await api.createAlarmLog({
        alarm_id: alarm.id,
        medication_ids: alarm.medication_ids,
        profile_id: alarm.profile_id,
        scheduled_time: new Date().toISOString(),
        status,
      });
      
      await refreshMedications();
      await refreshStats();
      
      Alert.alert(
        'Confirmado!',
        status === 'taken' ? 'Medicamento registrado como tomado' : 'Medicamento pulado',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(tabs)/home'),
          },
        ]
      );
    } catch (error) {
      console.error('Error confirming alarm:', error);
      Alert.alert('Erro', 'Não foi possível registrar a confirmação');
    } finally {
      setLoading(false);
    }
  };

  const handleSnooze = async () => {
    if (!alarm) return;
    
    // Reagendar para daqui a 5 minutos
    const alarmMeds = medications.filter(med => alarm.medication_ids.includes(med.id));
    
    try {
      await NotificationService.scheduleRepeatCriticalAlarm(alarm, alarmMeds, 5);
      
      Alert.alert(
        'Adiado',
        'Alarme adiado para daqui a 5 minutos',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(tabs)/home'),
          },
        ]
      );
    } catch (error) {
      console.error('Error snoozing alarm:', error);
      Alert.alert('Erro', 'Não foi possível adiar o alarme');
    }
  };

  if (!alarm) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const alarmMeds = medications.filter(med => alarm.medication_ids.includes(med.id));

  return (
    <SafeAreaView style={[styles.container, alarm.is_critical && styles.criticalContainer]}>
      <View style={styles.content}>
        {/* Ícone grande */}
        <View style={[styles.iconContainer, alarm.is_critical && styles.criticalIcon]}>
          <Ionicons 
            name={alarm.is_critical ? "alarm" : "notifications"} 
            size={80} 
            color={COLORS.white} 
          />
        </View>

        {/* Título */}
        <Text style={styles.title}>
          {alarm.is_critical ? '🔴 ALARME CRÍTICO!' : '💊 Hora do Medicamento'}
        </Text>
        
        <Text style={styles.time}>{alarm.time}</Text>

        {/* Lista de medicamentos */}
        <View style={styles.medicationsContainer}>
          {alarmMeds.map((med) => (
            <View key={med.id} style={styles.medItem}>
              <Ionicons name="medical" size={24} color={COLORS.white} />
              <View style={styles.medInfo}>
                <Text style={styles.medName}>{med.name}</Text>
                <Text style={styles.medDosage}>{med.dosage}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Botões de ação */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.takenButton]}
            onPress={() => handleConfirm('taken')}
            disabled={loading}
          >
            <Ionicons name="checkmark-circle" size={32} color={COLORS.white} />
            <Text style={styles.actionButtonText}>Já Tomei</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.skipButton]}
            onPress={() => handleConfirm('skipped')}
            disabled={loading}
          >
            <Ionicons name="close-circle" size={32} color={COLORS.white} />
            <Text style={styles.actionButtonText}>Pular</Text>
          </TouchableOpacity>
        </View>

        {/* Botão de adiar (só para alarmes críticos) */}
        {alarm.is_critical && (
          <TouchableOpacity
            style={styles.snoozeButton}
            onPress={handleSnooze}
            disabled={loading}
          >
            <Ionicons name="time" size={20} color={COLORS.white} />
            <Text style={styles.snoozeText}>Adiar 5 minutos</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  criticalContainer: {
    backgroundColor: COLORS.critical,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: COLORS.white,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: COLORS.primary + 'CC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  criticalIcon: {
    backgroundColor: COLORS.critical + 'CC',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: 16,
  },
  time: {
    fontSize: 48,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 32,
  },
  medicationsContainer: {
    width: '100%',
    marginBottom: 40,
  },
  medItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  medInfo: {
    marginLeft: 12,
    flex: 1,
  },
  medName: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.white,
  },
  medDosage: {
    fontSize: 16,
    color: COLORS.white,
    opacity: 0.9,
    marginTop: 4,
  },
  actionsContainer: {
    width: '100%',
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 16,
    gap: 12,
  },
  takenButton: {
    backgroundColor: COLORS.success,
  },
  skipButton: {
    backgroundColor: COLORS.warning,
  },
  actionButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.white,
  },
  snoozeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    padding: 12,
    gap: 8,
  },
  snoozeText: {
    fontSize: 16,
    color: COLORS.white,
    opacity: 0.9,
  },
});

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { Alarm } from '../types';
import { COLORS } from '../utils/constants';
import { api } from '../utils/api';
import { Button } from '../components/Button';

export default function AlarmDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { medications, refreshAlarms } = useApp();
  const [alarm, setAlarm] = useState<Alarm | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlarm();
  }, [id]);

  const loadAlarm = async () => {
    try {
      const data = await api.getAlarm(id as string);
      setAlarm(data);
    } catch (error) {
      console.error('Error loading alarm:', error);
      Alert.alert('Erro', 'Não foi possível carregar o alarme');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async () => {
    if (!alarm) return;
    try {
      await api.updateAlarm(alarm.id, { is_active: !alarm.is_active });
      await refreshAlarms();
      await loadAlarm();
      Alert.alert(
        'Sucesso',
        alarm.is_active ? 'Alarme desativado' : 'Alarme ativado'
      );
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar o alarme');
    }
  };

  const handleTestAlarm = () => {
    // Simular alarme tocando - navegar para tela de confirmação
    router.push(`/alarm-confirm?alarmId=${alarm?.id}`);
  };

  const handleDelete = () => {
    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza que deseja excluir este alarme?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.deleteAlarm(id as string);
              await refreshAlarms();
              Alert.alert('Sucesso', 'Alarme excluído');
              router.back();
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir o alarme');
            }
          },
        },
      ]
    );
  };

  const getFrequencyText = () => {
    if (!alarm) return '';
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

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Carregando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!alarm) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color={COLORS.critical} />
          <Text style={styles.errorText}>Alarme não encontrado</Text>
          <Button title="Voltar" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  const alarmMeds = medications.filter(med => alarm.medication_ids.includes(med.id));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes do Alarme</Text>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
          <Ionicons name="trash" size={24} color={COLORS.critical} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Horário */}
          <View style={styles.section}>
            <View style={styles.timeContainer}>
              <Ionicons 
                name={alarm.is_critical ? "alarm" : "time"} 
                size={48} 
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

          {/* Frequência */}
          <View style={styles.infoSection}>
            <Text style={styles.label}>Frequência</Text>
            <View style={styles.infoCard}>
              <Ionicons name="calendar" size={20} color={COLORS.primary} />
              <Text style={styles.infoText}>{getFrequencyText()}</Text>
            </View>
          </View>

          {/* Medicamentos */}
          <View style={styles.infoSection}>
            <Text style={styles.label}>Medicamentos</Text>
            {alarmMeds.map(med => (
              <View key={med.id} style={styles.medCard}>
                <Ionicons name="medical" size={20} color={COLORS.primary} />
                <View style={styles.medInfo}>
                  <Text style={styles.medName}>{med.name}</Text>
                  <Text style={styles.medDosage}>{med.dosage}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Status */}
          <View style={styles.infoSection}>
            <Text style={styles.label}>Status</Text>
            <TouchableOpacity
              style={[
                styles.statusCard,
                alarm.is_active ? styles.statusActive : styles.statusInactive,
              ]}
              onPress={handleToggleActive}
            >
              <Ionicons 
                name={alarm.is_active ? "checkmark-circle" : "close-circle"} 
                size={24} 
                color={alarm.is_active ? COLORS.success : COLORS.critical} 
              />
              <Text style={styles.statusText}>
                {alarm.is_active ? 'Alarme Ativo' : 'Alarme Desativado'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Botão de exclusão */}
          <Button
            title="Excluir Alarme"
            onPress={handleDelete}
            variant="danger"
            style={styles.deleteButtonBottom}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  deleteButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 18,
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 24,
  },
  section: {
    marginBottom: 32,
    alignItems: 'center',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  time: {
    fontSize: 48,
    fontWeight: '700',
    color: COLORS.text,
    marginLeft: 16,
  },
  badge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  infoSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  infoText: {
    fontSize: 16,
    color: COLORS.text,
  },
  medCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    gap: 12,
  },
  medInfo: {
    flex: 1,
  },
  medName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  medDosage: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 4,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 2,
  },
  statusActive: {
    borderColor: COLORS.success,
  },
  statusInactive: {
    borderColor: COLORS.critical,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  deleteButtonBottom: {
    marginTop: 16,
    marginBottom: 40,
  },
});

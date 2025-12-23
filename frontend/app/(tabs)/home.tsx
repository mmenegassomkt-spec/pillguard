import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { COLORS } from '../utils/constants';
import { format } from 'date-fns';

export default function HomeScreen() {
  const { currentProfile, alarms, medications, stats, refreshAlarms, refreshMedications, refreshStats } = useApp();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!currentProfile) {
      router.replace('/');
    }
  }, [currentProfile]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshAlarms(), refreshMedications(), refreshStats()]);
    setRefreshing(false);
  };

  const getUpcomingAlarms = () => {
    const now = new Date();
    const currentTime = format(now, 'HH:mm');
    return alarms.filter(alarm => alarm.is_active && alarm.time >= currentTime).slice(0, 3);
  };

  const upcomingAlarms = getUpcomingAlarms();

  if (!currentProfile) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header com perfil */}
        <View style={styles.header}>
          <View style={styles.profileInfo}>
            <View style={[styles.avatar, { backgroundColor: currentProfile.color }]}>
              <Ionicons name={currentProfile.avatar as any || 'person'} size={32} color={COLORS.white} />
            </View>
            <Text style={styles.greeting}>Olá, {currentProfile.name}</Text>
          </View>
        </View>

        {/* Stats */}
        {stats && (
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <Ionicons name="medkit" size={24} color={COLORS.primary} />
                <Text style={styles.statNumber}>{stats.medications_count}</Text>
              </View>
              <Text style={styles.statLabel}>Medicamentos</Text>
            </View>
            
            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <Ionicons name="alarm" size={24} color={COLORS.primary} />
                <Text style={styles.statNumber}>{stats.alarms_count}</Text>
              </View>
              <Text style={styles.statLabel}>Alarmes Ativos</Text>
            </View>
            
            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
                <Text style={styles.statNumber}>{stats.adherence_rate}%</Text>
              </View>
              <Text style={styles.statLabel}>Adesão</Text>
            </View>
          </View>
        )}

        {/* Alerta de estoque baixo */}
        {stats && stats.low_stock_count > 0 && (
          <View style={styles.alertCard}>
            <View style={styles.alertHeader}>
              <Ionicons name="warning" size={24} color={COLORS.warning} />
              <Text style={styles.alertTitle}>Estoque Baixo</Text>
            </View>
            <Text style={styles.alertText}>
              {stats.low_stock_count} medicamento(s) com estoque baixo
            </Text>
            <TouchableOpacity 
              style={styles.alertButton}
              onPress={() => router.push('/(tabs)/medications')}
            >
              <Text style={styles.alertButtonText}>Ver medicamentos</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Próximos alarmes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Próximos Alarmes</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/alarms')}>
              <Text style={styles.seeAll}>Ver todos</Text>
            </TouchableOpacity>
          </View>

          {upcomingAlarms.length > 0 ? (
            upcomingAlarms.map(alarm => {
              const alarmMeds = medications.filter(med => alarm.medication_ids.includes(med.id));
              return (
                <View key={alarm.id} style={styles.alarmItem}>
                  <View style={styles.alarmTime}>
                    <Ionicons 
                      name={alarm.is_critical ? "alarm" : "time"} 
                      size={24} 
                      color={alarm.is_critical ? COLORS.critical : COLORS.primary} 
                    />
                    <Text style={styles.alarmTimeText}>{alarm.time}</Text>
                  </View>
                  <View style={styles.alarmMeds}>
                    {alarmMeds.map(med => (
                      <Text key={med.id} style={styles.alarmMedText}>
                        • {med.name} ({med.dosage})
                      </Text>
                    ))}
                  </View>
                </View>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="alarm-outline" size={48} color={COLORS.textLight} />
              <Text style={styles.emptyText}>Nenhum alarme agendado</Text>
            </View>
          )}
        </View>

        {/* Botões de ação rápida */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/add-medication')}
          >
            <Ionicons name="add-circle" size={24} color={COLORS.white} />
            <Text style={styles.actionButtonText}>Novo Medicamento</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: COLORS.success }]}
            onPress={() => router.push('/add-alarm')}
          >
            <Ionicons name="add-circle" size={24} color={COLORS.white} />
            <Text style={styles.actionButtonText}>Novo Alarme</Text>
          </TouchableOpacity>
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
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  greeting: {
    fontSize: 16,
    color: COLORS.white,
    opacity: 0.9,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.white,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: 4,
  },
  alertCard: {
    backgroundColor: COLORS.warning + '20',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.warning,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 8,
  },
  alertText: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 12,
  },
  alertButton: {
    backgroundColor: COLORS.warning,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  alertButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  seeAll: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  alarmItem: {
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
  alarmTime: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  alarmTimeText: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginLeft: 12,
  },
  alarmMeds: {
    gap: 4,
  },
  alarmMedText: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textLight,
    marginTop: 12,
  },
  quickActions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
});
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../_context/AppContext';
import { ProfileHeader } from '../_components/ProfileHeader';
import { api } from '../_utils/api';
import { AlarmLog } from '../_types';
import { COLORS } from '../_utils/constants';
import { format } from 'date-fns';
import { useCustomAlert } from '../_components/CustomAlert';

export default function HistoryScreen() {
  const { currentProfile } = useApp();
  const router = useRouter();
  const { showAlert, AlertComponent } = useCustomAlert();
  const [logs, setLogs] = useState<AlarmLog[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentProfile) {
      router.replace('/');
    } else {
      loadLogs();
    }
  }, [currentProfile]);

  const loadLogs = async () => {
    if (!currentProfile) return;
    try {
      const data = await api.getAlarmLogs(currentProfile.id, 50);
      setLogs(data);
    } catch (error) {
      console.error('Error loading logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLogs();
    setRefreshing(false);
  };

  const handleClearHistory = () => {
    showAlert(
      'Limpar Histórico',
      'Tem certeza que deseja apagar todo o histórico?\n\nEsta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpar',
          style: 'destructive',
          onPress: async () => {
            try {
              if (currentProfile) {
                await api.clearAlarmLogs(currentProfile.id);
                setLogs([]);
                showAlert('Sucesso', 'Histórico limpo com sucesso', undefined, 'success');
              }
            } catch (error) {
              showAlert('Erro', 'Não foi possível limpar o histórico', undefined, 'error');
            }
          },
        },
      ],
      'confirm'
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'taken':
        return { name: 'checkmark-circle', color: COLORS.success };
      case 'skipped':
        return { name: 'close-circle', color: COLORS.warning };
      case 'missed':
        return { name: 'alert-circle', color: COLORS.critical };
      default:
        return { name: 'help-circle', color: COLORS.textLight };
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'taken':
        return 'Tomado';
      case 'skipped':
        return 'Pulado';
      case 'missed':
        return 'Perdido';
      default:
        return status;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <AlertComponent />
      <ProfileHeader />
      
      {/* Header com botão Limpar */}
      {logs.length > 0 && (
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Histórico</Text>
          <TouchableOpacity style={styles.clearButton} onPress={handleClearHistory}>
            <Ionicons name="trash-outline" size={18} color={COLORS.critical} />
            <Text style={styles.clearButtonText}>Limpar</Text>
          </TouchableOpacity>
        </View>
      )}

      {logs.length > 0 ? (
        <ScrollView 
          style={styles.scrollView}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <View style={styles.content}>
            {logs.map((log) => {
              const icon = getStatusIcon(log.status);
              return (
                <View key={log.id} style={styles.logItem}>
                  <View style={styles.logHeader}>
                    <Ionicons name={icon.name as any} size={28} color={icon.color} />
                    <View style={styles.logInfo}>
                      <Text style={styles.logStatus}>{getStatusText(log.status)}</Text>
                      <Text style={styles.logTime}>
                        {format(new Date(log.scheduled_time), "dd/MM/yyyy 'às' HH:mm")}
                      </Text>
                    </View>
                  </View>
                  {log.notes && (
                    <Text style={styles.logNotes}>{log.notes}</Text>
                  )}
                </View>
              );
            })}
          </View>
        </ScrollView>
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="time-outline" size={64} color={COLORS.textLight} />
          <Text style={styles.emptyTitle}>Nenhum histórico</Text>
          <Text style={styles.emptyText}>Seu histórico de medicamentos aparecerá aqui</Text>
        </View>
      )}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: COLORS.critical + '15',
    gap: 4,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.critical,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  logItem: {
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
  logHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logInfo: {
    marginLeft: 12,
    flex: 1,
  },
  logStatus: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  logTime: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 4,
  },
  logNotes: {
    fontSize: 14,
    color: COLORS.text,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 8,
    textAlign: 'center',
  },
});
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform, Modal } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { Alarm } from '../types';
import { COLORS } from '../utils/constants';
import { api } from '../utils/api';
import { Button } from '../components/Button';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar, LocaleConfig } from 'react-native-calendars';

// Configurar calendário em português
LocaleConfig.locales['pt-br'] = {
  monthNames: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
  monthNamesShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
  dayNames: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
  dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
  today: 'Hoje'
};
LocaleConfig.defaultLocale = 'pt-br';

const FREQUENCIES = [
  { value: 'daily', label: 'Todo dia' },
  { value: 'alternate', label: 'Alternado' },
  { value: 'specific', label: 'Selecionar' },
];

export default function AlarmDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { medications, refreshAlarms } = useApp();
  const [alarm, setAlarm] = useState<Alarm | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [editedTime, setEditedTime] = useState<Date>(new Date());
  const [editedFrequency, setEditedFrequency] = useState('daily');
  const [selectedDates, setSelectedDates] = useState<{[key: string]: {selected: boolean, selectedColor: string}}>({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadAlarm();
  }, [id]);

  const loadAlarm = async () => {
    try {
      const data = await api.getAlarm(id as string);
      setAlarm(data);
      // Parse time string to Date
      const [hours, minutes] = data.time.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      setEditedTime(date);
      setEditedFrequency(data.frequency);
      // Carregar datas específicas se houver
      if (data.specific_dates && data.specific_dates.length > 0) {
        const dates: {[key: string]: {selected: boolean, selectedColor: string}} = {};
        data.specific_dates.forEach((d: string) => {
          dates[d] = { selected: true, selectedColor: COLORS.primary };
        });
        setSelectedDates(dates);
      }
      setHasChanges(false);
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

  const handleTimeChange = (event: any, selectedDate?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setEditedTime(selectedDate);
      setHasChanges(true);
    }
  };

  const handleFrequencyChange = (frequency: string) => {
    setEditedFrequency(frequency);
    setHasChanges(true);
    if (frequency === 'specific') {
      setShowCalendar(true);
    }
  };

  const handleDayPress = (day: any) => {
    const dateStr = day.dateString;
    setSelectedDates(prev => {
      const newDates = { ...prev };
      if (newDates[dateStr]) {
        delete newDates[dateStr];
      } else {
        newDates[dateStr] = { selected: true, selectedColor: COLORS.primary };
      }
      return newDates;
    });
    setHasChanges(true);
  };

  const handleSaveChanges = async () => {
    if (!alarm) return;
    
    // Validar se tem datas selecionadas quando for "Selecionar"
    if (editedFrequency === 'specific' && Object.keys(selectedDates).length === 0) {
      Alert.alert('Atenção', 'Selecione pelo menos uma data para o alarme.');
      return;
    }
    
    setSaving(true);
    try {
      const timeString = `${editedTime.getHours().toString().padStart(2, '0')}:${editedTime.getMinutes().toString().padStart(2, '0')}`;
      const specificDates = Object.keys(selectedDates);
      await api.updateAlarm(alarm.id, { 
        time: timeString,
        frequency: editedFrequency,
        specific_dates: editedFrequency === 'specific' ? specificDates : []
      });
      await refreshAlarms();
      Alert.alert('Sucesso', 'Alarme atualizado com sucesso!');
      router.back();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar as alterações');
    } finally {
      setSaving(false);
    }
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

  const getFrequencyText = (freq: string) => {
    switch (freq) {
      case 'daily':
        return 'Todos os dias';
      case 'alternate':
        return 'Dias alternados';
      case 'specific':
        return 'Dias específicos';
      default:
        return freq;
    }
  };

  const formatTime = (date: Date) => {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
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
          {/* Horário - Editável */}
          <View style={styles.section}>
            <Text style={styles.label}>Horário</Text>
            <TouchableOpacity 
              style={styles.timeCard}
              onPress={() => setShowTimePicker(true)}
            >
              <Ionicons 
                name={alarm.is_critical ? "alarm" : "time"} 
                size={32} 
                color={alarm.is_critical ? COLORS.critical : COLORS.primary} 
              />
              <Text style={styles.time}>{formatTime(editedTime)}</Text>
              <Ionicons name="pencil" size={20} color={COLORS.primary} />
            </TouchableOpacity>
            {alarm.is_critical && (
              <View style={[styles.badge, { backgroundColor: COLORS.critical }]}>
                <Text style={styles.badgeText}>CRÍTICO</Text>
              </View>
            )}
          </View>

          {showTimePicker && (
            <DateTimePicker
              value={editedTime}
              mode="time"
              is24Hour={true}
              display="spinner"
              onChange={handleTimeChange}
            />
          )}

          {/* Frequência - Editável */}
          <View style={styles.infoSection}>
            <Text style={styles.label}>Frequência</Text>
            <View style={styles.frequencyOptions}>
              {FREQUENCIES.map(freq => (
                <TouchableOpacity
                  key={freq.value}
                  style={[
                    styles.frequencyOption,
                    editedFrequency === freq.value && styles.frequencySelected
                  ]}
                  onPress={() => handleFrequencyChange(freq.value)}
                >
                  <Text style={[
                    styles.frequencyText,
                    editedFrequency === freq.value && styles.frequencyTextSelected
                  ]}>
                    {freq.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            {/* Calendário para datas específicas */}
            {editedFrequency === 'specific' && (
              <View style={styles.calendarContainer}>
                <Text style={styles.calendarHint}>
                  Toque nos dias que deseja ativar o alarme ({Object.keys(selectedDates).length} selecionados)
                </Text>
                <Calendar
                  markedDates={selectedDates}
                  onDayPress={handleDayPress}
                  minDate={new Date().toISOString().split('T')[0]}
                  theme={{
                    todayTextColor: COLORS.primary,
                    selectedDayBackgroundColor: COLORS.primary,
                    arrowColor: COLORS.primary,
                    textDayFontSize: 14,
                    textMonthFontSize: 16,
                    textDayHeaderFontSize: 12,
                  }}
                  style={styles.calendar}
                />
              </View>
            )}
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
            <Text style={styles.label}>Status (Ativar/Desativar)</Text>
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

          {/* Botão de Salvar */}
          <Button
            title="💾 Salvar alterações"
            onPress={handleSaveChanges}
            variant="primary"
            loading={saving}
            style={styles.saveButton}
          />

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
    backgroundColor: COLORS.primary,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.white,
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
    marginBottom: 24,
    alignItems: 'center',
  },
  timeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    gap: 12,
    width: '100%',
  },
  time: {
    fontSize: 40,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
  },
  badge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 12,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  infoSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 10,
  },
  frequencyOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  frequencyOption: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  frequencySelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  frequencyText: {
    fontSize: 13,
    color: COLORS.textLight,
  },
  frequencyTextSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  calendarContainer: {
    marginTop: 16,
  },
  calendarHint: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: 8,
    textAlign: 'center',
  },
  calendar: {
    borderRadius: 12,
    overflow: 'hidden',
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
    padding: 14,
    marginBottom: 8,
    gap: 12,
  },
  medInfo: {
    flex: 1,
  },
  medName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  medDosage: {
    fontSize: 13,
    color: COLORS.textLight,
    marginTop: 2,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
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
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  saveButton: {
    marginTop: 8,
  },
  deleteButtonBottom: {
    marginTop: 12,
    marginBottom: 40,
  },
});

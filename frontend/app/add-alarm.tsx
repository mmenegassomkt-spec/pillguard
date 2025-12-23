import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS, FREQUENCIES, WEEKDAYS } from './utils/constants';
import { api } from './utils/api';
import { Button } from './components/Button';
import { useApp } from './context/AppContext';
import { Medication } from './types';

export default function AddAlarmScreen() {
  const router = useRouter();
  const { currentProfile, medications, refreshAlarms, premiumTrial } = useApp();
  
  const [time, setTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [frequency, setFrequency] = useState<'daily' | 'alternate' | 'specific'>('daily');
  const [specificDays, setSpecificDays] = useState<number[]>([]);
  const [selectedMedications, setSelectedMedications] = useState<string[]>([]);
  const [isCritical, setIsCritical] = useState(false);
  const [loading, setLoading] = useState(false);

  const isPremiumActive = premiumTrial && premiumTrial.is_active;

  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const toggleMedication = (medId: string) => {
    if (selectedMedications.includes(medId)) {
      setSelectedMedications(selectedMedications.filter(id => id !== medId));
    } else {
      // Premium check: múltiplos medicamentos
      if (selectedMedications.length >= 1 && !isPremiumActive) {
        Alert.alert(
          'Funcionalidade Premium',
          'Adicionar múltiplos medicamentos em um alarme é uma funcionalidade premium. Ative o trial gratuito nas configurações!',
          [{ text: 'OK' }]
        );
        return;
      }
      setSelectedMedications([...selectedMedications, medId]);
    }
  };

  const toggleDay = (day: number) => {
    if (specificDays.includes(day)) {
      setSpecificDays(specificDays.filter(d => d !== day));
    } else {
      setSpecificDays([...specificDays, day]);
    }
  };

  const handleCreate = async () => {
    if (!currentProfile) {
      Alert.alert('Erro', 'Nenhum perfil selecionado');
      return;
    }

    if (selectedMedications.length === 0) {
      Alert.alert('Erro', 'Selecione pelo menos um medicamento');
      return;
    }

    if (frequency === 'specific' && specificDays.length === 0) {
      Alert.alert('Erro', 'Selecione pelo menos um dia da semana');
      return;
    }

    // Premium check: alarmes críticos
    if (isCritical && !isPremiumActive) {
      Alert.alert(
        'Funcionalidade Premium',
        'Alarmes críticos são uma funcionalidade premium. Ative o trial gratuito nas configurações!',
        [{ text: 'OK' }]
      );
      return;
    }

    setLoading(true);
    try {
      await api.createAlarm({
        profile_id: currentProfile.id,
        time: formatTime(time),
        frequency,
        specific_days: frequency === 'specific' ? specificDays : undefined,
        medication_ids: selectedMedications,
        is_critical: isCritical,
        repeat_interval_minutes: 5,
        is_active: true,
      });
      
      await refreshAlarms();
      Alert.alert('Sucesso!', 'Alarme criado com sucesso');
      router.back();
    } catch (error) {
      console.error('Error creating alarm:', error);
      Alert.alert('Erro', 'Não foi possível criar o alarme');
    } finally {
      setLoading(false);
    }
  };

  const onTimeChange = (event: any, selectedDate?: Date) => {
    setShowTimePicker(false);
    if (selectedDate) {
      setTime(selectedDate);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Adicionar Alarme</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.scrollView}>
          <View style={styles.content}>
            {/* Horário */}
            <View style={styles.section}>
              <Text style={styles.label}>Horário</Text>
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => setShowTimePicker(true)}
              >
                <Ionicons name="time" size={32} color={COLORS.primary} />
                <Text style={styles.timeText}>{formatTime(time)}</Text>
              </TouchableOpacity>
              {showTimePicker && (
                <DateTimePicker
                  value={time}
                  mode="time"
                  is24Hour={true}
                  display="default"
                  onChange={onTimeChange}
                />
              )}
            </View>

            {/* Frequência */}
            <View style={styles.section}>
              <Text style={styles.label}>Frequência</Text>
              {FREQUENCIES.map((freq) => (
                <TouchableOpacity
                  key={freq.value}
                  style={[
                    styles.frequencyOption,
                    frequency === freq.value && styles.frequencySelected,
                  ]}
                  onPress={() => setFrequency(freq.value as any)}
                >
                  <View style={styles.radioButton}>
                    {frequency === freq.value && <View style={styles.radioButtonInner} />}
                  </View>
                  <Text style={[styles.frequencyText, frequency === freq.value && styles.frequencyTextSelected]}>
                    {freq.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Dias específicos */}
            {frequency === 'specific' && (
              <View style={styles.section}>
                <Text style={styles.label}>Selecione os dias</Text>
                <View style={styles.weekdaysContainer}>
                  {WEEKDAYS.map((day) => (
                    <TouchableOpacity
                      key={day.value}
                      style={[
                        styles.dayButton,
                        specificDays.includes(day.value) && styles.dayButtonSelected,
                      ]}
                      onPress={() => toggleDay(day.value)}
                    >
                      <Text style={[
                        styles.dayText,
                        specificDays.includes(day.value) && styles.dayTextSelected,
                      ]}>
                        {day.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Medicamentos */}
            <View style={styles.section}>
              <Text style={styles.label}>Medicamentos *</Text>
              {medications.length > 0 ? (
                medications.map((med) => (
                  <TouchableOpacity
                    key={med.id}
                    style={[
                      styles.medicationOption,
                      selectedMedications.includes(med.id) && styles.medicationSelected,
                    ]}
                    onPress={() => toggleMedication(med.id)}
                  >
                    <View style={styles.checkboxContainer}>
                      <Ionicons
                        name={selectedMedications.includes(med.id) ? "checkbox" : "square-outline"}
                        size={24}
                        color={COLORS.primary}
                      />
                      <View style={styles.medicationInfo}>
                        <Text style={styles.medicationName}>{med.name}</Text>
                        <Text style={styles.medicationDosage}>{med.dosage}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>
                    Nenhum medicamento cadastrado. Adicione medicamentos primeiro.
                  </Text>
                </View>
              )}
            </View>

            {/* Alarme Crítico (Premium) */}
            <View style={styles.section}>
              <TouchableOpacity
                style={styles.premiumOption}
                onPress={() => {
                  if (!isPremiumActive) {
                    Alert.alert(
                      'Funcionalidade Premium',
                      'Alarmes críticos são uma funcionalidade premium. Ative o trial gratuito nas configurações!',
                      [{ text: 'OK' }]
                    );
                    return;
                  }
                  setIsCritical(!isCritical);
                }}
              >
                <View style={styles.premiumHeader}>
                  <Ionicons
                    name={isCritical ? "checkbox" : "square-outline"}
                    size={24}
                    color={isPremiumActive ? COLORS.critical : COLORS.textLight}
                  />
                  <View style={styles.premiumTextContainer}>
                    <View style={styles.premiumTitleContainer}>
                      <Text style={[styles.premiumTitle, !isPremiumActive && styles.disabledText]}>
                        Alarme Crítico
                      </Text>
                      {!isPremiumActive && (
                        <View style={styles.premiumBadge}>
                          <Ionicons name="star" size={12} color="#FFD700" />
                          <Text style={styles.premiumBadgeText}>PREMIUM</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.premiumDescription}>
                      O alarme insiste até você confirmar (não pode ser silenciado)
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>

            {medications.length === 0 ? (
              <View style={styles.noMedicationsWarning}>
                <Ionicons name="alert-circle" size={48} color={COLORS.warning} />
                <Text style={styles.noMedicationsText}>
                  Você precisa cadastrar pelo menos um medicamento antes de criar um alarme.
                </Text>
                <TouchableOpacity
                  style={styles.goToMedicationsButton}
                  onPress={() => router.push('/add-medication')}
                >
                  <Text style={styles.goToMedicationsButtonText}>
                    Cadastrar Medicamento
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Button
                title="Criar Alarme"
                onPress={handleCreate}
                loading={loading}
                style={styles.createButton}
              />
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  timeButton: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  timeText: {
    fontSize: 48,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 8,
  },
  frequencyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  frequencySelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  frequencyText: {
    fontSize: 16,
    color: COLORS.text,
  },
  frequencyTextSelected: {
    fontWeight: '600',
    color: COLORS.primary,
  },
  weekdaysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayButtonSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  dayTextSelected: {
    color: COLORS.white,
  },
  medicationOption: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  medicationSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  medicationInfo: {
    flex: 1,
  },
  medicationName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  medicationDosage: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 4,
  },
  premiumOption: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  premiumHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  premiumTextContainer: {
    flex: 1,
  },
  premiumTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  premiumTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD70020',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 4,
  },
  premiumBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B8860B',
  },
  premiumDescription: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  disabledText: {
    color: COLORS.textLight,
  },
  emptyState: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  noMedicationsWarning: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: COLORS.warning + '20',
    borderRadius: 12,
    marginTop: 16,
    marginBottom: 40,
  },
  noMedicationsText: {
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  goToMedicationsButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    width: '100%',
  },
  goToMedicationsButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  createButton: {
    marginTop: 8,
    marginBottom: 40,
  },
});

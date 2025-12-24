import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { Medication } from '../types';
import { COLORS, PRIORITY_COLORS } from '../utils/constants';
import { api } from '../utils/api';
import { Button } from '../components/Button';
import { useCustomAlert } from '../components/CustomAlert';

export default function MedicationDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { refreshMedications } = useApp();
  const { showAlert, AlertComponent } = useCustomAlert();
  const [medication, setMedication] = useState<Medication | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedDosage, setEditedDosage] = useState('');
  const [editingDosage, setEditingDosage] = useState(false);

  useEffect(() => {
    loadMedication();
  }, [id]);

  const loadMedication = async () => {
    try {
      const data = await api.getMedication(id as string);
      setMedication(data);
      setEditedName(data.name);
      setEditedDosage(data.dosage);
    } catch (error) {
      console.error('Error loading medication:', error);
      showAlert('Erro', 'Não foi possível carregar o medicamento', undefined, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveName = async () => {
    if (!medication || !editedName.trim()) return;
    try {
      await api.updateMedication(medication.id, { name: editedName.trim() });
      await loadMedication();
      await refreshMedications();
      setEditingName(false);
      showAlert('Sucesso', 'Nome atualizado', undefined, 'success');
    } catch (error) {
      showAlert('Erro', 'Não foi possível atualizar o nome', undefined, 'error');
    }
  };

  const handleSaveDosage = async () => {
    if (!medication || !editedDosage.trim()) return;
    try {
      await api.updateMedication(medication.id, { dosage: editedDosage.trim() });
      await loadMedication();
      await refreshMedications();
      setEditingDosage(false);
      showAlert('Sucesso', 'Dosagem atualizada', undefined, 'success');
    } catch (error) {
      showAlert('Erro', 'Não foi possível atualizar a dosagem', undefined, 'error');
    }
  };

  const handleDelete = () => {
    showAlert(
      'Confirmar exclusão',
      'Tem certeza que deseja excluir este medicamento?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.deleteMedication(id as string);
              await refreshMedications();
              router.back();
            } catch (error) {
              showAlert('Erro', 'Não foi possível excluir o medicamento', undefined, 'error');
            }
          },
        },
      ],
      'confirm'
    );
  };

  const handleUpdateStock = async (increment: number) => {
    if (!medication) return;
    const newStock = Math.max(0, medication.stock_quantity + increment);
    try {
      await api.updateMedication(medication.id, { stock_quantity: newStock });
      await loadMedication();
      await refreshMedications();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar o estoque');
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

  if (!medication) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color={COLORS.critical} />
          <Text style={styles.errorText}>Medicamento não encontrado</Text>
          <Button title="Voltar" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  const priorityColor = PRIORITY_COLORS[medication.priority];
  const isLowStock = medication.stock_quantity <= medication.min_stock_alert;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes do Medicamento</Text>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
          <Ionicons name="trash" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.scrollView}>
          <View style={styles.content}>
            {/* Nome e Prioridade */}
            <View style={[styles.mainCard, { borderLeftColor: priorityColor, borderLeftWidth: 4 }]}>
              <View style={styles.cardHeader}>
                <Ionicons name="medical" size={20} color={priorityColor} />
                <View style={styles.cardContent}>
                  {editingName ? (
                    <View style={styles.editContainer}>
                      <TextInput
                        style={styles.editInput}
                        value={editedName}
                        onChangeText={setEditedName}
                        autoFocus
                      />
                      <View style={styles.editActions}>
                        <TouchableOpacity onPress={handleSaveName} style={styles.saveButton}>
                          <Ionicons name="checkmark" size={20} color={COLORS.white} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => { setEditedName(medication!.name); setEditingName(false); }} style={styles.cancelButton}>
                          <Ionicons name="close" size={20} color={COLORS.white} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <TouchableOpacity onPress={() => setEditingName(true)} style={styles.nameContainer}>
                      <Text style={styles.medName}>{medication.name}</Text>
                      <Ionicons name="pencil" size={16} color={COLORS.primary} />
                    </TouchableOpacity>
                  )}
                  
                  <View style={styles.dosageRow}>
                    {editingDosage ? (
                      <View style={[styles.editContainer, { flex: 1 }]}>
                        <TextInput
                          style={styles.editInput}
                          value={editedDosage}
                          onChangeText={setEditedDosage}
                          autoFocus
                        />
                        <View style={styles.editActions}>
                          <TouchableOpacity onPress={handleSaveDosage} style={styles.saveButton}>
                            <Ionicons name="checkmark" size={20} color={COLORS.white} />
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => { setEditedDosage(medication!.dosage); setEditingDosage(false); }} style={styles.cancelButton}>
                            <Ionicons name="close" size={20} color={COLORS.white} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : (
                      <>
                        <TouchableOpacity onPress={() => setEditingDosage(true)} style={styles.dosageContainer}>
                          <Text style={styles.dosage}>{medication.dosage}</Text>
                          <Ionicons name="pencil" size={14} color={COLORS.textLight} />
                        </TouchableOpacity>
                        {medication.priority !== 'normal' && (
                          <View style={[styles.priorityBadge, { backgroundColor: priorityColor }]}>
                            <Text style={styles.badgeText}>{medication.priority.toUpperCase()}</Text>
                          </View>
                        )}
                      </>
                    )}
                  </View>
                </View>
              </View>
            </View>

          {/* Estoque */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Estoque</Text>
            <View style={[styles.stockCard, isLowStock && styles.lowStockCard]}>
              <View style={styles.stockInfo}>
                <Ionicons 
                  name={isLowStock ? "warning" : "cube"} 
                  size={28} 
                  color={isLowStock ? COLORS.warning : COLORS.primary} 
                />
                <View style={styles.stockNumberRow}>
                  <Text style={styles.stockNumber}>{medication.stock_quantity}</Text>
                  <Text style={styles.stockLabel}>unidades</Text>
                </View>
                {isLowStock && (
                  <Text style={styles.lowStockWarning}>Estoque baixo!</Text>
                )}
              </View>
              <View style={styles.stockControls}>
                <TouchableOpacity 
                  style={styles.stockButtonSmall}
                  onPress={() => handleUpdateStock(-1)}
                >
                  <Ionicons name="remove" size={20} color={COLORS.white} />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.stockButtonSmall, { backgroundColor: COLORS.success }]}
                  onPress={() => handleUpdateStock(1)}
                >
                  <Ionicons name="add" size={20} color={COLORS.white} />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.stockButtonSmall, { backgroundColor: COLORS.primary }]}
                  onPress={() => router.back()}
                >
                  <Text style={styles.okButtonText}>OK</Text>
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.alertThreshold}>
              Alerta configurado para {medication.min_stock_alert} unidades
            </Text>
          </View>

          {/* Informações do Médico */}
          {(medication.doctor_name || medication.doctor_contact) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Médico Responsável</Text>
              <View style={styles.infoCard}>
                {medication.doctor_name && (
                  <View style={styles.infoRow}>
                    <Ionicons name="person" size={20} color={COLORS.primary} />
                    <Text style={styles.infoText}>{medication.doctor_name}</Text>
                  </View>
                )}
                {medication.doctor_contact && (
                  <View style={styles.infoRow}>
                    <Ionicons name="call" size={20} color={COLORS.primary} />
                    <Text style={styles.infoText}>{medication.doctor_contact}</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Fotos */}
          {(medication.prescription_photo || medication.box_photo) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Fotos</Text>
              {medication.prescription_photo && (
                <View style={styles.photoContainer}>
                  <Text style={styles.photoLabel}>Receita Médica</Text>
                  <Image 
                    source={{ uri: medication.prescription_photo }} 
                    style={styles.photo}
                    resizeMode="contain"
                  />
                </View>
              )}
              {medication.box_photo && (
                <View style={styles.photoContainer}>
                  <Text style={styles.photoLabel}>Caixa do Medicamento</Text>
                  <Image 
                    source={{ uri: medication.box_photo }} 
                    style={styles.photo}
                    resizeMode="contain"
                  />
                </View>
              )}
            </View>
          )}

          {/* Tipo */}
          <View style={styles.section}>
            <View style={styles.infoCard}>
              <Ionicons 
                name={medication.is_prescription_required ? "document-text" : "medkit"} 
                size={20} 
                color={COLORS.primary} 
              />
              <Text style={styles.infoText}>
                {medication.is_prescription_required ? 'Com receita' : 'Sem receita'}
              </Text>
            </View>
          </View>

          {/* Botão de exclusão */}
          <Button
            title="Excluir Medicamento"
            onPress={handleDelete}
            variant="danger"
            style={styles.deleteButtonBottom}
          />
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
    backgroundColor: COLORS.primary,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.white,
    flex: 1,
    textAlign: 'center',
  },
  backButton: {
    padding: 4,
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
  mainCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  cardContent: {
    marginLeft: 10,
    flex: 1,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  dosageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dosageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  editContainer: {
    marginBottom: 8,
  },
  editInput: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: COLORS.primary,
    marginBottom: 8,
  },
  editActions: {
    flexDirection: 'row',
    gap: 8,
  },
  saveButton: {
    backgroundColor: COLORS.success,
    borderRadius: 8,
    padding: 10,
    flex: 1,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.critical,
    borderRadius: 8,
    padding: 10,
    flex: 1,
    alignItems: 'center',
  },
  medName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  dosage: {
    fontSize: 13,
    color: COLORS.textLight,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginLeft: 8,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  stockCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lowStockCard: {
    borderWidth: 2,
    borderColor: COLORS.warning,
  },
  stockInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  stockNumberRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flex: 1,
  },
  stockNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.text,
  },
  stockLabel: {
    fontSize: 14,
    color: COLORS.textLight,
    marginLeft: 6,
  },
  lowStockWarning: {
    fontSize: 12,
    color: COLORS.warning,
    fontWeight: '600',
  },
  stockControls: {
    flexDirection: 'row',
    gap: 10,
  },
  stockButtonSmall: {
    flex: 1,
    backgroundColor: COLORS.critical,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  okButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
  },
  alertThreshold: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 8,
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    fontSize: 16,
    color: COLORS.text,
  },
  photoContainer: {
    marginBottom: 16,
  },
  photoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  photo: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: COLORS.border,
  },
  deleteButtonBottom: {
    marginTop: 16,
    marginBottom: 40,
  },
});

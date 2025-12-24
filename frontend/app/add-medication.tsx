import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, PRIORITY_COLORS } from '../../src/utils/constants';
import { api } from '../../src/utils/api';
import { Button } from '../../src/components/Button';
import { ProfileHeader } from '../../src/components/ProfileHeader';
import { useApp } from '../../src/context/AppContext';
import { useCustomAlert } from '../../src/components/CustomAlert';

export default function AddMedicationScreen() {
  const router = useRouter();
  const { currentProfile, refreshMedications } = useApp();
  const { showAlert, AlertComponent } = useCustomAlert();
  
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [priority, setPriority] = useState<'normal' | 'importante' | 'crítico'>('normal');
  const [stockQuantity, setStockQuantity] = useState('');
  const [minStockAlert, setMinStockAlert] = useState('10');
  const [doctorName, setDoctorName] = useState('');
  const [doctorContact, setDoctorContact] = useState('');
  const [prescriptionPhoto, setPrescriptionPhoto] = useState<string | null>(null);
  const [boxPhoto, setBoxPhoto] = useState<string | null>(null);
  const [isPrescriptionRequired, setIsPrescriptionRequired] = useState(true);
  const [loading, setLoading] = useState(false);

  const pickImage = async (type: 'prescription' | 'box') => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
      if (type === 'prescription') {
        setPrescriptionPhoto(base64Image);
      } else {
        setBoxPhoto(base64Image);
      }
    }
  };

  const takePhoto = async (type: 'prescription' | 'box') => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      showAlert('Permissão negada', 'Precisamos de permissão para acessar a câmera', undefined, 'warning');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
      if (type === 'prescription') {
        setPrescriptionPhoto(base64Image);
      } else {
        setBoxPhoto(base64Image);
      }
    }
  };

  const handleImageOptions = (type: 'prescription' | 'box') => {
    showAlert(
      'Adicionar Foto',
      'Escolha uma opção',
      [
        { text: 'Tirar Foto', onPress: () => takePhoto(type) },
        { text: 'Galeria', onPress: () => pickImage(type) },
        { text: 'Cancelar', style: 'cancel' },
      ],
      'info'
    );
  };

  const handleCreate = async () => {
    if (!currentProfile) {
      showAlert('Erro', 'Nenhum perfil selecionado', undefined, 'error');
      return;
    }

    if (!name.trim()) {
      showAlert('Campo obrigatório', 'Por favor, digite o nome do medicamento', undefined, 'warning');
      return;
    }

    if (!dosage.trim()) {
      showAlert('Campo obrigatório', 'A dosagem é obrigatória.\n\nExemplo: "1 comprimido", "2 gotas", "10ml"', undefined, 'warning');
      return;
    }

    const stock = parseInt(stockQuantity) || 0;
    const minStock = parseInt(minStockAlert) || 10;

    setLoading(true);
    try {
      const medicationData = await api.createMedication({
        profile_id: currentProfile.id,
        name: name.trim(),
        dosage: dosage.trim(),
        priority,
        stock_quantity: stock,
        min_stock_alert: minStock,
        doctor_name: doctorName.trim() || undefined,
        doctor_contact: doctorContact.trim() || undefined,
        prescription_photo: prescriptionPhoto || undefined,
        box_photo: boxPhoto || undefined,
        is_prescription_required: isPrescriptionRequired,
      });
      
      await refreshMedications();
      
      // Navegar de volta para a tela de medicamentos com o ID do novo medicamento
      router.replace({
        pathname: '/(tabs)/medications',
        params: { newMedicationId: medicationData.id }
      });
    } catch (error) {
      console.error('Error creating medication:', error);
      showAlert('Erro', 'Não foi possível adicionar o medicamento', undefined, 'error');
    } finally {
      setLoading(false);
    }
  };

  const priorities: Array<'normal' | 'importante' | 'crítico'> = ['normal', 'importante', 'crítico'];

  return (
    <SafeAreaView style={styles.container}>
      <AlertComponent />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Adicionar Medicamento</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ProfileHeader />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.scrollView}>
          <View style={styles.content}>
            {/* Nome */}
            <View style={styles.section}>
              <Text style={styles.label}>Nome do Medicamento *</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Ex: Paracetamol"
                autoFocus
              />
            </View>

            {/* Dosagem */}
            <View style={styles.section}>
              <Text style={styles.label}>Dosagem *</Text>
              <TextInput
                style={styles.input}
                value={dosage}
                onChangeText={setDosage}
                placeholder="Ex: 1 comprimido, 2 gotas..."
              />
            </View>

            {/* Prioridade */}
            <View style={styles.section}>
              <Text style={styles.label}>Prioridade</Text>
              <View style={styles.priorityContainer}>
                {priorities.map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={[
                      styles.priorityOption,
                      priority === p && { backgroundColor: PRIORITY_COLORS[p], borderColor: PRIORITY_COLORS[p] },
                    ]}
                    onPress={() => setPriority(p)}
                  >
                    <Text style={[styles.priorityText, priority === p && styles.priorityTextActive]}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Estoque */}
            <View style={styles.section}>
              <Text style={styles.label}>Estoque</Text>
              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <Text style={styles.subLabel}>Quantidade</Text>
                  <TextInput
                    style={styles.input}
                    value={stockQuantity}
                    onChangeText={setStockQuantity}
                    placeholder="0"
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.halfInput}>
                  <Text style={styles.subLabel}>Alerta mínimo</Text>
                  <TextInput
                    style={styles.input}
                    value={minStockAlert}
                    onChangeText={setMinStockAlert}
                    placeholder="10"
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>

            {/* Tipo */}
            <View style={styles.section}>
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setIsPrescriptionRequired(!isPrescriptionRequired)}
              >
                <Ionicons
                  name={isPrescriptionRequired ? "checkbox" : "square-outline"}
                  size={24}
                  color={COLORS.primary}
                />
                <Text style={styles.checkboxLabel}>Medicamento com receita</Text>
              </TouchableOpacity>
            </View>

            {/* Médico (opcional) */}
            <View style={styles.section}>
              <Text style={styles.label}>Informações do Médico (opcional)</Text>
              <TextInput
                style={styles.input}
                value={doctorName}
                onChangeText={setDoctorName}
                placeholder="Nome do médico"
              />
              <TextInput
                style={[styles.input, { marginTop: 8 }]}
                value={doctorContact}
                onChangeText={setDoctorContact}
                placeholder="Telefone ou contato"
                keyboardType="phone-pad"
              />
            </View>

            {/* Fotos */}
            <View style={styles.section}>
              <Text style={styles.label}>Fotos (opcional)</Text>
              
              <TouchableOpacity
                style={styles.photoButton}
                onPress={() => handleImageOptions('prescription')}
              >
                <Ionicons name="document-text" size={24} color={COLORS.primary} />
                <Text style={styles.photoButtonText}>
                  {prescriptionPhoto ? 'Foto da receita adicionada' : 'Adicionar foto da receita'}
                </Text>
                {prescriptionPhoto && (
                  <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.photoButton}
                onPress={() => handleImageOptions('box')}
              >
                <Ionicons name="cube" size={24} color={COLORS.primary} />
                <Text style={styles.photoButtonText}>
                  {boxPhoto ? 'Foto da caixa adicionada' : 'Adicionar foto da caixa'}
                </Text>
                {boxPhoto && (
                  <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
                )}
              </TouchableOpacity>
            </View>

            <Button
              title="Adicionar Medicamento"
              onPress={handleCreate}
              loading={loading}
              style={styles.createButton}
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
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.white,
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
    marginBottom: 8,
  },
  subLabel: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityOption: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  priorityText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  priorityTextActive: {
    color: COLORS.white,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkboxLabel: {
    fontSize: 16,
    color: COLORS.text,
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
    marginBottom: 12,
  },
  photoButtonText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
  },
  createButton: {
    marginTop: 8,
    marginBottom: 40,
  },
});
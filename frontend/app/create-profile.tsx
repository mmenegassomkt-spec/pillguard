import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, PROFILE_COLORS, PROFILE_AVATARS } from './utils/constants';
import { api } from './utils/api';
import { Button } from './components/Button';

export default function CreateProfileScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PROFILE_COLORS[0]);
  const [selectedAvatar, setSelectedAvatar] = useState(PROFILE_AVATARS[0]);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Erro', 'Por favor, digite um nome para o perfil');
      return;
    }

    setLoading(true);
    try {
      await api.createProfile({
        name: name.trim(),
        color: selectedColor,
        avatar: selectedAvatar,
      });
      Alert.alert('Sucesso!', 'Perfil criado com sucesso');
      router.back();
    } catch (error) {
      console.error('Error creating profile:', error);
      Alert.alert('Erro', 'Não foi possível criar o perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Criar Perfil</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Preview */}
          <View style={styles.previewSection}>
            <View style={[styles.previewAvatar, { backgroundColor: selectedColor }]}>
              <Ionicons name={selectedAvatar as any} size={48} color={COLORS.white} />
            </View>
            <Text style={styles.previewName}>{name || 'Nome do Perfil'}</Text>
          </View>

          {/* Nome */}
          <View style={styles.section}>
            <Text style={styles.label}>Nome do Perfil</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Ex: Eu, Mãe, Pai..."
              maxLength={30}
              autoFocus
            />
          </View>

          {/* Cor */}
          <View style={styles.section}>
            <Text style={styles.label}>Escolha uma Cor</Text>
            <View style={styles.colorGrid}>
              {PROFILE_COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    selectedColor === color && styles.colorSelected,
                  ]}
                  onPress={() => setSelectedColor(color)}
                  activeOpacity={0.7}
                >
                  {selectedColor === color && (
                    <Ionicons name="checkmark" size={24} color={COLORS.white} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Avatar */}
          <View style={styles.section}>
            <Text style={styles.label}>Escolha um Ícone</Text>
            <View style={styles.avatarGrid}>
              {PROFILE_AVATARS.map((avatar) => (
                <TouchableOpacity
                  key={avatar}
                  style={[
                    styles.avatarOption,
                    selectedAvatar === avatar && styles.avatarSelected,
                  ]}
                  onPress={() => setSelectedAvatar(avatar)}
                  activeOpacity={0.7}
                >
                  <Ionicons 
                    name={avatar as any} 
                    size={32} 
                    color={selectedAvatar === avatar ? COLORS.primary : COLORS.textLight} 
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Button
            title="Criar Perfil"
            onPress={handleCreate}
            loading={loading}
            style={styles.createButton}
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  previewSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  previewAvatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  previewName: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.text,
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
  input: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorSelected: {
    borderWidth: 3,
    borderColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  avatarOption: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  avatarSelected: {
    borderColor: COLORS.primary,
    borderWidth: 3,
  },
  createButton: {
    marginTop: 8,
  },
});
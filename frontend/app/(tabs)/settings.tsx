import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../../src/context/AppContext';
import { ProfileHeader } from '../../src/components/ProfileHeader';
import { COLORS } from '../../src/utils/constants';
import { api } from '../../src/utils/api';
import { format } from 'date-fns';

export default function SettingsScreen() {
  const { currentProfile, premiumTrial, refreshPremiumTrial, setCurrentProfile } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!currentProfile) {
      router.replace('/');
    }
  }, [currentProfile]);

  const handleStartTrial = async () => {
    if (!currentProfile) return;
    try {
      await api.createPremiumTrial({ profile_id: currentProfile.id, trial_days: 15 });
      await refreshPremiumTrial();
      Alert.alert('Sucesso!', 'Trial Premium ativado por 15 dias!');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível ativar o trial.');
    }
  };

  const handleChangeProfile = () => {
    Alert.alert(
      'Trocar perfil',
      'Deseja voltar para a seleção de perfil?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            await setCurrentProfile(null);
            router.replace('/');
          },
        },
      ]
    );
  };

  const isPremiumActive = premiumTrial && premiumTrial.is_active;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ProfileHeader />
      <ScrollView style={styles.scrollView}>
        {/* Perfil Atual */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Perfil Atual</Text>
          {currentProfile && (
            <View style={styles.profileCard}>
              <View style={[styles.avatar, { backgroundColor: currentProfile.color }]}>
                <Ionicons name={currentProfile.avatar as any || 'person'} size={32} color={COLORS.white} />
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{currentProfile.name}</Text>
                <TouchableOpacity onPress={handleChangeProfile}>
                  <Text style={styles.changeProfile}>Trocar perfil</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Premium */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Premium</Text>
          {isPremiumActive ? (
            <View style={styles.premiumCard}>
              <View style={styles.premiumHeader}>
                <Ionicons name="star" size={24} color="#FFD700" />
                <Text style={styles.premiumTitle}>Trial Ativo</Text>
              </View>
              <Text style={styles.premiumText}>
                Seu trial premium está ativo até:
              </Text>
              <Text style={styles.premiumDate}>
                {format(new Date(premiumTrial.trial_end), "dd/MM/yyyy 'às' HH:mm")}
              </Text>
              <View style={styles.premiumFeatures}>
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                  <Text style={styles.featureText}>Alarmes críticos</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                  <Text style={styles.featureText}>Múltiplos medicamentos por alarme</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                  <Text style={styles.featureText}>Prioridade avançada</Text>
                </View>
              </View>
            </View>
          ) : premiumTrial ? (
            <View style={styles.premiumCard}>
              <Text style={styles.premiumExpired}>Trial expirado</Text>
              <Text style={styles.premiumText}>
                Seu período de testes terminou. Funcionalidades básicas continuam disponíveis.
              </Text>
            </View>
          ) : (
            <View style={styles.premiumCard}>
              <View style={styles.premiumHeader}>
                <Ionicons name="star-outline" size={24} color={COLORS.primary} />
                <Text style={styles.premiumTitle}>Experimente Premium</Text>
              </View>
              <Text style={styles.premiumText}>
                15 dias grátis com acesso a todas as funcionalidades premium!
              </Text>
              <TouchableOpacity
                style={styles.trialButton}
                onPress={handleStartTrial}
              >
                <Text style={styles.trialButtonText}>Iniciar Trial Grátis</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Sobre */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sobre</Text>
          <View style={styles.optionCard}>
            <View style={styles.optionItem}>
              <Ionicons name="information-circle" size={24} color={COLORS.primary} />
              <Text style={styles.optionText}>Versão 1.0.0 (MVP)</Text>
            </View>
          </View>
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
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  changeProfile: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  premiumCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  premiumHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  premiumTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginLeft: 8,
  },
  premiumText: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 8,
  },
  premiumDate: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 16,
  },
  premiumExpired: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.critical,
    marginBottom: 8,
  },
  premiumFeatures: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 14,
    color: COLORS.text,
  },
  trialButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  trialButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  optionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionText: {
    fontSize: 16,
    color: COLORS.text,
  },
});
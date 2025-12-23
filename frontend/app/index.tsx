import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from './context/AppContext';
import { LoadingScreen } from './components/LoadingScreen';
import { COLORS, PROFILE_COLORS } from './utils/constants';
import { api } from './utils/api';

export default function Index() {
  const { profiles, currentProfile, setCurrentProfile, refreshProfiles, loading, deleteProfile } = useApp();
  const router = useRouter();
  const [hasRedirected, setHasRedirected] = React.useState(false);

  useEffect(() => {
    if (currentProfile && !hasRedirected) {
      // Se já tem perfil selecionado, vai para a home
      setHasRedirected(true);
      router.replace('/(tabs)/home');
    }
  }, [currentProfile, hasRedirected]);

  useEffect(() => {
    // Refresh profiles only once on mount
    refreshProfiles();
  }, [refreshProfiles]);

  const handleSelectProfile = async (profileId: string) => {
    const profile = profiles.find(p => p.id === profileId);
    if (profile) {
      await setCurrentProfile(profile);
      router.replace('/(tabs)/home');
    }
  };

  const handleDeleteProfile = (profileId: string, profileName: string) => {
    Alert.alert(
      'Remover Perfil',
      `Tem certeza que deseja remover o perfil "${profileName}"?\n\nTodos os medicamentos e alarmes deste perfil serão excluídos.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Remover', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProfile(profileId);
              Alert.alert('Sucesso', 'Perfil removido com sucesso!');
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível remover o perfil.');
            }
          }
        },
      ]
    );
  };

  const handleCreateProfile = () => {
    router.push('/create-profile');
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image 
          source={require('../assets/images/pillguard-logo-full-color.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <ScrollView style={styles.profileList} contentContainerStyle={styles.profileListContent}>
        {profiles.map((profile, index) => (
          <View key={profile.id} style={[styles.profileCard, { borderLeftColor: profile.color, borderLeftWidth: 6 }]}>
            <TouchableOpacity
              style={styles.profileContent}
              onPress={() => handleSelectProfile(profile.id)}
              activeOpacity={0.7}
            >
              <View style={[styles.avatar, { backgroundColor: profile.color }]}>
                <Ionicons name={profile.avatar as any || 'person'} size={32} color={COLORS.white} />
              </View>
              <Text style={styles.profileName}>{profile.name}</Text>
              <Ionicons name="chevron-forward" size={24} color={COLORS.textLight} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteProfile(profile.id, profile.name)}
              activeOpacity={0.7}
            >
              <Ionicons name="trash-outline" size={22} color={COLORS.critical} />
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity
          style={styles.addProfileCard}
          onPress={handleCreateProfile}
          activeOpacity={0.7}
        >
          <View style={styles.addIconContainer}>
            <Ionicons name="add-circle" size={48} color={COLORS.primary} />
          </View>
          <Text style={styles.addProfileText}>Criar Novo Perfil</Text>
        </TouchableOpacity>
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
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  logo: {
    width: 120,
    height: 80,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textLight,
    marginTop: 8,
    textAlign: 'center',
  },
  profileList: {
    flex: 1,
  },
  profileListContent: {
    padding: 20,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileName: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
  },
  deleteButton: {
    padding: 16,
    borderLeftWidth: 1,
    borderLeftColor: COLORS.border,
  },
  addProfileCard: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 32,
    marginTop: 8,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  addIconContainer: {
    marginBottom: 12,
  },
  addProfileText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.primary,
  },
});

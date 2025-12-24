import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Animated } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../_context/AppContext';
import { MedicationCard } from '../_components/MedicationCard';
import { ProfileHeader } from '../_components/ProfileHeader';
import { COLORS } from '../_utils/constants';

export default function MedicationsScreen() {
  const { medications, refreshMedications, currentProfile } = useApp();
  const router = useRouter();
  const { newMedicationId } = useLocalSearchParams();
  const [refreshing, setRefreshing] = useState(false);
  const [highlightedMedicationId, setHighlightedMedicationId] = useState<string | null>(null);
  const highlightAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!currentProfile) {
      router.replace('/');
    }
  }, [currentProfile]);

  // Efeito para destacar o novo medicamento criado
  useEffect(() => {
    if (newMedicationId && typeof newMedicationId === 'string') {
      setHighlightedMedicationId(newMedicationId);
      
      // Animar o destaque
      Animated.sequence([
        Animated.timing(highlightAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.delay(1500),
        Animated.timing(highlightAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: false,
        }),
      ]).start(() => {
        setHighlightedMedicationId(null);
      });
    }
  }, [newMedicationId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshMedications();
    setRefreshing(false);
  };

  const getHighlightStyle = (medicationId: string) => {
    if (medicationId !== highlightedMedicationId) return {};
    
    return {
      backgroundColor: highlightAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['transparent', 'rgba(76, 175, 80, 0.3)'],
      }),
      borderRadius: 12,
    };
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ProfileHeader />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/add-medication')}
        >
          <Ionicons name="add-circle" size={24} color={COLORS.white} />
          <Text style={styles.addButtonText}>Adicionar Medicamento</Text>
        </TouchableOpacity>
      </View>

      {medications.length > 0 ? (
        <FlatList
          data={medications}
          renderItem={({ item }) => (
            <Animated.View style={getHighlightStyle(item.id)}>
              <MedicationCard
                medication={item}
                onPress={() => router.push(`/medication/${item.id}`)}
              />
            </Animated.View>
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="medical-outline" size={64} color={COLORS.textLight} />
          <Text style={styles.emptyTitle}>Nenhum medicamento</Text>
          <Text style={styles.emptyText}>Adicione seus medicamentos para começar</Text>
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
    padding: 16,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
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
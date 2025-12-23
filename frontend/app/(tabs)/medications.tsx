import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { MedicationCard } from '../components/MedicationCard';
import { COLORS } from '../utils/constants';

export default function MedicationsScreen() {
  const { medications, refreshMedications, currentProfile } = useApp();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!currentProfile) {
      router.replace('/');
    }
  }, [currentProfile]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshMedications();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
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
            <MedicationCard
              medication={item}
              onPress={() => router.push(`/medication/${item.id}`)}
            />
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
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Medication } from '../_types';
import { COLORS, PRIORITY_COLORS } from '../_utils/constants';

interface MedicationCardProps {
  medication: Medication;
  onPress?: () => void;
}

export const MedicationCard: React.FC<MedicationCardProps> = ({ medication, onPress }) => {
  const priorityColor = PRIORITY_COLORS[medication.priority];
  const isLowStock = medication.stock_quantity <= medication.min_stock_alert;

  return (
    <TouchableOpacity
      style={[styles.card, { borderLeftColor: priorityColor, borderLeftWidth: 4 }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Ionicons name="medical" size={20} color={priorityColor} />
        <View style={styles.contentContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.name}>{medication.name}</Text>
            {medication.priority !== 'normal' && (
              <View style={[styles.badge, { backgroundColor: priorityColor }]}>
                <Text style={styles.badgeText}>{medication.priority}</Text>
              </View>
            )}
          </View>
          <Text style={styles.dosage}>{medication.dosage}</Text>
          <View style={styles.stockContainer}>
            <Ionicons 
              name={isLowStock ? "warning" : "cube"} 
              size={14} 
              color={isLowStock ? COLORS.warning : COLORS.textLight} 
            />
            <Text style={[styles.stockText, isLowStock && styles.lowStockText]}>
              Estoque: {medication.stock_quantity} un.
            </Text>
            {isLowStock && (
              <Text style={styles.alertText}> • Baixo estoque!</Text>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  contentContainer: {
    marginLeft: 10,
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  dosage: {
    fontSize: 13,
    color: COLORS.textLight,
    marginBottom: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginLeft: 8,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  stockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockText: {
    marginLeft: 4,
    fontSize: 13,
    color: COLORS.textLight,
  },
  lowStockText: {
    color: COLORS.warning,
    fontWeight: '600',
  },
  alertText: {
    fontSize: 12,
    color: COLORS.warning,
    fontWeight: '600',
  },
});
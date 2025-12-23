import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Medication } from '../types';
import { COLORS, PRIORITY_COLORS } from '../utils/constants';

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
        <View style={styles.titleContainer}>
          <Ionicons name="medical" size={24} color={priorityColor} />
          <View style={styles.textContainer}>
            <Text style={styles.name}>{medication.name}</Text>
            <Text style={styles.dosage}>{medication.dosage}</Text>
          </View>
        </View>
        
        {medication.priority !== 'normal' && (
          <View style={[styles.badge, { backgroundColor: priorityColor }]}>
            <Text style={styles.badgeText}>{medication.priority}</Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <View style={styles.stockContainer}>
          <Ionicons 
            name={isLowStock ? "warning" : "cube"} 
            size={18} 
            color={isLowStock ? COLORS.warning : COLORS.textLight} 
          />
          <Text style={[styles.stockText, isLowStock && styles.lowStockText]}>
            Estoque: {medication.stock_quantity} un.
          </Text>
        </View>
        
        {isLowStock && (
          <Text style={styles.alertText}>Baixo estoque!</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  textContainer: {
    marginLeft: 12,
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  dosage: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockText: {
    marginLeft: 6,
    fontSize: 14,
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
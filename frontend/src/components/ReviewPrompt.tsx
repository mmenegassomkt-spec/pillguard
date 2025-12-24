import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  Image,
  Dimensions 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../_utils/constants';

interface ReviewPromptProps {
  visible: boolean;
  onAccept: () => void;
  onDecline: () => void;
  onDismiss: () => void;
}

export const ReviewPrompt: React.FC<ReviewPromptProps> = ({
  visible,
  onAccept,
  onDecline,
  onDismiss,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Logo */}
          <Image 
            source={require('../../assets/images/pillguard-logo-color-linha.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          
          {/* Ícone de coração/estrela */}
          <View style={styles.iconContainer}>
            <Ionicons name="heart" size={40} color={COLORS.primary} />
          </View>
          
          {/* Título */}
          <Text style={styles.title}>
            O PillGuard está ajudando você a lembrar seus medicamentos?
          </Text>
          
          {/* Mensagem */}
          <Text style={styles.message}>
            Se puder, uma avaliação rápida ajuda muito! 😉
          </Text>
          
          {/* Botões */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.acceptButton]}
              onPress={onAccept}
              activeOpacity={0.8}
            >
              <Ionicons name="star" size={20} color={COLORS.white} />
              <Text style={styles.acceptButtonText}>Avaliar agora</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.declineButton]}
              onPress={onDecline}
              activeOpacity={0.8}
            >
              <Text style={styles.declineButtonText}>Mais tarde</Text>
            </TouchableOpacity>
          </View>
          
          {/* Botão de fechar */}
          <TouchableOpacity style={styles.closeButton} onPress={onDismiss}>
            <Ionicons name="close" size={24} color={COLORS.textLight} />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 24,
    width: width - 48,
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    position: 'relative',
  },
  logo: {
    width: 140,
    height: 40,
    marginBottom: 16,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 26,
  },
  message: {
    fontSize: 15,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 24,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  acceptButton: {
    backgroundColor: COLORS.primary,
  },
  acceptButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  declineButton: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  declineButtonText: {
    color: COLORS.textLight,
    fontSize: 16,
    fontWeight: '500',
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 4,
  },
});

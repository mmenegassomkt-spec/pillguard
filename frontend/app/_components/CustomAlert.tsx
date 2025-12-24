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
import { COLORS } from '../utils/constants';

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message?: string;
  buttons?: AlertButton[];
  onClose: () => void;
  type?: 'success' | 'error' | 'warning' | 'info' | 'confirm';
}

export const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  title,
  message,
  buttons = [{ text: 'OK', style: 'default' }],
  onClose,
  type = 'info',
}) => {
  const getIconName = () => {
    switch (type) {
      case 'success':
        return 'checkmark-circle';
      case 'error':
        return 'close-circle';
      case 'warning':
        return 'warning';
      case 'confirm':
        return 'help-circle';
      default:
        return 'information-circle';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'success':
        return COLORS.success;
      case 'error':
        return COLORS.critical;
      case 'warning':
        return COLORS.warning;
      default:
        return COLORS.primary;
    }
  };

  const handleButtonPress = (button: AlertButton) => {
    if (button.onPress) {
      button.onPress();
    }
    onClose();
  };

  const getButtonStyle = (style?: string) => {
    switch (style) {
      case 'destructive':
        return { backgroundColor: COLORS.critical };
      case 'cancel':
        return { backgroundColor: COLORS.textLight };
      default:
        return { backgroundColor: COLORS.primary };
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Logo */}
          <Image 
            source={require('../../assets/images/pillguard-logo-color-linha.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          
          {/* Ícone do tipo */}
          <View style={[styles.iconContainer, { backgroundColor: getIconColor() + '15' }]}>
            <Ionicons name={getIconName()} size={40} color={getIconColor()} />
          </View>
          
          {/* Título */}
          <Text style={styles.title}>{title}</Text>
          
          {/* Mensagem */}
          {message && <Text style={styles.message}>{message}</Text>}
          
          {/* Botões */}
          <View style={styles.buttonContainer}>
            {buttons.map((button, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.button,
                  getButtonStyle(button.style),
                  buttons.length > 1 && { flex: 1, marginHorizontal: 4 }
                ]}
                onPress={() => handleButtonPress(button)}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.buttonText,
                  button.style === 'cancel' && { color: COLORS.text }
                ]}>
                  {button.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Hook para usar o alert de forma mais fácil
import { useState, useCallback } from 'react';

interface AlertState {
  visible: boolean;
  title: string;
  message?: string;
  buttons?: AlertButton[];
  type?: 'success' | 'error' | 'warning' | 'info' | 'confirm';
}

export const useCustomAlert = () => {
  const [alertState, setAlertState] = useState<AlertState>({
    visible: false,
    title: '',
  });

  const showAlert = useCallback((
    title: string,
    message?: string,
    buttons?: AlertButton[],
    type?: 'success' | 'error' | 'warning' | 'info' | 'confirm'
  ) => {
    setAlertState({
      visible: true,
      title,
      message,
      buttons,
      type,
    });
  }, []);

  const hideAlert = useCallback(() => {
    setAlertState(prev => ({ ...prev, visible: false }));
  }, []);

  const AlertComponent = useCallback(() => (
    <CustomAlert
      visible={alertState.visible}
      title={alertState.title}
      message={alertState.message}
      buttons={alertState.buttons}
      type={alertState.type}
      onClose={hideAlert}
    />
  ), [alertState, hideAlert]);

  return { showAlert, hideAlert, AlertComponent };
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
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 15,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 8,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

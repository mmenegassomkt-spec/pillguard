export const COLORS = {
  primary: '#4A90E2',
  secondary: '#5D6D7E',
  success: '#5CB85C',
  warning: '#F0AD4E',
  critical: '#D9534F',
  background: '#F8F9FA',
  white: '#FFFFFF',
  black: '#000000',
  text: '#2C3E50',
  textLight: '#7F8C8D',
  border: '#E0E0E0',
  cardBg: '#FFFFFF',
};

export const PRIORITY_COLORS = {
  normal: COLORS.primary,
  importante: COLORS.warning,
  crítico: COLORS.critical,
};

export const PROFILE_COLORS = [
  '#4A90E2', // Azul
  '#5CB85C', // Verde
  '#F0AD4E', // Laranja
  '#9B59B6', // Roxo
  '#E91E63', // Rosa
  '#00BCD4', // Ciano
  '#FF5722', // Vermelho-Laranja
  '#795548', // Marrom
];

export const PROFILE_AVATARS = [
  'person',
  'person-outline',
  'people',
  'heart',
  'medical',
  'fitness',
];

export const FREQUENCIES = [
  { value: 'daily', label: 'Todos os dias' },
  { value: 'alternate', label: 'Dias alternados' },
  { value: 'specific', label: 'Dias específicos' },
];

export const WEEKDAYS = [
  { value: 0, label: 'Dom', fullLabel: 'Domingo' },
  { value: 1, label: 'Seg', fullLabel: 'Segunda' },
  { value: 2, label: 'Ter', fullLabel: 'Terça' },
  { value: 3, label: 'Qua', fullLabel: 'Quarta' },
  { value: 4, label: 'Qui', fullLabel: 'Quinta' },
  { value: 5, label: 'Sex', fullLabel: 'Sexta' },
  { value: 6, label: 'Sáb', fullLabel: 'Sábado' },
];

export const TRIAL_DAYS = 15;
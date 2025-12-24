import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as StoreReview from 'expo-store-review';
import { Platform } from 'react-native';

const STORAGE_KEYS = {
  FIRST_USE_DATE: '@pillguard_first_use_date',
  REVIEW_COMPLETED: '@pillguard_review_completed',
  NEXT_REVIEW_DATE: '@pillguard_next_review_date',
};

const DAYS_BEFORE_FIRST_REVIEW = 15;
const DAYS_BEFORE_RETRY = 30;

// Estado global para controlar o popup de review
let globalShowReview: ((show: boolean) => void) | null = null;

export const triggerReviewPrompt = () => {
  if (globalShowReview) {
    globalShowReview(true);
  }
};

export const useReviewPrompt = () => {
  const [shouldShowReview, setShouldShowReview] = useState(false);

  // Registrar o setter global
  useEffect(() => {
    globalShowReview = setShouldShowReview;
    return () => {
      globalShowReview = null;
    };
  }, []);

  useEffect(() => {
    checkReviewEligibility();
  }, []);

  const checkReviewEligibility = async () => {
    try {
      // Verificar se já avaliou
      const reviewCompleted = await AsyncStorage.getItem(STORAGE_KEYS.REVIEW_COMPLETED);
      if (reviewCompleted === 'true') {
        return; // Nunca mais mostrar automaticamente
      }

      // Verificar primeira data de uso
      let firstUseDate = await AsyncStorage.getItem(STORAGE_KEYS.FIRST_USE_DATE);
      if (!firstUseDate) {
        // Primeira vez usando o app
        firstUseDate = new Date().toISOString();
        await AsyncStorage.setItem(STORAGE_KEYS.FIRST_USE_DATE, firstUseDate);
        return; // Ainda não é hora de pedir avaliação
      }

      // Verificar se há data de próxima avaliação agendada
      const nextReviewDate = await AsyncStorage.getItem(STORAGE_KEYS.NEXT_REVIEW_DATE);
      const now = new Date();

      if (nextReviewDate) {
        // Usuário recusou antes, verificar se já passou o tempo
        const nextDate = new Date(nextReviewDate);
        if (now >= nextDate) {
          setShouldShowReview(true);
        }
      } else {
        // Verificar se já passaram 15 dias desde o primeiro uso
        const firstDate = new Date(firstUseDate);
        const daysSinceFirstUse = Math.floor((now.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysSinceFirstUse >= DAYS_BEFORE_FIRST_REVIEW) {
          setShouldShowReview(true);
        }
      }
    } catch (error) {
      console.error('Error checking review eligibility:', error);
    }
  };

  const handleReviewAccepted = useCallback(async () => {
    try {
      // Marcar como avaliado permanentemente
      await AsyncStorage.setItem(STORAGE_KEYS.REVIEW_COMPLETED, 'true');
      setShouldShowReview(false);

      // Tentar abrir a avaliação nativa da loja
      if (await StoreReview.isAvailableAsync()) {
        await StoreReview.requestReview();
      }
    } catch (error) {
      console.error('Error handling review:', error);
    }
  }, []);

  const handleReviewDeclined = useCallback(async () => {
    try {
      // Agendar para 30 dias depois
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + DAYS_BEFORE_RETRY);
      await AsyncStorage.setItem(STORAGE_KEYS.NEXT_REVIEW_DATE, nextDate.toISOString());
      setShouldShowReview(false);
    } catch (error) {
      console.error('Error scheduling next review:', error);
    }
  }, []);

  const dismissReview = useCallback(() => {
    setShouldShowReview(false);
  }, []);

  const forceShowReview = useCallback(() => {
    setShouldShowReview(true);
  }, []);

  // Para testes: resetar o estado de avaliação
  const resetReviewState = async () => {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.FIRST_USE_DATE,
      STORAGE_KEYS.REVIEW_COMPLETED,
      STORAGE_KEYS.NEXT_REVIEW_DATE,
    ]);
  };

  return {
    shouldShowReview,
    handleReviewAccepted,
    handleReviewDeclined,
    dismissReview,
    forceShowReview,
    resetReviewState,
  };
};

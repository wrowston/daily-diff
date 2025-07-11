import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useSubscription } from './useSubscription';
import { supabaseClient } from '@/utils/supabase';

interface WeeklyLimitStatus {
  currentWeekCount: number;
  maxWeeklyEntries: number;
  hasReachedLimit: boolean;
  loading: boolean;
  error: string | null;
  checkLimit: () => Promise<void>;
}

export function useWeeklyEntryLimit(): WeeklyLimitStatus {
  const { getToken, userId } = useAuth();
  const { isPro } = useSubscription();
  const [currentWeekCount, setCurrentWeekCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pro users have unlimited entries, free users have 3 per week
  const maxWeeklyEntries = isPro ? Infinity : 3;
  const hasReachedLimit = currentWeekCount >= maxWeeklyEntries;

  const getMondayOfCurrentWeek = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Sunday = 0, Monday = 1
    const monday = new Date(today);
    monday.setDate(today.getDate() - daysToMonday);
    monday.setHours(0, 0, 0, 0);
    return monday;
  };

  const checkLimit = useCallback(async () => {
    if (!userId || isPro) {
      setCurrentWeekCount(0);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = await getToken({ template: 'supabase' });
      const supabase = await supabaseClient(token);
      
      const mondayOfCurrentWeek = getMondayOfCurrentWeek();
      const mondayISO = mondayOfCurrentWeek.toISOString();

      const { data, error: fetchError } = await supabase
        .from('journal_entries')
        .select('id')
        .eq('user_id', userId)
        .gte('created_at', mondayISO);

      if (fetchError) {
        console.error('Error fetching weekly entries:', fetchError);
        throw new Error(`Failed to fetch weekly entries: ${fetchError.message}`);
      }

      setCurrentWeekCount(data?.length || 0);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while checking weekly limit';
      setError(errorMessage);
      console.error('Error checking weekly limit:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, isPro, getToken]);

  useEffect(() => {
    if (userId) {
      checkLimit();
    }
  }, [userId, checkLimit]);

  return {
    currentWeekCount,
    maxWeeklyEntries,
    hasReachedLimit,
    loading,
    error,
    checkLimit
  };
} 
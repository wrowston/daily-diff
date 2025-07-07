import { useAuth } from '@clerk/nextjs';
import { useState, useEffect, useCallback } from 'react';
import { supabaseClient } from '@/utils/supabase';

interface DailyPrompt {
  id?: number;
  text: string;
  category?: string;
  created_at?: string;
  used_dates?: string[];
}

interface PromptMetadata {
  remaining_prompts: number;
  was_reset: boolean;
  total_prompts_in_rotation?: number;
}

interface UseDailyPromptReturn {
  prompt: DailyPrompt | null;
  metadata: PromptMetadata | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useDailyPrompt(): UseDailyPromptReturn {
  const { getToken, userId, isLoaded } = useAuth();
  const [prompt, setPrompt] = useState<DailyPrompt | null>(null);
  const [metadata, setMetadata] = useState<PromptMetadata | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDailyPrompt = useCallback(async () => {
    if (!userId) {
      setError('User not authenticated');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get the JWT token from Clerk and create authenticated Supabase client
      const token = await getToken({ template: 'supabase' });
      const supabase = await supabaseClient(token);

      // Call the get_daily_prompt RPC function
      const { data, error: rpcError } = await supabase
        .rpc('get_daily_prompt', { user_id_input: userId });

      if (rpcError) {
        console.error('Supabase RPC error:', rpcError);
        throw new Error(`Failed to fetch daily prompt: ${rpcError.message}`);
      }

      if (data && data.length > 0) {
        const result = data[0];
        
        // Extract prompt and metadata from the result
        setPrompt({
          id: result.id,
          text: result.text,
          category: result.category,
          created_at: result.created_at,
          used_dates: result.used_dates,
        });

        setMetadata({
          remaining_prompts: result.remaining_prompts || 0,
          was_reset: result.was_reset || false,
          total_prompts_in_rotation: result.total_prompts_in_rotation || 0,
        });
      } else {
        throw new Error('No daily prompt available');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred while fetching prompt';
      setError(errorMessage);
      console.error('Error fetching daily prompt:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, getToken]);

  // Initial fetch when user is loaded and authenticated
  useEffect(() => {
    if (isLoaded && userId) {
      fetchDailyPrompt();
    }
  }, [isLoaded, userId, fetchDailyPrompt]);

  return {
    prompt,
    metadata,
    loading,
    error,
    refetch: fetchDailyPrompt,
  };
} 
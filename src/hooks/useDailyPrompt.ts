import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '@clerk/nextjs';

interface Prompt {
  id: string;
  text: string;
  category?: string;
}

interface PromptMetadata {
  total_prompts: number;
  remaining_prompts: number;
  was_reset: boolean;
  delivered_at: string;
}

interface PromptResponse {
  prompt: Prompt;
  metadata: PromptMetadata;
}

interface UseDailyPromptReturn {
  prompt: Prompt | null;
  metadata: PromptMetadata | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function useDailyPrompt(): UseDailyPromptReturn {
  const { getToken, isLoaded, userId } = useAuth();
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [metadata, setMetadata] = useState<PromptMetadata | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPrompt = useCallback(async () => {
    if (!userId) {
      setError('User not authenticated');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get the user's session token from Clerk for Supabase
      const token = await getToken({ template: 'supabase' });
      
      if (!token) {
        throw new Error('Failed to get authentication token');
      }

      // Call the Supabase Edge Function
      const { data, error: functionError } = await supabase.functions.invoke(
        'get-journal-prompt',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (functionError) {
        throw new Error(functionError.message || 'Failed to fetch prompt');
      }

      if (!data) {
        throw new Error('No data returned from function');
      }

      const response: PromptResponse = data;
      setPrompt(response.prompt);
      setMetadata(response.metadata);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      console.error('Error fetching daily prompt:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, getToken]);

  // Fetch prompt when user is loaded and authenticated
  useEffect(() => {
    if (isLoaded && userId) {
      fetchPrompt();
    } else if (isLoaded && !userId) {
      setError('User not authenticated');
    }
  }, [isLoaded, userId, fetchPrompt]);

  return {
    prompt,
    metadata,
    loading,
    error,
    refetch: fetchPrompt,
  };
} 
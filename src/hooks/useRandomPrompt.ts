import { useAuth } from '@clerk/nextjs';
import { useState, useEffect, useCallback } from 'react';
import { supabaseClient } from '@/utils/supabase';

interface Prompt {
  id: string;
  prompt: string;
  created_at: string;
}

interface UseRandomPromptReturn {
  prompt: Prompt | null;
  loading: boolean;
  error: string | null;
  fetchNewPrompt: () => Promise<void>;
}

export function useRandomPrompt(): UseRandomPromptReturn {
  const { getToken, userId, isLoaded } = useAuth();
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRandomPrompt = useCallback(async () => {
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

      // Get a random prompt using a different approach
      // First get the count of prompts, then fetch a random one
      const { count, error: countError } = await supabase
        .from('prompts')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        console.error('Supabase count prompts error:', countError);
        throw new Error(`Failed to count prompts: ${countError.message}`);
      }

      if (!count || count === 0) {
        // Fallback prompt if no prompts in database
        setPrompt({
          id: 'fallback',
          prompt: 'What are you reflecting on today?',
          created_at: new Date().toISOString(),
        });
        return;
      }

      // Generate a random offset
      const randomOffset = Math.floor(Math.random() * count);

      // Fetch the prompt at the random offset
      const { data: prompts, error: fetchError } = await supabase
        .from('prompts')
        .select('*')
        .range(randomOffset, randomOffset)
        .limit(1);

      if (fetchError) {
        console.error('Supabase fetch prompt error:', fetchError);
        throw new Error(`Failed to fetch random prompt: ${fetchError.message}`);
      }

      if (prompts && prompts.length > 0) {
        setPrompt(prompts[0] as Prompt);
      } else {
        // Fallback prompt if no prompts in database
        setPrompt({
          id: 'fallback',
          prompt: 'What are you reflecting on today?',
          created_at: new Date().toISOString(),
        });
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred while fetching prompt';
      setError(errorMessage);
      console.error('Error fetching random prompt:', err);
      
      // Set fallback prompt on error
      setPrompt({
        id: 'fallback',
        prompt: 'What are you reflecting on today?',
        created_at: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  }, [userId, getToken]);

  // Fetch a prompt when user is loaded and authenticated
  useEffect(() => {
    if (isLoaded && userId) {
      fetchRandomPrompt();
    }
  }, [isLoaded, userId, fetchRandomPrompt]);

  return {
    prompt,
    loading,
    error,
    fetchNewPrompt: fetchRandomPrompt,
  };
} 
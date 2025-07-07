import { useAuth } from '@clerk/nextjs';
import { useState, useEffect, useCallback } from 'react';
import { supabaseClient } from '@/utils/supabase';

interface JournalEntry {
  id: string;
  user_id: string;
  date: string; // Date field (required in DB)
  prompt: string; // Prompt field (required in DB)
  content: string;
  mood?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

interface SaveJournalEntryData {
  date: string; // Required: date field
  prompt: string; // Required: prompt field  
  content: string;
  mood?: string;
  tags?: string[];
}

interface UseJournalEntriesReturn {
  saveEntry: (data: SaveJournalEntryData) => Promise<JournalEntry>;
  entries: JournalEntry[];
  fetchEntries: () => Promise<void>;
  loadMore: () => Promise<void>;
  hasMore: boolean;
  loading: boolean;
  fetchingMore: boolean;
  error: string | null;
  refreshEntries: () => Promise<void>;
}

const ENTRIES_PER_PAGE = 10;

export function useJournalEntries(): UseJournalEntriesReturn {
  const { getToken, userId, isLoaded } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchingMore, setFetchingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(0);

  const saveEntry = useCallback(async (data: SaveJournalEntryData): Promise<JournalEntry> => {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    setLoading(true);
    setError(null);

    try {
      // Get the JWT token from Clerk and create authenticated Supabase client
      const token = await getToken({ template: 'supabase' });
      const supabase = await supabaseClient(token);
      
      // Debug: Log user info
      if (process.env.NODE_ENV === 'development') {
        console.log('Attempting to save entry for user:', userId);
      }
      
      // Insert the journal entry into the database with all required fields
      const { data: journalEntry, error: insertError } = await supabase
        .from('journal_entries')
        .insert({
          user_id: userId,
          date: data.date,
          prompt: data.prompt,
          content: data.content,
          mood: data.mood,
          tags: data.tags,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) {
        console.error('Supabase insert error:', insertError);
        console.error('Insert data:', {
          user_id: userId,
          date: data.date,
          prompt: data.prompt,
          content: data.content.substring(0, 50) + '...',
        });
        throw new Error(`Failed to save journal entry: ${insertError.message}`);
      }

      if (!journalEntry) {
        throw new Error('No journal entry returned after save');
      }

      // Add the new entry to the beginning of the entries list
      setEntries(prev => [journalEntry as JournalEntry, ...prev]);

      return journalEntry as JournalEntry;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred while saving';
      setError(errorMessage);
      console.error('Error saving journal entry:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId, getToken]);

  const fetchEntries = useCallback(async (page: number = 0, append: boolean = false) => {
    if (!userId) {
      setError('User not authenticated');
      return;
    }

    const isLoadingMore = page > 0;
    if (isLoadingMore) {
      setFetchingMore(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      // Get the JWT token from Clerk and create authenticated Supabase client
      const token = await getToken({ template: 'supabase' });
      const supabase = await supabaseClient(token);
      
      const from = page * ENTRIES_PER_PAGE;
      const to = from + ENTRIES_PER_PAGE - 1;

      const { data: journalEntries, error: fetchError } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (fetchError) {
        console.error('Supabase fetch error:', fetchError);
        throw new Error(`Failed to fetch journal entries: ${fetchError.message}`);
      }

      const fetchedEntries = journalEntries as JournalEntry[] || [];
      
      if (append) {
        setEntries(prev => [...prev, ...fetchedEntries]);
      } else {
        setEntries(fetchedEntries);
      }

      // Check if there are more entries to load
      setHasMore(fetchedEntries.length === ENTRIES_PER_PAGE);
      setCurrentPage(page);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred while fetching entries';
      setError(errorMessage);
      console.error('Error fetching journal entries:', err);
    } finally {
      setLoading(false);
      setFetchingMore(false);
    }
  }, [userId, getToken]);

  const loadMore = useCallback(async () => {
    if (!hasMore || fetchingMore) return;
    await fetchEntries(currentPage + 1, true);
  }, [fetchEntries, currentPage, hasMore, fetchingMore]);

  const refreshEntries = useCallback(async () => {
    setCurrentPage(0);
    setHasMore(true);
    await fetchEntries(0, false);
  }, [fetchEntries]);

  // Initial fetch when user is loaded and authenticated
  useEffect(() => {
    if (isLoaded && userId) {
      fetchEntries();
    }
  }, [isLoaded, userId, fetchEntries]);

  return {
    saveEntry,
    entries,
    fetchEntries: () => fetchEntries(0, false),
    loadMore,
    hasMore,
    loading,
    fetchingMore,
    error,
    refreshEntries,
  };
} 
'use client';
import React, { useState, useMemo, useCallback } from 'react';
import { useJournalEntries } from '@/hooks/useJournalEntries';
import { SimpleJournalEditor } from '@/components/SimpleJournalEditor';
import { JournalSidebar } from '@/components/JournalSidebar';

interface JournalEntry {
  id: string;
  user_id: string;
  date: string;
  prompt: string;
  content: string;
  mood?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

interface SaveJournalEntryData {
  date: string;
  prompt: string;
  content: string;
  mood?: string;
  tags?: string[];
}

// Note: If user is not authenticated, they should be redirected to /sign-in
// This can be handled by Clerk middleware or by checking auth state here

export default function JournalPage() {
  const {
    saveEntry,
    updateEntry,
    entries,
    loadMore,
    hasMore,
    loading,
    fetchingMore,
    error,
  } = useJournalEntries();

  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);

  const handleSaveEntry = useCallback(
    async (content: string, mood?: string, prompt?: string) => {
      try {
        if (selectedEntry) {
          // Update existing entry
          const updateData: SaveJournalEntryData = {
            date: selectedEntry.date, // Keep the original date
            prompt: selectedEntry.prompt, // Keep the original prompt  
            content: content.trim(),
            mood,
            tags: selectedEntry.tags, // Keep the original tags
          };
          
          await updateEntry(selectedEntry.id, updateData);
          // Stay on this entry after updating
        } else {
          // Create new entry
          const newEntryData: SaveJournalEntryData = {
            content: content.trim(),
            mood,
            prompt: prompt || '', // Use the provided prompt or empty string
            date: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
            tags: [],
          };
          
          const savedEntry = await saveEntry(newEntryData);
          
          if (savedEntry) {
            // After saving, immediately select this new entry to show it in the sidebar
            setSelectedEntry(savedEntry);
          }
        }
      } catch (error) {
        console.error('Failed to save journal entry:', error);
        throw error; // Re-throw to let the editor handle the error display
      }
    },
    [selectedEntry, saveEntry, updateEntry]
  );

  const handleEntrySelect = (entry: JournalEntry) => {
    setSelectedEntry(entry);
  };

  const handleNewEntry = () => {
    setSelectedEntry(null);
  };

  // Get the initial content for the editor
  const initialContent = useMemo(() => {
    return selectedEntry?.content || '';
  }, [selectedEntry]);

  // Get the initial mood for the editor
  const initialMood = useMemo(() => {
    return selectedEntry?.mood || '';
  }, [selectedEntry]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Journal</h1>
          <p className="text-muted-foreground">
            Reflect on your thoughts and track your journey.
          </p>
        </div>

        <div className="flex gap-6 h-[calc(100vh-200px)]">
          {/* Sidebar */}
          <div className="w-80 flex-shrink-0">
            <JournalSidebar
              entries={entries}
              loading={loading}
              fetchingMore={fetchingMore}
              hasMore={hasMore}
              error={error}
              onLoadMore={loadMore}
              onEntrySelect={handleEntrySelect}
              selectedEntryId={selectedEntry?.id}
            />
          </div>

          {/* Main Editor */}
          <div className="flex-1">
            <div className="relative h-full">
              {selectedEntry && (
                <div className="absolute top-4 right-4 z-10">
                  <button
                    onClick={handleNewEntry}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors underline"
                  >
                    + New Entry
                  </button>
                </div>
              )}
              
              <SimpleJournalEditor
                onSave={handleSaveEntry}
                loading={loading}
                initialContent={initialContent}
                initialMood={initialMood}
                key={selectedEntry?.id || 'new'} // Force re-render when switching entries
              />
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="fixed bottom-4 right-4 max-w-md">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Error
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
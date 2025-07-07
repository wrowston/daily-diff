'use client';
import React from 'react';
import { JournalEditor } from './JournalEditor';
import { useJournalEntries } from '@/hooks/useJournalEntries';

interface SaveJournalEntryData {
  date: string;
  prompt: string;
  content: string;
  mood?: string;
  tags?: string[];
}

export function JournalApp() {
  const { saveEntry, loading, error } = useJournalEntries();

  const handleSaveEntry = async (content: string, mood?: string, tags?: string[]): Promise<void> => {
    try {
      // Create a SaveJournalEntryData object with required fields
      const entryData: SaveJournalEntryData = {
        date: new Date().toISOString().split('T')[0], // Use today's date
        prompt: 'What are you reflecting on today?', // Default prompt
        content,
        mood,
        tags,
      };
      
      await saveEntry(entryData);
      console.log('Journal entry saved successfully!');
    } catch (error) {
      console.error('Failed to save journal entry:', error);
      // The error will be handled by the useJournalEntries hook
      throw error;
    }
  };

  return (
    <div>
      <JournalEditor
        initialContent=""
        onSave={handleSaveEntry}
        isExternalLoading={loading}
      />
      {error && (
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error saving journal entry
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
  );
} 
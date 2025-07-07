'use client';
import React, { useState } from 'react';
import { useJournalEntries } from '@/hooks/useJournalEntries';
import { JournalSidebar } from '@/components/journal/JournalSidebar';
import { JournalForm } from '@/components/journal/JournalForm';
import { JournalEntry, SaveJournalEntryData } from '@/components/journal/journalUtils';
import { Button } from '@/components/ui/button';

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
    error 
  } = useJournalEntries();

  // Selected entry state
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSave = async (data: SaveJournalEntryData) => {
    setIsSubmitting(true);
    try {
      const savedEntry = await saveEntry(data);
      if (savedEntry) {
        // After saving, select this new entry to show it in the sidebar
        setSelectedEntry(savedEntry);
      }
      return savedEntry;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (id: string, data: SaveJournalEntryData) => {
    setIsSubmitting(true);
    try {
      await updateEntry(id, data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEntrySelect = (entry: JournalEntry) => {
    setSelectedEntry(entry);
  };

  const handleNewEntry = () => {
    setSelectedEntry(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Daily Journal</h1>
          <p className="text-muted-foreground">
            Reflect on your day with guided prompts to capture your thoughts and feelings.
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
          <div className="flex-1 overflow-y-auto">
            {/* New Entry Button */}
            {selectedEntry && (
              <div className="mb-4 flex justify-end">
                <Button
                  onClick={handleNewEntry}
                  variant="outline"
                  className="text-sm"
                >
                  + New Entry
                </Button>
              </div>
            )}

            <JournalForm
              selectedEntry={selectedEntry}
              onSave={handleSave}
              onUpdate={handleUpdate}
              isSubmitting={isSubmitting}
              loading={loading}
              error={error}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
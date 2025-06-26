import React from 'react';
import { JournalEditor } from './JournalEditor';

// Example implementation of the journal save function
const saveJournalEntry = async (content: string, mood?: string, tags?: string[]): Promise<void> => {
  console.log('Saving journal entry:', { content, mood, tags });
  
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Here you could make an actual API call to save the journal entry
  // For example, calling a Supabase Edge Function or database insert
  
  console.log('Journal entry saved successfully!');
};

export function JournalApp() {
  return (
    <div>
      <JournalEditor
        initialContent=""
        onSave={saveJournalEntry}
      />
    </div>
  );
} 
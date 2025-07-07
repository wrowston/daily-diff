'use client';
import React, { useState, useMemo } from 'react';
import { useJournalEntries } from '@/hooks/useJournalEntries';
import { useRandomPrompt } from '@/hooks/useRandomPrompt';
import { JournalSidebar } from '@/components/JournalSidebar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Mood = {
  emoji: string;
  label: string;
  value: string;
};

const MOODS: Mood[] = [
  { emoji: '😊', label: 'Happy', value: 'happy' },
  { emoji: '😌', label: 'Peaceful', value: 'peaceful' },
  { emoji: '😐', label: 'Neutral', value: 'neutral' },
  { emoji: '😔', label: 'Sad', value: 'sad' },
  { emoji: '😩', label: 'Stressed', value: 'stressed' },
  { emoji: '😴', label: 'Tired', value: 'tired' },
  { emoji: '🤔', label: 'Thoughtful', value: 'thoughtful' },
  { emoji: '😤', label: 'Frustrated', value: 'frustrated' },
];

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

// Helper function to parse content back into structured format
function parseEntryContent(content: string) {
  const lines = content.split('\n');
  let mood = '';
  let answer1 = '';
  let answer2 = '';
  let answer3 = '';
  
  let currentSection = '';
  let currentContent: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.startsWith('Mood: ')) {
      mood = line.replace('Mood: ', '').trim();
    } else if (line === 'What went well today?') {
      if (currentSection && currentContent.length > 0) {
        // Save previous section
        if (currentSection === 'answer1') answer1 = currentContent.join('\n').trim();
        if (currentSection === 'answer2') answer2 = currentContent.join('\n').trim();
        if (currentSection === 'answer3') answer3 = currentContent.join('\n').trim();
      }
      currentSection = 'answer1';
      currentContent = [];
    } else if (line === 'What could have gone better?') {
      if (currentSection && currentContent.length > 0) {
        if (currentSection === 'answer1') answer1 = currentContent.join('\n').trim();
        if (currentSection === 'answer2') answer2 = currentContent.join('\n').trim();
        if (currentSection === 'answer3') answer3 = currentContent.join('\n').trim();
      }
      currentSection = 'answer2';
      currentContent = [];
    } else if (line && !line.startsWith('Mood: ') && currentSection === '' && answer1 === '' && answer2 === '') {
      // This might be a random prompt question
      currentSection = 'answer3';
      currentContent = [];
    } else if (line.trim() !== '' && currentSection) {
      currentContent.push(line);
    }
  }
  
  // Save the last section
  if (currentSection && currentContent.length > 0) {
    if (currentSection === 'answer1') answer1 = currentContent.join('\n').trim();
    if (currentSection === 'answer2') answer2 = currentContent.join('\n').trim();
    if (currentSection === 'answer3') answer3 = currentContent.join('\n').trim();
  }
  
  return { mood, answer1, answer2, answer3 };
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
    error 
  } = useJournalEntries();
  const { prompt: randomPrompt, loading: promptLoading, fetchNewPrompt } = useRandomPrompt();

  // Selected entry state
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);

  // Form state
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [answer1, setAnswer1] = useState<string>('');
  const [answer2, setAnswer2] = useState<string>('');
  const [answer3, setAnswer3] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);

  // Determine if we're editing an existing entry
  const isEditing = !!selectedEntry;

  // Parse selected entry content when entry changes
  React.useEffect(() => {
    if (selectedEntry) {
      const parsed = parseEntryContent(selectedEntry.content);
      
      // Find mood value from emoji
      let moodValue = selectedEntry.mood || '';
      if (parsed.mood && !moodValue) {
        const foundMood = MOODS.find(m => parsed.mood.includes(m.emoji));
        moodValue = foundMood?.value || '';
      }
      
      setSelectedMood(moodValue);
      setAnswer1(parsed.answer1);
      setAnswer2(parsed.answer2);
      setAnswer3(parsed.answer3);
    }
  }, [selectedEntry]);

  const handleMoodChange = (mood: string) => {
    const newMood = selectedMood === mood ? '' : mood;
    setSelectedMood(newMood);
  };

  const clearForm = () => {
    setSelectedMood('');
    setAnswer1('');
    setAnswer2('');
    setAnswer3('');
    setSelectedEntry(null);
    fetchNewPrompt(); // Get a new random prompt for next entry
  };

  const handleSave = async () => {
    // Validate that at least one answer is provided
    if (!answer1.trim() && !answer2.trim() && !answer3.trim()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Format the content string
      let content = '';
      
      // Add mood if selected
      if (selectedMood) {
        const selectedMoodData = MOODS.find(m => m.value === selectedMood);
        content += `Mood: ${selectedMoodData?.emoji || selectedMood}\n\n`;
      }

      // Add Question 1
      if (answer1.trim()) {
        content += `What went well today?\n${answer1.trim()}\n\n`;
      }

      // Add Question 2
      if (answer2.trim()) {
        content += `What could have gone better?\n${answer2.trim()}\n\n`;
      }

      // Add Question 3 (Random Prompt)
      if (answer3.trim()) {
        const promptText = isEditing ? selectedEntry?.prompt : (randomPrompt?.prompt || 'Reflection');
        content += `${promptText}\n${answer3.trim()}\n\n`;
      }

      // Remove trailing newlines
      content = content.trim();

      if (isEditing && selectedEntry) {
        // Update existing entry
        const updateData: SaveJournalEntryData = {
          date: selectedEntry.date, // Keep the original date
          prompt: selectedEntry.prompt, // Keep the original prompt  
          content,
          mood: selectedMood || undefined,
          tags: selectedEntry.tags, // Keep the original tags
        };
        
        await updateEntry(selectedEntry.id, updateData);
      } else {
        // Create new entry
        const entryData: SaveJournalEntryData = {
          date: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
          prompt: randomPrompt?.prompt || 'Daily reflection',
          content,
          mood: selectedMood || undefined,
          tags: [],
        };

        const savedEntry = await saveEntry(entryData);
        
        if (savedEntry) {
          // After saving, select this new entry to show it in the sidebar
          setSelectedEntry(savedEntry);
        }
      }

      // Show success message
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);

      // Only clear the form if we're creating a new entry
      if (!isEditing) {
        clearForm();
      }

    } catch (error) {
      console.error('Failed to save journal entry:', error);
      // Error is handled by the hook and displayed below
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEntrySelect = (entry: JournalEntry) => {
    setSelectedEntry(entry);
  };

  const handleNewEntry = () => {
    clearForm();
  };

  const isFormValid = answer1.trim() || answer2.trim() || answer3.trim();

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

            {/* Success Message */}
            {showSuccess && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-700">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-medium">
                    Journal entry {isEditing ? 'updated' : 'saved'} successfully!
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-6">
              {/* Mood Selector */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">😊</span>
                    How are you feeling today?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    {MOODS.map((mood) => (
                      <button
                        key={mood.value}
                        type="button"
                        onClick={() => handleMoodChange(mood.value)}
                        className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                          selectedMood === mood.value
                            ? 'bg-primary text-primary-foreground shadow-md scale-105'
                            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:scale-102'
                        }`}
                        title={`Select ${mood.label} mood`}
                      >
                        <span className="text-lg">{mood.emoji}</span>
                        <span>{mood.label}</span>
                      </button>
                    ))}
                  </div>
                  {selectedMood && (
                    <div className="mt-3 text-sm text-muted-foreground">
                      Current mood: {MOODS.find(m => m.value === selectedMood)?.emoji} {MOODS.find(m => m.value === selectedMood)?.label}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Question 1: What went well */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">✨</span>
                    What went well today?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={answer1}
                    onChange={(e) => setAnswer1(e.target.value)}
                    placeholder="Reflect on the positive moments, achievements, or things you're grateful for today..."
                    className="min-h-[120px] resize-none"
                  />
                  {answer1.length > 0 && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      {answer1.length} characters
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Question 2: What could have gone better */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">🎯</span>
                    What could have gone better?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={answer2}
                    onChange={(e) => setAnswer2(e.target.value)}
                    placeholder="Think about challenges you faced, lessons learned, or areas for improvement..."
                    className="min-h-[120px] resize-none"
                  />
                  {answer2.length > 0 && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      {answer2.length} characters
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Question 3: Random Prompt or Existing Entry Prompt */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">💭</span>
                      {isEditing ? 'Original Prompt' : 'Random Reflection'}
                    </div>
                    {!isEditing && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchNewPrompt}
                        disabled={promptLoading}
                        className="text-xs"
                      >
                        <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        New Prompt
                      </Button>
                    )}
                  </CardTitle>
                  {isEditing ? (
                    <p className="text-muted-foreground font-medium">
                      &ldquo;{selectedEntry?.prompt}&rdquo;
                    </p>
                  ) : promptLoading ? (
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
                      Getting a new prompt...
                    </div>
                  ) : randomPrompt ? (
                    <p className="text-muted-foreground font-medium">
                      &ldquo;{randomPrompt.prompt}&rdquo;
                    </p>
                  ) : (
                    <p className="text-muted-foreground text-sm">No prompt available</p>
                  )}
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={answer3}
                    onChange={(e) => setAnswer3(e.target.value)}
                    placeholder={
                      isEditing
                        ? `Reflect on: "${selectedEntry?.prompt}"`
                        : randomPrompt 
                          ? `Reflect on: "${randomPrompt.prompt}"`
                          : "Share your thoughts on today's reflection prompt..."
                    }
                    className="min-h-[120px] resize-none"
                  />
                  {answer3.length > 0 && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      {answer3.length} characters
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Save Button */}
              <div className="flex justify-center pt-4">
                <Button 
                  onClick={handleSave}
                  disabled={!isFormValid || isSubmitting || loading}
                  size="lg"
                  className="min-w-[200px]"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      {isEditing ? 'Updating...' : 'Saving Entry...'}
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {isEditing ? 'Update Entry' : 'Save Journal Entry'}
                    </>
                  )}
                </Button>
              </div>

              {/* Form validation hint */}
              {!isFormValid && (
                <div className="text-center text-sm text-muted-foreground">
                  Please answer at least one question to save your journal entry.
                </div>
              )}
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
                    Error saving entry
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
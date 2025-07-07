'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useRandomPrompt } from '@/hooks/useRandomPrompt';

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

interface SimpleJournalEditorProps {
  onSave: (content: string, mood?: string, prompt?: string) => Promise<void>;
  loading?: boolean;
  initialContent?: string;
  initialMood?: string;
  onContentChange?: (content: string) => void;
  onMoodChange?: (mood: string) => void;
}

export function SimpleJournalEditor({ 
  onSave, 
  loading = false, 
  initialContent = '',
  initialMood = '',
  onContentChange,
  onMoodChange
}: SimpleJournalEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [selectedMood, setSelectedMood] = useState(initialMood);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Only fetch random prompt for new entries (when no initialContent)
  const { prompt, loading: promptLoading, fetchNewPrompt } = useRandomPrompt();
  const isNewEntry = !initialContent;

  // Update content when initialContent changes (e.g., when selecting a different entry)
  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  // Update mood when initialMood changes
  useEffect(() => {
    setSelectedMood(initialMood);
  }, [initialMood]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    onContentChange?.(newContent);
  };

  const handleMoodChange = (mood: string) => {
    const newMood = selectedMood === mood ? '' : mood;
    setSelectedMood(newMood);
    onMoodChange?.(newMood);
  };

  const handleSave = async () => {
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      // Pass the current prompt when saving (for new entries)
      const currentPrompt = isNewEntry && prompt ? prompt.prompt : undefined;
      await onSave(content, selectedMood, currentPrompt);
      
      // Only clear the form if we're creating a new entry (no initialContent)
      // When editing, keep the content so user can continue editing
      if (!initialContent) {
        setContent(''); // Clear the textarea after successful save
        setSelectedMood(''); // Clear the mood after successful save
        fetchNewPrompt(); // Get a new prompt for the next entry
      }
      
      setShowSuccess(true);
      
      // Hide success message after 2 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to save entry:', error);
      // Error handling is done by the parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSave();
    }
  };

  const isDisabled = !content.trim() || isSubmitting || loading;

  return (
    <Card className="h-full">
      <CardContent className="p-6 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">
            {isNewEntry ? 'New Journal Entry' : 'Edit Entry'}
          </h2>
          {showSuccess && (
            <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Saved successfully!
            </div>
          )}
        </div>

        {/* Random Prompt Section - Only for new entries */}
        {isNewEntry && (
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-blue-600 text-lg">💭</span>
                  <h3 className="text-sm font-medium text-blue-900">Today&apos;s Writing Prompt</h3>
                </div>
                {promptLoading ? (
                  <div className="flex items-center gap-2 text-blue-700">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                    <span className="text-sm">Getting a prompt for you...</span>
                  </div>
                ) : prompt ? (
                  <p className="text-blue-800 font-medium leading-relaxed">
                    &ldquo;{prompt.prompt}&rdquo;
                  </p>
                ) : (
                  <p className="text-blue-700 text-sm">No prompt available</p>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchNewPrompt}
                disabled={promptLoading}
                className="border-blue-300 text-blue-700 hover:bg-blue-100 flex-shrink-0"
              >
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                New
              </Button>
            </div>
          </div>
        )}

        {/* Mood Selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-foreground mb-2">
            How are you feeling? <span className="text-xs text-muted-foreground">(optional)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {MOODS.map((mood) => (
              <button
                key={mood.value}
                type="button"
                onClick={() => handleMoodChange(mood.value)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                  selectedMood === mood.value
                    ? 'bg-primary text-primary-foreground shadow-sm scale-105'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:scale-102'
                }`}
                title={`Select ${mood.label} mood`}
              >
                <span className="text-sm">{mood.emoji}</span>
                <span className="hidden sm:inline">{mood.label}</span>
              </button>
            ))}
          </div>
          {selectedMood && (
            <div className="mt-2 text-xs text-muted-foreground">
              Current mood: {MOODS.find(m => m.value === selectedMood)?.emoji} {MOODS.find(m => m.value === selectedMood)?.label}
            </div>
          )}
        </div>
        
        <div className="flex-1 flex flex-col gap-4">
          <Textarea
            value={content}
            onChange={handleContentChange}
            onKeyDown={handleKeyDown}
            placeholder={
              isNewEntry && prompt 
                ? `Reflect on: "${prompt.prompt}"`
                : "What&apos;s on your mind today? Start writing your thoughts..."
            }
            className="flex-1 min-h-[300px] resize-none"
          />
          
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {content.length > 0 && (
                <span>{content.length} characters</span>
              )}
              <span className="text-xs ml-2">
                Tip: Press Cmd/Ctrl + Enter to save quickly
              </span>
            </div>
            
            <Button 
              onClick={handleSave}
              disabled={isDisabled}
              className="min-w-[100px]"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Saving...
                </>
              ) : showSuccess ? (
                <>
                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Saved!
                </>
              ) : (
                isNewEntry ? 'Save Entry' : 'Update Entry'
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 
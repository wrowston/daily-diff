'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';

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
  onSave: (content: string, mood?: string) => Promise<void>;
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
      await onSave(content, selectedMood);
      setContent(''); // Clear the textarea after successful save
      setSelectedMood(''); // Clear the mood after successful save
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
          <h2 className="text-xl font-semibold text-foreground">Today&apos;s Entry</h2>
          {showSuccess && (
            <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Saved successfully!
            </div>
          )}
        </div>

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
            placeholder="What&apos;s on your mind today? Start writing your thoughts..."
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
                'Save Entry'
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 
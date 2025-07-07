import React, { useState, useEffect } from 'react';
import { useRandomPrompt } from '@/hooks/useRandomPrompt';
import { MoodSelector, MOODS } from './MoodSelector';
import { QuestionCard } from './QuestionCard';
import { JournalFormActions } from './JournalFormActions';
import { NotificationMessages } from './NotificationMessages';
import { parseEntryContent, JournalEntry, SaveJournalEntryData } from './journalUtils';
import { Sparkles, Target, Lightbulb, RefreshCw } from 'lucide-react';

interface JournalFormProps {
  selectedEntry: JournalEntry | null;
  onSave: (data: SaveJournalEntryData) => Promise<JournalEntry | null>;
  onUpdate: (id: string, data: SaveJournalEntryData) => Promise<void>;
  isSubmitting: boolean;
  loading: boolean;
  error: string | null;
}

export function JournalForm({
  selectedEntry,
  onSave,
  onUpdate,
  isSubmitting,
  loading,
  error
}: JournalFormProps) {
  const { prompt: randomPrompt, loading: promptLoading, fetchNewPrompt } = useRandomPrompt();

  // Form state
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [answer1, setAnswer1] = useState<string>('');
  const [answer2, setAnswer2] = useState<string>('');
  const [answer3, setAnswer3] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState<boolean>(false);

  // Determine if we're editing an existing entry
  const isEditing = !!selectedEntry;

  // Parse selected entry content when entry changes
  useEffect(() => {
    if (selectedEntry) {
      const parsed = parseEntryContent(selectedEntry.content);
      
      // Find mood value from emoji
      let moodValue = selectedEntry.mood || '';
      if (parsed.mood && !moodValue) {
        const foundMood = MOODS.find(m => parsed.mood.includes(m.value));
        moodValue = foundMood?.value || '';
      }
      
      setSelectedMood(moodValue);
      setAnswer1(parsed.answer1);
      setAnswer2(parsed.answer2);
      setAnswer3(parsed.answer3);
    }
  }, [selectedEntry]);

  const clearForm = () => {
    setSelectedMood('');
    setAnswer1('');
    setAnswer2('');
    setAnswer3('');
    fetchNewPrompt(); // Get a new random prompt for next entry
  };

  const handleSave = async () => {
    // Validate that at least one answer is provided
    if (!answer1.trim() && !answer2.trim() && !answer3.trim()) {
      return;
    }

    try {
      // Format the content string
      let content = '';
      
      // Add mood if selected
      if (selectedMood) {
        const selectedMoodData = MOODS.find(m => m.value === selectedMood);
        content += `Mood: ${selectedMoodData?.label || selectedMood}\n\n`;
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
        
        await onUpdate(selectedEntry.id, updateData);
      } else {
        // Create new entry
        const entryData: SaveJournalEntryData = {
          date: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
          prompt: randomPrompt?.prompt || 'Daily reflection',
          content,
          mood: selectedMood || undefined,
          tags: [],
        };

        await onSave(entryData);
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
      // Error is handled by the parent component
    }
  };

  const isFormValid = Boolean(answer1.trim() || answer2.trim() || answer3.trim());

  return (
    <div className="space-y-6">
      <NotificationMessages 
        showSuccess={showSuccess} 
        isEditing={isEditing} 
        error={error} 
      />

      {/* Mood Selector */}
      <MoodSelector 
        selectedMood={selectedMood} 
        onMoodChange={setSelectedMood} 
      />

      {/* Question 1: What went well */}
      <QuestionCard
        icon={<Sparkles className="h-5 w-5 text-yellow-500" />}
        title="What went well today?"
        value={answer1}
        onChange={setAnswer1}
        placeholder="Reflect on the positive moments, achievements, or things you're grateful for today..."
      />

      {/* Question 2: What could have gone better */}
      <QuestionCard
        icon={<Target className="h-5 w-5 text-blue-500" />}
        title="What could have gone better?"
        value={answer2}
        onChange={setAnswer2}
        placeholder="Think about challenges you faced, lessons learned, or areas for improvement..."
      />

      {/* Question 3: Random Prompt or Existing Entry Prompt */}
      <QuestionCard
        icon={<Lightbulb className="h-5 w-5 text-purple-500" />}
        title={isEditing ? 'Original Prompt' : 'Random Reflection'}
        value={answer3}
        onChange={setAnswer3}
        placeholder={
          isEditing
            ? `Reflect on: "${selectedEntry?.prompt}"`
            : randomPrompt 
              ? `Reflect on: "${randomPrompt.prompt}"`
              : "Share your thoughts on today's reflection prompt..."
        }
        subtitle={
          isEditing 
            ? selectedEntry?.prompt 
            : promptLoading 
              ? 'Getting a new prompt...'
              : randomPrompt?.prompt
        }
        actionButton={
          !isEditing ? {
            label: 'New Prompt',
            onClick: fetchNewPrompt,
            disabled: promptLoading,
            icon: <RefreshCw className="h-3 w-3 mr-1" />
          } : undefined
        }
      />

      <JournalFormActions
        onSave={handleSave}
        isFormValid={isFormValid}
        isSubmitting={isSubmitting}
        loading={loading}
        isEditing={isEditing}
      />
    </div>
  );
} 
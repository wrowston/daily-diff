import React, { useState, useEffect } from 'react';
import { useRandomPrompt } from '@/hooks/useRandomPrompt';
import { useWeeklyEntryLimit } from '@/hooks/useWeeklyEntryLimit';
import { useSubscription } from '@/hooks/useSubscription';
import { UpgradeModal } from '@/components/UpgradeModal';
import { MoodSelector, MOODS } from './MoodSelector';
import { QuestionCard } from './QuestionCard';
import { JournalFormActions } from './JournalFormActions';
import { NotificationMessages } from './NotificationMessages';
import { parseEntryContent, JournalEntry, SaveJournalEntryData } from './journalUtils';
import { Sparkles, Target, Lightbulb, RefreshCw, Crown } from 'lucide-react';

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
  const { isPro } = useSubscription();
  const { hasReachedLimit, currentWeekCount, maxWeeklyEntries, checkLimit } = useWeeklyEntryLimit();

  // Form state
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [answer1, setAnswer1] = useState<string>('');
  const [answer2, setAnswer2] = useState<string>('');
  const [answer3, setAnswer3] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  
  // Modal states
  const [showUpgradeModal, setShowUpgradeModal] = useState<boolean>(false);
  const [upgradeModalContent, setUpgradeModalContent] = useState({
    title: '',
    description: '',
    feature: ''
  });

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

  const handleNewPrompt = () => {
    if (!isPro) {
      setUpgradeModalContent({
        title: 'Unlock Prompt Variety',
        description: 'Get access to unlimited prompt refreshes and discover new perspectives for your journaling.',
        feature: 'prompt_refresh'
      });
      setShowUpgradeModal(true);
      return;
    }
    fetchNewPrompt();
  };

  const handleSave = async () => {
    // Validate that at least one answer is provided
    if (!answer1.trim() && !answer2.trim() && !answer3.trim()) {
      return;
    }

    // Check weekly limit for free users on new entries
    if (!isEditing && !isPro && hasReachedLimit) {
      setUpgradeModalContent({
        title: 'Weekly Entry Limit Reached',
        description: `You've reached your weekly limit of ${maxWeeklyEntries} entries. Upgrade to Pro for unlimited journaling.`,
        feature: 'unlimited_entries'
      });
      setShowUpgradeModal(true);
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
        
        // Refresh the limit check after successful save
        await checkLimit();
      }

      // Show success message
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);

      // Clear form if not editing
      if (!isEditing) {
        clearForm();
      }
    } catch (error) {
      console.error('Error saving journal entry:', error);
    }
  };

  const isFormValid = answer1.trim() || answer2.trim() || answer3.trim();
  const isDisabled = !isEditing && !isPro && hasReachedLimit;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Weekly Limit Warning for Free Users */}
      {!isPro && !isEditing && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-blue-900">
              Weekly Progress: {currentWeekCount} of {maxWeeklyEntries} entries
            </span>
          </div>
          <p className="text-sm text-blue-700">
            {hasReachedLimit ? (
              <>You've reached your weekly limit. <button 
                onClick={() => setShowUpgradeModal(true)}
                className="underline font-medium hover:text-blue-800"
              >
                Upgrade to Pro
              </button> for unlimited entries.</>
            ) : (
              <>You can create {maxWeeklyEntries - currentWeekCount} more entries this week. 
              <button 
                onClick={() => setShowUpgradeModal(true)}
                className="underline font-medium hover:text-blue-800"
              >
                Upgrade to Pro
              </button> for unlimited journaling.</>
            )}
          </p>
        </div>
      )}

      <NotificationMessages 
        showSuccess={showSuccess}
        isEditing={isEditing}
        error={error}
      />

      <MoodSelector 
        selectedMood={selectedMood}
        onMoodChange={setSelectedMood}
      />

      <QuestionCard
        icon={<Sparkles className="h-5 w-5 text-green-500" />}
        title="What went well today?"
        value={answer1}
        onChange={setAnswer1}
        placeholder="Share your wins, achievements, or positive moments..."
      />

      <QuestionCard
        icon={<Target className="h-5 w-5 text-orange-500" />}
        title="What could have gone better?"
        value={answer2}
        onChange={setAnswer2}
        placeholder="Reflect on challenges, learnings, or areas for improvement..."
      />

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
            label: isPro ? 'New Prompt' : 'New Prompt (Pro)',
            onClick: handleNewPrompt,
            disabled: promptLoading,
            icon: isPro ? <RefreshCw className="h-3 w-3 mr-1" /> : <Crown className="h-3 w-3 mr-1" />
          } : undefined
        }
      />

      <JournalFormActions
        onSave={handleSave}
        isFormValid={Boolean(isFormValid && !isDisabled)}
        isSubmitting={isSubmitting}
        loading={loading}
        isEditing={isEditing}
      />

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        title={upgradeModalContent.title}
        description={upgradeModalContent.description}
        feature={upgradeModalContent.feature}
      />
    </div>
  );
} 
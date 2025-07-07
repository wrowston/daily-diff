'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';

interface JournalEditorProps {
  initialContent?: string;
  onSave?: (content: string, mood?: string, tags?: string[]) => Promise<void>;
  isExternalLoading?: boolean;
}

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

// Stub function for tag suggestions (replace with actual API call)
const getSuggestedTags = async (content: string): Promise<string[]> => {
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
  
  const keywords = content.toLowerCase();
  const suggestions = [];
  
  if (keywords.includes('work') || keywords.includes('job')) suggestions.push('work');
  if (keywords.includes('family') || keywords.includes('parents')) suggestions.push('family');
  if (keywords.includes('friend') || keywords.includes('social')) suggestions.push('relationships');
  if (keywords.includes('exercise') || keywords.includes('gym')) suggestions.push('fitness');
  if (keywords.includes('book') || keywords.includes('read')) suggestions.push('reading');
  if (keywords.includes('travel') || keywords.includes('trip')) suggestions.push('travel');
  if (keywords.includes('food') || keywords.includes('eat')) suggestions.push('food');
  if (keywords.includes('dream') || keywords.includes('sleep')) suggestions.push('dreams');
  if (keywords.includes('goal') || keywords.includes('plan')) suggestions.push('goals');
  if (keywords.includes('grateful') || keywords.includes('thankful')) suggestions.push('gratitude');
  
  return suggestions.slice(0, 5); // Return max 5 suggestions
};

export function JournalEditor({ initialContent = '', onSave, isExternalLoading = false }: JournalEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isLoadingTags, setIsLoadingTags] = useState(false);
  
  const autosaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isMountedRef = useRef<boolean>(true);
  const successTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const MAX_CHARACTERS = 1000;

  // Auto-resize textarea
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, []);

  // Save journal entry
  const saveJournalEntry = useCallback(async (content: string) => {
    if (!content.trim() || !isMountedRef.current) return;
    
    setIsLoading(true);
    try {
      if (onSave) {
        await onSave(content, selectedMood, selectedTags);
      }
      
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setLastSaved(new Date());
        setShowSuccess(true);
        
        // Clear any existing success timeout
        if (successTimeoutRef.current) {
          clearTimeout(successTimeoutRef.current);
        }
        
        // Set new timeout with proper cleanup
        successTimeoutRef.current = setTimeout(() => {
          if (isMountedRef.current) {
            setShowSuccess(false);
          }
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to save journal entry:', error);
      // You could add error state here
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [onSave, selectedMood, selectedTags]);

  // Autosave logic
  const scheduleAutosave = useCallback(() => {
    if (autosaveTimeoutRef.current) {
      clearTimeout(autosaveTimeoutRef.current);
    }
    
    autosaveTimeoutRef.current = setTimeout(() => {
      if (content.trim()) {
        saveJournalEntry(content);
      }
    }, 5000);
  }, [content, saveJournalEntry]);

  // Handle content change
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    if (newContent.length <= MAX_CHARACTERS) {
      setContent(newContent);
      scheduleAutosave();
    }
  };

  // Get tag suggestions based on content
  const updateTagSuggestions = useCallback(async (currentContent: string, currentSelectedTags: string[]) => {
    if (currentContent.length > 50) { // Only suggest tags if there's substantial content
      setIsLoadingTags(true);
      try {
        const suggestions = await getSuggestedTags(currentContent);
        setSuggestedTags(suggestions.filter(tag => !currentSelectedTags.includes(tag)));
      } catch (error) {
        console.error('Failed to get tag suggestions:', error);
      } finally {
        setIsLoadingTags(false);
      }
    }
  }, []);

  // Toggle tag selection
  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  // Effects
  useEffect(() => {
    adjustTextareaHeight();
  }, [content, adjustTextareaHeight]);

  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      updateTagSuggestions(content, selectedTags);
    }, 1000);

    return () => clearTimeout(debounceTimeout);
  }, [content, selectedTags, updateTagSuggestions]);

  useEffect(() => {
    return () => {
      // Mark component as unmounted to prevent state updates
      isMountedRef.current = false;
      
      // Clear all timeouts
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current);
      }
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Today&apos;s Reflection</h1>
          {lastSaved && (
            <p className="text-sm text-gray-500">
              Last saved: {lastSaved.toLocaleTimeString()}
            </p>
          )}
        </div>

        {/* Mood Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            How are you feeling?
          </label>
          <div className="flex flex-wrap gap-2">
            {MOODS.map((mood) => (
              <button
                key={mood.value}
                onClick={() => setSelectedMood(selectedMood === mood.value ? '' : mood.value)}
                className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedMood === mood.value
                    ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
                    : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                }`}
                title={mood.label}
              >
                <span className="text-lg">{mood.emoji}</span>
                <span className="hidden sm:inline">{mood.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Text Editor */}
        <div className="mb-6 relative">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleContentChange}
            placeholder="What&apos;s on your mind today?"
            className="w-full min-h-[300px] p-4 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none overflow-hidden"
            style={{ lineHeight: '1.6' }}
          />
          
          {/* Character Count */}
          <div className="absolute bottom-3 right-3 text-sm text-gray-500">
            <span className={content.length > MAX_CHARACTERS * 0.9 ? 'text-orange-600' : ''}>
              {content.length}
            </span>
            <span className="text-gray-400">/{MAX_CHARACTERS}</span>
          </div>
        </div>

        {/* Tags Section */}
        {(selectedTags.length > 0 || suggestedTags.length > 0) && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Tags {isLoadingTags && <span className="text-gray-400">(generating suggestions...)</span>}
            </label>
            
            {/* Selected Tags */}
            {selectedTags.length > 0 && (
              <div className="mb-3">
                <div className="flex flex-wrap gap-2">
                  {selectedTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full"
                    >
                      {tag}
                      <button
                        onClick={() => toggleTag(tag)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Suggested Tags */}
            {suggestedTags.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-2">Suggested tags:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full hover:bg-gray-200 transition-colors"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Save Button */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => saveJournalEntry(content)}
            disabled={isLoading || isExternalLoading || !content.trim()}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              isLoading || isExternalLoading || !content.trim()
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
            }`}
          >
            {(isLoading || isExternalLoading) ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Saving...
              </>
            ) : showSuccess ? (
              <>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Saved!
              </>
            ) : (
              'Save Entry'
            )}
          </button>

          {/* Success Indicator */}
          {showSuccess && (
            <div className="flex items-center gap-2 text-green-600 font-medium">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Entry saved successfully!
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
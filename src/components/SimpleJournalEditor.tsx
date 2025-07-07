'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';

interface SimpleJournalEditorProps {
  onSave: (content: string) => Promise<void>;
  loading?: boolean;
  initialContent?: string;
  onContentChange?: (content: string) => void;
}

export function SimpleJournalEditor({ 
  onSave, 
  loading = false, 
  initialContent = '',
  onContentChange 
}: SimpleJournalEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Update content when initialContent changes (e.g., when selecting a different entry)
  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    onContentChange?.(newContent);
  };

  const handleSave = async () => {
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSave(content);
      setContent(''); // Clear the textarea after successful save
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
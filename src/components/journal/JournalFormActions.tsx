import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

interface JournalFormActionsProps {
  onSave: () => void;
  isFormValid: boolean;
  isSubmitting: boolean;
  loading: boolean;
  isEditing: boolean;
}

export function JournalFormActions({
  onSave,
  isFormValid,
  isSubmitting,
  loading,
  isEditing
}: JournalFormActionsProps) {
  return (
    <>
      {/* Save Button */}
      <div className="flex justify-center pt-4">
        <Button 
          onClick={onSave}
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
              <CheckCircle className="h-4 w-4 mr-2" />
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
    </>
  );
} 
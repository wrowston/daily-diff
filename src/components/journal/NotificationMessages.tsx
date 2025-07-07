import React from 'react';
import { CheckCircle, AlertTriangle } from 'lucide-react';

interface NotificationMessagesProps {
  showSuccess: boolean;
  isEditing: boolean;
  error: string | null;
}

export function NotificationMessages({ 
  showSuccess, 
  isEditing, 
  error 
}: NotificationMessagesProps) {
  return (
    <>
      {/* Success Message */}
      {showSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">
              Journal entry {isEditing ? 'updated' : 'saved'} successfully!
            </span>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="fixed bottom-4 right-4 max-w-md">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-400" />
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
    </>
  );
} 
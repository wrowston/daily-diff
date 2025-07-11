import React, { useState } from 'react';
import { useDailyPrompt } from '../hooks/useDailyPrompt';
import { useSubscription } from '../hooks/useSubscription';
import { UpgradeModal } from './UpgradeModal';
import { Crown } from 'lucide-react';

export function DailyPrompt() {
  const { prompt, metadata, loading, error, refetch } = useDailyPrompt();
  const { isPro } = useSubscription();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const handleRefresh = () => {
    if (!isPro) {
      setShowUpgradeModal(true);
      return;
    }
    refetch();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading your daily prompt...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading prompt</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
        <div className="mt-4">
          <button
            onClick={refetch}
            className="bg-red-100 hover:bg-red-200 text-red-800 font-medium py-2 px-4 rounded-md text-sm transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!prompt) {
    return (
      <div className="text-center p-8 text-gray-500">
        <p>No prompt available at the moment.</p>
        <button
          onClick={refetch}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
        >
          Load Prompt
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Daily Journal Prompt</h2>
          {prompt.category && (
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
              {prompt.category}
            </span>
          )}
        </div>
        
        <div className="text-lg text-gray-700 leading-relaxed mb-8 text-center">
          <p className="italic">&ldquo;{prompt.text}&rdquo;</p>
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={handleRefresh}
            className={`font-medium py-2 px-4 rounded-md transition-colors flex items-center gap-2 ${
              isPro 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300'
            }`}
          >
            {isPro ? (
              <>Get New Prompt</>
            ) : (
              <>
                <Crown className="h-4 w-4" />
                Get New Prompt (Pro)
              </>
            )}
          </button>
          
          {metadata && (
            <div className="text-sm text-gray-500">
              <p>{metadata.remaining_prompts} prompts remaining</p>
              {metadata.was_reset && (
                <p className="text-orange-600">✨ Prompts refreshed!</p>
              )}
            </div>
          )}
        </div>

        {!isPro && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              <Crown className="h-4 w-4 inline mr-1" />
              Upgrade to Pro for unlimited prompt refreshes and discover new perspectives for your journaling.
            </p>
          </div>
        )}
      </div>

      {/* Metadata for debugging (remove in production) */}
      {metadata && process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg text-xs text-gray-600">
          <details>
            <summary className="cursor-pointer font-medium">Debug Info</summary>
            <pre className="mt-2 whitespace-pre-wrap">
              {JSON.stringify(metadata, null, 2)}
            </pre>
          </details>
        </div>
      )}

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        title="Unlock Daily Prompt Variety"
        description="Get access to unlimited prompt refreshes and discover new perspectives for your journaling every day."
        feature="prompt_refresh"
      />
    </div>
  );
} 
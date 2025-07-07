'use client';
import React, { useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Smile, 
  Meh, 
  Frown, 
  Zap, 
  Coffee, 
  Brain, 
  AlertTriangle,
  Heart
} from 'lucide-react';

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

interface JournalSidebarProps {
  entries: JournalEntry[];
  loading: boolean;
  fetchingMore: boolean;
  hasMore: boolean;
  error: string | null;
  onLoadMore: () => void;
  onEntrySelect?: (entry: JournalEntry) => void;
  selectedEntryId?: string;
}

// Helper function to get mood icon
function getMoodIcon(mood: string) {
  const iconProps = { className: "h-4 w-4" };
  
  switch (mood) {
    case 'happy':
      return <Smile {...iconProps} className="h-4 w-4 text-green-600" />;
    case 'peaceful':
      return <Heart {...iconProps} className="h-4 w-4 text-blue-500" />;
    case 'neutral':
      return <Meh {...iconProps} className="h-4 w-4 text-gray-500" />;
    case 'sad':
      return <Frown {...iconProps} className="h-4 w-4 text-blue-600" />;
    case 'stressed':
      return <Zap {...iconProps} className="h-4 w-4 text-red-500" />;
    case 'tired':
      return <Coffee {...iconProps} className="h-4 w-4 text-amber-600" />;
    case 'thoughtful':
      return <Brain {...iconProps} className="h-4 w-4 text-purple-600" />;
    case 'frustrated':
      return <AlertTriangle {...iconProps} className="h-4 w-4 text-orange-500" />;
    default:
      return null;
  }
}

export function JournalSidebar({
  entries,
  loading,
  fetchingMore,
  hasMore,
  error,
  onLoadMore,
  onEntrySelect,
  selectedEntryId
}: JournalSidebarProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Truncate content for display
  const truncateContent = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength).trim() + '...';
  };

  // Handle scroll to load more entries
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container || fetchingMore || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

    if (scrollPercentage > 0.8) {
      onLoadMore();
    }
  }, [fetchingMore, hasMore, onLoadMore]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  if (loading && entries.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg">Past Entries</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-current border-t-transparent"></div>
            Loading entries...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="text-lg">Past Entries</CardTitle>
        {entries.length > 0 && (
          <p className="text-sm text-muted-foreground">
            {entries.length} entries
          </p>
        )}
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden">
        <div
          ref={scrollContainerRef}
          className="h-full overflow-y-auto px-6 pb-6"
        >
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {entries.length === 0 && !loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No journal entries yet.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Start writing your first entry!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  onClick={() => onEntrySelect?.(entry)}
                  className={`
                    p-4 rounded-lg border cursor-pointer transition-all hover:shadow-sm
                    ${selectedEntryId === entry.id 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                    }
                  `}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground font-medium">
                        {formatDate(entry.date)}
                      </span>
                      {entry.prompt && (
                        <span className="text-xs text-primary font-medium mt-1 line-clamp-1">
                          {entry.prompt}
                        </span>
                      )}
                    </div>
                    {entry.mood && (
                      <span className="text-sm">
                        {/* Map mood values to icons */}
                        {getMoodIcon(entry.mood)}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-foreground leading-relaxed line-clamp-3">
                    {truncateContent(entry.content)}
                  </p>
                  
                  {entry.tags && entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {entry.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="inline-block px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-md"
                        >
                          {tag}
                        </span>
                      ))}
                      {entry.tags.length > 3 && (
                        <span className="text-xs text-muted-foreground">
                          +{entry.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* Load More Button */}
              {hasMore && (
                <div className="pt-4">
                  <Button
                    variant="outline"
                    onClick={onLoadMore}
                    disabled={fetchingMore}
                    className="w-full"
                  >
                    {fetchingMore ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2"></div>
                        Loading...
                      </>
                    ) : (
                      'Load More'
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 
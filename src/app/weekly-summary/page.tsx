'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useSubscription } from '@/hooks/useSubscription';
import { UpgradeModal } from '@/components/UpgradeModal';
import { supabaseClient } from '@/utils/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Calendar, BookOpen, TrendingUp, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface WeeklySummaryData {
  totalEntries: number;
  weekStart: string;
  weekEnd: string;
  mostCommonMood: string;
  entriesByDay: { day: string; count: number }[];
  recentEntries: { date: string; content: string; mood?: string }[];
}

export default function WeeklySummaryPage() {
  const { getToken, userId } = useAuth();
  const { isPro, isLoaded } = useSubscription();
  const [summaryData, setSummaryData] = useState<WeeklySummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    if (isLoaded && !isPro) {
      setShowUpgradeModal(true);
      setLoading(false);
    } else if (isLoaded && isPro && userId) {
      fetchWeeklySummary();
    }
  }, [isLoaded, isPro, userId]);

  const fetchWeeklySummary = async () => {
    if (!userId) return;

    try {
      const token = await getToken({ template: 'supabase' });
      const supabase = await supabaseClient(token);

      // Get the start and end of current week
      const today = new Date();
      const dayOfWeek = today.getDay();
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const monday = new Date(today);
      monday.setDate(today.getDate() - daysToMonday);
      monday.setHours(0, 0, 0, 0);

      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      sunday.setHours(23, 59, 59, 999);

      const { data: entries, error: fetchError } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', monday.toISOString())
        .lte('created_at', sunday.toISOString())
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      // Process the data
      const entriesByDay = getDailyEntryCounts(entries || [], monday);
      const mostCommonMood = getMostCommonMood(entries || []);
      const recentEntries = (entries || []).slice(0, 3).map(entry => ({
        date: entry.date,
        content: entry.content.substring(0, 100) + '...',
        mood: entry.mood
      }));

      setSummaryData({
        totalEntries: entries?.length || 0,
        weekStart: monday.toLocaleDateString(),
        weekEnd: sunday.toLocaleDateString(),
        mostCommonMood,
        entriesByDay,
        recentEntries
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load weekly summary');
    } finally {
      setLoading(false);
    }
  };

  const getDailyEntryCounts = (entries: any[], weekStart: Date) => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const counts = Array(7).fill(0);

    entries.forEach(entry => {
      const entryDate = new Date(entry.created_at);
      const dayIndex = ((entryDate.getDay() + 6) % 7); // Convert to Monday = 0
      counts[dayIndex]++;
    });

    return days.map((day, index) => ({ day, count: counts[index] }));
  };

  const getMostCommonMood = (entries: any[]) => {
    const moodCounts: { [key: string]: number } = {};
    entries.forEach(entry => {
      if (entry.mood) {
        moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
      }
    });

    const mostCommon = Object.entries(moodCounts).reduce((a, b) => 
      moodCounts[a[0]] > moodCounts[b[0]] ? a : b
    );

    return mostCommon ? mostCommon[0] : 'neutral';
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isPro) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8">
              <Crown className="h-16 w-16 text-amber-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Weekly Summary</h1>
              <p className="text-gray-600 mb-6">
                Weekly summaries are a Pro feature that provides insights into your journaling patterns and personal growth.
              </p>
              <Button 
                onClick={() => setShowUpgradeModal(true)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <Crown className="h-4 w-4 mr-2" />
                Upgrade to Pro
              </Button>
            </div>
          </div>
        </div>
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          title="Unlock Weekly Summaries"
          description="Get detailed insights into your journaling patterns, mood trends, and personal growth with Pro."
          feature="weekly_summary"
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <p className="text-red-700">Error loading weekly summary: {error}</p>
              <Button onClick={fetchWeeklySummary} className="mt-4">
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/journal">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Journal
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Weekly Summary</h1>
              <p className="text-muted-foreground">
                {summaryData?.weekStart} - {summaryData?.weekEnd}
              </p>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BookOpen className="h-5 w-5 text-blue-500" />
                  Total Entries
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {summaryData?.totalEntries || 0}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  entries this week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Most Common Mood
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600 capitalize">
                  {summaryData?.mostCommonMood || 'N/A'}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  dominant feeling
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="h-5 w-5 text-purple-500" />
                  Daily Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-end h-16">
                  {summaryData?.entriesByDay.map((day, index) => (
                    <div key={index} className="text-center">
                      <div 
                        className="bg-purple-200 rounded-t w-4 mx-auto"
                        style={{ height: `${Math.max(day.count * 12, 4)}px` }}
                      ></div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {day.day}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Entries */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Entries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {summaryData?.recentEntries.map((entry, index) => (
                  <div key={index} className="border-l-4 border-blue-200 pl-4">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-sm font-medium">
                        {new Date(entry.date).toLocaleDateString()}
                      </span>
                      {entry.mood && (
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded capitalize">
                          {entry.mood}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {entry.content}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 
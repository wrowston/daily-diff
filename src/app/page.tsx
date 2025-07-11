'use client';
import React from 'react';
import Link from 'next/link';
import { SignedIn } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { PricingTable } from '@clerk/nextjs';
import { useSubscription } from '@/hooks/useSubscription';
import { Crown } from 'lucide-react';

export default function HomePage() {
  const { isPro } = useSubscription();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-medium text-foreground mb-8 leading-tight">
            Structured Journaling for{' '}
            <span className="text-primary">Busy Builders</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed font-light">
            Stay focused, reflect clearly, and track your dev journey—one daily prompt at a time.
          </p>
          <Button asChild size="lg" className="text-lg px-8 py-6 h-auto">
            <Link href="/journal">
              Start Writing for Free
            </Link>
          </Button>
        </div>

        {/* Simple Quote Preview */}
        <div className="max-w-2xl mx-auto mt-20">
          <Card>
            <CardHeader>
              <div className="text-sm text-muted-foreground mb-2 font-mono">Today&apos;s prompt</div>
              <CardTitle className="text-lg font-medium">
                What&apos;s one thing you learned while coding today?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-muted-foreground font-mono text-sm leading-relaxed">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-muted rounded w-4/5"></div>
                  <div className="h-4 bg-muted rounded w-3/5"></div>
                  <div className="h-4 bg-muted rounded w-5/6"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="max-w-4xl mx-auto px-6 py-20">
        <h2 className="text-3xl md:text-4xl font-medium text-foreground text-center mb-16">
          How it works
        </h2>
        
        <div className="space-y-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-medium text-foreground mb-2">Get a daily prompt</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    A focused question delivered every day to guide your reflection on code, product, and growth.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                  2
                </div>
                <div>
                  <h3 className="text-xl font-medium text-foreground mb-2">Write for 5 minutes</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    No pressure, no perfect prose—just honest thoughts about your day building and shipping.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                  3
                </div>
                <div>
                  <h3 className="text-xl font-medium text-foreground mb-2">See your progress</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Get weekly summaries to spot patterns and track how your thinking evolves over time.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Weekly Summary Preview */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-medium text-foreground mb-4">
            Your weekly summary
          </h2>
          <div className="flex items-center justify-center gap-2 text-amber-600">
            <Crown className="h-5 w-5" />
            <span className="text-sm font-medium">Pro Feature</span>
          </div>
        </div>
        
        <div className="max-w-2xl mx-auto">
          <Card className="relative overflow-hidden">
            {/* Pro Badge */}
            <div className="absolute top-4 right-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
              <Crown className="h-3 w-3" />
              Pro
            </div>
            
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center">
                  <span className="text-amber-600 text-xs">✓</span>
                </div>
                <div>
                  <CardTitle>Week of March 4</CardTitle>
                  <div className="text-sm text-muted-foreground">7 entries</div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-foreground leading-relaxed">
                <p>
                  This week you shipped the user dashboard and spent time mentoring a junior dev. 
                  You struggled with balancing technical debt cleanup while hitting sprint goals.
                </p>
                <p>
                  Your best coding sessions happened in the morning, and you felt most creative 
                  when working on system architecture problems.
                </p>
              </div>
              
              <SignedIn>
                <div className="mt-6 pt-4 border-t">
                  <Link href="/weekly-summary">
                    <Button 
                      variant={isPro ? "default" : "outline"}
                      className={isPro ? "" : "text-purple-600 border-purple-200 hover:bg-purple-50"}
                    >
                      {isPro ? (
                        "View Your Weekly Summary"
                      ) : (
                        <>
                          <Crown className="h-4 w-4 mr-2" />
                          Upgrade for Weekly Summaries
                        </>
                      )}
                    </Button>
                  </Link>
                </div>
              </SignedIn>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Simple Pricing */}
      <section id="pricing" className="max-w-4xl mx-auto px-6 py-20">
        <h2 className="text-3xl md:text-4xl font-medium text-foreground text-center mb-16">
          Start free, upgrade when ready
        </h2>
        <PricingTable />
      </section>

      {/* Simple CTA Section */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-medium text-foreground mb-8">
          Ready to start your journey?
        </h2>
        <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
          Join thousands of developers who are already reflecting, learning, and growing through structured journaling.
        </p>
        <Button asChild size="lg" className="text-lg px-8 py-6 h-auto">
          <Link href="/journal">
            Start Your First Entry
          </Link>
        </Button>
      </section>
    </div>
  );
}

'use client';
import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function HomePage() {
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
              <div className="text-sm text-muted-foreground mb-2 font-mono">Today's prompt</div>
              <CardTitle className="text-lg font-medium">
                What's one thing you learned while coding today?
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
        <h2 className="text-3xl md:text-4xl font-medium text-foreground text-center mb-16">
          Your weekly summary
        </h2>
        
        <div className="max-w-2xl mx-auto">
          <Card>
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
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Simple Pricing */}
      <section id="pricing" className="max-w-4xl mx-auto px-6 py-20">
        <h2 className="text-3xl md:text-4xl font-medium text-foreground text-center mb-16">
          Start free, upgrade when ready
        </h2>
        
        <div className="max-w-md mx-auto">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-6">
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Free forever</div>
                  <div className="text-lg text-foreground">Daily prompts, weekly summaries, 7-day history</div>
                </div>
                
                <div className="border-t pt-6">
                  <div className="text-sm text-muted-foreground mb-2">Pro • $5/month</div>
                  <div className="text-lg text-foreground">Full archive, search, and email delivery</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Simple CTA Section */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl md:text-4xl font-medium text-foreground mb-8">
          Ready to start reflecting?
        </h2>
        <p className="text-xl text-muted-foreground mb-8 font-light">
          Join developers who are building better habits, one day at a time.
        </p>
        <Button asChild size="lg" className="text-lg px-8 py-6 h-auto">
          <Link href="/journal">
            Get your first prompt
          </Link>
        </Button>
      </section>

      {/* Sticky Footer CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t shadow-lg z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-center p-4">
          <Button asChild>
            <Link href="/journal">
              Start writing today →
            </Link>
          </Button>
        </div>
      </div>

      {/* Bottom padding for sticky footer */}
      <div className="h-20"></div>
    </div>
  );
}

'use client';
import React from 'react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-medium text-gray-900 mb-8 leading-tight">
            Structured Journaling for{' '}
            <span className="text-blue-900">Busy Builders</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
            Stay focused, reflect clearly, and track your dev journey—one daily prompt at a time.
          </p>
          <Link 
            href="/journal" 
            className="inline-block bg-blue-900 text-white px-8 py-4 rounded-xl text-lg font-medium hover:bg-blue-800 transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Start Writing for Free
          </Link>
        </div>

        {/* Simple Quote Preview */}
        <div className="max-w-2xl mx-auto mt-20">
          <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
            <div className="text-sm text-gray-500 mb-4 font-mono">Today's prompt</div>
            <h3 className="text-lg font-medium text-gray-800 mb-6">
              What's one thing you learned while coding today?
            </h3>
            <div className="text-gray-600 font-mono text-sm leading-relaxed">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-3 w-4/5"></div>
                <div className="h-4 bg-gray-200 rounded mb-3 w-3/5"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="max-w-4xl mx-auto px-6 py-20">
        <h2 className="text-3xl md:text-4xl font-medium text-gray-900 text-center mb-16">
          How it works
        </h2>
        
        <div className="space-y-12">
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-900 text-white rounded-full flex items-center justify-center text-sm font-medium">
              1
            </div>
            <div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Get a daily prompt</h3>
              <p className="text-gray-600 leading-relaxed">
                A focused question delivered every day to guide your reflection on code, product, and growth.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-900 text-white rounded-full flex items-center justify-center text-sm font-medium">
              2
            </div>
            <div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Write for 5 minutes</h3>
              <p className="text-gray-600 leading-relaxed">
                No pressure, no perfect prose—just honest thoughts about your day building and shipping.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-900 text-white rounded-full flex items-center justify-center text-sm font-medium">
              3
            </div>
            <div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">See your progress</h3>
              <p className="text-gray-600 leading-relaxed">
                Get weekly summaries to spot patterns and track how your thinking evolves over time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Weekly Summary Preview */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <h2 className="text-3xl md:text-4xl font-medium text-gray-900 text-center mb-16">
          Your weekly summary
        </h2>
        
        <div className="max-w-2xl mx-auto">
          <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center">
                <span className="text-amber-600 text-xs">✓</span>
              </div>
              <div>
                <div className="font-medium text-gray-900">Week of March 4</div>
                <div className="text-sm text-gray-500">7 entries</div>
              </div>
            </div>
            
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                This week you shipped the user dashboard and spent time mentoring a junior dev. 
                You struggled with balancing technical debt cleanup while hitting sprint goals.
              </p>
              <p>
                Your best coding sessions happened in the morning, and you felt most creative 
                when working on system architecture problems.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Simple Pricing */}
      <section id="pricing" className="max-w-4xl mx-auto px-6 py-20">
        <h2 className="text-3xl md:text-4xl font-medium text-gray-900 text-center mb-16">
          Start free, upgrade when ready
        </h2>
        
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="text-sm text-gray-500 mb-2">Free forever</div>
            <div className="text-lg text-gray-700 mb-6">Daily prompts, weekly summaries, 7-day history</div>
            
            <div className="border-t border-gray-200 pt-6">
              <div className="text-sm text-gray-500 mb-2">Pro • $5/month</div>
              <div className="text-lg text-gray-700">Full archive, search, and email delivery</div>
            </div>
          </div>
        </div>
      </section>

      {/* Simple CTA Section */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl md:text-4xl font-medium text-gray-900 mb-8">
          Ready to start reflecting?
        </h2>
        <p className="text-xl text-gray-600 mb-8 font-light">
          Join developers who are building better habits, one day at a time.
        </p>
        <Link 
          href="/journal" 
          className="inline-block bg-blue-900 text-white px-8 py-4 rounded-xl text-lg font-medium hover:bg-blue-800 transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Get your first prompt
        </Link>
      </section>

      {/* Sticky Footer CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-center">
          <Link 
            href="/journal" 
            className="inline-block bg-blue-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-800 transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Start writing today →
          </Link>
        </div>
      </div>

      {/* Bottom padding for sticky footer */}
      <div className="h-20"></div>
    </div>
  );
}

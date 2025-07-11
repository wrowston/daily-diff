'use client';
import React from 'react';
import Link from 'next/link';
import { useSubscription } from '@/hooks/useSubscription';
import { SignedIn, SignedOut } from '@clerk/nextjs';
import { Crown } from 'lucide-react';

export function NavigationMenu() {
  const { isPro } = useSubscription();

  return (
    <nav className="hidden md:flex items-center space-x-8">
      <Link href="/#how-it-works" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
        How it Works
      </Link>
      <Link href="/#pricing" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
        Pricing
      </Link>
      <Link href="/blog" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
        Blog
      </Link>
      
      <SignedIn>
        <Link
          href="/journal"
          className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
        >
          Journal
        </Link>
        
        <Link
          href="/weekly-summary"
          className={`flex items-center gap-1 font-medium transition-colors ${
            isPro 
              ? 'text-purple-600 hover:text-purple-800' 
              : 'text-gray-400 hover:text-gray-500'
          }`}
          title={isPro ? 'View Weekly Summary' : 'Weekly Summary (Pro Only)'}
        >
          {!isPro && <Crown className="h-3 w-3" />}
          Weekly Summary
        </Link>
      </SignedIn>
    </nav>
  );
} 
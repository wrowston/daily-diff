import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Crown, Sparkles } from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  feature: string;
}

export function UpgradeModal({ isOpen, onClose, title, description, feature }: UpgradeModalProps) {
  if (!isOpen) return null;

  const handleUpgrade = () => {
    // Redirect to pricing page or Clerk's subscription flow
    window.location.href = '/#pricing';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <Card className="border-0 shadow-none">
          <CardHeader className="relative">
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2 mb-2">
              <Crown className="h-6 w-6 text-amber-500" />
              <CardTitle className="text-xl font-bold">Upgrade to Pro</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg p-4 mb-4">
                <Sparkles className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
                <p className="text-sm text-gray-600">{description}</p>
              </div>
              
              <div className="text-left bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Pro Features Include:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Unlimited journal entries</li>
                  <li>• Prompt refresh & variety</li>
                  <li>• Weekly summaries & insights</li>
                  <li>• Email digests</li>
                  <li>• Advanced analytics</li>
                </ul>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button
                onClick={onClose}
                variant="outline"
                className="flex-1"
              >
                Maybe Later
              </Button>
              <Button
                onClick={handleUpgrade}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                Upgrade Now
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
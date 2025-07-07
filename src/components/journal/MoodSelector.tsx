import React from 'react';
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

type Mood = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  color: string;
};

const MOODS: Mood[] = [
  { icon: Smile, label: 'Happy', value: 'happy', color: 'text-green-600' },
  { icon: Heart, label: 'Peaceful', value: 'peaceful', color: 'text-blue-500' },
  { icon: Meh, label: 'Neutral', value: 'neutral', color: 'text-gray-500' },
  { icon: Frown, label: 'Sad', value: 'sad', color: 'text-blue-600' },
  { icon: Zap, label: 'Stressed', value: 'stressed', color: 'text-red-500' },
  { icon: Coffee, label: 'Tired', value: 'tired', color: 'text-amber-600' },
  { icon: Brain, label: 'Thoughtful', value: 'thoughtful', color: 'text-purple-600' },
  { icon: AlertTriangle, label: 'Frustrated', value: 'frustrated', color: 'text-orange-500' },
];

// Helper function to get mood icon component
function getMoodIcon(moodValue: string, className: string = "h-4 w-4") {
  const mood = MOODS.find(m => m.value === moodValue);
  if (!mood) return null;
  
  const IconComponent = mood.icon;
  return <IconComponent className={`${className} ${mood.color}`} />;
}

interface MoodSelectorProps {
  selectedMood: string;
  onMoodChange: (mood: string) => void;
}

export function MoodSelector({ selectedMood, onMoodChange }: MoodSelectorProps) {
  const handleMoodChange = (mood: string) => {
    const newMood = selectedMood === mood ? '' : mood;
    onMoodChange(newMood);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-primary" />
          How are you feeling today?
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3">
          {MOODS.map((mood) => {
            const IconComponent = mood.icon;
            return (
              <button
                key={mood.value}
                type="button"
                onClick={() => handleMoodChange(mood.value)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  selectedMood === mood.value
                    ? 'bg-primary text-primary-foreground shadow-md scale-105'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:scale-102'
                }`}
                title={`Select ${mood.label} mood`}
              >
                <IconComponent className={`h-4 w-4 ${selectedMood === mood.value ? 'text-white' : mood.color}`} />
                <span>{mood.label}</span>
              </button>
            );
          })}
        </div>
        {selectedMood && (
          <div className="mt-3 text-sm text-muted-foreground flex items-center gap-2">
            <span>Current mood:</span>
            {getMoodIcon(selectedMood)}
            <span>{MOODS.find(m => m.value === selectedMood)?.label}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export { MOODS, getMoodIcon }; 
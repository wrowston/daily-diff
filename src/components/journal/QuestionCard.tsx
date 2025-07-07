import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface QuestionCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  subtitle?: string;
  actionButton?: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
    icon?: React.ReactNode;
  };
}

export function QuestionCard({
  icon,
  title,
  value,
  onChange,
  placeholder,
  subtitle,
  actionButton
}: QuestionCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            {title}
          </div>
          {actionButton && (
            <Button
              variant="outline"
              size="sm"
              onClick={actionButton.onClick}
              disabled={actionButton.disabled}
              className="text-xs"
            >
              {actionButton.icon}
              {actionButton.label}
            </Button>
          )}
        </CardTitle>
        {subtitle && (
          <p className="text-muted-foreground font-medium">
            &ldquo;{subtitle}&rdquo;
          </p>
        )}
      </CardHeader>
      <CardContent>
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="min-h-[120px] resize-none"
        />
        {value.length > 0 && (
          <div className="mt-2 text-xs text-muted-foreground">
            {value.length} characters
          </div>
        )}
      </CardContent>
    </Card>
  );
} 
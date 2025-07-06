import { JournalApp } from '@/components/JournalApp';

// Note: If user is not authenticated, they should be redirected to /sign-in
// This can be handled by Clerk middleware or by checking auth state here

export default function JournalPage() {
  return (
    <div>
      <JournalApp />
    </div>
  );
} 
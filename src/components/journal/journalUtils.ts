// Helper function to parse content back into structured format
export function parseEntryContent(content: string) {
  const lines = content.split('\n');
  let mood = '';
  let answer1 = '';
  let answer2 = '';
  let answer3 = '';
  
  let currentSection = '';
  let currentContent: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.startsWith('Mood: ')) {
      mood = line.replace('Mood: ', '').trim();
      continue;
    }
    
    if (line === 'What went well today?') {
      // Save previous section if exists
      if (currentSection && currentContent.length > 0) {
        if (currentSection === 'answer1') answer1 = currentContent.join('\n').trim();
        if (currentSection === 'answer2') answer2 = currentContent.join('\n').trim();
        if (currentSection === 'answer3') answer3 = currentContent.join('\n').trim();
      }
      currentSection = 'answer1';
      currentContent = [];
      continue;
    }
    
    if (line === 'What could have gone better?') {
      // Save previous section if exists
      if (currentSection && currentContent.length > 0) {
        if (currentSection === 'answer1') answer1 = currentContent.join('\n').trim();
        if (currentSection === 'answer2') answer2 = currentContent.join('\n').trim();
        if (currentSection === 'answer3') answer3 = currentContent.join('\n').trim();
      }
      currentSection = 'answer2';
      currentContent = [];
      continue;
    }
    
    // Check if this line is a question that's not one of the standard two
    // This would be the random prompt question
    if (line.trim() !== '' && 
        line.endsWith('?') && 
        line !== 'What went well today?' && 
        line !== 'What could have gone better?' &&
        currentSection !== '' && // Only switch if we're already in a section
        (currentSection === 'answer2' || currentSection === 'answer1')) {
      // Save previous section if exists
      if (currentSection && currentContent.length > 0) {
        if (currentSection === 'answer1') answer1 = currentContent.join('\n').trim();
        if (currentSection === 'answer2') answer2 = currentContent.join('\n').trim();
      }
      currentSection = 'answer3';
      currentContent = [];
      continue;
    }
    
    // Add content to current section
    if (line.trim() !== '' && currentSection) {
      currentContent.push(line);
    }
  }
  
  // Save the last section
  if (currentSection && currentContent.length > 0) {
    if (currentSection === 'answer1') answer1 = currentContent.join('\n').trim();
    if (currentSection === 'answer2') answer2 = currentContent.join('\n').trim();
    if (currentSection === 'answer3') answer3 = currentContent.join('\n').trim();
  }
  
  return { mood, answer1, answer2, answer3 };
}

// Interface definitions
export interface JournalEntry {
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

export interface SaveJournalEntryData {
  date: string;
  prompt: string;
  content: string;
  mood?: string;
  tags?: string[];
} 
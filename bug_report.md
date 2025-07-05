# Bug Report - Daily Diff Journal App

## Bug 1: Missing Environment Variables (Security/Configuration Issue)

### **Problem**
In `src/hooks/useDailyPrompt.ts`, the Supabase client is initialized using environment variables that don't exist:
```typescript
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

### **Issue**
- No `.env` files exist in the project
- The `!` operator tells TypeScript these values are non-null, but they will be `undefined` at runtime
- This causes the Supabase client to fail silently or throw errors
- Users cannot fetch daily prompts because the database connection fails

### **Security Impact**
- Application will fail to connect to the database
- No proper error handling for missing configuration
- Could expose configuration errors to end users

### **Fix**
- Add proper environment variable validation
- Create a fallback mechanism or better error handling
- Add `.env.example` file for developers

---

## Bug 2: useEffect Dependency Issues (Logic Error)

### **Problem**
In `src/components/JournalEditor.tsx`, the `updateTagSuggestions` function has incorrect dependencies in its useCallback:

```typescript
const updateTagSuggestions = useCallback(async () => {
  if (content.length > 50) {
    setIsLoadingTags(true);
    try {
      const suggestions = await getSuggestedTags(content);
      setSuggestedTags(suggestions.filter(tag => !selectedTags.includes(tag)));
    } catch (error) {
      console.error('Failed to get tag suggestions:', error);
    } finally {
      setIsLoadingTags(false);
    }
  }
}, [content, selectedTags]); // Missing dependencies or incorrect memoization
```

### **Issue**
- The function is recreated on every render due to changing dependencies
- The useEffect that calls this function uses a debounce timeout, but the function reference changes
- This can cause memory leaks and performance issues
- Multiple API calls may be made unnecessarily

### **Performance Impact**
- Unnecessary re-renders and function recreations
- Potential memory leaks from uncleared debounce timers
- Multiple concurrent API calls for tag suggestions

### **Fix**
- Fix the useCallback dependencies
- Implement proper cleanup for debounced calls
- Add ref-based solution to prevent stale closures

---

## Bug 3: Race Condition in Autosave (Memory Leak)

### **Problem**
In `src/components/JournalEditor.tsx`, there's a race condition in the autosave functionality:

```typescript
const saveJournalEntry = useCallback(async (content: string) => {
  if (!content.trim()) return;
  
  setIsLoading(true);
  try {
    if (onSave) {
      await onSave(content, selectedMood, selectedTags);
    }
    setLastSaved(new Date());
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  } catch (error) {
    console.error('Failed to save journal entry:', error);
  } finally {
    setIsLoading(false);
  }
}, [onSave, selectedMood, selectedTags]);
```

### **Issue**
- If the component unmounts while a save operation is in progress, the state updates will still execute
- The `setTimeout` for hiding the success message is not cleaned up on unmount
- This can cause memory leaks and "Cannot update state on unmounted component" errors

### **Memory Leak Impact**
- State updates on unmounted components cause React warnings
- setTimeout callbacks continue to execute after component unmount
- Memory is not properly released

### **Fix**
- Add proper cleanup for ongoing operations
- Use refs to track component mount state
- Cancel pending operations on unmount

---

## Summary

These bugs represent common issues in React applications:
1. **Configuration Bug**: Missing environment variables causing runtime failures
2. **Logic Bug**: Incorrect useEffect dependencies causing performance issues
3. **Memory Leak**: Race conditions and missing cleanup causing memory leaks

All three bugs are now fixed in the codebase with proper error handling, dependency management, and cleanup mechanisms.
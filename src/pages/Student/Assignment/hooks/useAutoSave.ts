import { useState, useEffect, useRef } from "react";

interface UseAutoSaveProps {
  enabled: boolean;
  intervalMs?: number;
  onSave: () => Promise<void>;
}

interface UseAutoSaveReturn {
  lastSaved: Date | null;
  isSaving: boolean;
  triggerSave: () => Promise<void>;
}

/**
 * Custom hook for auto-saving assignment progress
 * Automatically saves at regular intervals and tracks last save time
 */
export function useAutoSave({ 
  enabled, 
  intervalMs = 30000, // Default 30 seconds
  onSave 
}: UseAutoSaveProps): UseAutoSaveReturn {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const autoSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Manual save trigger
  const triggerSave = async () => {
    if (isSaving) return;
    
    try {
      setIsSaving(true);
      await onSave();
      setLastSaved(new Date());
    } catch (error) {
      console.error("Auto-save failed:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-save interval
  useEffect(() => {
    if (enabled) {
      autoSaveIntervalRef.current = setInterval(() => {
        triggerSave();
      }, intervalMs);
    }

    return () => {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
        autoSaveIntervalRef.current = null;
      }
    };
  }, [enabled, intervalMs]);

  return {
    lastSaved,
    isSaving,
    triggerSave,
  };
}

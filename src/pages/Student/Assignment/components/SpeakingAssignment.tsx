import React, { useState, useRef, useEffect } from "react";
import { Mic, Square, RotateCcw, CheckCircle, Check, Trash2 } from "lucide-react";
import Button from "../../../../components/ui/Button";

// Persistent blob storage outside component to survive navigation
export const blobStorage = new Map<string, Blob>();

const STORAGE_PREFIX = "speakingRecording:";
const META_PREFIX = `${STORAGE_PREFIX}meta:`;
const BLOB_PREFIX = `${STORAGE_PREFIX}blob:`;
const SINGLE_RECORDING_ID = "current";
const isBrowser = typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";

interface PersistedRecordingMeta {
  id: string;
  duration: number;
  timestamp: string;
}

interface PersistedQuestionState {
  recordings: PersistedRecordingMeta[];
  selectedId: string | null;
  recordingTime: number;
  allowMultiple: boolean;
}

const blobStorageKey = (questionId: string, recordingId: string) =>
  `${questionId}:${recordingId}`;

const blobToBase64Payload = (blob: Blob): Promise<{ type: string; data: string }> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const [prefix, data] = result.split(",");
      const match = prefix.match(/data:(.*);base64/);
      const type = match ? match[1] : blob.type || "audio/webm";
      resolve({ type, data });
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

const persistBlob = async (questionId: string, recordingId: string, blob: Blob) => {
  const key = blobStorageKey(questionId, recordingId);
  blobStorage.set(key, blob);
  if (!isBrowser) {
    return;
  }
  try {
    const payload = await blobToBase64Payload(blob);
    sessionStorage.setItem(`${BLOB_PREFIX}${key}`, JSON.stringify(payload));
  } catch (error) {
    console.error("Failed to persist recording blob", error);
  }
};

const removePersistedBlob = (questionId: string, recordingId: string) => {
  const key = blobStorageKey(questionId, recordingId);
  blobStorage.delete(key);
  if (!isBrowser) {
    return;
  }
  sessionStorage.removeItem(`${BLOB_PREFIX}${key}`);
};

export const getPersistedBlob = (questionId: string, recordingId: string): Blob | null => {
  const key = blobStorageKey(questionId, recordingId);
  const cached = blobStorage.get(key);
  if (cached) {
    return cached;
  }
  if (!isBrowser) {
    return null;
  }
  const stored = sessionStorage.getItem(`${BLOB_PREFIX}${key}`);
  if (!stored) {
    return null;
  }
  try {
    const { type, data } = JSON.parse(stored) as { type: string; data: string };
    const byteCharacters = atob(data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i += 1) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: type || "audio/webm" });
    blobStorage.set(key, blob);
    return blob;
  } catch (error) {
    console.error("Failed to restore recording blob", error);
    return null;
  }
};

const persistQuestionState = (questionId: string, state: PersistedQuestionState) => {
  if (!isBrowser) {
    return;
  }
  try {
    sessionStorage.setItem(`${META_PREFIX}${questionId}`, JSON.stringify(state));
  } catch (error) {
    console.error("Failed to persist recording metadata", error);
  }
};

const retrieveQuestionState = (questionId: string): PersistedQuestionState | null => {
  if (!isBrowser) {
    return null;
  }
  const stored = sessionStorage.getItem(`${META_PREFIX}${questionId}`);
  if (!stored) {
    return null;
  }
  try {
    const parsed = JSON.parse(stored) as PersistedQuestionState;
    return parsed;
  } catch (error) {
    console.error("Failed to parse recording metadata", error);
    return null;
  }
};

const clearQuestionState = (questionId: string) => {
  if (!isBrowser) {
    return;
  }
  sessionStorage.removeItem(`${META_PREFIX}${questionId}`);
};

const serializeRecordings = (records: Recording[]): PersistedRecordingMeta[] =>
  records.map(recording => ({
    id: recording.id,
    duration: recording.duration,
    timestamp: recording.timestamp.toISOString(),
  }));

interface Recording {
  id: string;
  blobUrl: string;
  duration: number;
  timestamp: Date;
}

interface SpeakingAssignmentProps {
  recordingTime: number;
  setRecordingTime: React.Dispatch<React.SetStateAction<number>>;
  onRecordingComplete?: (blobUrl: string | null) => void;
  allowMultipleRecordings?: boolean;
  maxRecordings?: number;
  questionId?: string;
  initialRecordings?: Array<{ id: string; blobUrl: string; duration: number; timestamp: Date }>;
  initialSelectedId?: string | null;
  onRecordingsUpdate?: (recordings: Array<{ id: string; blobUrl: string; duration: number; timestamp: Date }>, selectedId: string | null) => void;
}

const AudioPlayer: React.FC<{ src: string }> = ({ src }) => (
  <audio controls src={src} className="w-full">
    Your browser does not support the audio element.
  </audio>
);

export default function SpeakingAssignment({ 
  recordingTime, 
  setRecordingTime,
  onRecordingComplete,
  allowMultipleRecordings = false,
  maxRecordings = 3,
  questionId,
  initialRecordings = [],
  initialSelectedId = null,
  onRecordingsUpdate
}: SpeakingAssignmentProps) {
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [recordings, setRecordings] = useState<Recording[]>(initialRecordings);
  const [selectedRecordingId, setSelectedRecordingId] = useState<string | null>(initialSelectedId);
  const lastNotifiedBlobUrlRef = useRef<string | null>(null);
  const currentTimeRef = useRef<number>(0);
  // Local state for immediate timer display during recording
  const [localRecordingTime, setLocalRecordingTime] = useState<number>(0);
  // Track if we should notify parent of recordings update
  const shouldNotifyRecordingsRef = useRef<boolean>(false);
  // Track if we're currently setting a new recording to prevent restore effect interference
  const isSettingRecordingRef = useRef<boolean>(false);
  // Track the most recently created blob URL to prevent it from being revoked
  const latestBlobUrlRef = useRef<string | null>(null);
  const prevQuestionIdRef = useRef<string | undefined>(questionId);

  const persistStateSnapshot = (records: Recording[], selectedIdSnapshot: string | null, recordingTimeSnapshot: number) => {
    if (!questionId) {
      return;
    }
    if (records.length === 0) {
      clearQuestionState(questionId);
      return;
    }
    persistQuestionState(questionId, {
      recordings: serializeRecordings(records),
      selectedId: selectedIdSnapshot,
      recordingTime: recordingTimeSnapshot,
      allowMultiple: allowMultipleRecordings,
    });
  };
  
  // Use native MediaRecorder for audio recording
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [currentBlobUrl, setCurrentBlobUrl] = useState<string | null>(null);

  // Update recordings when question changes (initialRecordings changes)
  useEffect(() => {
    const questionChanged = prevQuestionIdRef.current !== questionId;
    prevQuestionIdRef.current = questionId;
    if (questionChanged) {
      latestBlobUrlRef.current = null;
      
      // Stop any ongoing recording when question changes
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
      
      // Stop recording if in progress
      if (isRecording && mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
      }
    }
    
    // Revoke old blob URLs and recreate from storage
    if (!questionChanged && (!initialRecordings || initialRecordings.length === 0)) {
      return;
    }
    const recreatedRecordings = initialRecordings.map(rec => {
      if (questionId) {
        const blob = getPersistedBlob(questionId, rec.id);
        if (blob) {
          return {
            ...rec,
            blobUrl: URL.createObjectURL(blob),
            timestamp: rec.timestamp instanceof Date ? rec.timestamp : new Date(rec.timestamp),
          };
        }
      }
      return {
        ...rec,
        timestamp: rec.timestamp instanceof Date ? rec.timestamp : new Date(rec.timestamp),
      };
    });
    shouldNotifyRecordingsRef.current = false;
    setRecordings(prev => {
      prev.forEach(recording => {
        URL.revokeObjectURL(recording.blobUrl);
      });
      return recreatedRecordings;
    });
    if (questionId) {
      if (recreatedRecordings.length > 0) {
        const snapshotSelectedId =
          initialSelectedId ?? recreatedRecordings[0]?.id ?? null;
        const snapshotRecordingTime =
          snapshotSelectedId !== null
            ? recreatedRecordings.find(recording => recording.id === snapshotSelectedId)?.duration ?? 0
            : 0;
        persistStateSnapshot(recreatedRecordings, snapshotSelectedId, snapshotRecordingTime);
      } else {
        clearQuestionState(questionId);
      }
    }
    setSelectedRecordingId(initialSelectedId);
    if (initialSelectedId) {
      const selectedInitial = initialRecordings.find(rec => rec.id === initialSelectedId);
      if (selectedInitial) {
        setLocalRecordingTime(selectedInitial.duration);
      }
    } else if (questionChanged) {
      setLocalRecordingTime(0);
    }
    
    // Only revoke currentBlobUrl if we're actually changing questions
    // Don't revoke if it's the latest blob URL we just created
    if (currentBlobUrl && currentBlobUrl !== latestBlobUrlRef.current) {
      // Check if blob exists in storage - if it does, we'll recreate the URL
      if (questionId) {
        const storageKey = `${questionId}-current`;
        const blob = blobStorage.get(storageKey);
        if (blob) {
          // Blob exists in storage, so we'll recreate the URL in restore effect
          URL.revokeObjectURL(currentBlobUrl);
          setCurrentBlobUrl(null);
        } else {
          // No blob in storage, so this is a temporary URL that should be revoked
          URL.revokeObjectURL(currentBlobUrl);
          setCurrentBlobUrl(null);
        }
      } else {
        // No questionId, revoke it
        URL.revokeObjectURL(currentBlobUrl);
        setCurrentBlobUrl(null);
      }
    }
    
    setSelectedRecordingId(initialSelectedId);
    lastNotifiedBlobUrlRef.current = null;
    // Reset local recording time when question changes
    setLocalRecordingTime(0);
    currentTimeRef.current = 0;
    // Don't notify parent when updating from props
    shouldNotifyRecordingsRef.current = false;
  }, [questionId, initialRecordings, initialSelectedId]);

  // Restore persisted recordings when component mounts (e.g., after refresh)
  useEffect(() => {
    if (!questionId) {
      return;
    }
    if (allowMultipleRecordings) {
      if (initialRecordings.length > 0 || recordings.length > 0) {
        return;
      }
      const persisted = retrieveQuestionState(questionId);
      if (persisted && persisted.allowMultiple) {
        const restored: Recording[] = [];
        persisted.recordings.forEach(meta => {
          const blob = getPersistedBlob(questionId, meta.id);
          if (!blob) {
            return;
          }
          const url = URL.createObjectURL(blob);
          restored.push({
            id: meta.id,
            blobUrl: url,
            duration: meta.duration,
            timestamp: new Date(meta.timestamp),
          });
        });
        if (restored.length > 0) {
          setRecordings(restored);
          setSelectedRecordingId(persisted.selectedId);
          setLocalRecordingTime(persisted.recordingTime);
          shouldNotifyRecordingsRef.current = false;
          if (onRecordingsUpdate) {
            onRecordingsUpdate(
              restored.map(recording => ({
                id: recording.id,
                blobUrl: recording.blobUrl,
                duration: recording.duration,
                timestamp: recording.timestamp,
              })),
              persisted.selectedId,
            );
          }
        }
      }
    } else {
      if (currentBlobUrl) {
        return;
      }
      const persisted = retrieveQuestionState(questionId);
      if (persisted && !persisted.allowMultiple) {
        const blob = getPersistedBlob(questionId, SINGLE_RECORDING_ID);
        if (blob) {
          const url = URL.createObjectURL(blob);
          latestBlobUrlRef.current = url;
          const restoredRecording: Recording = {
            id: SINGLE_RECORDING_ID,
            blobUrl: url,
            duration: persisted.recordingTime,
            timestamp: new Date(persisted.recordings[0]?.timestamp ?? Date.now()),
          };
          shouldNotifyRecordingsRef.current = false;
          setRecordings([restoredRecording]);
          setCurrentBlobUrl(url);
          setLocalRecordingTime(persisted.recordingTime);
          setRecordingTime(persisted.recordingTime);
          if (onRecordingComplete && lastNotifiedBlobUrlRef.current !== url) {
            lastNotifiedBlobUrlRef.current = url;
            onRecordingComplete(url);
          }
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionId]);

  // Restore currentBlobUrl from storage on mount/question change (single recording mode)
  // Only restore if not currently recording or setting a recording to avoid conflicts
  useEffect(() => {
    if (!allowMultipleRecordings && questionId && !currentBlobUrl && !isRecording && !isSettingRecordingRef.current) {
      const storageKey = `${questionId}-current`;
      const blob = blobStorage.get(storageKey);
      if (blob) {
        const restoredUrl = URL.createObjectURL(blob);
        latestBlobUrlRef.current = restoredUrl; // Track restored URL too
        setCurrentBlobUrl(restoredUrl);
        
        // Restore recording time from persisted state
        const persisted = retrieveQuestionState(questionId);
        if (persisted && persisted.recordingTime) {
          setLocalRecordingTime(persisted.recordingTime);
          setRecordingTime(persisted.recordingTime);
        }
        
        // Notify parent of restored recording
        if (onRecordingComplete && lastNotifiedBlobUrlRef.current !== restoredUrl) {
          lastNotifiedBlobUrlRef.current = restoredUrl;
          onRecordingComplete(restoredUrl);
        }
      }
    }
  }, [questionId, allowMultipleRecordings, currentBlobUrl, isRecording, onRecordingComplete, setRecordingTime]);

  const hasRecording = currentBlobUrl !== null;
  const canRecordMore = allowMultipleRecordings ? recordings.length < maxRecordings : !hasRecording;

  // Helper to add recording to list
  const addRecordingToList = (blob: Blob, duration: number) => {
    const recordingId = `recording-${Date.now()}`;
    if (questionId) {
      persistBlob(questionId, recordingId, blob).catch((error) =>
        console.error("Failed to persist recording", error)
      );
    } else {
      blobStorage.set(recordingId, blob);
    }
    const blobUrl = URL.createObjectURL(blob);
    
    const newRecording: Recording = {
      id: recordingId,
      blobUrl: blobUrl,
      duration: duration,
      timestamp: new Date(),
    };
    
    setRecordings(prev => {
      const updated = [...prev, newRecording];
      // Mark that we should notify parent
      shouldNotifyRecordingsRef.current = true;
      if (questionId) {
        persistStateSnapshot(updated, newRecording.id, duration);
      }
      return updated;
    });
    setSelectedRecordingId(newRecording.id);
    setLocalRecordingTime(duration);
  };

  // Notify parent when selected recording changes
  useEffect(() => {
    if (allowMultipleRecordings) {
      if (selectedRecordingId && onRecordingComplete) {
        const selectedRecording = recordings.find(r => r.id === selectedRecordingId);
        if (selectedRecording && lastNotifiedBlobUrlRef.current !== selectedRecording.blobUrl) {
          lastNotifiedBlobUrlRef.current = selectedRecording.blobUrl;
          onRecordingComplete(selectedRecording.blobUrl);
        }
      } else if (!selectedRecordingId && recordings.length === 0 && onRecordingComplete && lastNotifiedBlobUrlRef.current !== null) {
        // Clear parent's blob URL when all recordings are deleted
        // Pass null to indicate no recording is selected
        lastNotifiedBlobUrlRef.current = null;
        onRecordingComplete(null as any);
      }
    } else if (!allowMultipleRecordings && hasRecording && onRecordingComplete && lastNotifiedBlobUrlRef.current !== currentBlobUrl) {
      // For single recording mode, notify immediately
      lastNotifiedBlobUrlRef.current = currentBlobUrl!;
      onRecordingComplete(currentBlobUrl!);
    }
  }, [selectedRecordingId, recordings, allowMultipleRecordings, hasRecording, onRecordingComplete, currentBlobUrl]);

  const startRecording = async () => {
    try {
      // Reset recording time first
      currentTimeRef.current = 0;
      setLocalRecordingTime(0);
      audioChunksRef.current = [];
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create MediaRecorder instance
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType });
      
      // Handle data available event
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      // Handle recording stop event
      mediaRecorderRef.current.onstop = () => {
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
        
        // Request any remaining data chunks
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.requestData();
        }
        
        // Use setTimeout to ensure all data chunks are collected
        setTimeout(() => {
          // Create blob from chunks
          if (audioChunksRef.current.length === 0) {
            console.error('No audio chunks recorded');
            alert('Recording failed: No audio data captured. Please try recording for at least 1 second.');
            setIsRecording(false);
            return;
          }
          
          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
          
          // Capture final time
          const finalTime = currentTimeRef.current;
          
          // Update state with final time
          setLocalRecordingTime(finalTime);
          setRecordingTime(finalTime);
          
          if (allowMultipleRecordings) {
            // Add to recordings list (stores blob in persistent storage)
            addRecordingToList(audioBlob, finalTime);
            // Clear current blob for next recording
            setCurrentBlobUrl(null);
            currentTimeRef.current = 0;
            setLocalRecordingTime(0);
            setRecordingTime(0);
          } else {
            // Single recording mode - mark that we're setting a recording
            isSettingRecordingRef.current = true;
            
            // Store blob in persistent storage FIRST
            if (questionId) {
              persistBlob(questionId, SINGLE_RECORDING_ID, audioBlob).catch((error) =>
                console.error("Failed to persist recording", error)
              );
            } else {
              blobStorage.set(SINGLE_RECORDING_ID, audioBlob);
            }
            
            // Revoke old blob URL if exists BEFORE creating new one
            const oldBlobUrl = currentBlobUrl;
            if (oldBlobUrl) {
              URL.revokeObjectURL(oldBlobUrl);
            }
            
            // Create blob URL - this must be valid
            const blobUrl = URL.createObjectURL(audioBlob);
            
            // Verify blob URL is valid
            if (!blobUrl || blobUrl === '') {
              console.error('Failed to create blob URL');
              setIsRecording(false);
              isSettingRecordingRef.current = false;
              return;
            }
            
            // Track this as the latest blob URL to prevent it from being revoked
            // Set this BEFORE setting state to ensure it's protected immediately
            latestBlobUrlRef.current = blobUrl;
            const singleRecording: Recording = {
              id: SINGLE_RECORDING_ID,
              blobUrl,
              duration: finalTime,
              timestamp: new Date(),
            };
            shouldNotifyRecordingsRef.current = false;
            setRecordings([singleRecording]);
            
            // Set state immediately using functional update
            setCurrentBlobUrl(() => blobUrl);
            
            // Notify parent immediately for single recording mode
            // Use a microtask to ensure state is set first
            Promise.resolve().then(() => {
              if (onRecordingComplete && lastNotifiedBlobUrlRef.current !== blobUrl) {
                lastNotifiedBlobUrlRef.current = blobUrl;
                onRecordingComplete(blobUrl);
              }
              if (questionId) {
                persistStateSnapshot([singleRecording], SINGLE_RECORDING_ID, finalTime);
              }
              // Reset flag after state is updated
              setTimeout(() => {
                isSettingRecordingRef.current = false;
              }, 100);
            });
          }
          
          audioChunksRef.current = [];
          setIsRecording(false);
        }, 100);
      };
      
      // Start recording with timeslice to ensure data chunks are collected
      // Timeslice of 100ms ensures we get chunks frequently (important for short recordings)
      mediaRecorderRef.current.start(100);
      setIsRecording(true);
      
      // Start recording timer - only update local state during recording
      recordingTimerRef.current = setInterval(() => {
        currentTimeRef.current += 1;
        // Only update local state for immediate display
        setLocalRecordingTime(currentTimeRef.current);
      }, 1000);
    } catch (error) {
      console.error("Error starting recording:", error);
      alert("Unable to access microphone. Please check your permissions.");
    }
  };

  const stopRecording = () => {
    if (!mediaRecorderRef.current || !isRecording) {
      return;
    }
    
    try {
      // Clear recording timer first
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
      
      // Request any pending data before stopping (important for short recordings)
      if (mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.requestData();
      }
      
      // Stop the MediaRecorder (onstop event will handle the rest)
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    } catch (error) {
      console.error("Error stopping recording:", error);
      setIsRecording(false);
    }
  };

  const resetRecording = () => {
    // Revoke current blob URL
    if (currentBlobUrl) {
      URL.revokeObjectURL(currentBlobUrl);
      latestBlobUrlRef.current = null;
    }
    
    // Remove from storage
    if (questionId) {
      removePersistedBlob(questionId, SINGLE_RECORDING_ID);
      clearQuestionState(questionId);
    } else {
      blobStorage.delete(SINGLE_RECORDING_ID);
    }
    
    if (onRecordingComplete) {
      onRecordingComplete(null);
      lastNotifiedBlobUrlRef.current = null;
    }
    
  shouldNotifyRecordingsRef.current = false;
  setRecordings([]);
    setCurrentBlobUrl(null);
    currentTimeRef.current = 0;
    setLocalRecordingTime(0);
    setRecordingTime(0);
  };

  const deleteRecording = (id: string) => {
    setRecordings(prev => {
      const recordingToDelete = prev.find(r => r.id === id);
      if (recordingToDelete) {
        // Revoke the blob URL
        URL.revokeObjectURL(recordingToDelete.blobUrl);
        // Remove from persistent storage
        if (questionId) {
          removePersistedBlob(questionId, id);
        } else {
          blobStorage.delete(id);
        }
      }
      
      const updated = prev.filter(r => r.id !== id);
      // If deleted recording was selected, select another or clear selection
      let newSelectedId = selectedRecordingId;
      if (selectedRecordingId === id) {
        newSelectedId = updated.length > 0 ? updated[0].id : null;
        setSelectedRecordingId(newSelectedId);
        if (newSelectedId) {
          const newSelectedRecording = updated.find(r => r.id === newSelectedId);
          if (newSelectedRecording) {
            setLocalRecordingTime(newSelectedRecording.duration);
          }
        } else {
          setLocalRecordingTime(0);
        }
      }
      // Mark that we should notify parent
      shouldNotifyRecordingsRef.current = true;
      
      if (questionId) {
        if (updated.length > 0) {
          const newRecordingTime =
            newSelectedId !== null
              ? (updated.find(recording => recording.id === newSelectedId)?.duration ?? 0)
              : 0;
          persistStateSnapshot(updated, newSelectedId, newRecordingTime);
        } else {
          clearQuestionState(questionId);
        }
      }
      
      return updated;
    });
  };

  const selectRecording = (id: string) => {
    const selectedRecording = recordings.find(r => r.id === id);
    const selectedDuration = selectedRecording ? selectedRecording.duration : localRecordingTime;
    setSelectedRecordingId(id);
    setLocalRecordingTime(selectedDuration);
    // Mark that we should notify parent
    shouldNotifyRecordingsRef.current = true;
    if (questionId) {
      persistStateSnapshot(recordings, id, selectedDuration);
    }
  };
  
  // Notify parent when recordings or selectedId changes (only if we initiated the change)
  useEffect(() => {
    if (shouldNotifyRecordingsRef.current && onRecordingsUpdate) {
      shouldNotifyRecordingsRef.current = false;
      onRecordingsUpdate(recordings, selectedRecordingId);
    }
  }, [recordings, selectedRecordingId, onRecordingsUpdate]);

  const formatRecordingTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Cleanup on unmount ONLY - no dependencies to avoid interfering with active recording
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      // Stop recording if still active
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      // Revoke blob URLs
      if (currentBlobUrl) {
        URL.revokeObjectURL(currentBlobUrl);
      }
      recordings.forEach(recording => {
        URL.revokeObjectURL(recording.blobUrl);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps = only run on mount/unmount

  return (
    <div className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
          <Mic className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-blue-900">Voice Recording</h3>
          <p className="text-sm text-blue-700">Record your answer for this speaking question</p>
        </div>
      </div>

      {!isRecording && recordings.length === 0 && !hasRecording && (
        <div className="text-center py-8">
          <div className="mb-6">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mic className="w-10 h-10 text-blue-600" />
            </div>
            <p className="text-neutral-600 mb-2">Click the button below to start recording</p>
            <p className="text-sm text-neutral-500">Make sure your microphone is connected and working</p>
            {allowMultipleRecordings && (
              <p className="text-sm text-blue-600 mt-2">
                You can record up to {maxRecordings} times and select your best one
              </p>
            )}
          </div>
          <Button
            variant="primary"
            size="lg"
            onClick={startRecording}
            iconLeft={<Mic className="w-5 h-5" />}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Start Recording
          </Button>
        </div>
      )}

      {isRecording && (
        <div className="text-center py-8">
          <div className="mb-6">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Mic className="w-10 h-10 text-red-600" />
            </div>
            <p className="text-xl font-bold text-red-600 mb-2">Recording...</p>
            <p className="text-2xl font-mono font-bold text-neutral-800">
              {formatRecordingTime(localRecordingTime)}
            </p>
          </div>
          <Button
            variant="danger"
            size="lg"
            onClick={stopRecording}
            iconLeft={<Square className="w-5 h-5" />}
          >
            Stop Recording
          </Button>
        </div>
      )}

      {/* Multiple Recordings Mode */}
      {allowMultipleRecordings && recordings.length > 0 && !isRecording && (
        <>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-neutral-900">Your Recordings ({recordings.length}/{maxRecordings})</h4>
              {canRecordMore && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={startRecording}
                  iconLeft={<Mic className="w-4 h-4" />}
                >
                  Record Another
                </Button>
              )}
            </div>
            
            <div className="space-y-3">
              {recordings.map((recording, index) => (
                <div
                  key={recording.id}
                  className={`border-2 rounded-lg p-4 transition-all ${
                    selectedRecordingId === recording.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-neutral-200 bg-white hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {selectedRecordingId === recording.id ? (
                          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        ) : (
                          <button
                            onClick={() => selectRecording(recording.id)}
                            className="w-5 h-5 border-2 border-neutral-400 rounded-full hover:border-blue-500"
                          />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-neutral-900">Recording {index + 1}</p>
                        <p className="text-sm text-neutral-600">{formatRecordingTime(recording.duration)}</p>
                      </div>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => deleteRecording(recording.id)}
                      iconLeft={<Trash2 className="w-4 h-4" />}
                      className="!bg-error-600 hover:!bg-error-700"
                    >
                      Delete
                    </Button>
                  </div>
                  
                  {/* Audio Player */}
                  <div className="mt-3">
                    {recording.blobUrl ? (
                      <AudioPlayer src={recording.blobUrl} />
                    ) : (
                      <p className="text-sm text-neutral-500">Audio unavailable</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedRecordingId && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-800 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Your selected recording is ready to submit. Click "Submit" when you're done.
              </p>
            </div>
          )}
        </>
      )}

      {/* Single Recording Mode */}
      {!allowMultipleRecordings && hasRecording && !isRecording && (
        <>
          <div className="bg-white border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-semibold text-green-800">Recording Complete</p>
                  <p className="text-sm text-neutral-600">Duration: {formatRecordingTime(recordingTime)}</p>
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={resetRecording}
                iconLeft={<RotateCcw className="w-4 h-4" />}
              >
                Re-record
              </Button>
            </div>
            
            {/* Audio Player */}
            <div className="mt-4 bg-neutral-50 p-4 rounded-lg">
              {currentBlobUrl ? (
                <AudioPlayer src={currentBlobUrl} />
              ) : (
                <p className="text-sm text-neutral-500">Loading audio...</p>
              )}
            </div>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
            <p className="text-sm text-green-800 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Your recording is ready to submit. Click "Submit" when you're done.
            </p>
          </div>
        </>
      )}
    </div>
  );
}

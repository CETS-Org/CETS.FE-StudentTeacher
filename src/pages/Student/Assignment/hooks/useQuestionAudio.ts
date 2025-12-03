import { useState, useRef, useCallback } from "react";
import type { Question } from "@/pages/Teacher/ClassDetail/Component/Popup/AdvancedAssignmentPopup";

// Callback type for showing error messages
type ErrorCallback = (message: string) => void;

interface UseQuestionAudioOptions {
  onError?: ErrorCallback;
}

interface UseQuestionAudioReturn {
  questionAudioPlaying: Record<string, boolean>;
  questionAudioRefs: React.MutableRefObject<Record<string, HTMLAudioElement>>;
  toggleQuestionAudio: (question: Question) => void;
  normalizeAudioUrl: (url: string | undefined) => string;
  questionAudioPlayCount: Record<string, number>;
  questionAudioHasEnded: Record<string, boolean>;
}

// Maximum play count for listening questions (2 times)
const MAX_AUDIO_PLAY_COUNT = 2;

/**
 * Custom hook for managing question audio playback
 * Handles audio player state and controls with play limit
 */
export function useQuestionAudio(options?: UseQuestionAudioOptions): UseQuestionAudioReturn {
  const { onError } = options || {};
  const [questionAudioPlaying, setQuestionAudioPlaying] = useState<Record<string, boolean>>({});
  const [questionAudioPlayCount, setQuestionAudioPlayCount] = useState<Record<string, number>>({});
  const [questionAudioHasEnded, setQuestionAudioHasEnded] = useState<Record<string, boolean>>({});
  const questionAudioRefs = useRef<Record<string, HTMLAudioElement>>({});

  // Normalize audio URL for consistent tracking
  const normalizeAudioUrl = useCallback((url: string | undefined): string => {
    if (!url) return "";
    try {
      const urlObj = new URL(url);
      return urlObj.pathname + urlObj.search;
    } catch {
      return url;
    }
  }, []);

  // Toggle audio playback with play limit
  const toggleQuestionAudio = useCallback((question: Question & { audioUrl?: string }) => {
    if (!question.audioUrl) return;

    const audioUrl = question.audioUrl;
    const normalizedUrl = normalizeAudioUrl(audioUrl);
    const trackingKey = normalizedUrl || audioUrl;

    const isPlaying = questionAudioPlaying[trackingKey] || false;
    const playCount = questionAudioPlayCount[trackingKey] || 0;

    if (isPlaying) {
      // Pause audio
      const audio = questionAudioRefs.current[trackingKey];
      if (audio) {
        audio.pause();
      }
      setQuestionAudioPlaying((prev) => ({ ...prev, [trackingKey]: false }));
    } else {
      // Get or create audio element
      let audio = questionAudioRefs.current[trackingKey];
      const hasEnded = questionAudioHasEnded[trackingKey] || false;
      
      // Determine if this is a resume (audio exists, not ended, paused, and currentTime > 0.1)
      const isResume = audio && !hasEnded && audio.paused && audio.currentTime > 0.1;
      
      // If this is a new play from the beginning (not a resume), check limit first
      if (!isResume) {
        if (playCount >= MAX_AUDIO_PLAY_COUNT) {
          // Show error message
          const errorMessage = `Bạn đã đạt giới hạn phát tối đa (${MAX_AUDIO_PLAY_COUNT} lần) cho audio này.`;
          if (onError) {
            onError(errorMessage);
          } else {
            console.warn(errorMessage);
          }
          return;
        }
      }

      // Stop all other audio first
      Object.keys(questionAudioRefs.current).forEach((key) => {
        if (key !== trackingKey) {
          const otherAudio = questionAudioRefs.current[key];
          if (otherAudio && !otherAudio.paused) {
            otherAudio.pause();
            otherAudio.currentTime = 0;
          }
        }
      });
      Object.keys(questionAudioRefs.current).forEach((key) => {
        if (key !== trackingKey) {
          setQuestionAudioPlaying((prev) => ({ ...prev, [key]: false }));
        }
      });

      // Create audio if it doesn't exist
      if (!audio) {
        audio = new Audio(audioUrl);
        questionAudioRefs.current[trackingKey] = audio;

        audio.onplay = () => {
          setQuestionAudioPlaying((prev) => ({ ...prev, [trackingKey]: true }));
        };

        audio.onpause = () => {
          setQuestionAudioPlaying((prev) => ({ ...prev, [trackingKey]: false }));
        };

        audio.onended = () => {
          setQuestionAudioPlaying((prev) => ({ ...prev, [trackingKey]: false }));
          setQuestionAudioHasEnded((prev) => ({ ...prev, [trackingKey]: true }));
          audio.currentTime = 0;
        };

        // If resuming from middle, just play without counting
        if (isResume) {
          audio.play().catch((error) => {
            console.error("Error playing audio:", error);
            setQuestionAudioPlaying((prev) => ({ ...prev, [trackingKey]: false }));
          });
          setQuestionAudioPlaying((prev) => ({ ...prev, [trackingKey]: true }));
        } else {
          // Playing from start - reset to beginning and increment count
          audio.currentTime = 0;
          
          // Increment count BEFORE playing
          setQuestionAudioPlayCount((prev) => ({
            ...prev,
            [trackingKey]: (prev[trackingKey] || 0) + 1,
          }));
          
          audio.play().catch((error) => {
            console.error("Error playing audio:", error);
            setQuestionAudioPlaying((prev) => ({ ...prev, [trackingKey]: false }));
            // Decrement count if play failed
            setQuestionAudioPlayCount((prev) => ({
              ...prev,
              [trackingKey]: Math.max(0, (prev[trackingKey] || 0) - 1),
            }));
          });
          setQuestionAudioPlaying((prev) => ({ ...prev, [trackingKey]: true }));
        }
      } else {
        // Audio already exists
        if (hasEnded || audio.ended) {
          // If audio has ended, reset to beginning
          audio.currentTime = 0;
          setQuestionAudioHasEnded((prev) => ({ ...prev, [trackingKey]: false }));
        }
        
        if (audio.paused) {
          // If resuming from middle, just play without counting
          if (isResume) {
            audio.play().catch((error) => {
              console.error("Error playing audio:", error);
              setQuestionAudioPlaying((prev) => ({ ...prev, [trackingKey]: false }));
            });
            setQuestionAudioPlaying((prev) => ({ ...prev, [trackingKey]: true }));
          } else {
            // Playing from start - reset to beginning and increment count
            audio.currentTime = 0;
            
            // Increment count BEFORE playing
            setQuestionAudioPlayCount((prev) => ({
              ...prev,
              [trackingKey]: (prev[trackingKey] || 0) + 1,
            }));
            
            audio.play().catch((error) => {
              console.error("Error playing audio:", error);
              setQuestionAudioPlaying((prev) => ({ ...prev, [trackingKey]: false }));
              // Decrement count if play failed
              setQuestionAudioPlayCount((prev) => ({
                ...prev,
                [trackingKey]: Math.max(0, (prev[trackingKey] || 0) - 1),
              }));
            });
            setQuestionAudioPlaying((prev) => ({ ...prev, [trackingKey]: true }));
          }
        } else {
          audio.pause();
        }
      }
    }
  }, [normalizeAudioUrl, questionAudioPlaying, questionAudioPlayCount, questionAudioHasEnded]);

  return {
    questionAudioPlaying,
    questionAudioRefs,
    toggleQuestionAudio,
    normalizeAudioUrl,
    questionAudioPlayCount,
    questionAudioHasEnded,
  };
}

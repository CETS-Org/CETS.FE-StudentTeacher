import { useState, useRef, useCallback } from "react";
import type { Question } from "@/pages/Teacher/ClassDetail/Component/Popup/AdvancedAssignmentPopup";

interface UseQuestionAudioReturn {
  questionAudioPlaying: Record<string, boolean>;
  questionAudioRefs: React.MutableRefObject<Record<string, HTMLAudioElement>>;
  toggleQuestionAudio: (question: Question) => void;
  normalizeAudioUrl: (url: string) => string;
}

/**
 * Custom hook for managing question audio playback
 * Handles audio player state and controls
 */
export function useQuestionAudio(): UseQuestionAudioReturn {
  const [questionAudioPlaying, setQuestionAudioPlaying] = useState<Record<string, boolean>>({});
  const questionAudioRefs = useRef<Record<string, HTMLAudioElement>>({});

  // Normalize audio URL for consistent tracking
  const normalizeAudioUrl = useCallback((url: string): string => {
    if (!url) return url;
    try {
      const urlObj = new URL(url);
      return urlObj.pathname + urlObj.search;
    } catch {
      return url;
    }
  }, []);

  // Toggle audio playback
  const toggleQuestionAudio = useCallback((question: Question & { audioUrl?: string }) => {
    if (!question.audioUrl) return;

    const audioUrl = question.audioUrl;
    const normalizedUrl = normalizeAudioUrl(audioUrl);
    const trackingKey = normalizedUrl || audioUrl;

    // Stop all other audio first
    Object.keys(questionAudioRefs.current).forEach((key) => {
      if (key !== trackingKey) {
        const audio = questionAudioRefs.current[key];
        if (audio && !audio.paused) {
          audio.pause();
          audio.currentTime = 0;
        }
      }
    });

    // Toggle current audio
    if (!questionAudioRefs.current[trackingKey]) {
      const audio = new Audio(audioUrl);
      questionAudioRefs.current[trackingKey] = audio;

      audio.onplay = () => {
        setQuestionAudioPlaying((prev) => ({ ...prev, [trackingKey]: true }));
      };

      audio.onpause = () => {
        setQuestionAudioPlaying((prev) => ({ ...prev, [trackingKey]: false }));
      };

      audio.onended = () => {
        setQuestionAudioPlaying((prev) => ({ ...prev, [trackingKey]: false }));
        audio.currentTime = 0;
      };

      audio.play().catch((error) => {
        console.error("Error playing audio:", error);
        setQuestionAudioPlaying((prev) => ({ ...prev, [trackingKey]: false }));
      });
    } else {
      const audio = questionAudioRefs.current[trackingKey];
      if (audio.paused) {
        audio.play().catch((error) => {
          console.error("Error playing audio:", error);
          setQuestionAudioPlaying((prev) => ({ ...prev, [trackingKey]: false }));
        });
      } else {
        audio.pause();
      }
    }
  }, [normalizeAudioUrl]);

  return {
    questionAudioPlaying,
    questionAudioRefs,
    toggleQuestionAudio,
    normalizeAudioUrl,
  };
}

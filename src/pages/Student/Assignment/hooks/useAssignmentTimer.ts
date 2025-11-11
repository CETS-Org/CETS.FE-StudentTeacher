import { useState, useEffect, useRef } from "react";

interface UseAssignmentTimerProps {
  timeLimitMinutes?: number;
  onTimeUp?: () => void;
}

interface UseAssignmentTimerReturn {
  timeRemaining: number | null;
  isTimerRunning: boolean;
  startTimer: () => void;
  stopTimer: () => void;
  formatTime: (seconds: number) => string;
}

/**
 * Custom hook for managing assignment timer
 * Handles countdown, time formatting, and time-up callback
 */
export function useAssignmentTimer({ 
  timeLimitMinutes, 
  onTimeUp 
}: UseAssignmentTimerProps): UseAssignmentTimerReturn {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize timer
  useEffect(() => {
    if (timeLimitMinutes && timeLimitMinutes > 0) {
      setTimeRemaining(timeLimitMinutes * 60);
    }
  }, [timeLimitMinutes]);

  // Start timer
  const startTimer = () => {
    if (timeRemaining !== null && timeRemaining > 0) {
      setIsTimerRunning(true);
    }
  };

  // Stop timer
  const stopTimer = () => {
    setIsTimerRunning(false);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  // Timer countdown effect
  useEffect(() => {
    if (isTimerRunning && timeRemaining !== null && timeRemaining > 0) {
      timerIntervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev === null || prev <= 1) {
            stopTimer();
            if (onTimeUp) {
              onTimeUp();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isTimerRunning, timeRemaining, onTimeUp]);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return {
    timeRemaining,
    isTimerRunning,
    startTimer,
    stopTimer,
    formatTime,
  };
}

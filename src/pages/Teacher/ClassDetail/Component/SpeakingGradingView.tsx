import { useState, useEffect, useRef } from "react";
import { X, ChevronLeft, ChevronRight, Save, MessageSquare, Award, Bot, Play, Pause, Volume2, Download } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/card";
import Loader from "@/components/ui/Loader";
import Toast from "@/components/ui/Toast";
import { useToast } from "@/hooks/useToast";
import WaveSurfer from "wavesurfer.js";

type WaveSurferInstance = WaveSurfer | null;

const CDN_BASE_URL = import.meta.env.VITE_STORAGE_PUBLIC_URL || '';

type Submission = {
  id: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  file: string | null;
  content: string | null;
  submittedDate: string;
  score: number | null;
  feedback: string | null;
  IsAiScore?: boolean;
};

type SpeakingSubmissionData = {
  submittedAt: string;
  answers: Array<{
    questionId: string;
    answer: string;
    timestamp: string;
  }>;
  audioUrls: Record<string, string>;
  // Optional: Enhanced question details for better grading experience
  questions?: Array<{
    id: string;
    question: string;
    points?: number;
    type?: string;
    duration?: number;
    instructions?: string;
  }>;
};

interface SpeakingGradingViewProps {
  assignmentTitle: string;
  submissions: Submission[];
  onClose: () => void;
  onGradeSubmit: (submissionId: string, score: number, feedback: string) => Promise<void>;
}

export default function SpeakingGradingView({
  assignmentTitle,
  submissions,
  onClose,
  onGradeSubmit,
}: SpeakingGradingViewProps) {
  // Toast notifications
  const { toasts, hideToast, success, error: showError } = useToast();
  
  const [selectedSubmissionIndex, setSelectedSubmissionIndex] = useState(0);
  const [score, setScore] = useState<string>("");
  const [feedback, setFeedback] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [audioLoading, setAudioLoading] = useState(true);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string>("");
  
  // Audio player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showUrlDebug, setShowUrlDebug] = useState(false);
  const [speakingData, setSpeakingData] = useState<SpeakingSubmissionData | null>(null);
  const [actualAudioUrl, setActualAudioUrl] = useState<string>("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const durationCheckInterval = useRef<NodeJS.Timeout | null>(null);
  const waveformRef = useRef<HTMLDivElement>(null);
  const waveSurferRef = useRef<WaveSurferInstance>(null);
  const loadingAbortController = useRef<AbortController | null>(null);

  const selectedSubmission = submissions[selectedSubmissionIndex];

  // Load score and feedback when submission changes
  useEffect(() => {
    if (selectedSubmission) {
      
      setScore(selectedSubmission.score?.toString() || "");
      setFeedback(selectedSubmission.feedback || "");
      setAudioError(false);
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      setSpeakingData(null);
      setActualAudioUrl("");
      setCurrentQuestionIndex(0);
      
      // Cancel any pending audio loading when switching submissions
      if (loadingAbortController.current) {
        loadingAbortController.current.abort();
        loadingAbortController.current = null;
      }
      
      // Load speaking assignment data if it's a JSON file and not already loaded
      if (selectedSubmission.file && selectedSubmission.file.endsWith('.json')) {
        loadSpeakingAssignmentData(selectedSubmission.file);
      } else {
        // Direct audio file
        const newAudioUrl = selectedSubmission.file || "";
        if (newAudioUrl !== currentAudioUrl) {
          setCurrentAudioUrl(newAudioUrl);
          setActualAudioUrl(newAudioUrl);
          setAudioLoading(true);
          
          // Reset audio player
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
          }
        }
      }
    }
  }, [selectedSubmission]);

  // Update audio source when URL changes
  useEffect(() => {
    if (audioRef.current && (actualAudioUrl || selectedSubmission?.file)) {
      const newAudioUrl = actualAudioUrl ? getFullAudioUrl(actualAudioUrl) : getFullAudioUrl(selectedSubmission?.file || "");
      
      
      if (audioRef.current.src !== newAudioUrl) {
        audioRef.current.src = newAudioUrl;
        audioRef.current.load();
      }
    }
  }, [actualAudioUrl, selectedSubmission?.file]);

  // Initialize WaveSurfer when component mounts
  useEffect(() => {
    if (waveformRef.current && !waveSurferRef.current) {
      try {
        waveSurferRef.current = WaveSurfer.create({
          container: waveformRef.current,
          waveColor: '#3b82f6',
          progressColor: '#1d4ed8',
          cursorColor: '#ef4444',
          barWidth: 3,
          barRadius: 3,
          height: 80,
          normalize: true,
          mediaControls: false
        });

        // WaveSurfer event listeners
        waveSurferRef.current.on('ready', () => {
          if (waveSurferRef.current) {
            const waveDuration = waveSurferRef.current.getDuration();
            if (waveDuration > 0) {
              setDuration(waveDuration);
            }
            setAudioLoading(false);
            // Clear any previous errors when successfully loaded
            setAudioError(false);
          }
        });

        waveSurferRef.current.on('audioprocess', () => {
          if (waveSurferRef.current) {
            setCurrentTime(waveSurferRef.current.getCurrentTime());
          }
        });

        waveSurferRef.current.on('seeking', () => {
          if (waveSurferRef.current) {
            setCurrentTime(waveSurferRef.current.getCurrentTime());
          }
        });

        waveSurferRef.current.on('play', () => {
          setIsPlaying(true);
        });

        waveSurferRef.current.on('pause', () => {
          setIsPlaying(false);
        });

        waveSurferRef.current.on('finish', () => {
          setIsPlaying(false);
          setCurrentTime(0);
        });

        waveSurferRef.current.on('error', (error) => {
          // Handle specific error types
          if (error.name === 'AbortError') {
            // Audio loading was cancelled, this is normal
            return;
          }
          
          // Don't immediately show error for EncodingError or other errors
          // WaveSurfer might still be able to play the audio
          // Only set error state if audio fails to load after timeout
        });

        waveSurferRef.current.on('loading', (percent) => {
          // Loading progress
        });

      } catch (error) {
        // Only set error if WaveSurfer creation fails completely
        setAudioError(true);
        setAudioLoading(false);
      }
    }

    return () => {
      // Cancel any pending audio loading
      if (loadingAbortController.current) {
        loadingAbortController.current.abort();
        loadingAbortController.current = null;
      }
      
      if (waveSurferRef.current) {
        try {
          waveSurferRef.current.destroy();
        } catch (error) {
          // Ignore destruction errors
        }
        waveSurferRef.current = null;
      }
    };
  }, []);

  // Load audio into WaveSurfer when URL changes
  useEffect(() => {
    if (waveSurferRef.current && (actualAudioUrl || selectedSubmission?.file)) {
      const audioUrl = actualAudioUrl ? getFullAudioUrl(actualAudioUrl) : getFullAudioUrl(selectedSubmission?.file || "");
      
      // Cancel any previous loading
      if (loadingAbortController.current) {
        loadingAbortController.current.abort();
      }
      
      // Create new abort controller for this request
      loadingAbortController.current = new AbortController();
      
      setAudioLoading(true);
      setAudioError(false);
      
      try {
        // Load audio with abort signal
        waveSurferRef.current.load(audioUrl);
        
        // Set a timeout to show error if loading takes too long
        const loadTimeout = setTimeout(() => {
          if (duration === 0 && !loadingAbortController.current?.signal.aborted) {
            setAudioLoading(false);
            // Only show error if audio completely failed to load after timeout
            if (waveSurferRef.current && !waveSurferRef.current.isPlaying()) {
              setAudioError(true);
            }
          }
        }, 15000); // Increased timeout to 15 seconds
        
        // Clear timeout when component unmounts or new load starts
        return () => {
          clearTimeout(loadTimeout);
          if (loadingAbortController.current) {
            loadingAbortController.current.abort();
            loadingAbortController.current = null;
          }
        };
        
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          setAudioLoading(false);
        }
      }
    }
  }, [actualAudioUrl, selectedSubmission?.file, duration]);


  // Load speaking assignment data from JSON
  const loadSpeakingAssignmentData = async (jsonUrl: string) => {
    try {
      setAudioLoading(true);
      const fullJsonUrl = getFullAudioUrl(jsonUrl);
      
      const response = await fetch(fullJsonUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: SpeakingSubmissionData = await response.json();
      
      setSpeakingData(data);
      
      // Handle multiple audio URLs - start with the first one
      const audioUrls = Object.values(data.audioUrls);
      if (audioUrls.length > 0) {
        const firstAudioUrl = audioUrls[0];
        setActualAudioUrl(firstAudioUrl);
        setCurrentAudioUrl(firstAudioUrl);
        setCurrentQuestionIndex(0); // Start with first question
      } else {
        setAudioError(true);
      }
      
      setAudioLoading(false);
    } catch (error) {
      setAudioError(true);
      setAudioLoading(false);
      showError('Failed to load speaking assignment data');
    }
  };

  // Function to switch between different audio questions
  const switchToQuestion = (questionIndex: number) => {
    if (!speakingData) return;
    
    const audioUrls = Object.values(speakingData.audioUrls);
    if (questionIndex >= 0 && questionIndex < audioUrls.length) {
      setCurrentQuestionIndex(questionIndex);
      // The useEffect will handle updating actualAudioUrl and currentAudioUrl
      
      // Reset audio player state
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
  };

  // Helper function to get current question details
  const getCurrentQuestionDetails = () => {
    if (!speakingData) return null;
    
    const questionIds = Object.keys(speakingData.audioUrls);
    const currentQuestionId = questionIds[currentQuestionIndex];
    
    // Try to find question details if available
    const questionDetails = speakingData.questions?.find(q => q.id === currentQuestionId);
    
    return {
      id: currentQuestionId,
      index: currentQuestionIndex,
      total: questionIds.length,
      details: questionDetails
    };
  };

  // Update audio when question changes
  useEffect(() => {
    if (speakingData && currentQuestionIndex >= 0) {
      const audioUrls = Object.values(speakingData.audioUrls);
      if (currentQuestionIndex < audioUrls.length) {
        const newAudioUrl = audioUrls[currentQuestionIndex];
        if (newAudioUrl !== actualAudioUrl) {
          setActualAudioUrl(newAudioUrl);
          setCurrentAudioUrl(newAudioUrl);
        }
      }
    }
  }, [currentQuestionIndex, speakingData]);

  // Keyboard shortcuts for navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Arrow keys for navigation
      if (e.key === 'ArrowLeft' && !e.shiftKey && selectedSubmissionIndex > 0) {
        e.preventDefault();
        handlePrevious();
      } else if (e.key === 'ArrowRight' && !e.shiftKey && selectedSubmissionIndex < submissions.length - 1) {
        e.preventDefault();
        handleNext();
      }
      // Shift + Arrow keys for question navigation (when multiple questions exist)
      else if (e.key === 'ArrowLeft' && e.shiftKey && speakingData && Object.keys(speakingData.audioUrls).length > 1 && currentQuestionIndex > 0) {
        e.preventDefault();
        switchToQuestion(currentQuestionIndex - 1);
      } else if (e.key === 'ArrowRight' && e.shiftKey && speakingData && Object.keys(speakingData.audioUrls).length > 1 && currentQuestionIndex < Object.keys(speakingData.audioUrls).length - 1) {
        e.preventDefault();
        switchToQuestion(currentQuestionIndex + 1);
      }
      // Ctrl/Cmd + S to save
      else if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      // Spacebar to play/pause
      else if (e.key === ' ' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const activeElement = document.activeElement;
        // Only handle spacebar if not focused on input/textarea
        if (activeElement?.tagName !== 'INPUT' && activeElement?.tagName !== 'TEXTAREA') {
          e.preventDefault();
          togglePlayPause();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedSubmissionIndex, submissions.length, score, feedback, isPlaying, speakingData, currentQuestionIndex]);

  const handleSubmissionSelect = (index: number) => {
    setSelectedSubmissionIndex(index);
  };

  const handlePrevious = () => {
    if (selectedSubmissionIndex > 0) {
      setSelectedSubmissionIndex(selectedSubmissionIndex - 1);
    }
  };

  const handleNext = () => {
    if (selectedSubmissionIndex < submissions.length - 1) {
      setSelectedSubmissionIndex(selectedSubmissionIndex + 1);
    }
  };

  const handleSave = async () => {
    if (!selectedSubmission) return;

    const parsedScore = score.trim() !== "" ? parseFloat(score) : null;
    const trimmedFeedback = feedback.trim();

    // Validation
    if (parsedScore === null && trimmedFeedback === "") {
      showError("Please provide at least a score or feedback.");
      return;
    }

    if (parsedScore !== null && (isNaN(parsedScore) || parsedScore < 0 || parsedScore > 10)) {
      showError("Score must be a number between 0 and 10.");
      return;
    }

    try {
      setSaving(true);
      await onGradeSubmit(
        selectedSubmission.id,
        parsedScore ?? selectedSubmission.score ?? 0,
        trimmedFeedback || selectedSubmission.feedback || ""
      );
      
      // Check if this is the last submission
      const isLastSubmission = selectedSubmissionIndex === submissions.length - 1;
      
      if (isLastSubmission) {
        success("Grade saved! This was the last submission.");
      } else {
        success("Grade saved! Moving to next submission...");
        // Auto-navigate to next submission after a short delay
        setTimeout(() => {
          handleNext();
        }, 500);
      }
    } catch (error) {
      console.error("Error saving grade:", error);
      showError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const getFullAudioUrl = (audioUrl: string): string => {
    // Handle different URL formats
    if (audioUrl.startsWith('http://') || audioUrl.startsWith('https://')) {
      return audioUrl; // Already a full URL
    }
    
    // Handle empty CDN_BASE_URL
    if (!CDN_BASE_URL) {
      console.warn('CDN_BASE_URL is empty, using relative URL');
      return audioUrl;
    }
    
    // Ensure proper URL formatting
    let normalizedUrl = audioUrl;
    if (!normalizedUrl.startsWith('/')) {
      normalizedUrl = `/${normalizedUrl}`;
    }
    
    // Remove double slashes in CDN_BASE_URL
    let cleanCdnUrl = CDN_BASE_URL;
    if (cleanCdnUrl.endsWith('/')) {
      cleanCdnUrl = cleanCdnUrl.slice(0, -1);
    }
    
    const fullUrl = `${cleanCdnUrl}${normalizedUrl}`;
    
    
    return fullUrl;
  };

  // Audio player functions
  const togglePlayPause = () => {
    if (!waveSurferRef.current) return;

    try {
      if (isPlaying) {
        waveSurferRef.current.pause();
      } else {
        waveSurferRef.current.play();
      }
    } catch (error) {
      setAudioError(true);
      showError('Unable to play audio. Please try downloading the file.');
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const currentAudioTime = audioRef.current.currentTime;
      
      // Validate current time before setting
      if (isFinite(currentAudioTime) && currentAudioTime >= 0) {
        setCurrentTime(currentAudioTime);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      const audioDuration = audioRef.current.duration;
      
      // Validate duration before setting
      if (isFinite(audioDuration) && audioDuration > 0) {
        setDuration(audioDuration);
      } else {
        setDuration(0);
      }
      setAudioLoading(false);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (waveSurferRef.current && duration > 0) {
      const seekProgress = newTime / duration;
      waveSurferRef.current.seekTo(seekProgress);
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (waveSurferRef.current) {
      waveSurferRef.current.setVolume(newVolume);
    }
  };

  const formatTime = (time: number): string => {
    // Handle invalid time values
    if (isNaN(time) || !isFinite(time) || time < 0) {
      return "0:00";
    }
    
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const renderAudioPlayer = () => {
    if (!selectedSubmission?.file && !actualAudioUrl) {
      return (
        <div className="h-full flex items-center justify-center bg-neutral-50">
          <div className="text-center">
            <MessageSquare className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <p className="text-neutral-500 text-lg">No audio submitted</p>
            {selectedSubmission?.content && (
              <div className="mt-4 p-4 bg-white rounded-lg shadow-sm max-w-lg">
                <p className="text-sm text-neutral-700 whitespace-pre-wrap">
                  {selectedSubmission.content}
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Use actual audio URL if available, otherwise fall back to file URL
    const audioUrl = actualAudioUrl ? getFullAudioUrl(actualAudioUrl) : getFullAudioUrl(selectedSubmission.file || "");

    return (
      <div className="h-full w-full bg-neutral-50 relative flex flex-col">

        {/* Always show the waveform UI, don't hide it on error */}
        {true ? (
          <>
            {/* Loading State */}
            {audioLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-neutral-100 z-10">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
                  <p className="text-neutral-600 font-medium">Loading audio...</p>
                  <p className="text-neutral-500 text-sm mt-2">{selectedSubmission.studentName}'s recording</p>
                </div>
              </div>
            )}
            
            {/* Audio Player UI */}
            <div className="p-4 relative">
              <div className="w-full max-w-2xl mx-auto">
                
                {/* Open in New Tab Button */}
                <div className="absolute top-1 right-1 z-20">
                  <a
                    href={audioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-primary-600 text-white px-3 py-1 rounded text-sm hover:bg-primary-700 transition-colors shadow-lg"
                  >
                    Open in New Tab
                  </a>
                </div>
                {/* Question Information & Navigation - Compact */}
                {speakingData && (() => {
                  const questionInfo = getCurrentQuestionDetails();
                  const showNavigation = questionInfo && questionInfo.total > 1;
                  
                  return (
                    <div className="bg-white rounded-lg p-3 shadow-sm mb-3 mt-6">
                      {/* Compact Question Header */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-medium text-neutral-700">
                            {showNavigation ? `Q${questionInfo.index + 1}/${questionInfo.total}` : 'Question'}
                          </h4>
                          {questionInfo?.details?.points && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                              {questionInfo.details.points}pts
                            </span>
                          )}
                          {questionInfo?.details?.duration && (
                            <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                              {questionInfo.details.duration}s
                            </span>
                          )}
                        </div>
                        
                        {/* Navigation Controls - Inline */}
                        {showNavigation && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => switchToQuestion(currentQuestionIndex - 1)}
                              disabled={currentQuestionIndex === 0}
                              className="p-1 text-neutral-600 hover:text-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Previous question"
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </button>
                            
                            {/* Question dots indicator - compact */}
                            <div className="flex gap-1 mx-2">
                              {Object.keys(speakingData.audioUrls).map((_, index) => (
                                <button
                                  key={index}
                                  onClick={() => switchToQuestion(index)}
                                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                                    index === currentQuestionIndex 
                                      ? 'bg-primary-600' 
                                      : 'bg-neutral-300 hover:bg-neutral-400'
                                  }`}
                                  title={`Go to question ${index + 1}`}
                                />
                              ))}
                            </div>
                            
                            <button
                              onClick={() => switchToQuestion(currentQuestionIndex + 1)}
                              disabled={currentQuestionIndex === Object.keys(speakingData.audioUrls).length - 1}
                              className="p-1 text-neutral-600 hover:text-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Next question"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                      
                      {/* Compact Question Text */}
                      {questionInfo?.details?.question ? (
                        <div className="text-sm text-neutral-800 p-2 bg-neutral-50 rounded border-l-2 border-primary-500">
                          <p className="overflow-hidden" style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical'
                          }}>{questionInfo.details.question}</p>
                          {questionInfo?.details?.instructions && (
                            <p className="text-xs text-neutral-600 mt-1 italic">{questionInfo.details.instructions}</p>
                          )}
                        </div>
                      ) : (
                        <div className="text-xs text-neutral-500 bg-yellow-50 border border-yellow-200 rounded p-2">
                          <strong>ID:</strong> {questionInfo?.id || 'Unknown'} • <em>No question details available</em>
                        </div>
                      )}
                    </div>
                  );
                })()}
                
                {/* Waveform Visualization */}
                <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-sm font-medium text-neutral-700">Audio Waveform</h4>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          // Try to reinitialize if needed
                          if (!waveSurferRef.current && waveformRef.current) {
                            setAudioError(false);
                            setAudioLoading(true);
                          }
                        }}
                        className="text-xs px-2 py-1 bg-blue-100 hover:bg-blue-200 rounded transition-colors"
                      >
                        Reload
                      </button>
                    </div>
                  </div>
                  
                  {/* WaveSurfer.js container */}
                  <div 
                    ref={waveformRef}
                    className="h-20 bg-gradient-to-r from-accent-100 to-accent-200 rounded-lg mb-3"
                  />
                  
                  {/* Progress Bar */}
                  <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={currentTime}
                    onChange={handleSeek}
                    disabled={!duration || duration === 0}
                    className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer mb-4 disabled:opacity-50"
                    style={{
                      background: duration > 0 
                        ? `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(currentTime / duration) * 100}%, #e5e7eb ${(currentTime / duration) * 100}%, #e5e7eb 100%)`
                        : '#e5e7eb',
                      // Hide the thumb/dot on all browsers
                      WebkitAppearance: 'none',
                      MozAppearance: 'none',
                      appearance: 'none'
                    }}
                  />
                  
                  <style dangerouslySetInnerHTML={{
                    __html: `
                      input[type="range"]::-webkit-slider-thumb {
                        -webkit-appearance: none;
                        height: 0px;
                        width: 0px;
                        background: transparent;
                      }
                      
                      input[type="range"]::-moz-range-thumb {
                        height: 0px;
                        width: 0px;
                        background: transparent;
                        border: none;
                        -moz-appearance: none;
                      }
                      
                      input[type="range"]::-ms-thumb {
                        height: 0px;
                        width: 0px;
                        background: transparent;
                        border: none;
                      }
                    `
                  }} />
                  
                  {/* Time Display */}
                  <div className="flex justify-between text-sm text-neutral-500 mb-4">
                    <span>{formatTime(currentTime)}</span>
                    <span>{duration > 0 ? formatTime(duration) : '--:--'}</span>
                  </div>
                  
                  {/* Duration Status */}
                  {duration === 0 && !audioError && (
                    <div className="text-xs text-neutral-400 text-center mb-2">
                      Loading audio duration...
                      <button 
                        onClick={() => {
                          if (waveSurferRef.current) {
                            // Manual refresh attempt
                            setAudioLoading(true);
                            setTimeout(() => setAudioLoading(false), 1000);
                          }
                        }}
                        className="ml-2 text-blue-500 hover:text-blue-700 underline"
                      >
                        Refresh
                      </button>
                    </div>
                  )}
                </div>

                {/* Controls */}
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <div className="flex items-center justify-center gap-4">
                    {/* Play/Pause Button */}
                    <button
                      onClick={togglePlayPause}
                      disabled={audioLoading}
                      className="bg-primary-600 hover:bg-primary-700 disabled:bg-neutral-400 text-white rounded-full p-3 transition-colors"
                    >
                      {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                    </button>

                    {/* Volume Control */}
                    <div className="flex items-center gap-2">
                      <Volume2 size={20} className="text-neutral-600" />
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={volume}
                        onChange={handleVolumeChange}
                        className="w-20 h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    {/* Download Button */}
                    <a
                      href={audioUrl}
                      download
                      className="bg-neutral-600 hover:bg-neutral-700 text-white rounded-full p-2 transition-colors"
                      title="Download audio"
                    >
                      <Download size={20} />
                    </a>
                  </div>
                </div>
              </div>
            </div>

          </>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-md">
              <MessageSquare className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
              <p className="text-neutral-500 mb-4">Unable to play this audio file</p>
              <p className="text-sm text-neutral-400 mb-6">
                This might be due to an unsupported audio format or network issues.
                You can try downloading the file to play it locally.
              </p>
              <div className="space-y-4">
                {/* URL Debug Info */}
                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                  <button
                    onClick={() => setShowUrlDebug(!showUrlDebug)}
                    className="text-sm text-yellow-700 hover:text-yellow-800 font-medium"
                  >
                    {showUrlDebug ? '▼' : '▶'} Debug Info
                  </button>
                  {showUrlDebug && (
                    <div className="mt-2 text-xs text-yellow-700 space-y-1">
                      <div><strong>Submission File:</strong> {selectedSubmission.file}</div>
                      <div><strong>Actual Audio URL:</strong> {actualAudioUrl || 'Not found'}</div>
                      <div><strong>Full Audio URL:</strong> {audioUrl}</div>
                      <div><strong>CDN Base:</strong> {CDN_BASE_URL || 'Not set'}</div>
                      {speakingData && (
                        <>
                          <div><strong>Audio URLs in data:</strong> {Object.keys(speakingData?.audioUrls || {}).length} found</div>
                          <div><strong>Current Question:</strong> {currentQuestionIndex + 1} of {Object.keys(speakingData?.audioUrls || {}).length}</div>
                          <div><strong>Current Question ID:</strong> {Object.keys(speakingData?.audioUrls || {})[currentQuestionIndex] || 'N/A'}</div>
                          <div><strong>Question Details Available:</strong> {speakingData?.questions ? `Yes (${speakingData?.questions?.length || 0} questions)` : 'No'}</div>
                          {getCurrentQuestionDetails()?.details && (
                            <div><strong>Current Question Text:</strong> {getCurrentQuestionDetails()?.details?.question?.substring(0, 50) || 'N/A'}...</div>
                          )}
                        </>
                      )}
                      <div className="mt-2">
                        <a 
                          href={audioUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          Test Audio URL in new tab
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* Browser Native Audio Player as Fallback */}
                <div className="bg-white p-4 rounded-lg border">
                  <p className="text-sm text-neutral-600 mb-2">Try browser native player:</p>
                  <audio 
                    controls 
                    className="w-full"
                    src={audioUrl}
                    onError={(e) => {
                      console.error('Native audio player error:', e);
                    }}
                    onLoadStart={() => {
                    }}
                  >
                    <source src={audioUrl} type="audio/mpeg" />
                    <source src={audioUrl} type="audio/wav" />
                    <source src={audioUrl} type="audio/ogg" />
                    <source src={audioUrl} type="audio/mp4" />
                    <source src={audioUrl} type="audio/webm" />
                    Your browser does not support the audio element.
                  </audio>
                </div>
                
                <div className="flex gap-2 justify-center flex-wrap">
                  <a
                    href={audioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 transition-colors inline-block text-sm"
                  >
                    Download Audio
                  </a>
                  <button
                    onClick={() => {
                      setAudioError(false);
                      setAudioLoading(true);
                      if (audioRef.current) {
                        audioRef.current.load();
                      }
                    }}
                    className="bg-neutral-600 text-white px-4 py-2 rounded hover:bg-neutral-700 transition-colors text-sm"
                  >
                    Retry Custom Player
                  </button>
                  <button
                    onClick={() => {
                      // Try without CDN base URL
                      const directUrl = selectedSubmission.file;
                      if (audioRef.current && directUrl) {
                        audioRef.current.src = directUrl;
                        audioRef.current.load();
                        setAudioError(false);
                        setAudioLoading(true);
                      }
                    }}
                    className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 transition-colors text-sm"
                  >
                    Try Direct URL
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (submissions.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
        <Card className="bg-white p-8 max-w-md w-full mx-4">
          <h3 className="text-xl font-bold text-primary-800 mb-4">No Submissions</h3>
          <p className="text-neutral-600 mb-6">There are no submissions to grade for this assignment.</p>
          <Button onClick={onClose} variant="primary" className="w-full">
            Close
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-neutral-900 z-[9999] flex flex-col">
      {/* Header */}
      <div className="bg-primary-700 text-white px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="hover:bg-primary-600 p-2 rounded-lg transition-colors"
            title="Close"
          >
            <X size={24} />
          </button>
          <div>
            <h2 className="text-xl font-bold">{assignmentTitle}</h2>
            <p className="text-primary-200 text-sm">Speaking Assignment Grading</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-xs text-primary-200 hidden md:block">
            <span className="opacity-75">Shortcuts: </span>
            <kbd className="px-2 py-1 bg-primary-600 rounded text-xs">←→</kbd> Navigate
            <span className="mx-1">•</span>
            <kbd className="px-2 py-1 bg-primary-600 rounded text-xs">Space</kbd> Play/Pause
            <span className="mx-1">•</span>
            <kbd className="px-2 py-1 bg-primary-600 rounded text-xs">Ctrl+S</kbd> Save
          </div>
          <span className="text-sm text-primary-200">
            {selectedSubmissionIndex + 1} / {submissions.length}
          </span>
        </div>
      </div>

      {/* Main Content - 3 Columns */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column - Student List */}
        <div className="w-80 bg-white border-r border-neutral-200 overflow-y-auto">
          <div className="p-4 bg-accent-50 border-b border-accent-200">
            <h3 className="font-semibold text-primary-800">Students</h3>
            <p className="text-xs text-neutral-600 mt-1">{submissions.length} submissions</p>
          </div>
          <div className="divide-y divide-neutral-200">
            {submissions.map((submission, index) => (
              <button
                key={submission.id}
                onClick={() => handleSubmissionSelect(index)}
                className={`w-full text-left p-4 hover:bg-accent-25 transition-colors ${
                  index === selectedSubmissionIndex ? "bg-secondary-100 border-l-4 border-primary-600" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-primary-800 truncate">
                      {submission.studentName}
                    </p>
                    <p className="text-xs text-neutral-500">{submission.studentCode}</p>
                    <p className="text-xs text-neutral-400 mt-1">{submission.submittedDate}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {submission.score !== null ? (
                      <>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-success-100 text-success-700">
                          {submission.score}
                        </span>
                        {submission.IsAiScore === true && (
                          <div className="flex items-center gap-1 px-1.5 py-0.5 bg-blue-50 border border-blue-200 rounded text-[10px]">
                            <Bot size={10} className="text-blue-600" />
                            <span className="text-blue-700 font-medium">AI</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <span className="text-xs text-neutral-400 italic">Not graded</span>
                    )}
                    {submission.feedback && (
                      <MessageSquare size={14} className="text-primary-400" />
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Middle Column - Audio Player */}
        <div className="flex-1 flex flex-col bg-neutral-100">
          <div className="bg-neutral-800 text-white px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrevious}
                disabled={selectedSubmissionIndex === 0}
                className="p-1 hover:bg-neutral-700 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Previous submission (←)"
              >
                <ChevronLeft size={20} />
              </button>
              <div>
                <p className="font-semibold">{selectedSubmission?.studentName}</p>
                <p className="text-xs text-neutral-400">
                  {selectedSubmission?.studentCode} • {selectedSubmissionIndex + 1}/{submissions.length}
                </p>
              </div>
              <button
                onClick={handleNext}
                disabled={selectedSubmissionIndex === submissions.length - 1}
                className="p-1 hover:bg-neutral-700 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Next submission (→)"
              >
                <ChevronRight size={20} />
              </button>
            </div>
            <div className="text-sm text-neutral-400">
              Submitted: {selectedSubmission?.submittedDate}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {renderAudioPlayer()}
          </div>
        </div>

        {/* Right Column - Grading Form */}
        <div className="w-96 bg-white border-l border-neutral-200 flex flex-col">
          <div className="p-4 bg-accent-50 border-b border-accent-200">
            <h3 className="font-semibold text-primary-800 flex items-center gap-2">
              <Award size={20} className="text-primary-600" />
              Grading
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Score Input */}
            <div>
              <label className="block text-sm font-semibold text-primary-800 mb-2">
                Score (0-10)
              </label>
              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-lg font-semibold"
                placeholder="Enter score"
              />
              {score && (
                <p className="text-xs text-neutral-500 mt-1">
                  Score: {score}/10
                </p>
              )}
              {/* AI Score Note - Show when IsAiScore is true */}
              {selectedSubmission?.IsAiScore === true && (
                <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                  <Bot size={16} className="text-blue-600" />
                  <p className="text-xs text-blue-700 font-medium">
                    💡 This score is AI-generated. Your grading will replace it.
                  </p>
                </div>
              )}
            </div>

            {/* Feedback Textarea */}
            <div>
              <label className="block text-sm font-semibold text-primary-800 mb-2">
                Feedback
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={12}
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all resize-none"
                placeholder="Write your feedback here..."
              />
              <p className="text-xs text-neutral-500 mt-1">
                {feedback.length} characters
              </p>
            </div>

            {/* Quick Feedback Buttons - Speaking Specific */}
            <div>
              <label className="block text-sm font-semibold text-primary-800 mb-2">
                Quick Feedback
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setFeedback(feedback + "\n• Clear pronunciation")}
                  className="text-xs px-3 py-2 bg-accent-100 hover:bg-accent-200 rounded transition-colors text-left"
                >
                  + Clear pronunciation
                </button>
                <button
                  onClick={() => setFeedback(feedback + "\n• Good fluency")}
                  className="text-xs px-3 py-2 bg-accent-100 hover:bg-accent-200 rounded transition-colors text-left"
                >
                  + Good fluency
                </button>
                <button
                  onClick={() => setFeedback(feedback + "\n• Natural intonation")}
                  className="text-xs px-3 py-2 bg-accent-100 hover:bg-accent-200 rounded transition-colors text-left"
                >
                  + Natural intonation
                </button>
                <button
                  onClick={() => setFeedback(feedback + "\n• Confident delivery")}
                  className="text-xs px-3 py-2 bg-accent-100 hover:bg-accent-200 rounded transition-colors text-left"
                >
                  + Confident delivery
                </button>
                <button
                  onClick={() => setFeedback(feedback + "\n• Work on pronunciation")}
                  className="text-xs px-3 py-2 bg-warning-100 hover:bg-warning-200 rounded transition-colors text-left"
                >
                  - Pronunciation needs work
                </button>
                <button
                  onClick={() => setFeedback(feedback + "\n• Speak more slowly")}
                  className="text-xs px-3 py-2 bg-warning-100 hover:bg-warning-200 rounded transition-colors text-left"
                >
                  - Speak more slowly
                </button>
                <button
                  onClick={() => setFeedback(feedback + "\n• Improve volume/clarity")}
                  className="text-xs px-3 py-2 bg-warning-100 hover:bg-warning-200 rounded transition-colors text-left"
                >
                  - Volume/clarity
                </button>
                <button
                  onClick={() => setFeedback(feedback + "\n• More practice needed")}
                  className="text-xs px-3 py-2 bg-warning-100 hover:bg-warning-200 rounded transition-colors text-left"
                >
                  - More practice
                </button>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="p-4 border-t border-neutral-200 bg-white">
            <Button
              onClick={handleSave}
              disabled={saving || (score.trim() === "" && feedback.trim() === "")}
              className="w-full btn-primary"
              iconLeft={saving ? <Loader /> : <Save size={18} />}
            >
              {saving ? "Saving..." : "Save & Next"}
            </Button>
            <p className="text-xs text-center text-neutral-500 mt-2">
              {selectedSubmissionIndex < submissions.length - 1
                ? "Will move to next submission after saving"
                : "This is the last submission"}
            </p>
          </div>
        </div>
      </div>

      {/* Toast Notifications */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => hideToast(toast.id)}
          duration={3000}
        />
      ))}
    </div>
  );
}

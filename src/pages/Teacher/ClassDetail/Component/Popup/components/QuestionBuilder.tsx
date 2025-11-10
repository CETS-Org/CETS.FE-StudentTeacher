import { useState, useEffect, useMemo, useRef } from "react";
import { Plus, Trash2, GripVertical, X, CheckCircle, PenTool, Play, Pause, Headphones } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import type { Question, QuestionType, QuestionOption, FillInTheBlank, MatchingData, MatchingItem, MatchingPair, SkillType } from "../AdvancedAssignmentPopup";
import { config } from "@/lib/config";

interface Props {
  questions: Question[];
  onAddQuestion: (question: Question) => void;
  onUpdateQuestion: (id: string, question: Partial<Question>) => void;
  onDeleteQuestion: (id: string) => void;
  onReorderQuestions: (fromIndex: number, toIndex: number) => void;
  skillType: string;
}

export default function QuestionBuilder({
  questions,
  onAddQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
  onReorderQuestions,
  skillType,
}: Props) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  // Reading: Store passage (shared across multiple questions)
  const [currentPassage, setCurrentPassage] = useState<string>("");
  // Listening: Store audio file (shared across multiple questions)
  const [currentAudioFile, setCurrentAudioFile] = useState<File | null>(null);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string>("");
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioObjectUrl, setAudioObjectUrl] = useState<string | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  
  // Helper function to get existing passage from questions
  const getExistingPassage = useMemo(() => {
    if (skillType.toLowerCase() === "reading" && questions.length > 0) {
      // Find first question with passage
      const questionWithPassage = questions.find(q => (q as any)._passage && (q as any)._passage.trim());
      if (questionWithPassage) {
        return (questionWithPassage as any)._passage.trim();
      }
    }
    return "";
  }, [questions, skillType]);

  // Helper function to get existing audio from questions
  const getExistingAudio = useMemo(() => {
    if (skillType.toLowerCase() === "listening" && questions.length > 0) {
      // Find first question with audio
      const questionWithAudio = questions.find(q => {
        const audio = (q as any)._audioUrl || q.reference;
        return audio && audio.trim();
      });
      if (questionWithAudio) {
        return (questionWithAudio as any)._audioUrl || questionWithAudio.reference || "";
      }
    }
    return "";
  }, [questions, skillType]);
  
  // Auto-load passage from imported questions when questions change
  useEffect(() => {
    if (skillType.toLowerCase() === "reading" && questions.length > 0) {
      // Find first question with passage
      const questionWithPassage = questions.find(q => (q as any)._passage && (q as any)._passage.trim());
      if (questionWithPassage) {
        const importedPassage = (questionWithPassage as any)._passage.trim();
        // Only update if currentPassage is empty
        // This prevents overwriting user input while allowing auto-load from imports
        setCurrentPassage(prev => {
          if (!prev) {
            return importedPassage;
          }
          return prev;
        });
      }
    }
  }, [questions, skillType]);

  // Auto-load audio from imported questions when questions change
  useEffect(() => {
    if (skillType.toLowerCase() === "listening" && questions.length > 0) {
      // Find first question with audio
      const questionWithAudio = questions.find(q => {
        const audio = (q as any)._audioUrl || q.reference;
        return audio && audio.trim();
      });
      if (questionWithAudio) {
        const importedAudio = (questionWithAudio as any)._audioUrl || questionWithAudio.reference || "";
        // Only update if currentAudioUrl is empty and no file is selected
        setCurrentAudioUrl(prev => {
          if (!prev && !currentAudioFile) {
            return importedAudio;
          }
          return prev;
        });
      }
    }
  }, [questions, skillType, currentAudioFile]);
  // Helper function to get default question type - must be defined before useState
  const getDefaultQuestionType = (): QuestionType => {
    if (skillType.toLowerCase().includes("speaking")) {
      return "speaking";
    } else if (skillType.toLowerCase().includes("writing")) {
      return "essay";
    }
    return "multiple_choice";
  };

  const [newQuestion, setNewQuestion] = useState<Partial<Question>>(() => ({
    type: getDefaultQuestionType(),
    question: "",
    points: 1,
    options: [],
    shuffleOptions: false,
  }));

  const questionTypes: { value: QuestionType; label: string; icon: string }[] = [
    { value: "multiple_choice", label: "Multiple Choice", icon: "☑️" },
    { value: "true_false", label: "True/False", icon: "✓" },
    { value: "fill_in_the_blank", label: "Fill in the Blank", icon: "___" },
    { value: "short_answer", label: "Short Answer", icon: "✍️" },
    { value: "matching", label: "Matching", icon: "🔗" },
    { value: "essay", label: "Essay", icon: "📝" },
    { value: "speaking", label: "Speaking", icon: "🎤" },
  ];

  const resetForm = () => {
    setNewQuestion({
      type: getDefaultQuestionType(),
      question: "",
      points: 1,
      options: [],
      shuffleOptions: false,
    });
    setShowAddForm(false);
    setEditingId(null);
    // Don't clear passage for Reading - allow adding more questions
    // Don't clear audio file for Listening - allow adding more questions
  };

  const resetFormAndPassage = () => {
    resetForm();
    setCurrentPassage("");
  };

  const resetFormAndAudio = () => {
    // Stop and cleanup audio player
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current = null;
    }
    setAudioPlaying(false);
    // Cleanup object URL
    if (audioObjectUrl) {
      URL.revokeObjectURL(audioObjectUrl);
      setAudioObjectUrl(null);
    }
    resetForm();
    setCurrentAudioFile(null);
    setCurrentAudioUrl("");
  };

  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check if file is audio (MP3, WAV, etc.)
      if (!file.type.includes("audio") && !file.name.toLowerCase().match(/\.(mp3|wav|ogg|m4a)$/)) {
        alert("Please upload an audio file (MP3, WAV, OGG, M4A)");
        return;
      }
      
      // Cleanup previous object URL if exists
      if (audioObjectUrl) {
        URL.revokeObjectURL(audioObjectUrl);
      }
      
      // Stop any playing audio
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current.currentTime = 0;
      }
      setAudioPlaying(false);
      
      // Create object URL for the new file
      const objectUrl = URL.createObjectURL(file);
      setAudioObjectUrl(objectUrl);
      setCurrentAudioFile(file);
      setCurrentAudioUrl(""); // Clear URL when new file is selected
    }
  };

  // Cleanup audio player and object URL on unmount
  useEffect(() => {
    return () => {
      // Stop and cleanup audio player
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current = null;
      }
      // Revoke object URL
      if (audioObjectUrl) {
        URL.revokeObjectURL(audioObjectUrl);
      }
    };
  }, [audioObjectUrl]);

  // Helper function to normalize audio URL
  const getAudioSource = (): string | undefined => {
    if (currentAudioFile && audioObjectUrl) {
      return audioObjectUrl; // Use object URL for local file
    }
    if (currentAudioUrl) {
      // If URL, check if it needs normalization
      if (currentAudioUrl.startsWith('http://') || currentAudioUrl.startsWith('https://')) {
        return currentAudioUrl;
      }
      return `${config.storagePublicUrl}${currentAudioUrl.startsWith('/') ? currentAudioUrl : '/' + currentAudioUrl}`;
    }
    if (getExistingAudio) {
      // Normalize existing audio URL
      if (getExistingAudio.startsWith('http://') || getExistingAudio.startsWith('https://')) {
        return getExistingAudio;
      }
      return `${config.storagePublicUrl}${getExistingAudio.startsWith('/') ? getExistingAudio : '/' + getExistingAudio}`;
    }
    return undefined;
  };

  const toggleAudioPlayback = () => {
    const audioSource = getAudioSource();
    if (!audioSource) {
      alert("No audio available. Please upload an audio file or enter an audio URL.");
      return;
    }

    // If already playing, pause it
    if (audioPlaying && audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      setAudioPlaying(false);
      return;
    }

    // If audio element exists but not playing, check if source matches
    if (audioPlayerRef.current) {
      // If source changed, create new audio element
      const currentSrc = audioPlayerRef.current.src;
      if (!currentSrc || !currentSrc.includes(audioSource.split('/').pop() || '')) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current = null;
      }
    }

    // Create new audio element if needed
    if (!audioPlayerRef.current) {
      const audio = new Audio(audioSource);
      audioPlayerRef.current = audio;
      
      audio.onloadeddata = () => {
        console.log("Audio loaded successfully");
      };
      
      audio.onended = () => {
        setAudioPlaying(false);
        if (audioPlayerRef.current) {
          audioPlayerRef.current.currentTime = 0;
        }
      };
      
      audio.onerror = (e) => {
        console.error("Audio playback error:", e);
        alert("Failed to load audio. Please check the audio file or URL.");
        setAudioPlaying(false);
        audioPlayerRef.current = null;
      };
    }

    // Play audio
    const audio = audioPlayerRef.current;
    audio.play().catch((error) => {
      console.error("Audio play error:", error);
      alert("Failed to play audio. Please check the audio file or URL.");
      setAudioPlaying(false);
      audioPlayerRef.current = null;
    });
    setAudioPlaying(true);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", "");
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      onReorderQuestions(draggedIndex, dropIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleAddOption = () => {
    const options = newQuestion.options || [];
    const labels = ["A", "B", "C", "D", "E", "F"];
    const newOption: QuestionOption = {
      id: `opt-${Date.now()}`,
      label: labels[options.length] || String.fromCharCode(65 + options.length),
      text: "",
    };
    setNewQuestion({
      ...newQuestion,
      options: [...options, newOption],
    });
  };

  const handleUpdateOption = (optionId: string, text: string) => {
    const options = (newQuestion.options || []).map((opt) =>
      opt.id === optionId ? { ...opt, text } : opt
    );
    setNewQuestion({ ...newQuestion, options });
  };

  const handleDeleteOption = (optionId: string) => {
    const options = (newQuestion.options || []).filter((opt) => opt.id !== optionId);
    setNewQuestion({ ...newQuestion, options });
  };

  const handleSetCorrectAnswer = (optionId: string) => {
    setNewQuestion({ ...newQuestion, correctAnswer: optionId });
  };

  const handleSaveQuestion = () => {
    if (!newQuestion.question?.trim()) {
      alert("Please enter a question");
      return;
    }

    // Validate audio for Listening
    if (skillType.toLowerCase() === "listening") {
      if (!currentAudioFile && !currentAudioUrl.trim() && !getExistingAudio && questions.length === 0) {
        alert("Please upload an audio file or enter an audio URL for Listening questions");
        return;
      }
    }

    // Skip multiple choice validation for Speaking and Writing skills
    const isSpeakingOrWriting = skillType === "Speaking" || skillType.toLowerCase().includes("speaking") ||
                                 skillType === "Writing" || skillType.toLowerCase().includes("writing");

    if (newQuestion.type === "multiple_choice" && !isSpeakingOrWriting) {
      if (!newQuestion.options || newQuestion.options.length < 2) {
        alert("Multiple choice questions need at least 2 options");
        return;
      }
      if (!newQuestion.correctAnswer) {
        alert("Please select a correct answer");
        return;
      }
    }

    if (newQuestion.type === "true_false" && newQuestion.correctAnswer === undefined) {
      alert("Please select True or False");
      return;
    }

    const question: Question & { _passage?: string } = {
      id: editingId || `q-${Date.now()}`,
      type: newQuestion.type as QuestionType,
      order: editingId
        ? questions.find((q) => q.id === editingId)?.order || questions.length + 1
        : questions.length + 1,
      question: newQuestion.question!,
      points: newQuestion.points || 1,
      options: newQuestion.options,
      correctAnswer: newQuestion.correctAnswer,
      explanation: newQuestion.explanation,
      audioTimestamp: newQuestion.audioTimestamp,
      reference: newQuestion.reference,
      shuffleOptions: newQuestion.shuffleOptions,
      requiresManualGrading: newQuestion.type === "essay" || newQuestion.type === "short_answer" || newQuestion.type === "speaking",
    };

    // For Reading: attach passage to question
    // Use currentPassage if entered, otherwise check if editing question has passage
    if (skillType.toLowerCase() === "reading") {
      if (currentPassage.trim()) {
        (question as any)._passage = currentPassage.trim();
      } else if (editingId) {
        // When editing, preserve existing passage if no new passage entered
        const existingQuestion = questions.find(q => q.id === editingId);
        if (existingQuestion && (existingQuestion as any)._passage) {
          (question as any)._passage = (existingQuestion as any)._passage;
        }
      } else {
        // For new questions, check if there are existing questions with passage
        if (getExistingPassage) {
          (question as any)._passage = getExistingPassage;
        }
      }
    }

    // For Listening: attach audio file or URL to question
    if (skillType.toLowerCase() === "listening") {
      if (currentAudioFile) {
        // Store file object for later upload
        (question as any)._audioFile = currentAudioFile;
        (question as any)._audioUrl = ""; // Will be set after upload
      } else if (currentAudioUrl.trim()) {
        // Use URL if provided (from import or manual entry)
        (question as any)._audioUrl = currentAudioUrl.trim();
        question.reference = currentAudioUrl.trim(); // Also store in reference for backward compatibility
      } else if (editingId) {
        // When editing, preserve existing audio if no new audio entered
        const existingQuestion = questions.find(q => q.id === editingId);
        if (existingQuestion) {
          const existingAudio = (existingQuestion as any)._audioUrl || existingQuestion.reference;
          if (existingAudio) {
            (question as any)._audioUrl = existingAudio;
            question.reference = existingAudio;
          }
        }
      } else {
        // For new questions, check if there are existing questions with audio
        if (getExistingAudio) {
          (question as any)._audioUrl = getExistingAudio;
          question.reference = getExistingAudio;
        }
      }
    }

    if (editingId) {
      onUpdateQuestion(editingId, question);
      resetForm();
    } else {
      onAddQuestion(question);
      // For Reading: keep form open to add more questions for the same passage
      if (skillType.toLowerCase() === "reading" && currentPassage.trim()) {
        // Reset question fields but keep passage
        setNewQuestion({
          type: getDefaultQuestionType(),
          question: "",
          points: 1,
          options: [],
          shuffleOptions: false,
        });
      } else if (skillType.toLowerCase() === "listening" && (currentAudioFile || currentAudioUrl.trim())) {
        // For Listening: keep form open to add more questions for the same audio
        setNewQuestion({
          type: getDefaultQuestionType(),
          question: "",
          points: 1,
          options: [],
          shuffleOptions: false,
        });
      } else {
        resetForm();
      }
    }
  };

  const handleEdit = (question: Question) => {
    setNewQuestion({
      type: question.type,
      question: question.question,
      points: question.points,
      options: question.options || [],
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      audioTimestamp: question.audioTimestamp,
      reference: question.reference,
      shuffleOptions: question.shuffleOptions,
      keywords: question.keywords,
      maxLength: question.maxLength,
    });
    // Load passage if exists (for Reading)
    if (skillType.toLowerCase() === "reading") {
      const passage = (question as any)._passage;
      if (passage) {
        setCurrentPassage(passage);
      }
    }
    // Load audio if exists (for Listening)
    if (skillType.toLowerCase() === "listening") {
      const audioUrl = (question as any)._audioUrl || question.reference;
      if (audioUrl) {
        setCurrentAudioUrl(audioUrl);
        setCurrentAudioFile(null); // Clear file when editing (URL takes precedence)
        setAudioObjectUrl(null); // Clear object URL
        setAudioPlaying(false);
        if (audioPlayerRef.current) {
          audioPlayerRef.current.pause();
          audioPlayerRef.current = null;
        }
      }
    }
    setEditingId(question.id);
    setShowAddForm(true);
  };

  const renderQuestionForm = () => {
    if (!showAddForm && !editingId) return null;

    return (
      <div className="border-2 border-gray-300 rounded-lg p-6 bg-gray-100 mb-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">
            {editingId ? "Edit Question" : "Add New Question"}
          </h3>
          <button
            onClick={resetForm}
            className="text-neutral-500 hover:text-neutral-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Reading Passage Section - Show first for Reading */}
          {(skillType === "Reading" || skillType.toLowerCase().includes("reading")) && (
            <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
              <label className="block text-sm font-medium text-blue-800 mb-2">
                Reading Passage (Optional)
                {getExistingPassage && !currentPassage && (
                  <span className="text-xs text-blue-600 ml-2">(Using passage from imported questions)</span>
                )}
              </label>
              <p className="text-xs text-blue-700 mb-3">
                {getExistingPassage && !currentPassage 
                  ? "Passage is already set from imported questions. You can modify it below or add more questions."
                  : "Enter the passage text (optional). You can add multiple questions for this passage, or create questions without a passage."}
              </p>
              <textarea
                value={currentPassage || getExistingPassage || ""}
                onChange={(e) => setCurrentPassage(e.target.value)}
                placeholder={getExistingPassage && !currentPassage
                  ? "Passage from imported questions will be used. Modify if needed..."
                  : "Paste or type your reading passage here..."}
                className="w-full border border-blue-300 rounded-md p-3 text-sm min-h-[200px] focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              />
              {(currentPassage || getExistingPassage) && (
                <p className="text-xs text-blue-600 mt-2">
                  {(currentPassage || getExistingPassage || "").length} characters. {questions.length} question{questions.length !== 1 ? 's' : ''} already added for this passage.
                </p>
              )}
            </div>
          )}

          {/* Listening Audio Section - Show first for Listening */}
          {(skillType === "Listening" || skillType.toLowerCase().includes("listening")) && (
            <div className="border-2 border-purple-200 rounded-lg p-4 bg-purple-50">
              <label className="block text-sm font-medium text-purple-800 mb-2">
                Listening Audio File 
                {!getExistingAudio && !currentAudioFile && !currentAudioUrl && questions.length === 0 && <span className="text-red-500">*</span>}
                {getExistingAudio && !currentAudioFile && !currentAudioUrl && (
                  <span className="text-xs text-purple-600 ml-2">(Using audio from imported questions)</span>
                )}
              </label>
              <p className="text-xs text-purple-700 mb-3">
                {getExistingAudio && !currentAudioFile && !currentAudioUrl
                  ? "Audio is already set from imported questions. You can upload a new file below or add more questions."
                  : "Upload an MP3 audio file. You can add multiple questions for this audio."}
              </p>
              
              {/* File Upload */}
              <div className="mb-3">
                <input
                  type="file"
                  accept="audio/*,.mp3,.wav,.ogg,.m4a"
                  onChange={handleAudioFileChange}
                  className="hidden"
                  id="audio-file-input"
                />
                <label
                  htmlFor="audio-file-input"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-purple-300 rounded-md cursor-pointer hover:bg-purple-50 transition-colors text-sm text-purple-700"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  {currentAudioFile ? "Change Audio File" : "Upload Audio File (MP3)"}
                </label>
                {currentAudioFile && (
                  <div className="mt-2 p-3 bg-white border border-purple-200 rounded">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1">
                        <span className="font-medium text-xs text-purple-700">Selected: </span>
                        <span className="text-xs text-purple-600">{currentAudioFile.name}</span>
                        <span className="text-xs text-purple-500 ml-2">
                          ({(currentAudioFile.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setCurrentAudioFile(null);
                          setAudioObjectUrl(null);
                          setAudioPlaying(false);
                          if (audioPlayerRef.current) {
                            audioPlayerRef.current.pause();
                            audioPlayerRef.current = null;
                          }
                          const input = document.getElementById("audio-file-input") as HTMLInputElement;
                          if (input) input.value = "";
                          // Cleanup object URL
                          if (audioObjectUrl) {
                            URL.revokeObjectURL(audioObjectUrl);
                          }
                        }}
                        className="ml-2 text-red-600 hover:text-red-800 text-xs"
                      >
                        Remove
                      </button>
                    </div>
                    {/* Audio Player */}
                    <div className="flex items-center gap-2 mt-2 p-2 bg-purple-50 rounded border border-purple-100">
                      <button
                        onClick={toggleAudioPlayback}
                        className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-600 text-white hover:bg-purple-700 transition-colors"
                        disabled={!getAudioSource()}
                      >
                        {audioPlaying ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4 ml-0.5" />
                        )}
                      </button>
                      <div className="flex-1 flex items-center gap-2">
                        <Headphones className="w-4 h-4 text-purple-600" />
                        <span className="text-xs text-purple-700">
                          {audioPlaying ? "Playing..." : "Click to preview audio"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Audio URL Input (alternative to file upload) */}
              <div className="mt-3">
                <label className="block text-xs font-medium text-purple-700 mb-1">
                  Or enter audio URL:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={currentAudioUrl || getExistingAudio || ""}
                    onChange={(e) => {
                      // Stop and reset audio player when URL changes
                      if (audioPlayerRef.current) {
                        audioPlayerRef.current.pause();
                        audioPlayerRef.current.currentTime = 0;
                        audioPlayerRef.current = null;
                      }
                      setAudioPlaying(false);
                      setCurrentAudioUrl(e.target.value);
                      setCurrentAudioFile(null); // Clear file when URL is entered
                      // Cleanup object URL
                      if (audioObjectUrl) {
                        URL.revokeObjectURL(audioObjectUrl);
                        setAudioObjectUrl(null);
                      }
                    }}
                    placeholder="https://example.com/audio.mp3"
                    className="flex-1 border border-purple-300 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 bg-white"
                  />
                  {(currentAudioUrl || getExistingAudio) && getAudioSource() && (
                    <button
                      onClick={toggleAudioPlayback}
                      className="flex items-center justify-center w-10 h-10 rounded-md bg-purple-600 text-white hover:bg-purple-700 transition-colors"
                      title={audioPlaying ? "Pause" : "Play"}
                    >
                      {audioPlaying ? (
                        <Pause className="w-5 h-5" />
                      ) : (
                        <Play className="w-5 h-5 ml-0.5" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Audio Preview for URL (when no file is uploaded) */}
              {(currentAudioUrl || getExistingAudio) && !currentAudioFile && getAudioSource() && (
                <div className="mt-3 p-3 bg-purple-50 rounded border border-purple-200">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={toggleAudioPlayback}
                      className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-600 text-white hover:bg-purple-700 transition-colors"
                      title={audioPlaying ? "Pause" : "Play"}
                    >
                      {audioPlaying ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4 ml-0.5" />
                      )}
                    </button>
                    <div className="flex-1 flex items-center gap-2">
                      <Headphones className="w-4 h-4 text-purple-600" />
                      <span className="text-xs text-purple-700">
                        {audioPlaying ? "Playing audio..." : "Click to preview audio"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {(currentAudioFile || currentAudioUrl || getExistingAudio) && (
                <p className="text-xs text-purple-600 mt-2">
                  {questions.length} question{questions.length !== 1 ? 's' : ''} already added for this audio.
                </p>
              )}
            </div>
          )}

          {/* Question Type - Hidden for Speaking and Writing skills */}
          {!(skillType === "Speaking" || skillType.toLowerCase().includes("speaking") || 
             skillType === "Writing" || skillType.toLowerCase().includes("writing")) && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Question Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                {questionTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => {
                      setNewQuestion({
                        ...newQuestion,
                        type: type.value,
                        options: type.value === "multiple_choice" ? newQuestion.options : undefined,
                        correctAnswer: undefined,
                      });
                    }}
                    className={`p-3 border-2 rounded-lg text-sm font-medium transition-colors ${
                      newQuestion.type === type.value
                        ? "border-gray-400 bg-secondary-200 text-primary-700"
                        : "border-neutral-300 bg-white text-neutral-700 hover:border-primary-300"
                    }`}
                  >
                    <div className="text-lg mb-1">{type.icon}</div>
                    <div>{type.label}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Question Text */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Question Text <span className="text-red-500">*</span>
              {(skillType === "Speaking" || skillType.toLowerCase().includes("speaking")) && (
                <span className="text-xs text-neutral-500 ml-2">(Speaking Prompt)</span>
              )}
              {(skillType === "Writing" || skillType.toLowerCase().includes("writing")) && (
                <span className="text-xs text-neutral-500 ml-2">(Writing Prompt)</span>
              )}
            </label>
            <textarea
              value={newQuestion.question || ""}
              onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
              placeholder={
                (skillType === "Speaking" || skillType.toLowerCase().includes("speaking"))
                  ? "Enter the speaking prompt (e.g., 'Describe your favorite vacation' or 'Give a 2-minute presentation about climate change')..."
                  : (skillType === "Writing" || skillType.toLowerCase().includes("writing"))
                  ? "Enter the writing prompt (e.g., 'Write an essay about the importance of education' or 'Describe your ideal learning environment in 300 words')..."
                  : "Enter your question here..."
              }
              className="w-full border bg-white border-neutral-300 rounded-md p-3 text-sm min-h-[100px] focus:outline-none focus:ring-1 focus:ring-primary-100"
            />
            {(skillType === "Speaking" || skillType.toLowerCase().includes("speaking")) && (
              <p className="text-xs text-neutral-500 mt-1">
                Students will record their spoken response to this prompt. The question type is automatically set for speaking assignments.
              </p>
            )}
            {(skillType === "Writing" || skillType.toLowerCase().includes("writing")) && (
              <p className="text-xs text-neutral-500 mt-1">
                Students will write their response to this prompt. The question type is automatically set for writing assignments.
              </p>
            )}
          </div>

          {/* Points */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Input
                label="Points"
                type="number"
                value={newQuestion.points || 1}
                onChange={(e) =>
                  setNewQuestion({ ...newQuestion, points: parseInt(e.target.value) || 1 })
                }
                min={1}
              />
            </div>
            {/* Speaking Time Limit for Speaking skills */}
            {(skillType === "Speaking" || skillType.toLowerCase().includes("speaking")) && (
              <div>
                <Input
                  label="Speaking Time Limit (seconds)"
                  type="number"
                  placeholder="e.g., 120 for 2 minutes"
                  value={newQuestion.maxLength ? newQuestion.maxLength.toString() : ""}
                  onChange={(e) =>
                    setNewQuestion({
                      ...newQuestion,
                      maxLength: e.target.value ? parseInt(e.target.value) : undefined,
                    })
                  }
                  hint="Maximum time students have to record their response"
                />
              </div>
            )}
            {/* Shuffle options for multiple choice/matching */}
            {(newQuestion.type === "multiple_choice" || newQuestion.type === "matching") && 
             !(skillType === "Speaking" || skillType.toLowerCase().includes("speaking") || 
               skillType === "Writing" || skillType.toLowerCase().includes("writing")) && (
              <div className="flex items-center pt-6">
                <input
                  type="checkbox"
                  id="shuffleOptions"
                  checked={newQuestion.shuffleOptions || false}
                  onChange={(e) =>
                    setNewQuestion({ ...newQuestion, shuffleOptions: e.target.checked })
                  }
                  className="w-4 h-4 text-primary-600 border-neutral-300 rounded"
                />
                <label htmlFor="shuffleOptions" className="ml-2 text-sm text-neutral-700">
                  Shuffle Options
                </label>
              </div>
            )}
          </div>

          {/* Multiple Choice Options */}
          {newQuestion.type === "multiple_choice" && 
           !(skillType === "Speaking" || skillType.toLowerCase().includes("speaking") || 
             skillType === "Writing" || skillType.toLowerCase().includes("writing")) && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-neutral-700">
                  Options <span className="text-red-500">*</span>
                </label>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleAddOption}
                  iconLeft={<Plus className="w-4 h-4" />}
                >
                  Add Option
                </Button>
              </div>
              <div className="space-y-2">
                {(newQuestion.options || []).map((option, idx) => (
                  <div key={option.id} className="flex items-center gap-2">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="w-8 text-center font-medium text-neutral-600">
                        {option.label}
                      </span>
                      <input
                        type="text"
                        value={option.text}
                        onChange={(e) => handleUpdateOption(option.id, e.target.value)}
                        placeholder={`Option ${option.label}`}
                        className="flex-1 border bg-white border-neutral-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-100"
                      />
                      <button
                        onClick={() => handleSetCorrectAnswer(option.id)}
                        className={`p-2 rounded ${
                          newQuestion.correctAnswer === option.id
                            ? "bg-green-100 text-green-700"
                            : "bg-neutral-100 text-neutral-500 hover:bg-green-50"
                        }`}
                        title="Mark as correct answer"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteOption(option.id)}
                        className="p-2 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {(!newQuestion.options || newQuestion.options.length === 0) && (
                  <p className="text-sm text-neutral-500 italic">
                    Click "Add Option" to add answer choices
                  </p>
                )}
              </div>
            </div>
          )}

          {/* True/False */}
          {newQuestion.type === "true_false" && 
           !(skillType === "Speaking" || skillType.toLowerCase().includes("speaking") || 
             skillType === "Writing" || skillType.toLowerCase().includes("writing")) && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Correct Answer <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4">
                <button
                  onClick={() => setNewQuestion({ ...newQuestion, correctAnswer: true })}
                  className={`flex-1 p-4 border-2 rounded-lg font-medium transition-colors ${
                    newQuestion.correctAnswer === true
                      ? "border-green-600 bg-green-50 text-green-700"
                      : "border-neutral-300 bg-white text-neutral-700 hover:border-green-300"
                  }`}
                >
                  True
                </button>
                <button
                  onClick={() => setNewQuestion({ ...newQuestion, correctAnswer: false })}
                  className={`flex-1 p-4 border-2 rounded-lg font-medium transition-colors ${
                    newQuestion.correctAnswer === false
                      ? "border-red-600 bg-red-50 text-red-700"
                      : "border-neutral-300 bg-white text-neutral-700 hover:border-red-300"
                  }`}
                >
                  False
                </button>
              </div>
            </div>
          )}

          {/* Fill in the Blank - Simplified for now */}
          {newQuestion.type === "fill_in_the_blank" && 
           !(skillType === "Speaking" || skillType.toLowerCase().includes("speaking") || 
             skillType === "Writing" || skillType.toLowerCase().includes("writing")) && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Correct Answer(s) <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Enter correct answer (comma-separated for multiple)"
                value={
                  Array.isArray(newQuestion.correctAnswer)
                    ? newQuestion.correctAnswer.join(", ")
                    : (newQuestion.correctAnswer as string) || ""
                }
                onChange={(e) => {
                  const answers = e.target.value.split(",").map((a) => a.trim()).filter(Boolean);
                  setNewQuestion({
                    ...newQuestion,
                    correctAnswer: answers.length === 1 ? answers[0] : answers,
                  });
                }}
              />
              <p className="text-xs text-neutral-500 mt-1">
                Separate multiple acceptable answers with commas
              </p>
            </div>
          )}

          {/* Short Answer / Essay */}
          {(newQuestion.type === "short_answer" || newQuestion.type === "essay") && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Keywords (Optional)
              </label>
              <Input
                placeholder="Comma-separated keywords for grading reference"
                value={newQuestion.keywords?.join(", ") || ""}
                onChange={(e) => {
                  const keywords = e.target.value.split(",").map((k) => k.trim()).filter(Boolean);
                  setNewQuestion({ ...newQuestion, keywords });
                }}
              />
              {newQuestion.type === "essay" && 
               !(skillType === "Writing" || skillType.toLowerCase().includes("writing")) && (
                <div className="mt-2">
                  <Input
                    label="Max Length (characters)"
                    type="number"
                    value={newQuestion.maxLength || ""}
                    onChange={(e) =>
                      setNewQuestion({
                        ...newQuestion,
                        maxLength: e.target.value ? parseInt(e.target.value) : undefined,
                      })
                    }
                    placeholder="No limit"
                  />
                </div>
              )}
            </div>
          )}

          {/* Matching - Simplified for now */}
          {newQuestion.type === "matching" && 
           !(skillType === "Speaking" || skillType.toLowerCase().includes("speaking") || 
             skillType === "Writing" || skillType.toLowerCase().includes("writing")) && (
            <div>
              <p className="text-sm text-neutral-600 mb-4">
                Matching questions will be added in a future update. For now, use Multiple Choice.
              </p>
            </div>
          )}

          {/* Audio Timestamp (for Listening) */}
          {(skillType === "Listening" || skillType.toLowerCase().includes("listening")) && (
            <div>
              <Input
                label="Audio Timestamp (Optional)"
                placeholder="e.g., 0:30 or 1:15"
                value={newQuestion.audioTimestamp || ""}
                onChange={(e) =>
                  setNewQuestion({ ...newQuestion, audioTimestamp: e.target.value })
                }
              />
            </div>
          )}

          {/* Reference (for Reading) */}
          {(skillType === "Reading" || skillType.toLowerCase().includes("reading")) && (
            <div>
              <Input
                label="Reference (Optional)"
                placeholder="e.g., Paragraph 2, Line 5"
                value={newQuestion.reference || ""}
                onChange={(e) =>
                  setNewQuestion({ ...newQuestion, reference: e.target.value })
                }
              />
            </div>
          )}

          {/* Writing Word Count (for Writing) */}
          {(skillType === "Writing" || skillType.toLowerCase().includes("writing")) && (
            <div>
              <Input
                label="Word Count Limit (Optional)"
                type="number"
                placeholder="e.g., 300 for 300 words"
                value={newQuestion.maxLength ? newQuestion.maxLength.toString() : ""}
                onChange={(e) =>
                  setNewQuestion({
                    ...newQuestion,
                    maxLength: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
                hint="Maximum number of words students should write (leave empty for no limit)"
              />
            </div>
          )}

          {/* Explanation */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Explanation (Optional)
            </label>
            <textarea
              value={newQuestion.explanation || ""}
              onChange={(e) =>
                setNewQuestion({ ...newQuestion, explanation: e.target.value })
              }
              placeholder="Explain why this is the correct answer..."
              className="w-full border bg-white border-neutral-300 rounded-md p-3 text-sm min-h-[80px] focus:outline-none focus:ring-1 focus:ring-primary-100"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button 
              variant="secondary" 
              onClick={() => {
                if (editingId) {
                  resetForm();
                } else if (skillType.toLowerCase() === "reading" && currentPassage) {
                  resetFormAndPassage();
                } else if (skillType.toLowerCase() === "listening" && (currentAudioFile || currentAudioUrl)) {
                  resetFormAndAudio();
                } else {
                  resetForm();
                }
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveQuestion}
              disabled={
                (skillType.toLowerCase() === "listening" && 
                !currentAudioFile && 
                !currentAudioUrl.trim() && 
                !getExistingAudio &&
                questions.length === 0)
              }
            >
              {editingId ? "Update Question" : "Add Question"}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Add Question Button */}
      {!showAddForm && !editingId && (
        <Button
          onClick={() => {
            setNewQuestion({
              type: getDefaultQuestionType(),
              question: "",
              points: 1,
              options: [],
              shuffleOptions: false,
            });
            setShowAddForm(true);
          }}
          iconLeft={<Plus className="w-4 h-4" />}
          className="w-full"
        >
          Add Question
        </Button>
      )}

      {/* Question Form */}
      {renderQuestionForm()}

      {/* Questions List */}
      {questions.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-sm text-neutral-700">
            Questions ({questions.length})
          </h4>
          {questions
            .sort((a, b) => a.order - b.order)
            .map((question, index) => {
              const sortedQuestions = [...questions].sort((a, b) => a.order - b.order);
              const actualIndex = sortedQuestions.findIndex(q => q.id === question.id);
              
              return (
              <div
                key={question.id}
                draggable
                onDragStart={(e) => handleDragStart(e, actualIndex)}
                onDragOver={(e) => handleDragOver(e, actualIndex)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, actualIndex)}
                onDragEnd={handleDragEnd}
                className={`border rounded-lg p-5 bg-white hover:shadow-md transition-all ${
                  draggedIndex === actualIndex 
                    ? "opacity-50 cursor-grabbing" 
                    : dragOverIndex === actualIndex && draggedIndex !== null
                    ? "border-primary-500 border-2 shadow-lg"
                    : "border-neutral-200 cursor-grab"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 flex-1">
                    <div className="text-neutral-400 cursor-move" draggable={false}>
                      <GripVertical className="w-5 h-5" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-accent-300 bg-secondary-200 px-2.5 py-1 rounded">
                        Q{question.order}
                      </span>
                      <span className="text-xs text-neutral-500 uppercase tracking-wide">
                        {question.type.replace("_", " ")}
                      </span>
                      <span className="text-xs font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded">
                        {question.points} point{question.points !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2" onMouseDown={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleEdit(question)}
                      className="p-2 text-green-500 hover:bg-green-100 rounded"
                      title="Edit question"
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      <PenTool className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteQuestion(question.id)}
                      className="p-2 text-red-500 hover:bg-red-100 rounded"
                      title="Delete question"
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-sm font-medium text-neutral-900 mb-3 leading-relaxed">{question.question}</p>
                
                {/* Multiple Choice - Show options with correct answer */}
                {question.options && question.options.length > 0 && (
                  <div className="ml-2 space-y-2 mb-3">
                    {question.options.map((opt) => (
                      <div
                        key={opt.id}
                        className={`text-sm p-2 rounded ${
                          question.correctAnswer === opt.id
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : "bg-neutral-50 text-neutral-600"
                        }`}
                      >
                        <span className="font-medium">{opt.label}.</span> {opt.text}
                        {question.correctAnswer === opt.id && (
                          <span className="ml-2 text-green-600 font-semibold">✓ Correct</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                {/* True/False - Show correct answer */}
                {question.type === "true_false" && question.correctAnswer !== undefined && (
                  <div className="ml-2 mb-3">
                    <div className={`inline-flex items-center gap-2 px-3 py-2 rounded ${
                      question.correctAnswer === true 
                        ? "bg-green-50 text-green-700 border border-green-200" 
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}>
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm font-semibold">
                        Correct Answer: {question.correctAnswer === true ? "True" : "False"}
                      </span>
                    </div>
                  </div>
                )}
                
                {/* Fill-in-the-Blank - Show correct answer(s) */}
                {question.type === "fill_in_the_blank" && question.correctAnswer && (
                  <div className="ml-2 mb-3">
                    <div className="bg-green-50 text-green-700 border border-green-200 px-3 py-2 rounded inline-block">
                      <span className="text-sm font-semibold">
                        Correct Answer{Array.isArray(question.correctAnswer) && question.correctAnswer.length > 1 ? "s" : ""}: {
                          Array.isArray(question.correctAnswer)
                            ? question.correctAnswer.join(", ")
                            : question.correctAnswer
                        } ✓
                      </span>
                    </div>
                  </div>
                )}
                
                {/* Matching - Show correct matches */}
                {question.type === "matching" && question.matching && question.matching.correctMatches && question.matching.correctMatches.length > 0 && (
                  <div className="ml-2 mb-3">
                    <div className="bg-green-50 text-green-700 border border-green-200 px-3 py-2 rounded inline-block">
                      <span className="text-sm font-semibold">
                        {question.matching.correctMatches.length} correct match{question.matching.correctMatches.length !== 1 ? "es" : ""} configured ✓
                      </span>
                    </div>
                  </div>
                )}
                
                {/* Short Answer - Show keywords if available */}
                {question.type === "short_answer" && question.keywords && question.keywords.length > 0 && (
                  <div className="ml-2 mb-3">
                    <div className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-2 rounded">
                      <span className="text-xs font-medium block mb-1">Keywords:</span>
                      <span className="text-sm">{question.keywords.join(", ")}</span>
                    </div>
                  </div>
                )}
                
                {/* Essay - Show manual grading indicator */}
                {question.type === "essay" && (
                  <div className="ml-2 mb-3">
                    <div className="bg-neutral-100 text-neutral-600 px-3 py-2 rounded inline-block">
                      <span className="text-sm italic">Requires manual grading</span>
                    </div>
                  </div>
                )}
                
                {/* Speaking - Show indicator */}
                {question.type === "speaking" && (
                  <div className="ml-2 mb-3">
                    <div className="bg-neutral-100 text-neutral-600 px-3 py-2 rounded inline-block">
                      <span className="text-sm italic">🎤 Voice recording required - Requires manual grading</span>
                    </div>
                  </div>
                )}
                
                {question.explanation && (
                  <div className="mt-3 pt-3 border-t border-neutral-100">
                    <p className="text-xs text-neutral-500 italic">
                      <span className="font-medium text-neutral-600">Explanation:</span> {question.explanation}
                    </p>
                  </div>
                )}
              </div>
              );
            })}
        </div>
      )}

      {questions.length === 0 && !showAddForm && (
        <div className="text-center py-12 border-2 border-dashed border-neutral-300 rounded-lg">
          <PenTool className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
          <p className="text-neutral-600 mb-2">No questions added yet</p>
          <p className="text-sm text-neutral-500">
            Click "Add Question" to start building your assignment
          </p>
        </div>
      )}
    </div>
  );
}


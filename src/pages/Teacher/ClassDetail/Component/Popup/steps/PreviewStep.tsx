import { useState } from "react";
import { FileText, MessageSquare, PenTool, CheckCircle, Eye, BookOpen, Headphones } from "lucide-react";
import Button from "@/components/ui/Button";
import TeacherTestPreview from "../components/TeacherTestPreview";
import type { Question, Skill, AssignmentQuestionData } from "../AdvancedAssignmentPopup";

interface PreviewStepProps {
  title: string;
  description: string;
  dueDate: string;
  selectedSkill: Skill | undefined;
  assignmentType: string;
  questions: Question[];
  totalPoints: number;
  timeLimitMinutes: number | undefined;
  maxAttempts: number;
  isAutoGradable: boolean;
  answerVisibility: "immediately" | "after_due_date" | "never";
}

export default function PreviewStep({
  title,
  description,
  dueDate,
  selectedSkill,
  assignmentType,
  questions,
  totalPoints,
  timeLimitMinutes,
  maxAttempts,
  isAutoGradable,
  answerVisibility,
}: PreviewStepProps) {
  const [showFullPreview, setShowFullPreview] = useState(false);

  // Helper function to get correct answer display
  const getCorrectAnswerDisplay = (question: Question) => {
    if (question.type === "true_false") {
      // Handle both boolean true/false and string "true"/"false"
      if (question.correctAnswer === true || question.correctAnswer === "true" || question.correctAnswer === "True") {
        return "True";
      }
      if (question.correctAnswer === false || question.correctAnswer === "false" || question.correctAnswer === "False") {
        return "False";
      }
      return question.correctAnswer ? String(question.correctAnswer) : "N/A";
    }
    if (question.type === "fill_in_the_blank") {
      if (question.correctAnswer) {
        if (Array.isArray(question.correctAnswer)) {
          return question.correctAnswer.join(", ");
        }
        return String(question.correctAnswer);
      }
      return "N/A";
    }
    return null;
  };

  // Extract passage and audio from questions
  const sortedQuestions = [...questions].sort((a, b) => a.order - b.order);
  
  // Group questions by passage (can have multiple passages)
  const passageGroups = new Map<string, Question[]>();
  const audioGroups = new Map<string, Question[]>();
  const questionsWithoutPassage: Question[] = [];
  const questionsWithoutAudio: Question[] = [];

  for (const q of sortedQuestions) {
    const passage = (q as any)._passage;
    const audio = (q as any)._audioUrl || q.reference;

    // Group by passage
    if (passage && passage.trim()) {
      const passageKey = passage.trim();
      if (!passageGroups.has(passageKey)) {
        passageGroups.set(passageKey, []);
      }
      passageGroups.get(passageKey)!.push(q);
    } else {
      questionsWithoutPassage.push(q);
    }

    // Group by audio
    if (audio && audio.trim()) {
      const audioKey = audio.trim();
      if (!audioGroups.has(audioKey)) {
        audioGroups.set(audioKey, []);
      }
      audioGroups.get(audioKey)!.push(q);
    } else {
      questionsWithoutAudio.push(q);
    }
  }

  // Get all unique passages (sorted by first question order)
  const passages = Array.from(passageGroups.entries()).map(([passage, qs]) => ({
    passage,
    questions: qs.sort((a, b) => a.order - b.order),
    firstQuestionOrder: Math.min(...qs.map(q => q.order)),
  })).sort((a, b) => a.firstQuestionOrder - b.firstQuestionOrder);

  // Get all unique audio (sorted by first question order)
  const audios = Array.from(audioGroups.entries()).map(([audio, qs]) => ({
    audio,
    questions: qs.sort((a, b) => a.order - b.order),
    firstQuestionOrder: Math.min(...qs.map(q => q.order)),
  })).sort((a, b) => a.firstQuestionOrder - b.firstQuestionOrder);

  // For preview modal: use the first passage/audio (or most common)
  let readingPassage: string | undefined;
  let audioUrl: string | undefined;
  if (passages.length > 0) {
    readingPassage = passages[0].passage;
  }
  if (audios.length > 0) {
    audioUrl = audios[0].audio;
  }

  // Prepare question data for preview
  const questionData: AssignmentQuestionData = {
    version: "1.0",
    questions: sortedQuestions.map(q => {
      const { _passage, _audioUrl, ...cleanedQ } = q as any;
      return cleanedQ;
    }),
    ...(readingPassage && { readingPassage }),
    ...(audioUrl && {
      media: {
        audioUrl,
      },
    }),
  };

  const isReading = selectedSkill?.name?.toLowerCase() === "reading";
  const isListening = selectedSkill?.name?.toLowerCase() === "listening";

  return (
    <>
      <div className="space-y-6 min-h-full">
      {/* Preview Button - Prominent Banner */}
      {questions.length > 0 && (
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Ready to Preview Your Assignment?
              </h3>
              <p className="text-primary-100 text-sm">
                Review your assignment exactly as students will see it. Test navigation, check answers, and verify everything looks perfect.
              </p>
            </div>
            <Button
              variant="secondary"
              onClick={() => setShowFullPreview(true)}
              iconLeft={<Eye className="w-5 h-5" />}
              className="min-w-[200px] border-0"
            >
              Open Full Preview
            </Button>
          </div>
        </div>
      )}
      {/* Assignment Summary */}
      <div className="bg-gradient-to-br from-accent-100/50 to-accent-200/30 border border-primary-200 p-6 rounded-lg shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-primary-600" />
          <h3 className="font-semibold text-lg text-primary-900">Assignment Summary</h3>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-white/60 rounded-md p-3">
            <span className="text-neutral-600 text-xs block mb-1">Title</span>
            <span className="font-semibold text-neutral-900">{title || "Untitled"}</span>
          </div>
          <div className="bg-white/60 rounded-md p-3">
            <span className="text-neutral-600 text-xs block mb-1">Skill</span>
            <span className="font-semibold text-neutral-900">{selectedSkill?.name || "N/A"}</span>
          </div>
          <div className="bg-white/60 rounded-md p-3">
            <span className="text-neutral-600 text-xs block mb-1">Type</span>
            <span className="font-semibold text-neutral-900">{assignmentType}</span>
          </div>
          <div className="bg-white/60 rounded-md p-3">
            <span className="text-neutral-600 text-xs block mb-1">Due Date</span>
            <span className="font-semibold text-neutral-900">{new Date(dueDate).toLocaleString()}</span>
          </div>
          <div className="bg-white/60 rounded-md p-3">
            <span className="text-neutral-600 text-xs block mb-1">Total Questions</span>
            <span className="font-semibold text-neutral-900">{questions.length}</span>
          </div>
          <div className="bg-white/60 rounded-md p-3">
            <span className="text-neutral-600 text-xs block mb-1">Total Points</span>
            <span className="font-semibold text-neutral-900">{totalPoints}</span>
          </div>
          {timeLimitMinutes && (
            <div className="bg-white/60 rounded-md p-3">
              <span className="text-neutral-600 text-xs block mb-1">Time Limit</span>
              <span className="font-semibold text-neutral-900">{timeLimitMinutes} minutes</span>
            </div>
          )}
        </div>
        
        {/* Settings Summary */}
        <div className="mt-4 pt-4 border-t border-primary-200">
          <div className="flex flex-wrap gap-3 text-xs">
            <span className={`px-3 py-1 rounded-full ${isAutoGradable ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-600'}`}>
              {isAutoGradable ? '✓ Auto-Grading Enabled' : 'Manual Grading'}
            </span>
            {answerVisibility === "immediately" && (
              <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700">
                Answers after submission
              </span>
            )}
            {answerVisibility === "after_due_date" && (
              <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700">
                Answers after due date
              </span>
            )}
            {answerVisibility === "never" && (
              <span className="px-3 py-1 rounded-full bg-neutral-100 text-neutral-600">
                Answers never shown
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Instructions */}
      {description && (
        <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-5">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="w-5 h-5 text-neutral-600" />
            <h4 className="font-semibold text-neutral-900">Instructions</h4>
          </div>
          <p className="text-sm text-neutral-700 whitespace-pre-wrap leading-relaxed">{description}</p>
        </div>
      )}

      {/* Reading Passages Preview - Show all passages with their questions */}
      {passages.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold text-blue-900">
              Reading Passages ({passages.length} passage{passages.length !== 1 ? 's' : ''})
            </h4>
          </div>
          {passages.map((passageGroup, idx) => (
            <div key={idx} className="bg-blue-50 border-2 border-blue-200 rounded-lg p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-blue-700 bg-blue-200 px-3 py-1 rounded">
                    Passage {idx + 1}
                  </span>
                  <span className="text-xs text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                    {passageGroup.questions.length} question{passageGroup.questions.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              <div className="bg-white border border-blue-200 rounded-md p-4 max-h-[300px] overflow-y-auto scrollbar-hide mb-4">
                <p className="text-sm text-neutral-700 whitespace-pre-wrap leading-relaxed">{passageGroup.passage}</p>
              </div>
              
              {/* Questions for this passage */}
              <div className="mt-4 pt-4 border-t border-blue-200">
                <p className="text-xs font-medium text-blue-700 mb-2">Questions for this passage:</p>
                <div className="space-y-2">
                  {passageGroup.questions.map((q) => (
                    <div key={q.id} className="bg-white border border-blue-200 rounded-md p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                          Q{q.order}
                        </span>
                        <span className="text-xs text-neutral-500 uppercase">
                          {q.type.replace("_", " ")}
                        </span>
                        <span className="text-xs text-green-600 font-medium">
                          {q.points} pt{q.points !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-800">{q.question}</p>
                      {q.options && q.options.length > 0 && (
                        <div className="mt-2 ml-4 space-y-1">
                          {q.options.map((opt) => (
                            <div
                              key={opt.id}
                              className={`text-xs p-1.5 rounded ${
                                q.correctAnswer === opt.id
                                  ? "bg-green-50 text-green-700 border border-green-200"
                                  : "bg-neutral-50 text-neutral-600"
                              }`}
                            >
                              <span className="font-medium">{opt.label}.</span> {opt.text}
                              {q.correctAnswer === opt.id && (
                                <span className="ml-2 text-green-600 font-semibold">✓</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      {/* Show correct answer for True/False */}
                      {q.type === "true_false" && getCorrectAnswerDisplay(q) && (
                        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs">
                          <span className="font-semibold text-green-700">Correct Answer: </span>
                          <span className="text-green-700 font-bold">{getCorrectAnswerDisplay(q)}</span>
                        </div>
                      )}
                      {/* Show correct answer for Fill in the Blank */}
                      {q.type === "fill_in_the_blank" && getCorrectAnswerDisplay(q) && (
                        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs">
                          <span className="font-semibold text-green-700">
                            Correct Answer{Array.isArray(q.correctAnswer) && q.correctAnswer.length > 1 ? "s" : ""}: 
                          </span>
                          <span className="text-green-700 font-semibold ml-1">{getCorrectAnswerDisplay(q)}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
          
          {/* Questions without passage */}
          {questionsWithoutPassage.length > 0 && (
            <div className="bg-neutral-50 border-2 border-neutral-200 rounded-lg p-5">
              <div className="flex items-center gap-2 mb-4">
                <PenTool className="w-5 h-5 text-neutral-600" />
                <h4 className="font-semibold text-neutral-900">
                  Questions without Passage ({questionsWithoutPassage.length} question{questionsWithoutPassage.length !== 1 ? 's' : ''})
                </h4>
              </div>
              <div className="space-y-3">
                {questionsWithoutPassage.map((q) => (
                  <div key={q.id} className="bg-white border border-neutral-200 rounded-md p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded">
                        Q{q.order}
                      </span>
                      <span className="text-xs text-neutral-500 uppercase">
                        {q.type.replace("_", " ")}
                      </span>
                      <span className="text-xs text-green-600 font-medium">
                        {q.points} pt{q.points !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-800 mb-2">{q.question}</p>
                    {q.options && q.options.length > 0 && (
                      <div className="mt-2 ml-4 space-y-1">
                        {q.options.map((opt) => (
                          <div
                            key={opt.id}
                            className={`text-xs p-1.5 rounded ${
                              q.correctAnswer === opt.id
                                ? "bg-green-50 text-green-700 border border-green-200"
                                : "bg-neutral-50 text-neutral-600"
                            }`}
                          >
                            <span className="font-medium">{opt.label}.</span> {opt.text}
                            {q.correctAnswer === opt.id && (
                              <span className="ml-2 text-green-600 font-semibold">✓</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    {/* Show correct answer for True/False */}
                    {q.type === "true_false" && getCorrectAnswerDisplay(q) && (
                      <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs">
                        <span className="font-semibold text-green-700">Correct Answer: </span>
                        <span className="text-green-700 font-bold">{getCorrectAnswerDisplay(q)}</span>
                      </div>
                    )}
                    {/* Show correct answer for Fill in the Blank */}
                    {q.type === "fill_in_the_blank" && getCorrectAnswerDisplay(q) && (
                      <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs">
                        <span className="font-semibold text-green-700">
                          Correct Answer{Array.isArray(q.correctAnswer) && q.correctAnswer.length > 1 ? "s" : ""}: 
                        </span>
                        <span className="text-green-700 font-semibold ml-1">{getCorrectAnswerDisplay(q)}</span>
                      </div>
                    )}
                    {q.explanation && (
                      <div className="mt-2 pt-2 border-t border-neutral-100">
                        <p className="text-xs text-neutral-500 italic">
                          <span className="font-medium text-neutral-600">Explanation:</span> {q.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Listening Audio Preview - Show all audio with their questions */}
      {audios.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Headphones className="w-5 h-5 text-green-600" />
            <h4 className="font-semibold text-green-900">
              Listening Audio ({audios.length} audio file{audios.length !== 1 ? 's' : ''})
            </h4>
          </div>
          {audios.map((audioGroup, idx) => (
            <div key={idx} className="bg-green-50 border-2 border-green-200 rounded-lg p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-green-700 bg-green-200 px-3 py-1 rounded">
                    Audio {idx + 1}
                  </span>
                  <span className="text-xs text-green-600 bg-green-100 px-3 py-1 rounded-full">
                    {audioGroup.questions.length} question{audioGroup.questions.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              <div className="bg-white border border-green-200 rounded-md p-4 mb-4">
                <p className="text-sm text-green-700 font-medium mb-2">Audio URL:</p>
                <p className="text-xs text-green-600 break-all bg-green-50 p-2 rounded">{audioGroup.audio}</p>
              </div>
              
              {/* Questions for this audio */}
              <div className="mt-4 pt-4 border-t border-green-200">
                <p className="text-xs font-medium text-green-700 mb-2">Questions for this audio:</p>
                <div className="space-y-2">
                  {audioGroup.questions.map((q) => (
                    <div key={q.id} className="bg-white border border-green-200 rounded-md p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded">
                          Q{q.order}
                        </span>
                        <span className="text-xs text-neutral-500 uppercase">
                          {q.type.replace("_", " ")}
                        </span>
                        <span className="text-xs text-green-600 font-medium">
                          {q.points} pt{q.points !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-800">{q.question}</p>
                      {q.options && q.options.length > 0 && (
                        <div className="mt-2 ml-4 space-y-1">
                          {q.options.map((opt) => (
                            <div
                              key={opt.id}
                              className={`text-xs p-1.5 rounded ${
                                q.correctAnswer === opt.id
                                  ? "bg-green-50 text-green-700 border border-green-200"
                                  : "bg-neutral-50 text-neutral-600"
                              }`}
                            >
                              <span className="font-medium">{opt.label}.</span> {opt.text}
                              {q.correctAnswer === opt.id && (
                                <span className="ml-2 text-green-600 font-semibold">✓</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      {/* Show correct answer for True/False */}
                      {q.type === "true_false" && getCorrectAnswerDisplay(q) && (
                        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs">
                          <span className="font-semibold text-green-700">Correct Answer: </span>
                          <span className="text-green-700 font-bold">{getCorrectAnswerDisplay(q)}</span>
                        </div>
                      )}
                      {/* Show correct answer for Fill in the Blank */}
                      {q.type === "fill_in_the_blank" && getCorrectAnswerDisplay(q) && (
                        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs">
                          <span className="font-semibold text-green-700">
                            Correct Answer{Array.isArray(q.correctAnswer) && q.correctAnswer.length > 1 ? "s" : ""}: 
                          </span>
                          <span className="text-green-700 font-semibold ml-1">{getCorrectAnswerDisplay(q)}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
          
          {/* Questions without audio */}
          {questionsWithoutAudio.length > 0 && (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
              <p className="text-sm font-medium text-yellow-800 mb-2">
                ⚠️ {questionsWithoutAudio.length} question{questionsWithoutAudio.length !== 1 ? 's' : ''} without audio
              </p>
              <div className="space-y-1">
                {questionsWithoutAudio.map((q) => (
                  <div key={q.id} className="text-xs text-yellow-700">
                    Q{q.order}: {q.question.substring(0, 50)}{q.question.length > 50 ? '...' : ''}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Questions Preview - Only show if not already displayed in passage/audio sections */}
      {questions.length > 0 && passages.length === 0 && audios.length === 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <PenTool className="w-5 h-5 text-primary-600" />
              <h4 className="font-semibold text-neutral-900">Questions Preview</h4>
              <span className="text-sm text-neutral-500">
                ({questions.length} question{questions.length !== 1 ? 's' : ''})
              </span>
            </div>
          </div>
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 scrollbar-hide">
            {questions.sort((a, b) => a.order - b.order).map((q) => (
              <div key={q.id} className="border border-neutral-200 rounded-lg p-5 bg-white hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold  text-accent-300 bg-secondary-200 px-2.5 py-1 rounded">
                      Q{q.order}
                    </span>
                    <span className="text-xs text-neutral-500 uppercase tracking-wide">
                      {q.type.replace("_", " ")}
                    </span>
                    <span className="text-xs font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded">
                      {q.points} point{q.points !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                <p className="text-sm font-medium text-neutral-900 mb-3 leading-relaxed">{q.question}</p>
                
                {/* Multiple Choice - Show options with correct answer */}
                {q.options && q.options.length > 0 && (
                  <div className="ml-2 space-y-2 mb-3">
                    {q.options.map((opt) => (
                      <div
                        key={opt.id}
                        className={`text-sm p-2 rounded ${
                          q.correctAnswer === opt.id
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : "bg-neutral-50 text-neutral-600"
                        }`}
                      >
                        <span className="font-medium">{opt.label}.</span> {opt.text}
                        {q.correctAnswer === opt.id && (
                          <span className="ml-2 text-green-600 font-semibold">✓ Correct</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                {/* True/False - Show correct answer */}
                {q.type === "true_false" && getCorrectAnswerDisplay(q) && (
                  <div className="ml-2 mb-3">
                    <div className="inline-flex items-center gap-2 px-3 py-2 rounded bg-green-50 text-green-700 border border-green-200">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm font-semibold">
                        Correct Answer: <span className="font-bold">{getCorrectAnswerDisplay(q)}</span>
                      </span>
                    </div>
                  </div>
                )}
                
                {/* Fill-in-the-Blank - Show correct answer(s) */}
                {q.type === "fill_in_the_blank" && getCorrectAnswerDisplay(q) && (
                  <div className="ml-2 mb-3">
                    <div className="bg-green-50 text-green-700 border border-green-200 px-3 py-2 rounded inline-block">
                      <span className="text-sm font-semibold">
                        Correct Answer{Array.isArray(q.correctAnswer) && q.correctAnswer.length > 1 ? "s" : ""}: 
                        <span className="font-bold ml-1">{getCorrectAnswerDisplay(q)}</span> ✓
                      </span>
                    </div>
                  </div>
                )}
                
                {/* Matching - Show correct matches */}
                {q.type === "matching" && q.matching && q.matching.correctMatches && q.matching.correctMatches.length > 0 && (
                  <div className="ml-2 mb-3">
                    <div className="bg-green-50 text-green-700 border border-green-200 px-3 py-2 rounded inline-block">
                      <span className="text-sm font-semibold">
                        {q.matching.correctMatches.length} correct match{q.matching.correctMatches.length !== 1 ? "es" : ""} configured ✓
                      </span>
                    </div>
                  </div>
                )}
                
                {/* Short Answer - Show keywords if available */}
                {q.type === "short_answer" && q.keywords && q.keywords.length > 0 && (
                  <div className="ml-2 mb-3">
                    <div className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-2 rounded">
                      <span className="text-xs font-medium block mb-1">Keywords:</span>
                      <span className="text-sm">{q.keywords.join(", ")}</span>
                    </div>
                  </div>
                )}
                
                {/* Essay - Show manual grading indicator */}
                {q.type === "essay" && (
                  <div className="ml-2 mb-3">
                    <div className="bg-neutral-100 text-neutral-600 px-3 py-2 rounded inline-block">
                      <span className="text-sm italic">Requires manual grading</span>
                    </div>
                  </div>
                )}
                
                {q.explanation && (
                  <div className="mt-3 pt-3 border-t border-neutral-100">
                    <p className="text-xs text-neutral-500 italic">
                      <span className="font-medium text-neutral-600">Explanation:</span> {q.explanation}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Questions Warning */}
      {questions.length === 0 && assignmentType === "Quiz" && (
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6 text-center">
          <PenTool className="w-10 h-10 text-yellow-600 mx-auto mb-3" />
          <p className="text-sm font-semibold text-yellow-800 mb-1">No questions added yet</p>
          <p className="text-xs text-yellow-600">Please go back to the Questions step to add questions before creating the assignment</p>
        </div>
      )}
    </div>

    {/* Full Preview Modal */}
    {showFullPreview && (
      <TeacherTestPreview
        open={showFullPreview}
        onClose={() => setShowFullPreview(false)}
        questionData={questionData}
        title={`Preview: ${title || "Untitled Assignment"}`}
        skillName={selectedSkill?.name}
      />
    )}
    </>
  );
}


import { FileText, MessageSquare, PenTool, CheckCircle } from "lucide-react";
import type { Question, Skill } from "../AdvancedAssignmentPopup";

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
  return (
    <div className="space-y-6 min-h-full">
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
          <div className="bg-white/60 rounded-md p-3">
            <span className="text-neutral-600 text-xs block mb-1">Max Attempts</span>
            <span className="font-semibold text-neutral-900">{maxAttempts}</span>
          </div>
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

      {/* Questions Preview */}
      {questions.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <PenTool className="w-5 h-5 text-primary-600" />
            <h4 className="font-semibold text-neutral-900">Questions Preview</h4>
            <span className="ml-auto text-sm text-neutral-500">
              {questions.length} question{questions.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
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
                {q.type === "true_false" && q.correctAnswer !== undefined && (
                  <div className="ml-2 mb-3">
                    <div className={`inline-flex items-center gap-2 px-3 py-2 rounded ${
                      q.correctAnswer === true 
                        ? "bg-green-50 text-green-700 border border-green-200" 
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}>
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm font-semibold">
                        Correct Answer: {q.correctAnswer === true ? "True" : "False"}
                      </span>
                    </div>
                  </div>
                )}
                
                {/* Fill-in-the-Blank - Show correct answer(s) */}
                {q.type === "fill_in_the_blank" && q.correctAnswer && (
                  <div className="ml-2 mb-3">
                    <div className="bg-green-50 text-green-700 border border-green-200 px-3 py-2 rounded inline-block">
                      <span className="text-sm font-semibold">
                        Correct Answer{Array.isArray(q.correctAnswer) && q.correctAnswer.length > 1 ? "s" : ""}: {
                          Array.isArray(q.correctAnswer)
                            ? q.correctAnswer.join(", ")
                            : q.correctAnswer
                        } ✓
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
    </div>
  );
}


import { useState } from "react";
import { PenTool, FileSpreadsheet, CheckCircle } from "lucide-react";
import QuestionBuilder from "../components/QuestionBuilder";
import QuestionImport from "../components/QuestionImport";
import type { Question, Skill } from "../AdvancedAssignmentPopup";

interface QuestionsStepProps {
  questions: Question[];
  onAddQuestion: (question: Question) => void;
  onUpdateQuestion: (id: string, question: Partial<Question>) => void;
  onDeleteQuestion: (id: string) => void;
  onReorderQuestions: (fromIndex: number, toIndex: number) => void;
  onImportQuestions?: (questions: Question[]) => void; // Optional: for bulk import
  selectedSkill: Skill | undefined;
  totalPoints: number;
}

export default function QuestionsStep({
  questions,
  onAddQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
  onReorderQuestions,
  onImportQuestions,
  selectedSkill,
  totalPoints,
}: QuestionsStepProps) {
  const [activeTab, setActiveTab] = useState<"builder" | "import">("builder");

  const handleImportQuestions = (importedQuestions: Question[]) => {
    const newQuestions = importedQuestions.map((q, idx) => ({
      ...q,
      id: q.id || `q-${Date.now()}-${idx}`,
      order: questions.length + idx + 1,
    }));
    
    // If onImportQuestions is provided, use it for bulk import (more efficient)
    // Otherwise, fall back to adding questions one by one
    if (onImportQuestions) {
      onImportQuestions(newQuestions);
    } else {
      // Fallback: add questions one by one (may have state update issues with multiple questions)
      newQuestions.forEach((q) => onAddQuestion(q));
    }
    setActiveTab("builder");
  };

  return (
    <div className="space-y-6 min-h-full flex flex-col">
      {/* Tabs */}
      <div className="flex border-b border-neutral-200">
        <button
          onClick={() => setActiveTab("builder")}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            activeTab === "builder"
              ? "border-primary-600 text-primary-600"
              : "border-transparent text-neutral-500 hover:text-neutral-700"
          }`}
        >
          <PenTool className="w-4 h-4 inline mr-2" />
          Question Builder
        </button>
        <button
          onClick={() => setActiveTab("import")}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            activeTab === "import"
              ? "border-primary-600 text-primary-600"
              : "border-transparent text-neutral-500 hover:text-neutral-700"
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 inline mr-2" />
          Import Questions
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 min-h-0">
        {activeTab === "builder" && (
          <QuestionBuilder
            questions={questions}
            onAddQuestion={onAddQuestion}
            onUpdateQuestion={onUpdateQuestion}
            onDeleteQuestion={onDeleteQuestion}
            onReorderQuestions={onReorderQuestions}
            skillType={selectedSkill?.name || "Other"}
          />
        )}

        {activeTab === "import" && (
          <QuestionImport
            onImport={handleImportQuestions}
            skillType={selectedSkill?.name || "Other"}
          />
        )}
      </div>

      {/* Summary Footer */}
      {questions.length > 0 && (
        <div className="mt-auto pt-4 border-t border-neutral-200">
          <div className="bg-gradient-to-r from-secondary-100 to-secondary-200 border border-primary-200 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <PenTool className="w-4 h-4 text-primary-600" />
                  <span className="text-sm font-medium text-neutral-700">
                    Total Questions:
                  </span>
                  <span className="text-sm font-semibold text-primary-900">
                    {questions.length}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-neutral-700">
                    Total Points:
                  </span>
                  <span className="text-sm font-semibold text-green-700">
                    {totalPoints}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


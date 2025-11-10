import { useState, useEffect } from "react";
import type { Question } from "@/pages/Teacher/ClassDetail/Component/Popup/AdvancedAssignmentPopup";

interface Props {
  question: Question;
  answer: any;
  onAnswerChange: (answer: any) => void;
  skillType: string;
}

export default function EssayQuestion({ question, answer, onAnswerChange, skillType }: Props) {
  const [wordCount, setWordCount] = useState(0);
  const isWriting = skillType.toLowerCase().includes("writing");

  useEffect(() => {
    if (answer) {
      const words = String(answer).trim().split(/\s+/).filter(word => word.length > 0);
      setWordCount(words.length);
    } else {
      setWordCount(0);
    }
  }, [answer]);

  const handleChange = (value: string) => {
    onAnswerChange(value);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">{question.question}</h3>
        {isWriting && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700 mb-2">
              <span className="font-medium">Writing Prompt:</span> Write your response to this prompt.
            </p>
            {question.maxLength && (
              <p className="text-xs text-blue-600">
                Word count limit: {question.maxLength} words
              </p>
            )}
          </div>
        )}
        {/* {question.reference && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              <span className="font-medium">Reference:</span> {question.reference}
            </p>
          </div>
        )} */}
      </div>

      <div>
        <textarea
          value={answer || ""}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Write your essay here..."
          className="w-full border border-neutral-300 rounded-md p-3 text-sm min-h-[300px] focus:outline-none focus:ring-1 focus:ring-primary-100"
        />
        <div className="mt-2 flex justify-between items-center">
          <p className="text-xs text-neutral-500">
            {wordCount} word{wordCount !== 1 ? 's' : ''}
            {question.maxLength && ` / ${question.maxLength} words`}
          </p>
          {question.maxLength && wordCount > question.maxLength && (
            <p className="text-xs text-red-600">
              Exceeded word limit by {wordCount - question.maxLength} words
            </p>
          )}
        </div>
      </div>
    </div>
  );
}


import { useState, useEffect } from "react";
import Input from "@/components/ui/Input";
import type { Question } from "@/pages/Teacher/ClassDetail/Component/Popup/AdvancedAssignmentPopup";

interface Props {
  question: Question;
  answer: any;
  onAnswerChange: (answer: any) => void;
  skillType: string;
}

export default function ShortAnswerQuestion({ question, answer, onAnswerChange, skillType }: Props) {
  const [charCount, setCharCount] = useState(0);
  const isSpeaking = skillType.toLowerCase().includes("speaking");

  useEffect(() => {
    if (answer) {
      setCharCount(String(answer).length);
    } else {
      setCharCount(0);
    }
  }, [answer]);

  const handleChange = (value: string) => {
    onAnswerChange(value);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">{question.question}</h3>
        {isSpeaking && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700 mb-2">
              <span className="font-medium">Speaking Prompt:</span> Record your spoken response to this question.
            </p>
            {question.maxLength && (
              <p className="text-xs text-blue-600">
                Time limit: {question.maxLength} seconds
              </p>
            )}
          </div>
        )}
        {question.audioTimestamp && !isSpeaking && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              <span className="font-medium">Audio Timestamp:</span> {question.audioTimestamp}
            </p>
          </div>
        )}
        {question.reference && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              <span className="font-medium">Reference:</span> {question.reference}
            </p>
          </div>
        )}
      </div>

      {isSpeaking ? (
        <div>
          <p className="text-sm text-neutral-600 mb-4">
            Use the recording feature below to record your spoken response.
          </p>
          {/* Audio recording will be handled in the parent component */}
        </div>
      ) : (
        <div>
          <textarea
            value={answer || ""}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Enter your answer here..."
            className="w-full border border-neutral-300 rounded-md p-3 text-sm min-h-[150px] focus:outline-none focus:ring-1 focus:ring-primary-100"
            maxLength={question.maxLength}
          />
          {question.maxLength && (
            <p className="text-xs text-neutral-500 mt-2">
              {charCount} / {question.maxLength} characters
            </p>
          )}
        </div>
      )}
    </div>
  );
}


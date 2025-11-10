import { useState, useEffect } from "react";
import type { Question, QuestionOption } from "@/pages/Teacher/ClassDetail/Component/Popup/AdvancedAssignmentPopup";

interface Props {
  question: Question;
  answer: any;
  onAnswerChange: (answer: any) => void;
  skillType: string;
}

export default function MultipleChoiceQuestion({ question, answer, onAnswerChange, skillType }: Props) {
  const [shuffledOptions, setShuffledOptions] = useState<QuestionOption[]>([]);

  useEffect(() => {
    if (question.options) {
      let options = [...question.options];
      if (question.shuffleOptions) {
        // Shuffle options
        for (let i = options.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [options[i], options[j]] = [options[j], options[i]];
        }
      }
      setShuffledOptions(options);
    }
  }, [question.options, question.shuffleOptions]);

  const handleOptionSelect = (optionId: string) => {
    onAnswerChange(optionId);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">{question.question}</h3>
        {question.audioTimestamp && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              <span className="font-medium">Audio Timestamp:</span> {question.audioTimestamp}
            </p>
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

      <div className="space-y-3">
        {shuffledOptions.map((option) => {
          const isSelected = answer === option.id;
          return (
            <button
              key={option.id}
              onClick={() => handleOptionSelect(option.id)}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                isSelected
                  ? "border-primary-500 bg-primary-50 text-primary-900"
                  : "border-neutral-300 bg-white hover:border-primary-300 hover:bg-primary-25"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  isSelected
                    ? "border-primary-500 bg-primary-500"
                    : "border-neutral-400"
                }`}>
                  {isSelected && (
                    <div className="w-3 h-3 rounded-full bg-white" />
                  )}
                </div>
                <span className="font-medium text-neutral-700">{option.label}.</span>
                <span className="text-neutral-900">{option.text}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}


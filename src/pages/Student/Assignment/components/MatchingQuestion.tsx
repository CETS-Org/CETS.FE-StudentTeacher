import { useState, useEffect } from "react";
import type { Question, MatchingData } from "@/pages/Teacher/ClassDetail/Component/Popup/AdvancedAssignmentPopup";

interface Props {
  question: Question;
  answer: any;
  onAnswerChange: (answer: any) => void;
  skillType: string;
}

interface MatchingAnswer {
  leftId: string;
  rightId: string;
}

export default function MatchingQuestion({ question, answer, onAnswerChange, skillType }: Props) {
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, string>>(answer || {});

  useEffect(() => {
    onAnswerChange(matches);
  }, [matches]);

  const matchingData = question.matching as MatchingData | undefined;

  if (!matchingData) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-700">Matching question data is not available.</p>
      </div>
    );
  }

  const handleLeftClick = (leftId: string) => {
    if (selectedLeft === leftId) {
      setSelectedLeft(null);
    } else {
      setSelectedLeft(leftId);
    }
  };

  const handleRightClick = (rightId: string) => {
    if (selectedLeft) {
      setMatches((prev) => ({
        ...prev,
        [selectedLeft]: rightId,
      }));
      setSelectedLeft(null);
    }
  };

  const handleClearMatch = (leftId: string) => {
    setMatches((prev) => {
      const newMatches = { ...prev };
      delete newMatches[leftId];
      return newMatches;
    });
  };

  const leftColumn = matchingData.leftColumn || [];
  const rightColumn = matchingData.shuffleRightColumn
    ? [...(matchingData.rightColumn || [])].sort(() => Math.random() - 0.5)
    : matchingData.rightColumn || [];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">{question.question}</h3>
        <p className="text-sm text-neutral-600 mb-4">
          Match each item in the left column with the corresponding item in the right column.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-3">
          <h4 className="font-semibold text-neutral-700 mb-3">Column A</h4>
          {leftColumn.map((item) => {
            const matchedRightId = matches[item.id];
            const isSelected = selectedLeft === item.id;
            return (
              <div
                key={item.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  isSelected
                    ? "border-primary-500 bg-primary-50"
                    : matchedRightId
                    ? "border-green-500 bg-green-50"
                    : "border-neutral-300 bg-white hover:border-primary-300"
                }`}
                onClick={() => handleLeftClick(item.id)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-neutral-900">{item.text}</span>
                  {matchedRightId && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClearMatch(item.id);
                      }}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column */}
        <div className="space-y-3">
          <h4 className="font-semibold text-neutral-700 mb-3">Column B</h4>
          {rightColumn.map((item) => {
            const isMatched = Object.values(matches).includes(item.id);
            const isSelected = selectedLeft && matches[selectedLeft] === item.id;
            return (
              <div
                key={item.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  isSelected
                    ? "border-primary-500 bg-primary-50"
                    : isMatched
                    ? "border-green-500 bg-green-50"
                    : "border-neutral-300 bg-white hover:border-primary-300"
                }`}
                onClick={() => selectedLeft && handleRightClick(item.id)}
              >
                <span className="text-neutral-900">{item.text}</span>
              </div>
            );
          })}
        </div>
      </div>

      {selectedLeft && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            Select an item from Column B to match with the selected item from Column A.
          </p>
        </div>
      )}
    </div>
  );
}


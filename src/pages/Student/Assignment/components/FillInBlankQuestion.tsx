import Input from "@/components/ui/input";
import type { Question } from "@/pages/Teacher/ClassDetail/Component/Popup/AdvancedAssignmentPopup";

interface Props {
  question: Question;
  answer: any;
  onAnswerChange: (answer: any) => void;
  skillType: string;
}

export default function FillInBlankQuestion({ question, answer, onAnswerChange, skillType }: Props) {
  const handleChange = (value: string) => {
    onAnswerChange(value);
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

      <div>
        <Input
          label="Your Answer"
          placeholder="Enter your answer here..."
          value={answer || ""}
          onChange={(e) => handleChange(e.target.value)}
        />
        <p className="text-xs text-neutral-500 mt-2">
          Type your answer in the blank space above.
        </p>
      </div>
    </div>
  );
}


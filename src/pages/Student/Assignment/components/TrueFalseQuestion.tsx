import type { Question } from "@/pages/Teacher/ClassDetail/Component/Popup/AdvancedAssignmentPopup";

interface Props {
  question: Question;
  answer: any;
  onAnswerChange: (answer: any) => void;
  skillType: string;
}

export default function TrueFalseQuestion({ question, answer, onAnswerChange, skillType }: Props) {
  const handleSelect = (value: boolean) => {
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

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => handleSelect(true)}
          className={`p-6 rounded-lg border-2 transition-all ${
            answer === true
              ? "border-green-600 bg-green-50 text-green-700"
              : "border-neutral-300 bg-white hover:border-green-300 hover:bg-green-25"
          }`}
        >
          <div className="text-center">
            <div className="text-2xl font-bold mb-2">True</div>
            <div className="text-sm text-neutral-600">Select if the statement is correct</div>
          </div>
        </button>
        <button
          onClick={() => handleSelect(false)}
          className={`p-6 rounded-lg border-2 transition-all ${
            answer === false
              ? "border-red-600 bg-red-50 text-red-700"
              : "border-neutral-300 bg-white hover:border-red-300 hover:bg-red-25"
          }`}
        >
          <div className="text-center">
            <div className="text-2xl font-bold mb-2">False</div>
            <div className="text-sm text-neutral-600">Select if the statement is incorrect</div>
          </div>
        </button>
      </div>
    </div>
  );
}


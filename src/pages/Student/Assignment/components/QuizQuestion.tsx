import type { Question } from "@/pages/Teacher/ClassDetail/Component/Popup/AdvancedAssignmentPopup";
import MultipleChoiceQuestion from "./MultipleChoiceQuestion";
import TrueFalseQuestion from "./TrueFalseQuestion";
import FillInBlankQuestion from "./FillInBlankQuestion";
import ShortAnswerQuestion from "./ShortAnswerQuestion";
import EssayQuestion from "./EssayQuestion";
import MatchingQuestion from "./MatchingQuestion";
import SpeakingQuestion from "./SpeakingQuestion";

interface QuizQuestionProps {
  question: Question;
  answer: any;
  onAnswerChange: (answer: any) => void;
  skillType: string;
}

export default function QuizQuestion({ 
  question, 
  answer, 
  onAnswerChange, 
  skillType 
}: QuizQuestionProps) {
  const commonProps = {
    question,
    answer,
    onAnswerChange,
    skillType,
  };

  switch (question.type) {
    case "multiple_choice":
      return <MultipleChoiceQuestion {...commonProps} />;
    case "true_false":
      return <TrueFalseQuestion {...commonProps} />;
    case "fill_in_the_blank":
      return <FillInBlankQuestion {...commonProps} />;
    case "short_answer":
      return <ShortAnswerQuestion {...commonProps} />;
    case "essay":
      return <EssayQuestion {...commonProps} />;
    case "matching":
      return <MatchingQuestion {...commonProps} />;
    case "speaking":
      return <SpeakingQuestion {...commonProps} />;
    default:
      return <div>Unknown question type</div>;
  }
}


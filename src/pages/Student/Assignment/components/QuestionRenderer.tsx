import { Play, Pause, Headphones } from "lucide-react";
import type { Question } from "@/pages/Teacher/ClassDetail/Component/Popup/AdvancedAssignmentPopup";
import MultipleChoiceQuestion from "./MultipleChoiceQuestion";
import TrueFalseQuestion from "./TrueFalseQuestion";
import FillInBlankQuestion from "./FillInBlankQuestion";
import ShortAnswerQuestion from "./ShortAnswerQuestion";
import EssayQuestion from "./EssayQuestion";
import MatchingQuestion from "./MatchingQuestion";
import SpeakingQuestion from "./SpeakingQuestion";

interface QuestionRendererProps {
  question: Question;
  answer: any;
  onAnswerChange: (answer: any) => void;
  skillType: string;
  questionRecordings?: Record<string, any>;
  allowMultipleRecordings?: boolean;
  maxRecordings?: number;
  onRecordingUpdate?: (questionId: string) => (data: any) => void;
  questionAudioUrl?: string;
  questionAudioPlaying?: Record<string, boolean>;
  toggleQuestionAudio?: (question: Question & { audioUrl?: string }) => void;
  normalizeAudioUrl?: (url: string) => string;
}

/**
 * Renders the appropriate question component based on question type
 * Handles audio player for questions with audio
 */
export default function QuestionRenderer({
  question,
  answer,
  onAnswerChange,
  skillType,
  questionRecordings,
  allowMultipleRecordings,
  maxRecordings,
  onRecordingUpdate,
  questionAudioUrl,
  questionAudioPlaying,
  toggleQuestionAudio,
  normalizeAudioUrl,
}: QuestionRendererProps) {
  const commonProps = {
    question,
    answer,
    onAnswerChange,
    skillType,
  };

  // Render question component based on type
  const renderQuestionComponent = () => {
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
        return (
          <SpeakingQuestion
            {...commonProps}
            onRecordingUpdate={onRecordingUpdate?.(question.id)}
            initialRecordingData={questionRecordings?.[question.id]}
            allowMultipleRecordings={allowMultipleRecordings}
            maxRecordings={maxRecordings}
          />
        );
      default:
        return <div className="text-red-600">Unknown question type: {question.type}</div>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Audio Player for Question */}
      {questionAudioUrl && toggleQuestionAudio && questionAudioPlaying && normalizeAudioUrl && (
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center gap-3">
            <button
              onClick={() => toggleQuestionAudio({ ...question, audioUrl: questionAudioUrl })}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-600 text-white hover:bg-purple-700 transition-colors"
              title={questionAudioPlaying[normalizeAudioUrl(questionAudioUrl) || questionAudioUrl] ? "Pause" : "Play"}
            >
              {questionAudioPlaying[normalizeAudioUrl(questionAudioUrl) || questionAudioUrl] ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
              )}
            </button>
            <div className="flex-1 flex items-center gap-2">
              <Headphones className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-purple-900">
                  {questionAudioPlaying[normalizeAudioUrl(questionAudioUrl) || questionAudioUrl]
                    ? "Playing audio..."
                    : "Click to play audio for this question"}
                </p>
                {question.audioTimestamp && (
                  <p className="text-xs text-purple-600 mt-1">Timestamp: {question.audioTimestamp}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {renderQuestionComponent()}
    </div>
  );
}

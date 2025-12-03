import { Play, Pause, Headphones, X } from "lucide-react";
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
  normalizeAudioUrl?: (url: string | undefined) => string;
  audioPlayCount?: number;
  remainingAudioPlays?: number;
  isAudioDisabled?: boolean;
  maxAudioPlays?: number;
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
  audioPlayCount = 0,
  remainingAudioPlays,
  isAudioDisabled = false,
  maxAudioPlays,
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

  // Chỉ hiển thị audio player cho listening questions
  // Logic:
  // - Nếu skillType có giá trị: chỉ hiển thị khi chứa "listening" (cho PlacementTest)
  // - Nếu skillType null/empty: hiển thị nếu có audio URL (cho StudentAssignmentTaking khi skillName chưa được set)
  const hasSkillType = skillType && skillType.trim() !== "";
  const isListening = hasSkillType ? skillType.toLowerCase().includes("listening") : false;
  const shouldShowAudioPlayer = (hasSkillType ? isListening : true) && !!questionAudioUrl;

  return (
    <div className="space-y-4">
      {/* Audio Player for Question - chỉ hiển thị cho listening */}
      {shouldShowAudioPlayer && questionAudioUrl && (
        <div className={`bg-purple-50 p-4 rounded-lg border ${isAudioDisabled ? 'border-red-300 bg-red-50' : 'border-purple-200'}`}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (!isAudioDisabled && toggleQuestionAudio && questionAudioUrl) {
                  toggleQuestionAudio({ ...question, audioUrl: questionAudioUrl });
                }
              }}
              disabled={isAudioDisabled || !toggleQuestionAudio}
              className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
                isAudioDisabled || !toggleQuestionAudio
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
              title={
                isAudioDisabled
                  ? `Maximum play limit reached (${maxAudioPlays || 2} times)`
                  : !toggleQuestionAudio
                  ? "Audio player not available"
                  : questionAudioPlaying?.[normalizeAudioUrl?.(questionAudioUrl) || questionAudioUrl || '']
                  ? "Pause"
                  : remainingAudioPlays !== undefined
                  ? `Play (${remainingAudioPlays} ${remainingAudioPlays === 1 ? 'time' : 'times'} remaining)`
                  : "Play"
              }
            >
              {isAudioDisabled || !toggleQuestionAudio ? (
                <X className="w-5 h-5" />
              ) : questionAudioPlaying?.[normalizeAudioUrl?.(questionAudioUrl) || questionAudioUrl || ''] ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
              )}
            </button>
            <div className="flex-1 flex items-center gap-2">
              <Headphones className={`w-5 h-5 ${isAudioDisabled ? 'text-red-600' : 'text-purple-600'}`} />
              <div>
                <p className={`text-sm font-medium ${isAudioDisabled ? 'text-red-900' : 'text-purple-900'}`}>
                  {isAudioDisabled
                    ? `Audio play limit reached (${maxAudioPlays || 2}/${maxAudioPlays || 2} times used)`
                    : !toggleQuestionAudio
                    ? "Audio player not available"
                    : questionAudioPlaying?.[normalizeAudioUrl?.(questionAudioUrl) || questionAudioUrl || '']
                    ? "Playing audio..."
                    : remainingAudioPlays !== undefined && remainingAudioPlays > 0
                    ? `Click to play audio (${remainingAudioPlays} ${remainingAudioPlays === 1 ? 'time' : 'times'} remaining)`
                    : "Click to play audio for this question"}
                </p>
                {question.audioTimestamp && (
                  <p className={`text-xs mt-1 ${isAudioDisabled ? 'text-red-600' : 'text-purple-600'}`}>
                    Timestamp: {question.audioTimestamp}
                  </p>
                )}
                {remainingAudioPlays !== undefined && remainingAudioPlays > 0 && !isAudioDisabled && (
                  <p className="text-xs text-purple-600 mt-1">
                    {audioPlayCount > 0 && `Played: ${audioPlayCount}/${maxAudioPlays || 2} times`}
                  </p>
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

import { useState, useEffect, useRef } from "react";
import type { Question } from "@/pages/Teacher/ClassDetail/Component/Popup/AdvancedAssignmentPopup";
import SpeakingAssignment from "./SpeakingAssignment";

interface Recording {
  id: string;
  blobUrl: string;
  duration: number;
  timestamp: Date;
}

interface Props {
  question: Question;
  answer: any;
  onAnswerChange: (answer: any) => void;
  skillType: string;
  onRecordingUpdate?: (data: {
    recordings: Recording[];
    selectedId: string | null;
    recordingTime: number;
    currentBlobUrl: string | null;
  }) => void;
  initialRecordingData?: {
    recordings: Recording[];
    selectedId: string | null;
    recordingTime: number;
    currentBlobUrl: string | null;
  };
  allowMultipleRecordings?: boolean;
  maxRecordings?: number;
}

export default function SpeakingQuestion({ question, answer, onAnswerChange, onRecordingUpdate, initialRecordingData, allowMultipleRecordings = false, maxRecordings = 3 }: Props) {
  const [recordingTime, setRecordingTime] = useState(initialRecordingData?.recordingTime || 0);
  const [recordings, setRecordings] = useState<Recording[]>(initialRecordingData?.recordings || []);
  const [selectedId, setSelectedId] = useState<string | null>(initialRecordingData?.selectedId || null);
  const [currentBlobUrl, setCurrentBlobUrl] = useState<string | null>(initialRecordingData?.currentBlobUrl || answer || null);
  
  const prevQuestionIdRef = useRef<string | undefined>(undefined);

  // Initialize from parent data when question changes
  useEffect(() => {
    const questionChanged = prevQuestionIdRef.current !== question.id;
    prevQuestionIdRef.current = question.id;
    
    if (questionChanged) {
      // Reset to initial data for this question (or empty if no data)
      if (initialRecordingData) {
        setRecordingTime(initialRecordingData.recordingTime || 0);
        setRecordings(initialRecordingData.recordings || []);
        setSelectedId(initialRecordingData.selectedId || null);
        setCurrentBlobUrl(initialRecordingData.currentBlobUrl || answer || null);
      } else {
        // No data for this question, reset to empty
        setRecordingTime(0);
        setRecordings([]);
        setSelectedId(null);
        setCurrentBlobUrl(answer || null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question.id]);

  // Notify parent when recording state changes
  useEffect(() => {
    if (onRecordingUpdate) {
      onRecordingUpdate({
        recordings,
        selectedId,
        recordingTime,
        currentBlobUrl
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recordings, selectedId, recordingTime, currentBlobUrl]);

  const handleRecordingComplete = (blobUrl: string | null) => {
    // Store the blob URL as the answer
    setCurrentBlobUrl(blobUrl);
    onAnswerChange(blobUrl);
  };

  const handleRecordingsUpdate = (updatedRecordings: Recording[], updatedSelectedId: string | null) => {
    setRecordings(updatedRecordings);
    setSelectedId(updatedSelectedId);
  };

  return (
    <div className="space-y-4">
      {/* Question Text - Only show if not empty */}
      {question.question && question.question.trim() !== "" && (
        <div className="mb-4">
          <p className="text-base text-neutral-800">{question.question}</p>
        </div>
      )}
      
      {/* Question Details */}
      {question.explanation && (
        <div className="mb-4 p-4 bg-info-50 border border-info-200 rounded-lg">
          <p className="text-sm text-info-800">
            <span className="font-medium">Explanation:</span> {question.explanation}
          </p>
        </div>
      )}
      {question.audioTimestamp && (
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
      {question.maxLength && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            <span className="font-medium">Time limit:</span> {question.maxLength} seconds
          </p>
        </div>
      )}
      
      {/* Integrated Speaking Assignment Component */}
      <SpeakingAssignment
        key={question.id}
        recordingTime={recordingTime}
        setRecordingTime={setRecordingTime}
        onRecordingComplete={handleRecordingComplete}
        onRecordingsUpdate={handleRecordingsUpdate}
        allowMultipleRecordings={allowMultipleRecordings}
        maxRecordings={maxRecordings}
        questionId={question.id}
        initialRecordings={initialRecordingData?.recordings || []}
        initialSelectedId={initialRecordingData?.selectedId || null}
      />
    </div>
  );
}



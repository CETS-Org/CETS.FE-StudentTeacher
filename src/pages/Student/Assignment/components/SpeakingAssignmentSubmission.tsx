import { getSpeakingSubmissionUploadUrls, submitSpeakingSubmission } from "@/api/assignments.api";
import { uploadJsonToPresignedUrl } from "@/api/file.api";
import type { Question } from "@/pages/Teacher/ClassDetail/Component/Popup/AdvancedAssignmentPopup";

interface QuestionRecording {
  recordings: Array<{ id: string; blobUrl: string; duration: number; timestamp: Date }>;
  selectedId: string | null;
  recordingTime: number;
  currentBlobUrl: string | null;
}

interface SpeakingAssignmentSubmissionProps {
  assignmentId: string;
  studentId: string;
  questions: Question[];
  answers: Record<string, any>;
  questionRecordings: Record<string, QuestionRecording>;
  allowMultipleRecordings: boolean;
  getAudioBlob: (questionId?: string) => Promise<Blob | null>;
  onSuccess: () => void;
  onError: (error: string) => void;
  forceSubmit?: boolean; // When true, bypass validation (e.g., when time is up)
}

/**
 * Handles the submission process for speaking assignments
 * This includes getting presigned URLs, uploading files, and finalizing the submission
 */
export const submitSpeakingAssignment = async ({
  assignmentId,
  studentId,
  questions,
  answers,
  questionRecordings,
  allowMultipleRecordings,
  getAudioBlob,
  onSuccess,
  onError,
  forceSubmit = false,
}: SpeakingAssignmentSubmissionProps): Promise<void> => {
  try {
    // Step 1: Collect audio question IDs
    const audioQuestionIds: string[] = [];
    
    if (questions.length === 0) {
      // Pure speaking assignment
      const pureSpeakingRec = questionRecordings["pure-speaking"];
      if (pureSpeakingRec && (pureSpeakingRec.selectedId || pureSpeakingRec.currentBlobUrl)) {
        audioQuestionIds.push("pure-speaking");
      }
    } else {
      // Speaking questions
      for (const q of questions) {
        if (q.type === "speaking") {
          const rec = questionRecordings[q.id];
          if (rec && (rec.selectedId || rec.currentBlobUrl)) {
            audioQuestionIds.push(q.id);
          }
        }
      }
    }

    // Skip validation if force submitting (e.g., when time is up)
    // Still try to submit what we have, even if incomplete
    if (audioQuestionIds.length === 0 && !forceSubmit) {
      throw new Error("No audio recordings found. Please record your voice before submitting.");
    }
    
    // If force submitting with no recordings, submit with empty audio (answers only)
    if (audioQuestionIds.length === 0 && forceSubmit) {
      console.warn("Force submitting speaking assignment with no recordings (time expired)");
    }

    // Step 2: Get presigned URLs
    // Even with empty audioQuestionIds, we still need to call the API to get the answers JSON upload URL
    const uploadUrlsResponse = await getSpeakingSubmissionUploadUrls(
      assignmentId,
      studentId,
      audioQuestionIds
    );
    const uploadUrls = uploadUrlsResponse.data.data || uploadUrlsResponse.data;

    // Handle both camelCase and PascalCase response formats
    const audioUploadUrls = uploadUrls.audioUploadUrls || uploadUrls.AudioUploadUrls || {};

    // Step 3: Prepare answers JSON
    const answersData = Object.entries(answers).map(([questionId, answer]) => ({
      questionId,
      answer,
      timestamp: new Date().toISOString(),
    }));

    // Add audio file paths to answers
    const audioUrls: Record<string, string> = {};
    for (const questionId of audioQuestionIds) {
      const audioInfo = audioUploadUrls[questionId];
      if (audioInfo) {
        // Handle both camelCase and PascalCase property names
        const filePath = audioInfo.FilePath || audioInfo.filePath;
        if (filePath) {
          audioUrls[questionId] = filePath;
        } else {
          console.warn(`No FilePath found in audioInfo for question ${questionId}`, audioInfo);
        }
      } else {
        console.warn(`No audio upload URL found for question ${questionId}`, {
          questionId,
          availableKeys: Object.keys(audioUploadUrls),
          audioQuestionIds
        });
      }
    }

    // Include question details for better teacher grading experience
    const questionDetails = questions.map(q => ({
      id: q.id,
      question: q.question || '',
      points: q.points || 0,
      type: q.type,
      duration: q.maxDuration,
      instructions: q.instructions || '',
      order: q.order
    })).filter(q => q.question); // Only include questions with actual question text

    const submissionData = {
      submittedAt: new Date().toISOString(),
      answers: answersData,
      audioUrls: audioUrls,
      questions: questionDetails.length > 0 ? questionDetails : undefined
    };

    // Step 4: Upload answers JSON to presigned URL (if available)
    if (uploadUrls.answersJsonUploadUrl) {
      const answersJson = JSON.stringify(submissionData);
      const jsonUploadResponse = await uploadJsonToPresignedUrl(
        uploadUrls.answersJsonUploadUrl,
        answersJson
      );

      if (!jsonUploadResponse.ok) {
        throw new Error(`Failed to upload answers JSON: ${jsonUploadResponse.status}`);
      }
    } else if (forceSubmit) {
      // When force submitting, we still need to submit even if JSON upload URL is not available
      console.warn("No answersJsonUploadUrl available, proceeding with submission");
    }

    // Step 5: Upload audio files to presigned URLs
    for (const questionId of audioQuestionIds) {
      const audioInfo = audioUploadUrls[questionId];
      if (!audioInfo) {
        console.warn(`No audio info found for question ${questionId}, skipping upload`);
        continue;
      }

      const audioBlob = await getAudioBlob(questionId);
      if (!audioBlob) {
        console.warn(`No audio blob found for question ${questionId}, skipping upload`);
        continue;
      }

      // Handle both camelCase and PascalCase property names
      const uploadUrl = audioInfo.UploadUrl || audioInfo.uploadUrl;
      const contentType = audioInfo.ContentType || audioInfo.contentType || "audio/webm";

      if (!uploadUrl) {
        console.warn(`No upload URL found for question ${questionId}`, audioInfo);
        continue;
      }

      // Create a File object from the Blob
      const audioFile = new File([audioBlob], `audio-${questionId}.webm`, { type: contentType });

      const audioUploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': contentType,
        },
        body: audioFile,
      });

      if (!audioUploadResponse.ok) {
        throw new Error(`Failed to upload audio for question ${questionId}: ${audioUploadResponse.status}`);
      }
    }

    // Step 6: Submit speaking assignment
    await submitSpeakingSubmission(
      assignmentId,
      studentId,
      uploadUrls.answersJsonFilePath || "" // Use empty string if null when force submitting
    );

    onSuccess();
  } catch (error: any) {
    console.error("Failed to submit speaking assignment:", error);
    onError(error.response?.data?.message || error.message || "Failed to submit speaking assignment");
    throw error;
  }
};

/**
 * Validates that all required recordings are present before submission
 */
export const validateSpeakingSubmission = (
  questions: Question[],
  questionRecordings: Record<string, QuestionRecording>,
  allowMultipleRecordings: boolean
): { isValid: boolean; errorMessage?: string } => {
  // Handle pure speaking assignments (no questions)
  if (questions.length === 0) {
    const pureSpeakingRec = questionRecordings["pure-speaking"];
    if (!pureSpeakingRec) {
      return {
        isValid: false,
        errorMessage: "Please record your voice before submitting this speaking assignment."
      };
    }
    if (allowMultipleRecordings) {
      if (!pureSpeakingRec.selectedId || pureSpeakingRec.recordings.length === 0) {
        return {
          isValid: false,
          errorMessage: "Please record your voice before submitting this speaking assignment."
        };
      }
    } else {
      if (!pureSpeakingRec.currentBlobUrl) {
        return {
          isValid: false,
          errorMessage: "Please record your voice before submitting this speaking assignment."
        };
      }
    }
    return { isValid: true };
  }

  // Handle speaking questions
  const speakingQuestions = questions.filter(q => q.type === "speaking");
  const missingRecordings = speakingQuestions.filter(q => {
    const rec = questionRecordings[q.id];
    if (!rec) return true;
    if (allowMultipleRecordings) {
      return !rec.selectedId || rec.recordings.length === 0;
    }
    return !rec.currentBlobUrl;
  });
  
  if (missingRecordings.length > 0) {
    return {
      isValid: false,
      errorMessage: `Please record your voice for all speaking questions before submitting. Missing recordings for ${missingRecordings.length} question(s).`
    };
  }

  return { isValid: true };
};


import { getSpeakingSubmissionUploadUrls, submitSpeakingSubmission } from "@/api/assignments.api";
import { uploadJsonToPresignedUrl } from "@/api/file.api";

interface QuestionRecording {
  recordings: Array<{ id: string; blobUrl: string; duration: number; timestamp: Date }>;
  selectedId: string | null;
  recordingTime: number;
  currentBlobUrl: string | null;
}

interface SpeakingAssignmentSubmissionProps {
  assignmentId: string;
  studentId: string;
  questions: Array<{ id: string; type: string }>;
  answers: Record<string, any>;
  questionRecordings: Record<string, QuestionRecording>;
  allowMultipleRecordings: boolean;
  getAudioBlob: (questionId?: string) => Promise<Blob | null>;
  onSuccess: () => void;
  onError: (error: string) => void;
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

    if (audioQuestionIds.length === 0) {
      throw new Error("No audio recordings found. Please record your voice before submitting.");
    }

    // Step 2: Get presigned URLs
    const uploadUrlsResponse = await getSpeakingSubmissionUploadUrls(
      assignmentId,
      studentId,
      audioQuestionIds
    );
    const uploadUrls = uploadUrlsResponse.data.data || uploadUrlsResponse.data;

    // Handle both camelCase and PascalCase response formats
    const audioUploadUrls = uploadUrls.audioUploadUrls || uploadUrls.AudioUploadUrls || {};

    console.log("Upload URLs response:", {
      audioQuestionIds,
      uploadUrls,
      audioUploadUrls,
      responseKeys: Object.keys(uploadUrls)
    });

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

    console.log("Final audioUrls:", audioUrls);

    const submissionData = {
      submittedAt: new Date().toISOString(),
      answers: answersData,
      audioUrls: audioUrls
    };

    // Step 4: Upload answers JSON to presigned URL
    const answersJson = JSON.stringify(submissionData);
    const jsonUploadResponse = await uploadJsonToPresignedUrl(
      uploadUrls.answersJsonUploadUrl,
      answersJson
    );

    if (!jsonUploadResponse.ok) {
      throw new Error(`Failed to upload answers JSON: ${jsonUploadResponse.status}`);
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
      uploadUrls.answersJsonFilePath
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
  questions: Array<{ id: string; type: string }>,
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


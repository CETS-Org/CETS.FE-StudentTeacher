import { useState, useRef } from "react";
import { Upload, FileSpreadsheet, FileText, X, CheckCircle, AlertCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import { useToast } from "@/hooks/useToast";
import type { Question, QuestionOption, SkillType } from "../AdvancedAssignmentPopup";
import * as XLSX from "xlsx";

interface Props {
  onImport: (questions: Question[]) => void;
  skillType: string;
}

interface ImportError {
  row: number;
  message: string;
}

export default function QuestionImport({ onImport, skillType }: Props) {
  const { success, error: showError } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [previewQuestions, setPreviewQuestions] = useState<Question[]>([]);
  const [errors, setErrors] = useState<ImportError[]>([]);
  const [fileName, setFileName] = useState<string>("");

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setImporting(true);
    setErrors([]);
    setPreviewQuestions([]);

    try {
      if (file.name.endsWith(".csv") || file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
        await handleExcelImport(file);
      } else {
        showError("Unsupported file format. Please use CSV or Excel files.");
      }
    } catch (err) {
      console.error("Import error:", err);
      showError("Failed to import questions. Please check the file format.");
    } finally {
      setImporting(false);
    }
  };

  const handleExcelImport = async (file: File) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as any[][];

        if (jsonData.length < 2) {
          showError("File is empty or missing header row");
          return;
        }

        const headers = (jsonData[0] as string[]).map((h) => h?.toString().toLowerCase().trim() || "");
        const questions: Question[] = [];
        const importErrors: ImportError[] = [];

        // Expected columns (flexible matching)
        const questionCol = findColumn(headers, ["question", "question text", "q"]);
        const typeCol = findColumn(headers, ["type", "question type", "qtype"]);
        const optionACol = findColumn(headers, ["option a", "a", "option1"]);
        const optionBCol = findColumn(headers, ["option b", "b", "option2"]);
        const optionCCol = findColumn(headers, ["option c", "c", "option3"]);
        const optionDCol = findColumn(headers, ["option d", "d", "option4"]);
        const answerCol = findColumn(headers, ["answer", "correct answer", "correct", "key"]);
        const pointsCol = findColumn(headers, ["points", "point", "score", "marks"]);
        const explanationCol = findColumn(headers, ["explanation", "explain", "note"]);
        
        // Reading: Passage column
        const passageCol = findColumn(headers, ["passage", "reading passage", "text"]);
        // Listening: Audio column
        const audioCol = findColumn(headers, ["audio", "audio url", "audiourl", "audio file", "sound"]);

        if (questionCol === -1) {
          showError("Could not find 'Question' column in the file");
          return;
        }

        // Track current passage and audio for grouping questions
        let currentPassage = "";
        let currentAudioUrl = "";

        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (!row || row.length === 0) continue;

          const questionText = row[questionCol]?.toString().trim();
          if (!questionText) {
            importErrors.push({ row: i + 1, message: "Missing question text" });
            continue;
          }

          // Reading: Get passage (can be shared across multiple questions)
          // If passage is empty in the row, the question will have no passage
          // If passage has value, update currentPassage and assign to question
          const rowPassage = passageCol !== -1 ? row[passageCol]?.toString().trim() : "";
          let passage: string | undefined = undefined;
          if (rowPassage) {
            // Passage has value - update currentPassage and assign to question
            currentPassage = rowPassage;
            passage = currentPassage;
          }
          // If rowPassage is empty, passage remains undefined (question will have no passage)

          // Listening: Get audio URL (can be shared across multiple questions)
          // If audio is empty, use the previous audio
          const rowAudioUrl = audioCol !== -1 ? row[audioCol]?.toString().trim() : "";
          if (rowAudioUrl) {
            currentAudioUrl = rowAudioUrl;
          }
          const audioUrl = currentAudioUrl;

          const questionType = (row[typeCol]?.toString().toLowerCase().trim() || "multiple_choice")
            .replace(/\s+/g, "_")
            .replace(/[^a-z_]/g, "");

          const points = parseInt(row[pointsCol]?.toString() || "1") || 1;
          const correctAnswer = row[answerCol]?.toString().trim() || "";
          const explanation = row[explanationCol]?.toString().trim() || "";

          let question: Question & { _passage?: string; _audioUrl?: string } = {
            id: `imported-${Date.now()}-${i}`,
            type: questionType as any,
            order: i,
            question: questionText,
            points,
            explanation: explanation || undefined,
            requiresManualGrading: questionType === "essay" || questionType === "short_answer",
          };

          // Store passage and audio URL as temporary fields
          // Only assign passage if it has a value (undefined means no passage)
          if (passage !== undefined && passage) {
            (question as any)._passage = passage;
          }
          if (audioUrl) {
            (question as any)._audioUrl = audioUrl;
            question.reference = audioUrl; // Also store in reference for backward compatibility
          }

          // Handle multiple choice
          if (questionType === "multiple_choice" || questionType === "mc") {
            const options: QuestionOption[] = [];
            const optionLabels = ["A", "B", "C", "D", "E", "F"];

            if (optionACol !== -1 && row[optionACol]) {
              options.push({
                id: `opt-${i}-a`,
                label: optionLabels[0],
                text: row[optionACol].toString().trim(),
              });
            }
            if (optionBCol !== -1 && row[optionBCol]) {
              options.push({
                id: `opt-${i}-b`,
                label: optionLabels[1],
                text: row[optionBCol].toString().trim(),
              });
            }
            if (optionCCol !== -1 && row[optionCCol]) {
              options.push({
                id: `opt-${i}-c`,
                label: optionLabels[2],
                text: row[optionCCol].toString().trim(),
              });
            }
            if (optionDCol !== -1 && row[optionDCol]) {
              options.push({
                id: `opt-${i}-d`,
                label: optionLabels[3],
                text: row[optionDCol].toString().trim(),
              });
            }

            if (options.length < 2) {
              importErrors.push({
                row: i + 1,
                message: "Multiple choice needs at least 2 options",
              });
              continue;
            }

            // Find correct answer option
            let correctOptionId: string | undefined;
            if (correctAnswer) {
              const answerUpper = correctAnswer.toUpperCase().trim();
              const matchingOption = options.find(
                (opt) => opt.label === answerUpper || opt.text.toLowerCase() === correctAnswer.toLowerCase()
              );
              if (matchingOption) {
                correctOptionId = matchingOption.id;
              } else {
                importErrors.push({
                  row: i + 1,
                  message: `Could not find correct answer "${correctAnswer}" in options`,
                });
                continue;
              }
            }

            question.options = options;
            question.correctAnswer = correctOptionId;
          }
          // Handle True/False
          else if (questionType === "true_false" || questionType === "tf") {
            const answerUpper = correctAnswer.toUpperCase().trim();
            if (answerUpper === "TRUE" || answerUpper === "T" || answerUpper === "1") {
              question.correctAnswer = true;
            } else if (answerUpper === "FALSE" || answerUpper === "F" || answerUpper === "0") {
              question.correctAnswer = false;
            } else {
              importErrors.push({
                row: i + 1,
                message: `Invalid answer for True/False. Expected "True" or "False", got "${correctAnswer}"`,
              });
              continue;
            }
          }
          // Handle Fill in the Blank
          else if (questionType === "fill_in_the_blank" || questionType === "fillblank") {
            question.correctAnswer = correctAnswer;
          }
          // Handle Short Answer / Essay
          else if (questionType === "short_answer" || questionType === "essay") {
            question.requiresManualGrading = true;
          }

          questions.push(question);
        }

        if (questions.length === 0) {
          showError("No valid questions found in the file");
          return;
        }

        setPreviewQuestions(questions);
        if (importErrors.length > 0) {
          setErrors(importErrors);
          showError(
            `Imported ${questions.length} questions with ${importErrors.length} error(s). Please review.`
          );
        } else {
          success(`Successfully imported ${questions.length} questions!`);
        }
      } catch (err) {
        console.error("Parse error:", err);
        showError("Failed to parse file. Please check the format.");
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const findColumn = (headers: string[], possibleNames: string[]): number => {
    for (const name of possibleNames) {
      const index = headers.findIndex((h) => h.includes(name));
      if (index !== -1) return index;
    }
    return -1;
  };

  const handleConfirmImport = () => {
    if (previewQuestions.length > 0) {
      onImport(previewQuestions);
      setPreviewQuestions([]);
      setErrors([]);
      setFileName("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      success(`Imported ${previewQuestions.length} questions successfully!`);
    }
  };

  const handleCancelImport = () => {
    setPreviewQuestions([]);
    setErrors([]);
    setFileName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      {/* File Upload Area */}
      <div className="border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center">
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileSelect}
          className="hidden"
          id="question-import-file"
        />
        <label
          htmlFor="question-import-file"
          className="flex flex-col items-center cursor-pointer"
        >
          <FileSpreadsheet className="w-12 h-12 text-neutral-400 mb-4" />
          <span className="text-sm font-medium text-neutral-700 mb-2">
            Click to upload or drag and drop
          </span>
          <span className="text-xs text-neutral-500">
            CSV or Excel files (.csv, .xlsx, .xls)
          </span>
        </label>
        {importing && (
          <div className="mt-4">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
            <p className="text-sm text-neutral-600 mt-2">Processing file...</p>
          </div>
        )}
      </div>

      {/* File Format Guide */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-sm text-blue-800 mb-2">Expected File Format</h4>
        <div className="text-xs text-blue-700 space-y-1">
          <p>
            <strong>Required columns:</strong> Question (or Question Text)
          </p>
          <p>
            <strong>Optional columns:</strong> Type, Option A, Option B, Option C, Option D, Answer
            (or Correct Answer), Points, Explanation
            {skillType.toLowerCase() === "reading" && (
              <>, <strong>Passage</strong> (for reading assignments - can be shared across multiple questions)</>
            )}
            {skillType.toLowerCase() === "listening" && (
              <>, <strong>Audio</strong> (for listening assignments - can be shared across multiple questions)</>
            )}
          </p>
          <p className="mt-2">
            <strong>Question Types:</strong> multiple_choice, true_false, fill_in_the_blank,
            short_answer, essay
          </p>
          {skillType.toLowerCase() === "reading" && (
            <p className="mt-2 text-blue-800">
              <strong>Note:</strong> For Reading assignments, you can add a "Passage" column. 
              If a row has a Passage value, that question will use that passage. 
              If a row has an empty Passage, that question will have no passage (standalone question).
            </p>
          )}
          {skillType.toLowerCase() === "listening" && (
            <p className="mt-2 text-blue-800">
              <strong>Note:</strong> For Listening assignments, you can add an "Audio" column with audio URLs. 
              Multiple questions can share the same audio. If a row has an empty Audio, 
              it will use the audio from the previous row.
            </p>
          )}
        </div>
      </div>

      {/* Preview Questions */}
      {previewQuestions.length > 0 && (
        <div className="border border-neutral-200 rounded-lg p-4 bg-white">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold text-sm">
              Preview ({previewQuestions.length} questions)
            </h4>
            <button
              onClick={handleCancelImport}
              className="text-neutral-500 hover:text-neutral-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto mb-4">
            {previewQuestions.map((q, idx) => (
              <div key={q.id} className="border border-neutral-200 rounded p-3 bg-neutral-50">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-primary-600">Q{idx + 1}</span>
                  <span className="text-xs text-neutral-500">
                    {q.type.replace("_", " ").toUpperCase()}
                  </span>
                  <span className="text-xs text-neutral-500">{q.points} pts</span>
                </div>
                {/* Display Passage for Reading */}
                {(q as any)._passage && skillType.toLowerCase() === "reading" && (
                  <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                    <strong className="text-blue-800">Passage:</strong>
                    <p className="text-blue-700 mt-1 line-clamp-3">{(q as any)._passage}</p>
                  </div>
                )}
                {/* Display Audio URL for Listening */}
                {(q as any)._audioUrl && skillType.toLowerCase() === "listening" && (
                  <div className="mb-2 p-2 bg-purple-50 border border-purple-200 rounded text-xs">
                    <strong className="text-purple-800">Audio:</strong>
                    <p className="text-purple-700 mt-1 break-all">{(q as any)._audioUrl}</p>
                  </div>
                )}
                <p className="text-sm text-neutral-800">{q.question}</p>
                {q.options && q.options.length > 0 && (
                  <div className="ml-4 mt-2 space-y-1">
                    {q.options.map((opt) => (
                      <div
                        key={opt.id}
                        className={`text-xs ${
                          q.correctAnswer === opt.id
                            ? "text-green-600 font-medium"
                            : "text-neutral-600"
                        }`}
                      >
                        {opt.label}. {opt.text}
                        {q.correctAnswer === opt.id && " ✓"}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={handleCancelImport}>
              Cancel
            </Button>
            <Button onClick={handleConfirmImport} iconLeft={<CheckCircle className="w-4 h-4" />}>
              Import {previewQuestions.length} Questions
            </Button>
          </div>
        </div>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <div className="border border-red-200 rounded-lg p-4 bg-red-50">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <h4 className="font-semibold text-sm text-red-800">
              Import Errors ({errors.length})
            </h4>
          </div>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {errors.map((err, idx) => (
              <div key={idx} className="text-xs text-red-700">
                Row {err.row}: {err.message}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sample Template Download */}
      <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
        <h4 className="font-semibold text-sm text-neutral-700 mb-2">Need a template?</h4>
        <p className="text-xs text-neutral-600 mb-3">
          Download our Excel template with example questions to get started.
        </p>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            // Create sample Excel file based on skill type
            let sampleData: any[] = [];
            
            if (skillType.toLowerCase() === "reading") {
              sampleData = [
                {
                  Passage: "Climate change represents one of the most pressing challenges facing humanity. The scientific consensus is clear: Earth's climate is warming at an unprecedented rate, primarily due to human activities.",
                  Question: "What is the main cause of climate change?",
                  Type: "multiple_choice",
                  "Option A": "Natural weather patterns",
                  "Option B": "Human activities",
                  "Option C": "Solar radiation",
                  "Option D": "Ocean currents",
                  Answer: "B",
                  Points: 2,
                  Explanation: "Human activities are the primary cause of climate change.",
                },
                {
                  Passage: "", // Empty passage - this question will have no passage
                  Question: "What is the capital of France?",
                  Type: "multiple_choice",
                  "Option A": "London",
                  "Option B": "Berlin",
                  "Option C": "Paris",
                  "Option D": "Madrid",
                  Answer: "C",
                  Points: 1,
                  Explanation: "Paris is the capital city of France.",
                },
                {
                  Passage: "The quick brown fox jumps over the lazy dog.",
                  Question: "What animal jumps over the dog?",
                  Type: "multiple_choice",
                  "Option A": "Cat",
                  "Option B": "Fox",
                  "Option C": "Rabbit",
                  "Option D": "Bird",
                  Answer: "B",
                  Points: 1,
                  Explanation: "The fox jumps over the lazy dog.",
                },
              ];
            } else if (skillType.toLowerCase() === "listening") {
              sampleData = [
                {
                  Audio: "https://example.com/audio1.mp3",
                  Question: "What is the main topic of the conversation?",
                  Type: "multiple_choice",
                  "Option A": "Weather",
                  "Option B": "Travel plans",
                  "Option C": "Food",
                  "Option D": "Sports",
                  Answer: "B",
                  Points: 2,
                  Explanation: "The conversation is about travel plans.",
                },
                {
                  Audio: "", // Empty audio to indicate shared audio
                  Question: "Where are they planning to go?",
                  Type: "multiple_choice",
                  "Option A": "Paris",
                  "Option B": "London",
                  "Option C": "Tokyo",
                  "Option D": "New York",
                  Answer: "A",
                  Points: 2,
                  Explanation: "They are planning to go to Paris.",
                },
              ];
            } else {
              // Default sample data for other skill types
              sampleData = [
                {
                  Question: "What is the capital of France?",
                  Type: "multiple_choice",
                  "Option A": "London",
                  "Option B": "Berlin",
                  "Option C": "Paris",
                  "Option D": "Madrid",
                  Answer: "C",
                  Points: 2,
                  Explanation: "Paris is the capital city of France.",
                },
                {
                  Question: "The Earth is round.",
                  Type: "true_false",
                  Answer: "True",
                  Points: 1,
                  Explanation: "The Earth is approximately spherical.",
                },
              ];
            }

            const ws = XLSX.utils.json_to_sheet(sampleData);
            
            // Set column widths for better readability
            if (skillType.toLowerCase() === "reading") {
              ws['!cols'] = [
                { wch: 50 }, // Passage
                { wch: 40 }, // Question
                { wch: 15 }, // Type
                { wch: 25 }, // Option A
                { wch: 25 }, // Option B
                { wch: 25 }, // Option C
                { wch: 25 }, // Option D
                { wch: 10 }, // Answer
                { wch: 8 },  // Points
                { wch: 40 }, // Explanation
              ];
            } else if (skillType.toLowerCase() === "listening") {
              ws['!cols'] = [
                { wch: 40 }, // Audio
                { wch: 40 }, // Question
                { wch: 15 }, // Type
                { wch: 25 }, // Option A
                { wch: 25 }, // Option B
                { wch: 25 }, // Option C
                { wch: 25 }, // Option D
                { wch: 10 }, // Answer
                { wch: 8 },  // Points
                { wch: 40 }, // Explanation
              ];
            } else {
              ws['!cols'] = [
                { wch: 40 }, // Question
                { wch: 15 }, // Type
                { wch: 25 }, // Option A
                { wch: 25 }, // Option B
                { wch: 25 }, // Option C
                { wch: 25 }, // Option D
                { wch: 10 }, // Answer
                { wch: 8 },  // Points
                { wch: 40 }, // Explanation
              ];
            }
            
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Questions");
            XLSX.writeFile(wb, `question_template_${skillType.toLowerCase()}.xlsx`);
            success("Template downloaded!");
          }}
          iconLeft={<FileText className="w-4 h-4" />}
        >
          Download Template
        </Button>
      </div>
    </div>
  );
}


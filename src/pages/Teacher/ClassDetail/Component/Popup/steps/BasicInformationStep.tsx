import { X, Upload } from "lucide-react";
import Input from "@/components/ui/input";
import Select from "@/components/ui/Select";
import type { Skill } from "../AdvancedAssignmentPopup";

interface BasicInformationStepProps {
  title: string;
  onTitleChange: (value: string) => void;
  description: string;
  onDescriptionChange: (value: string) => void;
  dueDate: string;
  onDueDateChange: (value: string) => void;
  selectedSkillId: string | null;
  onSkillChange: (value: string | null) => void;
  assignmentType: string;
  onAssignmentTypeChange: (value: string) => void;
  skills: Skill[];
  loadingSkills: boolean;
  files: File[];
  onFilesChange: (files: File[]) => void;
  getMinDateTime: () => string;
}

export default function BasicInformationStep({
  title,
  onTitleChange,
  description,
  onDescriptionChange,
  dueDate,
  onDueDateChange,
  selectedSkillId,
  onSkillChange,
  assignmentType,
  onAssignmentTypeChange,
  skills,
  loadingSkills,
  files,
  onFilesChange,
  getMinDateTime,
}: BasicInformationStepProps) {
  
  // Check if this is a speaking assignment
  const isSpeakingAssignment = skills.find(s => s.lookUpId === selectedSkillId)?.name === "Speaking";
  return (
    <div className="space-y-6 min-h-full">
      <div>
        <Input
          label={
            <>
              Assignment Title <span className="text-red-500">*</span>
            </>
          }
          placeholder="e.g., Unit 3 Listening Comprehension"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          required
        />
      </div>

      <div>
        <Select
          label={
            <>
              Skill <span className="text-red-500">*</span>
            </>
          }
          value={selectedSkillId || ""}
          onChange={(e) => onSkillChange(e.target.value || null)}
          options={skills?.map((skill) => ({
            value: skill.lookUpId,
            label: skill.name,
          })) || []}
          placeholder="Select a skill..."
          loading={loadingSkills}
          loadingText="Loading skills..."
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Assignment Type <span className="text-red-500">*</span>
        </label>
        <Select
          value={assignmentType}
          onChange={(e) => onAssignmentTypeChange(e.target.value)}
          options={[
            { value: "Homework", label: "Homework" },
            { value: "Quiz", label: "Quiz" },
          ]}
          required
        />
        <p className="text-xs text-neutral-500 mt-1">
          {assignmentType === "Homework" 
            ? "Students will submit files for this assignment" 
            : "Students will take a test with questions for this assignment"}
        </p>
      </div>

      <div>
        <Input
          label={
            <>
              Due Date & Time <span className="text-red-500">*</span>
            </>
          }
          type="datetime-local"
          value={dueDate}
          onChange={(e) => onDueDateChange(e.target.value)}
          min={getMinDateTime()}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Instructions / Description
        </label>
        <textarea
          placeholder="Provide detailed instructions for students..."
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          className="w-full border border-neutral-300 rounded-md p-3 text-sm min-h-[120px] focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* File Upload - Required for Homework, Hidden for Quiz */}
      {assignmentType === "Homework" && (
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Attachments <span className="text-red-500">*</span>
          </label>
        <div className="border-2 border-dashed border-neutral-300 rounded-lg p-4">
          <input
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.xlsx,.zip,.rar,image/*,video/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/zip,application/x-rar-compressed"
            onChange={(e) => {
              if (e.target.files) {
                onFilesChange(Array.from(e.target.files));
              }
            }}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="flex flex-col items-center cursor-pointer"
          >
            <Upload className="w-8 h-8 text-neutral-400 mb-2" />
            <span className="text-sm text-neutral-600">
              Click to upload or drag and drop
            </span>
            <span className="text-xs text-neutral-500 mt-1">
              PDF, DOC, DOCX, XLSX, ZIP, RAR, Images, Videos (Max 50MB)
            </span>
          </label>
          {files.length > 0 && (
            <div className="mt-4 space-y-2">
              {files.map((file, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-neutral-50 rounded">
                  <span className="text-sm text-neutral-700">{file.name}</span>
                  <button
                    onClick={() => onFilesChange(files.filter((_, i) => i !== idx))}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        </div>
      )}
    </div>
  );
}


import React, { useState } from "react";
import Button from "@/components/ui/Button";
import { 
  Star,
  User,
  BookOpen,
  X,
  Loader2,
  CheckCircle2
} from "lucide-react";
import { feedbackApi } from "@/api/feedback.api";
import { getUserInfo } from "@/lib/utils";
import type { FeedbackCourse as Course } from "@/types/course";

interface CourseFeedbackData {
  overallRating: number;
  contentClarity: "excellent" | "good" | "average" | "poor" | "";
  courseRelevance: "highly_relevant" | "somewhat_relevant" | "not_very_relevant" | "";
  materialsQuality: "excellent" | "good" | "average" | "poor" | "";
  additionalComments: string;
}

interface TeacherFeedbackData {
  overallRating: number;
  teachingEffectiveness: "excellent" | "good" | "average" | "poor" | "";
  communicationSkills: "excellent" | "good" | "average" | "poor" | "";
  teacherSupportiveness: "very_supportive" | "supportive" | "somewhat_supportive" | "not_supportive" | "";
  additionalComments: string;
}

interface FeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: Course | null;
  onComplete: () => void;
}

// Rating component
const StarRating: React.FC<{
  rating: number;
  onRatingChange: (rating: number) => void;
  size?: "sm" | "md";
}> = ({ rating, onRatingChange, size = "md" }) => {
  const starSize = size === "sm" ? "w-4 h-4" : "w-6 h-6";
  
  return (
    <div className="flex gap-1 p-2 bg-yellow-25 rounded-lg border border-yellow-200 w-fit">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onRatingChange(star)}
          className="focus:outline-none hover:scale-110 transition-transform"
        >
          <Star
            className={`${starSize} ${
              star <= rating
                ? "fill-yellow-400 text-yellow-500 drop-shadow-sm"
                : "text-neutral-300 hover:text-yellow-300"
            } transition-all duration-200`}
          />
        </button>
      ))}
    </div>
  );
};

// Radio group component
const RadioGroup: React.FC<{
  name: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}> = ({ name, options, value, onChange }) => {
  const getOptionColor = (optionValue: string) => {
    switch (optionValue) {
      case "excellent":
      case "very_supportive":
      case "highly_relevant":
        return "border-green-200 bg-green-25 text-green-800 hover:bg-green-50";
      case "good":
      case "supportive":
      case "somewhat_relevant":
        return "border-blue-200 bg-blue-25 text-blue-800 hover:bg-blue-50";
      case "average":
      case "somewhat_supportive":
        return "border-yellow-200 bg-yellow-25 text-yellow-800 hover:bg-yellow-50";
      case "poor":
      case "not_supportive":
      case "not_very_relevant":
        return "border-red-200 bg-red-25 text-red-800 hover:bg-red-50";
      default:
        return "border-neutral-200 bg-neutral-25 text-neutral-700 hover:bg-neutral-50";
    }
  };

  return (
    <div className="space-y-3">
      {options.map((option) => (
        <label 
          key={option.value} 
          className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
            value === option.value 
              ? `${getOptionColor(option.value)} ring-2 ring-primary-200 shadow-sm` 
              : "border-neutral-200 bg-white hover:bg-neutral-25"
          }`}
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={(e) => onChange(e.target.value)}
            className="w-5 h-5 text-primary-500 border-neutral-300 focus:ring-primary-500"
          />
          <span className={`text-sm font-medium ${
            value === option.value ? "" : "text-neutral-700"
          }`}>
            {option.label}
          </span>
        </label>
      ))}
    </div>
  );
};

export default function FeedbackDialog({ open, onOpenChange, course, onComplete }: FeedbackDialogProps) {
  const [step, setStep] = useState<"course" | "teacher">("course");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [courseFeedbackData, setCourseFeedbackData] = useState<CourseFeedbackData>({
    overallRating: 0,
    contentClarity: "",
    courseRelevance: "",
    materialsQuality: "",
    additionalComments: ""
  });
  const [teacherFeedbackData, setTeacherFeedbackData] = useState<TeacherFeedbackData>({
    overallRating: 0,
    teachingEffectiveness: "",
    communicationSkills: "",
    teacherSupportiveness: "",
    additionalComments: ""
  });

  const handleCourseFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Course feedback:", courseFeedbackData);
    setStep("teacher");
  };

  const handleTeacherFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const userInfo = getUserInfo();
      if (!userInfo?.id) {
        throw new Error("User not authenticated");
      }

      if (!course?.id) {
        throw new Error("Course information is missing");
      }

      // Check if teacher is assigned
      const hasTeacher = course?.teacherId && course.teacherId.trim() !== "";

      // Submit combined feedback
      const result = await feedbackApi.createCombined({
        submitterID: userInfo.id,
        courseID: course.id,
        teacherID: hasTeacher ? course.teacherId : "00000000-0000-0000-0000-000000000000", // Use dummy GUID if no teacher
        courseFeedback: {
          rating: courseFeedbackData.overallRating || undefined,
          comment: courseFeedbackData.additionalComments || undefined,
          contentClarity: courseFeedbackData.contentClarity || undefined,
          courseRelevance: courseFeedbackData.courseRelevance || undefined,
          materialsQuality: courseFeedbackData.materialsQuality || undefined,
        },
        teacherFeedback: hasTeacher ? {
          rating: teacherFeedbackData.overallRating || undefined,
          comment: teacherFeedbackData.additionalComments || undefined,
          teachingEffectiveness: teacherFeedbackData.teachingEffectiveness || undefined,
          communicationSkills: teacherFeedbackData.communicationSkills || undefined,
          teacherSupportiveness: teacherFeedbackData.teacherSupportiveness || undefined,
        } : undefined, // Skip teacher feedback if no teacher assigned
      });

      if (!result.success) {
        throw new Error(result.message || "Failed to submit feedback");
      }

      // Reset forms
      setStep("course");
      setCourseFeedbackData({
        overallRating: 0,
        contentClarity: "",
        courseRelevance: "",
        materialsQuality: "",
        additionalComments: ""
      });
      setTeacherFeedbackData({
        overallRating: 0,
        teachingEffectiveness: "",
        communicationSkills: "",
        teacherSupportiveness: "",
        additionalComments: ""
      });
      onComplete();
      onOpenChange(false);
    } catch (err: any) {
      console.error("Failed to submit feedback:", err);
      setError(err.message || "Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep("course");
    setError(null);
    onOpenChange(false);
  };

  if (!open || !course) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity"
          onClick={handleClose}
        />
        
        {/* Dialog Content */}
        <div className="inline-block w-200 mx-8 p-0 my-8 text-left align-middle transition-all transform bg-white shadow-xl rounded-lg relative z-10 max-h-[90vh] overflow-y-auto">
          {step === "course" ? (
            // Course Feedback Form
            <div>
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b  bg-gradient-to-r ">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center shadow-md">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-primary-800">Course Feedback</h3>
                    <p className="text-sm text-accent-600">Step 1 of 2</p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-red-100 rounded-lg transition-colors border border-transparent hover:border-red-200"
                >
                  <X className="w-4 h-4 text-red-500" />
                </button>
              </div>

              {/* Course Info */}
              <div className="p-6 border-b border-neutral-200 bg-gradient-to-r from-blue-25 to-blue-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-800">{course.title}</h4>
                    <p className="text-sm text-blue-600">Instructor: {course.instructor}</p>
                  </div>
                </div>
              </div>

              {/* Form Content */}
              <form onSubmit={handleCourseFeedbackSubmit} className="p-6 space-y-6">
                {/* Overall Course Rating */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Overall Course Rating
                  </label>
                  <StarRating
                    rating={courseFeedbackData.overallRating}
                    onRatingChange={(rating) =>
                      setCourseFeedbackData({ ...courseFeedbackData, overallRating: rating })
                    }
                  />
                </div>

                {/* Course Content Clarity */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-3">
                    Course Content Clarity
                  </label>
                  <RadioGroup
                    name="contentClarity"
                    options={[
                      { value: "excellent", label: "Excellent" },
                      { value: "good", label: "Good" },
                      { value: "average", label: "Average" },
                      { value: "poor", label: "Poor" }
                    ]}
                    value={courseFeedbackData.contentClarity}
                    onChange={(value) =>
                      setCourseFeedbackData({ ...courseFeedbackData, contentClarity: value as any })
                    }
                  />
                </div>

                {/* Course Relevance */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-3">
                    Course Relevance
                  </label>
                  <RadioGroup
                    name="courseRelevance"
                    options={[
                      { value: "highly_relevant", label: "Highly Relevant" },
                      { value: "somewhat_relevant", label: "Somewhat Relevant" },
                      { value: "not_very_relevant", label: "Not Very Relevant" }
                    ]}
                    value={courseFeedbackData.courseRelevance}
                    onChange={(value) =>
                      setCourseFeedbackData({ ...courseFeedbackData, courseRelevance: value as any })
                    }
                  />
                </div>

                {/* Course Materials Quality */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-3">
                    Course Materials Quality
                  </label>
                  <RadioGroup
                    name="materialsQuality"
                    options={[
                      { value: "excellent", label: "Excellent" },
                      { value: "good", label: "Good" },
                      { value: "average", label: "Average" },
                      { value: "poor", label: "Poor" }
                    ]}
                    value={courseFeedbackData.materialsQuality}
                    onChange={(value) =>
                      setCourseFeedbackData({ ...courseFeedbackData, materialsQuality: value as any })
                    }
                  />
                </div>

                {/* Additional Comments */}
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    Additional Comments
                  </label>
                  <textarea
                    value={courseFeedbackData.additionalComments}
                    onChange={(e) =>
                      setCourseFeedbackData({ ...courseFeedbackData, additionalComments: e.target.value })
                    }
                    placeholder="Share your thoughts about the course content, structure, or any suggestions..."
                    className="w-full p-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none text-primary-800 placeholder-primary-400"
                    rows={4}
                  />
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-accent-200">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleClose}
                    className="border-neutral-300 hover:bg-neutral-100"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    className="btn-primary px-8"
                  >
                    Next Step →
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            // Teacher Feedback Form
            <div>
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-purple-800">Teacher Feedback</h3>
                    <p className="text-sm text-purple-600">Step 2 of 2</p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-red-100 rounded-lg transition-colors border border-transparent hover:border-red-200"
                >
                  <X className="w-4 h-4 text-red-500" />
                </button>
              </div>

              {/* Course Info */}
              <div className="p-6 border-b border-neutral-200 bg-gradient-to-r from-purple-25 to-purple-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-purple-800">{course.title}</h4>
                    <p className="text-sm text-purple-600">Instructor: {course.instructor}</p>
                  </div>
                </div>
              </div>

              {/* Form Content */}
              <form onSubmit={handleTeacherFeedbackSubmit} className="p-6 space-y-6">
                {/* Overall Teacher Rating */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Overall Teacher Rating
                  </label>
                  <StarRating
                    rating={teacherFeedbackData.overallRating}
                    onRatingChange={(rating) =>
                      setTeacherFeedbackData({ ...teacherFeedbackData, overallRating: rating })
                    }
                  />
                </div>

                {/* Teaching Effectiveness */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-3">
                    Teaching Effectiveness
                  </label>
                  <RadioGroup
                    name="teachingEffectiveness"
                    options={[
                      { value: "excellent", label: "Excellent" },
                      { value: "good", label: "Good" },
                      { value: "average", label: "Average" },
                      { value: "poor", label: "Poor" }
                    ]}
                    value={teacherFeedbackData.teachingEffectiveness}
                    onChange={(value) =>
                      setTeacherFeedbackData({ ...teacherFeedbackData, teachingEffectiveness: value as any })
                    }
                  />
                </div>

                {/* Communication Skills */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-3">
                    Communication Skills
                  </label>
                  <RadioGroup
                    name="communicationSkills"
                    options={[
                      { value: "excellent", label: "Excellent" },
                      { value: "good", label: "Good" },
                      { value: "average", label: "Average" },
                      { value: "poor", label: "Poor" }
                    ]}
                    value={teacherFeedbackData.communicationSkills}
                    onChange={(value) =>
                      setTeacherFeedbackData({ ...teacherFeedbackData, communicationSkills: value as any })
                    }
                  />
                </div>

                {/* Teacher Supportiveness */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-3">
                    Teacher Supportiveness
                  </label>
                  <RadioGroup
                    name="teacherSupportiveness"
                    options={[
                      { value: "very_supportive", label: "Very Supportive" },
                      { value: "supportive", label: "Supportive" },
                      { value: "somewhat_supportive", label: "Somewhat Supportive" },
                      { value: "not_supportive", label: "Not Supportive" }
                    ]}
                    value={teacherFeedbackData.teacherSupportiveness}
                    onChange={(value) =>
                      setTeacherFeedbackData({ ...teacherFeedbackData, teacherSupportiveness: value as any })
                    }
                  />
                </div>

                {/* Additional Comments */}
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    Additional Comments
                  </label>
                  <textarea
                    value={teacherFeedbackData.additionalComments}
                    onChange={(e) =>
                      setTeacherFeedbackData({ ...teacherFeedbackData, additionalComments: e.target.value })
                    }
                    placeholder="Share your thoughts about the teacher's performance, teaching style, or any suggestions..."
                    className="w-full p-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none text-primary-800 placeholder-primary-400"
                    rows={4}
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                {/* Footer Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-accent-200">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setStep("course")}
                    disabled={isSubmitting}
                    className="border-neutral-300 hover:bg-neutral-100"
                  >
                    ← Back
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isSubmitting}
                    className="btn-secondary px-8 flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Submit Feedback
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
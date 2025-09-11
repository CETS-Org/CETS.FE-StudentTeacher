import React, { useState } from "react";
import Button from "@/components/ui/Button";
import { 
  Star,
  User,
  BookOpen,
  X
} from "lucide-react";

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
  const starSize = size === "sm" ? "w-4 h-4" : "w-5 h-5";
  
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onRatingChange(star)}
          className="focus:outline-none"
        >
          <Star
            className={`${starSize} ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-neutral-300"
            } hover:text-yellow-400 transition-colors`}
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
  return (
    <div className="space-y-2">
      {options.map((option) => (
        <label key={option.value} className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={(e) => onChange(e.target.value)}
            className="w-4 h-4 text-primary-500 border-neutral-300 focus:ring-primary-500"
          />
          <span className="text-sm text-neutral-700">{option.label}</span>
        </label>
      ))}
    </div>
  );
};

export default function FeedbackDialog({ open, onOpenChange, course, onComplete }: FeedbackDialogProps) {
  const [step, setStep] = useState<"course" | "teacher">("course");
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

  const handleTeacherFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Teacher feedback:", teacherFeedbackData);
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
  };

  const handleClose = () => {
    setStep("course");
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
        <div className="inline-block w-200 mx-8 p-0 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg relative z-10 max-h-screen">
          {step === "course" ? (
            // Course Feedback Form
            <div>
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-neutral-200">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary-500" />
                  <h3 className="text-lg font-semibold text-neutral-900">Course Feedback</h3>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-neutral-100 rounded-md transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Course Info */}
              <div className="p-6 border-b border-neutral-200">
                <h4 className="font-medium text-neutral-900">{course.title}</h4>
                <p className="text-sm text-neutral-600">Instructor: {course.instructor}</p>
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
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Additional Comments
                  </label>
                  <textarea
                    value={courseFeedbackData.additionalComments}
                    onChange={(e) =>
                      setCourseFeedbackData({ ...courseFeedbackData, additionalComments: e.target.value })
                    }
                    placeholder="Share your thoughts about the course content, structure, or any suggestions..."
                    className="w-full p-3 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                    rows={4}
                  />
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleClose}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    className="bg-neutral-900 hover:bg-neutral-800 text-white px-8"
                  >
                    Next Page
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            // Teacher Feedback Form
            <div>
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-neutral-200">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-primary-500" />
                  <h3 className="text-lg font-semibold text-neutral-900">Teacher Feedback</h3>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-neutral-100 rounded-md transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Course Info */}
              <div className="p-6 border-b border-neutral-200">
                <h4 className="font-medium text-neutral-900">{course.title}</h4>
                <p className="text-sm text-neutral-600">Instructor: {course.instructor}</p>
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
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Additional Comments
                  </label>
                  <textarea
                    value={teacherFeedbackData.additionalComments}
                    onChange={(e) =>
                      setTeacherFeedbackData({ ...teacherFeedbackData, additionalComments: e.target.value })
                    }
                    placeholder="Share your thoughts about the teacher's performance, teaching style, or any suggestions..."
                    className="w-full p-3 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                    rows={4}
                  />
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setStep("course")}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    className="bg-neutral-900 hover:bg-neutral-800 text-white px-8"
                  >
                    Submit Teacher Feedback
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
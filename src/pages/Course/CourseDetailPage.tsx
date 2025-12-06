import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Button from "@/components/ui/Button";
import Loader from "@/components/ui/Loader";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import CourseDetail from "./CourseDetail";
import { api } from "@/api";
import type { Course, CourseSyllabus, SyllabusItem } from "@/types/course";

type RawSyllabusItem = Record<string, any>;
type RawSyllabus = Record<string, any>;

const mapSyllabusItem = (
  item: RawSyllabusItem,
  index: number,
  parentId?: string
): SyllabusItem => {
  const fallbackPrefix = parentId ? `${parentId}-item` : "syllabus-item";
  const resolvedId = item.id || item.syllabusItemID || `${fallbackPrefix}-${index}`;
  const parsedSession = Number(item.sessionNumber);
  const sessionNumber = Number.isFinite(parsedSession) ? parsedSession : index + 1;

  return {
    id: String(resolvedId),
    sessionNumber,
    topicTitle: (item.topicTitle || item.title || `Session ${sessionNumber}`) as string,
    totalSlots: typeof item.totalSlots === "number" ? item.totalSlots : undefined,
    required: item.required !== undefined ? Boolean(item.required) : true,
    objectives: typeof item.objectives === "string" ? item.objectives : undefined,
    contentSummary: typeof item.contentSummary === "string" ? item.contentSummary : undefined,
    preReadingUrl: ((item.preReadingUrl ?? item.preReadingURL) as string | null | undefined) ?? null,
  };
};

const mapStructuredSyllabi = (data: Record<string, any>): CourseSyllabus[] => {
  if (!Array.isArray(data?.syllabi)) {
    return [];
  }

  return (data.syllabi as RawSyllabus[]).map((syllabus, sectionIndex) => {
    const sectionId = String(syllabus.syllabusID || syllabus.id || `syllabus-${sectionIndex}`);

    return {
      id: sectionId,
      syllabusID: syllabus.syllabusID ?? undefined,
      courseID: syllabus.courseID ?? undefined,
      title: (syllabus.title || `Section ${sectionIndex + 1}`) as string,
      description: (syllabus.description ?? null) as string | null,
      items: Array.isArray(syllabus.items)
        ? (syllabus.items as RawSyllabusItem[]).map((item, itemIndex) =>
            mapSyllabusItem(item, itemIndex, sectionId)
          )
        : [],
    };
  });
};

export default function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId) {
      setError("Course ID not provided");
      setLoading(false);
      return;
    }

    const fetchCourseDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await api.getCourseDetail(courseId);
        const data = response.data;
        const structuredSyllabi = mapStructuredSyllabi(data);
        
        // Map the API response to our Course interface
        const mappedCourse: Course = {
          ...data,
          courseImageUrl: data.courseImageUrl || "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=250&fit=crop",
          courseLevel: data.courseLevel || "Beginner",
          startDate: data.startDate,
          enrolledCount: data.enrolledCount,
          syllabusItems: Array.isArray(data.syllabusItems) ? data.syllabusItems : undefined,
          syllabi: structuredSyllabi,
          benefits: data.benefits || [],
          requirements: data.requirements || [],
          teacherDetails: data.teacherDetails || [],
          feedbacks: Array.isArray(data.courseFeedbacks) 
            ? data.courseFeedbacks.map((feedback: any) => ({
                id: feedback.feedbackId || feedback.id,
                studentName: feedback.submitterName || "Anonymous",
                studentAvatar: undefined,
                rating: feedback.rating || 0,
                comment: feedback.comment || "",
                date: feedback.createdAt ? new Date(feedback.createdAt).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric' 
                }) : "",
                isVerified: true
              }))
            : []
        };
        
        setCourse(mappedCourse);
      } catch (err: any) {
        console.error('Failed to fetch course details:', err);
        
        // Handle axios errors
        if (err.response) {
          setError(`Failed to load course details. Status: ${err.response.status}`);
        } else if (err.request) {
          setError('Network error. Please check your connection.');
        } else {
          setError('Failed to load course details. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetail();
  }, [courseId]);

  const handleGoBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex justify-center items-center py-20">
          <Loader />
          <span className="ml-3 text-gray-600">Loading course details...</span>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-20">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Course Not Found</h1>
            <p className="text-gray-600 mb-8">{error || "The course you're looking for doesn't exist."}</p>
            <Button 
              onClick={handleGoBack}
              variant="secondary"
              iconLeft={<ArrowLeft className="w-4 h-4" />}
            >
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: "Home", to: "/" },
    { label: "Courses", to: "/courses" },
    { label: course.courseName }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumbs items={breadcrumbItems} />
        </div>
      </div>
      
      {/* Course Detail Component */}
      <CourseDetail course={course} />
    </div>
  );
}

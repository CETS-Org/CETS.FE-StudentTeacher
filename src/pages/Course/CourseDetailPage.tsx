import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Button from "@/components/ui/Button";
import Loader from "@/components/ui/Loader";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import CourseDetail from "./CourseDetail";
import { getCourseDetailApiUrl } from "@/lib/config";
import type { Course } from "@/types/course";

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
        
        const response = await fetch(getCourseDetailApiUrl(courseId));
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Map the API response to our Course interface
        const mappedCourse: Course = {
          ...data,
          courseImageUrl: data.courseImageUrl || "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=250&fit=crop",
          courseLevel: data.courseLevel || "Beginner",
          syllabusItems: data.syllabusItems ? 
            data.syllabusItems.map((item: Record<string, unknown>) => ({
              id: (item.id ) as string,
              sessionNumber: (item.sessionNumber || 1) as number,
              topicTitle: (item.topicTitle || "Untitled Topic") as string,
              estimatedMinutes: item.estimatedMinutes as number | undefined,
              required: item.required !== undefined ? item.required as boolean : true,
              objectives: item.objectives as string | undefined,
              contentSummary: item.contentSummary as string | undefined,
              preReadingUrl: item.preReadingUrl as string | null | undefined
            })) : [],
          benefits: data.benefits || [],
          requirements: data.requirements || [],
          teacherDetail: data.teacherDetail || undefined
        };
        
        setCourse(mappedCourse);
      } catch (err) {
        console.error('Failed to fetch course details:', err);
        setError('Failed to load course details. Please try again later.');   
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
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50">
        <div className="flex justify-center items-center py-20">
          <Loader />
          <span className="ml-3 text-gray-600">Loading course details...</span>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50">
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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50">
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

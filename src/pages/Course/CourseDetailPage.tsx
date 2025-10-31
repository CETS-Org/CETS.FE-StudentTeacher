import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Button from "@/components/ui/Button";
import Loader from "@/components/ui/Loader";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import CourseDetail from "./CourseDetail";
import { api } from "@/api";
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
        
        const response = await api.getCourseDetail(courseId);
        const data = response.data;
        
        // Map the API response to our Course interface
        const mappedCourse: Course = {
          ...data,
          courseImageUrl: data.courseImageUrl || "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=250&fit=crop",
          courseLevel: data.courseLevel || "Beginner",
          startDate: data.startDate,
          enrolledCount: data.enrolledCount,
          syllabusItems: data.syllabusItems ? 
            data.syllabusItems.map((item: Record<string, unknown>) => ({
              id: (item.id ) as string,
              sessionNumber: (item.sessionNumber || 1) as number,
              topicTitle: (item.topicTitle || "Untitled Topic") as string,
              totalSlots: item.totalSlots as number | undefined,
              required: item.required !== undefined ? item.required as boolean : true,
              objectives: item.objectives as string | undefined,
              contentSummary: item.contentSummary as string | undefined,
              preReadingUrl: item.preReadingUrl as string | null | undefined
            })) : [],
          benefits: data.benefits || [],
          requirements: data.requirements || [],
          teacherDetails: data.teacherDetails || [],
          feedbacks: [
            {
              id: "1",
              studentName: "Sarah Johnson",
              studentAvatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
              rating: 5,
              comment: "This course exceeded my expectations! The instructor's teaching style is engaging and the content is well-structured. I learned so much and feel confident applying these skills in real projects.",
              date: "2 weeks ago",
              isVerified: true
            },
            {
              id: "2",
              studentName: "Michael Chen",
              rating: 4,
              comment: "Great course overall. The practical examples really helped me understand the concepts better. Would recommend to anyone looking to improve their skills in this area.",
              date: "1 month ago",
              isVerified: true
            },
            {
              id: "3",
              studentName: "Emily Rodriguez",
              studentAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
              rating: 5,
              comment: "Absolutely fantastic! The step-by-step approach made complex topics easy to understand. The assignments were challenging but fair, and the feedback was constructive.",
              date: "3 weeks ago",
              isVerified: true
            },
            {
              id: "4",
              studentName: "David Kim",
              rating: 4,
              comment: "Solid course with good content. The instructor is knowledgeable and explains things clearly. The pace was perfect for me as a beginner.",
              date: "1 week ago",
              isVerified: false
            },
            {
              id: "5",
              studentName: "Lisa Thompson",
              studentAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
              rating: 5,
              comment: "One of the best online courses I've taken! The material is up-to-date, relevant, and presented in an engaging way. Definitely worth the investment.",
              date: "2 days ago",
              isVerified: true
            },
            {
              id: "6",
              studentName: "James Wilson",
              rating: 4,
              comment: "Very informative course. I appreciated the real-world examples and practical exercises. The community support was also excellent.",
              date: "5 days ago",
              isVerified: true
            }
          ]
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

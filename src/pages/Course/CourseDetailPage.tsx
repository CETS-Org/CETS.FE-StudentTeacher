import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Button from "@/components/ui/Button";
import Loader from "@/components/ui/Loader";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import CourseDetail from "./CourseDetail";
import { getCourseDetailApiUrl } from "@/lib/config";

interface Course {
  id: string;
  courseName: string;
  description: string;
  teacher: string;
  duration: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  price: number;
  rating: number;
  studentsCount: number;
  image: string;
  category: string;
  features: string[]; 
  isPopular?: boolean;
  isNew?: boolean;
  detailedDescription?: string;
  curriculum?: string[];
  requirements?: string[];
  whatYouWillLearn?: string[];
  teacherBio?: string;
  teacherImage?: string;
  teacherRating?: number;
  teacherStudents?: number;
  teacherCourses?: number;
}

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
          image: data.image || "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=250&fit=crop",
          teacher: data.teacher || "Unknown teacher",
          duration: data.duration || "N/A",
          level: data.level || "Beginner",
          features: data.features || [], 
          originalPrice: data.originalPrice || undefined,
          isPopular: data.isPopular || false,
          isNew: data.isNew || false,
          detailedDescription: data.detailedDescription || data.description,
          curriculum: data.curriculum || [],
          requirements: data.requirements || [],
          whatYouWillLearn: data.whatYouWillLearn || [],
          teacherBio: data.teacherBio || '',
          teacherImage: data.teacherImage || '',
          teacherRating: data.teacherRating || 0,
          teacherStudents: data.teacherStudents || 0,
          teacherCourses: data.teacherCourses || 0
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

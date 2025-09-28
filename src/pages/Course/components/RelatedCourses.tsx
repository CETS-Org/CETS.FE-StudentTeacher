import { useState, useEffect } from "react";
import { Star, Clock, Users, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { api } from "@/lib/config";
import type { Course } from "@/types/course";

interface RelatedCoursesProps {
  currentCourse: Course;
}

export default function RelatedCourses({ currentCourse }: RelatedCoursesProps) {
  const [relatedCourses, setRelatedCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRelatedCourses = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Calculate price range (±20% of current course price)
        const priceRange = currentCourse.standardPrice * 0.2;
        const minPrice = currentCourse.standardPrice - priceRange;
        const maxPrice = currentCourse.standardPrice + priceRange;
        
        // Search for courses with similar category and price range
        const searchParams = {
          categoryIds: [currentCourse.categoryName], // Use categoryIds instead of categories
          priceMin: Math.max(0, Math.floor(minPrice)), // Ensure non-negative integer
          priceMax: Math.ceil(maxPrice),
          pageSize: 8, // Get more courses to have better filtering options
        };
        
        const response = await api.searchCourses(searchParams);
        
        // Handle the API response structure
        const responseData = response.data;
        const coursesArray = responseData?.items || responseData || [];
        
        // Filter out the current course and limit to 4 courses
        let filteredCourses = coursesArray
          .filter((course: Course) => course.id !== currentCourse.id)
          .slice(0, 4);
        
        // If we don't have enough related courses with price filter, search by category only
        if (filteredCourses.length < 2) {
          try {
            const fallbackParams = {
              categoryIds: [currentCourse.categoryName],
              pageSize: 8,
            };
            
            const fallbackResponse = await api.searchCourses(fallbackParams);
            const fallbackData = fallbackResponse.data;
            const fallbackArray = fallbackData?.items || fallbackData || [];
            
            filteredCourses = fallbackArray
              .filter((course: Course) => course.id !== currentCourse.id)
              .slice(0, 4);
          } catch (fallbackErr) {
            console.warn("Fallback search also failed:", fallbackErr);
          }
        }
        
        setRelatedCourses(filteredCourses);
      } catch (err: any) {
        console.error("Error fetching related courses:", err);
        setError("Failed to load related courses");
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedCourses();
  }, [currentCourse.id, currentCourse.categoryName, currentCourse.standardPrice]);

  const handleCourseClick = (courseId: string) => {
    navigate(`/course/${courseId}`);
  };

  if (loading) {
    return (
      <Card title="Related Courses">
        <div className="text-center py-8">
          <div className="text-gray-500">Loading related courses...</div>
        </div>
      </Card>
    );
  }

  if (error || relatedCourses.length === 0) {
    return (
      <Card title="Related Courses">
        <div className="text-center py-8 text-gray-500">
          <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No related courses found</p>
        </div>
      </Card>
    );
  }

  return (
    <Card title="Related Courses">
      <div className="grid grid-cols-1 gap-4">
        {relatedCourses.map((course) => (
          <div
            key={course.id}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleCourseClick(course.id)}
          >
            <div className="flex gap-3">
              <img
                src={course.courseImageUrl}
                alt={course.courseName}
                className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1">
                  {course.courseName}
                </h3>
                <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                  <span className="bg-accent-100 text-primary-800 px-2 py-1 rounded-full">
                    {course.categoryName}
                  </span>
                  <span className="px-2 py-1 bg-gray-100 rounded-full">
                    {course.courseLevel}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      <span>{course.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>{course.studentsCount}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{course.duration}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-sm font-bold text-primary-600">
                    {course.standardPrice.toLocaleString('vi-VN')} ₫
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {relatedCourses.length > 0 && (
        <div className="mt-6 text-center">
          <Button
            variant="primary"
            onClick={() => {
              navigate(`/courses?category=${encodeURIComponent(currentCourse.categoryName)}`, { replace: false });
              setTimeout(() => {
                window.location.hash = '#courses';
              }, 50);
            }}
          >
            View All {currentCourse.categoryName} Courses
          </Button>
        </div>
      )}
    </Card>
  );
}

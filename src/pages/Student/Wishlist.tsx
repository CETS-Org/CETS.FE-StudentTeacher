import { useState } from "react";
import StudentLayout from "@/Shared/StudentLayout";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import CourseCard, { type Course } from "@/components/ui/CourseCard";
import Pagination from "@/Shared/Pagination";
import { Heart } from "lucide-react";

const mockCourses: Course[] = [
  {
    id: "1",
    title: "Advanced Business English",
    description: "Master professional communication skills for the corporate world. Learn presentations, negotiations, and business writing.",
    image: "/api/placeholder/400/240",
    level: "Advanced",
    format: "Online",
    timeOfDay: "Evening",
    price: 299,
    duration: "12 weeks",
    rating: 4.8,
    students: 1250
  },
  {
    id: "2", 
    title: "IELTS Test Preparation",
    description: "Comprehensive IELTS preparation covering all four skills: listening, reading, writing, and speaking with practice tests.",
    image: "/api/placeholder/400/240",
    level: "Intermediate",
    format: "In-person",
    timeOfDay: "Morning",
    price: 199,
    duration: "8 weeks",
    rating: 4.9,
    students: 890
  },
  {
    id: "3",
    title: "English Conversation Club", 
    description: "Practice speaking English in a relaxed, supportive environment with native speakers and fellow learners.",
    image: "/api/placeholder/400/240",
    level: "Beginner",
    format: "Hybrid", 
    timeOfDay: "Weekend",
    price: 89,
    duration: "4 weeks",
    rating: 4.7,
    students: 650
  },
  {
    id: "4",
    title: "Academic Writing Workshop",
    description: "Improve your academic writing skills with focus on essay structure, research techniques, and citation styles.",
    image: "/api/placeholder/400/240",
    level: "Advanced",
    format: "Online",
    timeOfDay: "Morning",
    price: 249,
    duration: "10 weeks",
    rating: 4.6,
    students: 520
  },
  {
    id: "5",
    title: "Pronunciation Masterclass",
    description: "Perfect your English pronunciation with phonetics, stress patterns, and intonation techniques.",
    image: "/api/placeholder/400/240",
    level: "Intermediate",
    format: "In-person",
    timeOfDay: "Evening",
    price: 149,
    duration: "6 weeks",
    rating: 4.5,
    students: 380
  },
  {
    id: "6",
    title: "Grammar Fundamentals",
    description: "Build a solid foundation in English grammar with clear explanations and practical exercises.",
    image: "/api/placeholder/400/240",
    level: "Beginner",
    format: "Online",
    timeOfDay: "Morning",
    price: 129,
    duration: "8 weeks",
    rating: 4.4,
    students: 720
  },
  {
    id: "7",
    title: "English for Presentations",
    description: "Learn to deliver confident and effective presentations in English for professional settings.",
    image: "/api/placeholder/400/240",
    level: "Intermediate",
    format: "Hybrid",
    timeOfDay: "Evening",
    price: 199,
    duration: "6 weeks",
    rating: 4.7,
    students: 440
  },
  {
    id: "8",
    title: "Travel English Essentials",
    description: "Essential English phrases and vocabulary for traveling confidently in English-speaking countries.",
    image: "/api/placeholder/400/240",
    level: "Beginner",
    format: "Online",
    timeOfDay: "Weekend",
    price: 99,
    duration: "4 weeks",
    rating: 4.3,
    students: 950
  }
];



export default function Wishlist() {
  const [courses, setCourses] = useState<Course[]>(mockCourses);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // Number of courses per page (2 rows of 3 for desktop)

  const handleRemoveFromWishlist = (courseId: string) => {
    setCourses(prev => prev.filter(course => course.id !== courseId));
    
    // If removing item results in empty current page, go to previous page
    const newTotalItems = courses.length - 1;
    const newTotalPages = Math.ceil(newTotalItems / itemsPerPage);
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(newTotalPages);
    }
  };

  // Calculate pagination
  const totalPages = Math.ceil(courses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCourses = courses.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of course grid
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <StudentLayout>
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <PageHeader
            title="My Wishlist"
            subtitle={`Courses you've saved for later`}
            actions={
              <div className="text-sm text-neutral-600 bg-neutral-100 px-3 py-1 rounded-full">
                {courses.length} course{courses.length !== 1 ? 's' : ''} saved
              </div>
            }
          />
        </div>

        {/* Course Grid */}
        {courses.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onRemoveFromWishlist={handleRemoveFromWishlist}
                  showWishlistButton={true}
                  isWishlisted={true}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={courses.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        ) : (
          /* Empty State */
          <Card className="text-center py-12">
            <div className="max-w-md mx-auto">
              <Heart className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                Your wishlist is empty
              </h3>
              <p className="text-neutral-600 mb-6">
                Start browsing courses and save the ones you're interested in to your wishlist.
              </p>
              <Button variant="primary">
                Browse Courses
              </Button>
            </div>
          </Card>
        )}
      </div>
    </StudentLayout>
  );
}
import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, Star, Award, Users, BookOpen } from "lucide-react";
import CourseCard from "@/pages/Course/components/CourseCard";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { getCoursesApiUrl } from "@/lib/config";

interface SyllabusItem {
  sessionNumber: number;
  topicTitle: string;
  estimatedMinutes?: number;
  required: boolean;
  objectives?: string;
  contentSummary?: string;
}

interface Course {
  id: string;
  courseName: string;
  description: string;
  teacher: string; 
  duration: string;
  level: string; 
  price: number;
  rating: number;
  studentsCount: number;
  image: string;
  categoryName: string;
  features?: string[]; 
  isPopular?: boolean;
  isNew?: boolean;
  detailedDescription?: string;
  syllabusItems?: SyllabusItem[];
  requirements?: string[];
  whatYouWillLearn?: string[];
  teacherBio?: string;
  teacherImage?: string;
  teacherRating?: number;
  teacherStudents?: number;
  teacherCourses?: number;
}

export default function CourseCatalog() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedPriceRange, setSelectedPriceRange] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [showFilters, setShowFilters] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch courses from API
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(getCoursesApiUrl());
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        const mappedCourses: Course[] = data.map((course: any) => ({
          ...course,
          courseName: course.courseName || "Unknown Course",
          categoryName: course.categoryName || "General",
          image: course.image || "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=250&fit=crop",
          teacher: course.teacher || "Unknown teacher",
          duration: course.duration || "N/A",
          features: course.features || [], 
          isPopular: course.isPopular || false,
          isNew: course.isNew || false,
          detailedDescription: course.detailedDescription || course.description,
          curriculum: course.curriculum || [],
          syllabusItems: course.SyllabusItems ? course.SyllabusItems.map((item: any) => ({
            sessionNumber: item.SessionNumber,
            topicTitle: item.TopicTitle,
            estimatedMinutes: item.EstimatedMinutes,
            required: item.Required,
            objectives: item.Objectives,
            contentSummary: item.ContentSummary
          })) : [],
          requirements: course.requirements || [],
          whatYouWillLearn: course.whatYouWillLearn || [],
          teacherBio: course.teacherBio || '',
          teacherImage: course.teacherImage || '',
          teacherRating: course.teacherRating || 0,
          teacherStudents: course.teacherStudents || 0,
          teacherCourses: course.teacherCourses || 0
        }));
        
        setCourses(mappedCourses);
      } catch (err) {
        console.error('Failed to fetch courses:', err);
        setError('Failed to load courses. Please try again later.');   
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  /*
  // PREVIOUS HARDCODED DATA - KEPT FOR REFERENCE
  const courses: Course[] = [
    {
      id: "1",
      title: "Complete IELTS Preparation Course",
      description: "Master all four IELTS skills with comprehensive practice tests and expert guidance. Perfect for students aiming for band 7+.",
      teacher: "Sarah Johnson",
      duration: "12 weeks",
      level: "Advanced",
      price: 299,
      originalPrice: 399,
      rating: 4.8,
      studentsCount: 15420,
      image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=250&fit=crop",
      category: "IELTS",
      features: ["Live classes", "Practice tests", "1-on-1 tutoring", "Certificate"],
      isPopular: true,
      isNew: false,
      detailedDescription: "This comprehensive IELTS preparation course is designed to help you achieve your target band score. Our expert teachers will guide you through all four sections of the IELTS exam with proven strategies and techniques.",
      curriculum: [
        "Introduction to IELTS",
        "Listening Skills Development",
        "Reading Comprehension Strategies",
        "Writing Task 1: Academic & General",
        "Writing Task 2: Essay Writing",
        "Speaking Test Preparation",
        "Practice Tests & Mock Exams",
        "Final Review & Tips"
      ],
      requirements: [
        "Intermediate English level (B1 or higher)",
        "Basic computer skills",
        "Dedication to study 3-4 hours per week",
        "Access to computer with internet connection"
      ],
      whatYouWillLearn: [
        "Master all four IELTS skills (Listening, Reading, Writing, Speaking)",
        "Learn proven strategies for each test section",
        "Practice with authentic IELTS materials",
        "Develop time management skills for the exam",
        "Build confidence through mock tests",
        "Understand IELTS scoring criteria"
      ],
      teacherBio: "Sarah is a certified IELTS examiner with over 10 years of experience helping students achieve their target scores. She has taught thousands of students worldwide and has a 95% success rate.",
      teacherImage: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
      teacherRating: 4.9,
      teacherStudents: 25000,
      teacherCourses: 5
}];
  */

  // Dynamic categories based on API data, with fallback for common categories
  const categories = useMemo(() => {
    const allCategories = ["all", ...new Set(courses.map(course => course.categoryName).filter(Boolean))];
    return allCategories.length > 1 ? allCategories : ["all", "Web Development", "Data Science", "Programming", "Design"];
  }, [courses]);
  
  const levels = ["all", "Beginner", "Intermediate", "Advanced"];
  const priceRanges = [
    { value: "all", label: "All Prices" },
    { value: "0-2000000", label: "Under 2M VND" },
    { value: "2000000-5000000", label: "2M - 5M VND" },
    { value: "5000000-10000000", label: "5M - 10M VND" },
    { value: "10000000+", label: "Above 10M VND" }
  ];

  const sortOptions = [
    { value: "popular", label: "Most Popular" },
    { value: "newest", label: "Newest" },
    { value: "rating", label: "Highest Rated" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" }
  ];

  const filteredCourses = useMemo(() => {
    let filtered = courses.filter(course => {
      const matchesSearch = course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.teacher.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = selectedCategory === "all" || course.categoryName === selectedCategory;

      const matchesLevel = selectedLevel === "all" || course.level === selectedLevel;
      
      const matchesPrice = (() => {
        if (selectedPriceRange === "all") return true;
        if (selectedPriceRange.endsWith("+")) {
          const min = Number(selectedPriceRange.replace("+", ""));
          return course.price >= min;
        }
        const [min, max] = selectedPriceRange.split("-").map(Number);
        return course.price >= min && course.price <= max;
      })();

      return matchesSearch && matchesCategory && matchesLevel && matchesPrice;
    });

    // Sort courses
    switch (sortBy) {
      case "newest":
        filtered = filtered.filter(course => course.isNew).concat(
          filtered.filter(course => !course.isNew)
        );
        break;
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "popular":
      default:
        filtered.sort((a, b) => {
          if (a.isPopular && !b.isPopular) return -1;
          if (!a.isPopular && b.isPopular) return 1;
          return b.studentsCount - a.studentsCount;
        });
        break;
    }

    return filtered;
  }, [searchTerm, selectedCategory, selectedLevel, selectedPriceRange, sortBy, courses]);

  const handleEnroll = (course: Course) => {
    // Navigate to course detail page
    navigate(`/course/${course.id}`);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedLevel("all");
    setSelectedPriceRange("all");
    setSortBy("popular");
  };

  const activeFiltersCount = [searchTerm, selectedCategory, selectedLevel, selectedPriceRange].filter(
    filter => filter !== "all" && filter !== ""
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center text-white">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-primary-200 bg-clip-text text-transparent">
              Discover Your Perfect Course
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100  mx-auto">
              Master English with our expert-led courses. From beginner to advanced, 
              we have everything you need to achieve your language goals.
            </p>
            
            {/* Search Bar */}
            <div className="w-[70%] mx-auto relative">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search courses, teachers, or topics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-4 py-4  text-lg rounded-2xl border-0 shadow-2xl focus:ring-4 focus:ring-white/30"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full animate-bounce"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-white/10 rounded-full animate-bounce delay-1000"></div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">50K+</div>
              <div className="text-gray-600">Happy Students</div>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-accent-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">100+</div>
              <div className="text-gray-600">Expert Courses</div>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-success-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Star className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">4.8</div>
              <div className="text-gray-600">Average Rating</div>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Award className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">95%</div>
              <div className="text-gray-600">Success Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Courses Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filter Controls */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="secondary"
                onClick={() => setShowFilters(!showFilters)}
                iconLeft={<Filter className="w-4 h-4" />}
              >
                Filters
                {activeFiltersCount > 0 && (
                  <span className="bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
              
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="min-w-[200px]"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
            
            <div className="text-gray-600">
              Showing {filteredCourses.length} of {courses.length} courses
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <Card className="mt-6 animate-in slide-in-from-top-4 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <Select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category === "all" ? "All Categories" : category}
                      </option>
                    ))}
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
                  <Select
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                  >
                    {levels.map(level => (
                      <option key={level} value={level}>
                        {level === "all" ? "All Levels" : level}
                      </option>
                    ))}
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                  <Select
                    value={selectedPriceRange}
                    onChange={(e) => setSelectedPriceRange(e.target.value)}
                  >
                    {priceRanges.map(range => (
                      <option key={range.value} value={range.value}>
                        {range.label}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
              
              {activeFiltersCount > 0 && (
                <div className="mt-4 flex justify-end">
                  <Button
                    variant="secondary"
                    onClick={clearFilters}
                    className="text-sm"
                  >
                    Clear all filters
                  </Button>
                </div>
              )}
            </Card>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <span className="ml-3 text-gray-600">Loading courses...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-red-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Error Loading Courses</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => window.location.reload()} variant="secondary">
              Try Again
            </Button>
          </div>
        )}

        {/* Courses Grid */}
        {!loading && !error && filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course, index) => (
              <div
                key={course.id}
                className="animate-in fade-in-0 slide-in-from-bottom-4"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CourseCard course={course} onEnroll={handleEnroll} />
              </div>
            ))}
          </div>
        ) : !loading && !error ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">No courses found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search criteria or filters to find what you're looking for.
            </p>
            <Button onClick={clearFilters} variant="secondary">
              Clear all filters
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

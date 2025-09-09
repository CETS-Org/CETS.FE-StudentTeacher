import { useState, useMemo } from "react";
import { Search, Filter, Star, Award, Users, BookOpen } from "lucide-react";
import CourseCard from "@/pages/home/components/CourseCard";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  price: number;
  originalPrice?: number;
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
  instructorBio?: string;
  instructorImage?: string;
  instructorRating?: number;
  instructorStudents?: number;
  instructorCourses?: number;
}

interface CourseCatalogProps {
  onCourseSelect?: (course: Course) => void;
}

export default function CourseCatalog({ onCourseSelect }: CourseCatalogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedPriceRange, setSelectedPriceRange] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [showFilters, setShowFilters] = useState(false);

  // Mock data for courses
  const courses: Course[] = [
    {
      id: "1",
      title: "Complete IELTS Preparation Course",
      description: "Master all four IELTS skills with comprehensive practice tests and expert guidance. Perfect for students aiming for band 7+.",
      instructor: "Sarah Johnson",
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
      detailedDescription: "This comprehensive IELTS preparation course is designed to help you achieve your target band score. Our expert instructors will guide you through all four sections of the IELTS exam with proven strategies and techniques.",
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
      instructorBio: "Sarah is a certified IELTS examiner with over 10 years of experience helping students achieve their target scores. She has taught thousands of students worldwide and has a 95% success rate.",
      instructorImage: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
      instructorRating: 4.9,
      instructorStudents: 25000,
      instructorCourses: 5
    },
    {
      id: "2",
      title: "TOEIC Business English Mastery",
      description: "Boost your business English skills and TOEIC score with real-world scenarios and professional vocabulary.",
      instructor: "Michael Chen",
      duration: "10 weeks",
      level: "Intermediate",
      price: 249,
      rating: 4.7,
      studentsCount: 12850,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=250&fit=crop",
      category: "TOEIC",
      features: ["Business scenarios", "Vocabulary building", "Mock exams", "Career guidance"],
      isPopular: true,
      isNew: true,
      detailedDescription: "This TOEIC preparation course focuses on business English skills that are essential for professional success. Learn practical vocabulary and communication strategies used in real business environments.",
      curriculum: [
        "Business Communication Basics",
        "TOEIC Listening Strategies",
        "Reading Business Documents",
        "Professional Email Writing",
        "Meeting and Presentation Skills",
        "Business Vocabulary Expansion",
        "TOEIC Practice Tests",
        "Career Development Tips"
      ],
      requirements: [
        "Basic English knowledge",
        "Interest in business English",
        "Commitment to regular practice",
        "Computer with internet access"
      ],
      whatYouWillLearn: [
        "Master TOEIC test format and strategies",
        "Develop business communication skills",
        "Expand professional vocabulary",
        "Improve listening comprehension",
        "Enhance reading speed and accuracy",
        "Build confidence in business settings"
      ],
      instructorBio: "Michael is a business English specialist with 8 years of corporate training experience. He has helped professionals from Fortune 500 companies improve their English communication skills.",
      instructorImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      instructorRating: 4.8,
      instructorStudents: 18000,
      instructorCourses: 3
    },
    {
      id: "3",
      title: "English Conversation for Beginners",
      description: "Start your English journey with confidence. Learn essential phrases and build your speaking skills from scratch.",
      instructor: "Emma Wilson",
      duration: "8 weeks",
      level: "Beginner",
      price: 149,
      originalPrice: 199,
      rating: 4.9,
      studentsCount: 25680,
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=250&fit=crop",
      category: "Conversation",
      features: ["Daily practice", "Pronunciation guide", "Cultural tips", "Progress tracking"],
      isPopular: false,
      isNew: false,
      detailedDescription: "Perfect for absolute beginners! This course will help you build a strong foundation in English conversation with practical, everyday phrases and confidence-building exercises.",
      curriculum: [
        "Basic Greetings and Introductions",
        "Numbers, Time, and Dates",
        "Family and Personal Information",
        "Shopping and Money",
        "Food and Dining",
        "Travel and Transportation",
        "Health and Emergencies",
        "Daily Routines and Hobbies"
      ],
      requirements: [
        "No prior English experience required",
        "Willingness to practice speaking",
        "Basic computer skills",
        "Positive attitude and motivation"
      ],
      whatYouWillLearn: [
        "Essential English phrases for daily life",
        "Correct pronunciation and intonation",
        "Basic grammar structures",
        "Confidence in speaking English",
        "Cultural understanding",
        "Listening comprehension skills"
      ],
      instructorBio: "Emma specializes in teaching beginners and has a unique approach that makes learning English fun and engaging. She has helped over 30,000 students start their English journey.",
      instructorImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
      instructorRating: 4.9,
      instructorStudents: 35000,
      instructorCourses: 4
    },
    {
      id: "4",
      title: "Academic Writing Excellence",
      description: "Master academic writing skills for university and professional success. Learn essay structure, research methods, and citation.",
      instructor: "Dr. Robert Kim",
      duration: "14 weeks",
      level: "Advanced",
      price: 349,
      rating: 4.6,
      studentsCount: 8750,
      image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=250&fit=crop",
      category: "Academic Writing",
      features: ["Essay writing", "Research skills", "Citation styles", "Peer review"],
      isPopular: false,
      isNew: true,
      detailedDescription: "This advanced course covers all aspects of academic writing, from research methodology to proper citation formats. Perfect for university students and professionals.",
      curriculum: [
        "Academic Writing Fundamentals",
        "Research Methods and Sources",
        "Essay Structure and Organization",
        "Argumentation and Critical Thinking",
        "Citation Styles (APA, MLA, Chicago)",
        "Literature Review Writing",
        "Thesis and Dissertation Writing",
        "Peer Review and Revision"
      ],
      requirements: [
        "Advanced English level (B2 or higher)",
        "Basic research skills",
        "Access to academic databases",
        "Commitment to extensive writing practice"
      ],
      whatYouWillLearn: [
        "Master academic writing conventions",
        "Develop strong research skills",
        "Learn proper citation methods",
        "Improve critical thinking abilities",
        "Enhance essay organization",
        "Build confidence in academic communication"
      ],
      instructorBio: "Dr. Kim is a published academic with 15 years of university teaching experience. He has authored several research papers and guides students in academic writing.",
      instructorImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      instructorRating: 4.7,
      instructorStudents: 12000,
      instructorCourses: 2
    },
    {
      id: "5",
      title: "Business Communication Skills",
      description: "Enhance your professional communication with email writing, presentations, and meeting skills for career advancement.",
      instructor: "Lisa Martinez",
      duration: "6 weeks",
      level: "Intermediate",
      price: 199,
      rating: 4.5,
      studentsCount: 12300,
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop",
      category: "Business English",
      features: ["Email etiquette", "Presentation skills", "Meeting management", "Networking"],
      isPopular: false,
      isNew: false,
      detailedDescription: "Develop essential business communication skills that will help you succeed in the professional world. Learn to write effective emails, deliver presentations, and manage meetings.",
      curriculum: [
        "Professional Email Writing",
        "Business Presentation Skills",
        "Meeting Management and Participation",
        "Cross-cultural Communication",
        "Negotiation and Persuasion",
        "Networking and Small Talk",
        "Business Writing Styles",
        "Crisis Communication"
      ],
      requirements: [
        "Intermediate English level",
        "Professional work experience preferred",
        "Access to presentation software",
        "Willingness to practice with colleagues"
      ],
      whatYouWillLearn: [
        "Write professional emails and reports",
        "Deliver compelling presentations",
        "Lead and participate in meetings",
        "Communicate across cultures",
        "Build professional relationships",
        "Handle difficult conversations"
      ],
      instructorBio: "Lisa is a corporate communication consultant with 12 years of experience training professionals in Fortune 500 companies. She specializes in cross-cultural business communication.",
      instructorImage: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
      instructorRating: 4.6,
      instructorStudents: 15000,
      instructorCourses: 3
    },
    {
      id: "6",
      title: "TOEFL iBT Complete Preparation",
      description: "Comprehensive TOEFL preparation with authentic practice tests and strategies for all four sections.",
      instructor: "David Park",
      duration: "16 weeks",
      level: "Advanced",
      price: 399,
      originalPrice: 499,
      rating: 4.8,
      studentsCount: 9650,
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop",
      category: "TOEFL",
      features: ["Full practice tests", "Speaking practice", "Writing feedback", "Score guarantee"],
      isPopular: true,
      isNew: false,
      detailedDescription: "Comprehensive TOEFL iBT preparation course with authentic practice materials and personalized feedback. Our proven strategies have helped students achieve their target scores.",
      curriculum: [
        "TOEFL iBT Overview and Strategies",
        "Reading Section Mastery",
        "Listening Section Techniques",
        "Speaking Section Practice",
        "Writing Section Development",
        "Integrated Skills Practice",
        "Full-Length Practice Tests",
        "Score Improvement Strategies"
      ],
      requirements: [
        "Advanced English level (B2 or higher)",
        "Academic English background preferred",
        "Computer with microphone and speakers",
        "Commitment to intensive study"
      ],
      whatYouWillLearn: [
        "Master all four TOEFL iBT sections",
        "Develop time management strategies",
        "Improve academic English skills",
        "Practice with authentic test materials",
        "Build confidence for test day",
        "Achieve your target score"
      ],
      instructorBio: "David is a TOEFL specialist with 10 years of experience and a 98% success rate. He has helped over 20,000 students achieve their target TOEFL scores.",
      instructorImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      instructorRating: 4.9,
      instructorStudents: 25000,
      instructorCourses: 2
    }
  ];

  const categories = ["all", "IELTS", "TOEIC", "TOEFL", "Conversation", "Academic Writing", "Business English"];
  const levels = ["all", "Beginner", "Intermediate", "Advanced"];
  const priceRanges = [
    { value: "all", label: "All Prices" },
    { value: "0-150", label: "Under $150" },
    { value: "150-250", label: "$150 - $250" },
    { value: "250-350", label: "$250 - $350" },
    { value: "350+", label: "Above $350" }
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
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === "all" || course.category === selectedCategory;
      
      const matchesLevel = selectedLevel === "all" || course.level === selectedLevel;
      
      const matchesPrice = (() => {
        if (selectedPriceRange === "all") return true;
        const [min, max] = selectedPriceRange.split("-").map(Number);
        if (max === undefined) return course.price >= min;
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
  }, [searchTerm, selectedCategory, selectedLevel, selectedPriceRange, sortBy]);

  const handleEnroll = (course: Course) => {
    if (onCourseSelect) {
      onCourseSelect(course);
    } else {
      // Default behavior - you can add navigation logic here
      console.log("Enrolling in course:", course.title);
    }
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
                  placeholder="Search courses, instructors, or topics..."
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
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
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

        {/* Courses Grid */}
        {filteredCourses.length > 0 ? (
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
        ) : (
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
        )}
      </div>
    </div>
  );
}

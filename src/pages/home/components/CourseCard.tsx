import { Star, Clock, Users, BookOpen, ArrowRight, CheckCircle } from "lucide-react";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";

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
}

interface CourseCardProps {
  course: Course;
  onEnroll: (course: Course) => void;
}

export default function CourseCard({ course, onEnroll }: CourseCardProps) {
  const discountPercentage = course.originalPrice 
    ? Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)
    : 0;

  return (
    <Card className="group relative hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
      {/* Badges */}
      <div className="absolute top-4 left-4 z-10 flex gap-2 p-2">
        {course.isPopular && (
          <span className="bg-primary-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
            🔥 Popular
          </span>
        )}
        {course.isNew && (
          <span className="bg-accent-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
            ✨ New
          </span>
        )}
        {discountPercentage > 0 && (
          <span className="bg-success-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
            -{discountPercentage}%
          </span>
        )}
      </div>

      {/* Course Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={course.image}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Course Content */}
      <div className="p-6">
        {/* Category */}
        <div className="mb-3">
          <span className="inline-block bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-xs font-medium">
            {course.category}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors duration-300 line-clamp-2">
          {course.title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {course.description}
        </p>

        {/* Instructor */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-semibold">
              {course.instructor.charAt(0)}
            </span>
          </div>
          <span className="text-sm text-gray-600">by {course.instructor}</span>
        </div>

        {/* Features */}
        <div className="space-y-2 mb-4">
          {course.features.slice(0, 3).map((feature, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span>{feature}</span>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="font-medium">{course.rating}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{course.studentsCount.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{course.duration}</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="w-4 h-4" />
            <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
              {course.level}
            </span>
          </div>
        </div>

        {/* Price and Enroll Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gray-900">
              ${course.price}
            </span>
            {course.originalPrice && (
              <span className="text-lg text-gray-400 line-through">
                ${course.originalPrice}
              </span>
            )}
          </div>
          <Button
            onClick={() => onEnroll(course)}
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            Enroll Now
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

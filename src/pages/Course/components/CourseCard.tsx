import { Star, Clock, Users, BookOpen, ArrowRight, CheckCircle } from "lucide-react";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import type { CourseCardProps } from "@/types/course";

export default function CourseCard({ course, onEnroll }: CourseCardProps) {

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
      </div>

      {/* Course Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={course.courseImageUrl}
          alt={course.courseName}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Course Content */}
      <div className="p-6">
        {/* Category */}
        <div className="mb-3">
          <span className="inline-block bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-xs font-medium">
            {course.categoryName}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors duration-300 line-clamp-2">
          {course.courseName}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {course.description}
        </p>

        {/* Teacher */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-semibold">
              {course.teacher.charAt(0)}
            </span>
          </div>
          <span className="text-sm text-gray-600">by {course.teacher}</span>
        </div>

        {/* Benefits */}
        {course.benefits && course.benefits.length > 0 && (
          <div className="space-y-2 mb-4">
            {course.benefits.slice(0, 3).map((benefit) => (
              <div key={benefit.id} className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span>{benefit.benefitName}</span>
              </div>
            ))}
          </div>
        )}

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
              {course.courseLevel}
            </span>
          </div>
        </div>

        {/* Price and Enroll Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gray-900">
              {course.standardPrice.toLocaleString('vi-VN')} ₫
            </span>
          </div>
          <Button
            onClick={() => onEnroll(course)}
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            iconRight={<ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />}
          >
            View Details
          </Button>
        </div>
      </div>
    </Card>
  );
}

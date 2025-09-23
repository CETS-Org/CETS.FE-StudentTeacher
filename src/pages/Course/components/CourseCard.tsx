import { Star, Clock, Users, BookOpen, ArrowRight, Heart } from "lucide-react";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import type { CourseCardProps } from "@/types/course";

export default function CourseCard({ course, onEnroll, onToggleWishlist, isInWishlist = false }: CourseCardProps) {

  return (
    <Card className="group relative hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden h-full flex flex-col bg-white border border-gray-100 hover:border-primary-200">
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex gap-2">
        {course.isPopular && (
          <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm">
            🔥 Popular
          </span>
        )}
        {course.isNew && (
          <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm">
            ✨ New
          </span>
        )}
      </div>

      {/* Wishlist Heart Icon */}
      {onToggleWishlist && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(course.id);
          }}
          className="absolute top-3 right-3 z-10 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white hover:scale-110 transition-all duration-200 group/heart"
        >
          <Heart 
            className={`w-5 h-5 transition-all duration-200 ${
              isInWishlist 
                ? 'text-red-500 fill-red-500 scale-110' 
                : 'text-gray-600 group-hover/heart:text-red-500 group-hover/heart:scale-110'
            }`}
          />
        </button>
      )}

      {/* Course Image */}
      <div className="relative h-44 overflow-hidden flex-shrink-0">
        <img
          src={course.courseImageUrl}
          alt={course.courseName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/40 to-transparent"></div>
      </div>

      {/* Course Content */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Category */}
        <div className="mb-3">
          <span className="inline-block bg-gradient-to-r from-primary-100 to-accent-100 text-primary-700 px-3 py-1.5 rounded-full text-xs font-semibold border border-primary-200">
            {course.categoryName}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors duration-300 line-clamp-2 min-h-[3rem] leading-tight">
          {course.courseName}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 min-h-[2.5rem] leading-relaxed">
          {course.description}
        </p>

        {/* Teacher */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-sm">
            <span className="text-white text-xs font-bold">
              {course.teacherDetails?.[0]?.fullName?.charAt(0) || '?'}
            </span>
          </div>
          <span className="text-xs text-gray-600 truncate">
            by {course.teacherDetails && course.teacherDetails.length > 0 
              ? course.teacherDetails.length > 1 
                ? `${course.teacherDetails[0].fullName} +${course.teacherDetails.length - 1} more`
                : course.teacherDetails[0].fullName
              : 'Unknown Teacher'
            }
          </span>
        </div>


        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
          <div className="flex items-center gap-1.5 text-gray-600">
            <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
              <Star className="w-3 h-3 text-yellow-500 fill-current" />
            </div>
            <span className="font-semibold text-gray-900">{course.rating}</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-600">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="w-3 h-3 text-blue-500" />
            </div>
            <span>{course.studentsCount.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-600">
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
              <Clock className="w-3 h-3 text-green-500" />
            </div>
            <span>{course.duration}</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-600">
            <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
              <BookOpen className="w-3 h-3 text-purple-500" />
            </div>
            <span className="font-medium text-purple-700">{course.courseLevel}</span>
          </div>
        </div>

        {/* Price and Enroll Button - This will always be at the bottom */}
        <div className="mt-auto pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xl font-bold text-gray-900">
                {course.standardPrice.toLocaleString('vi-VN')} ₫
              </span>
              <span className="text-xs text-gray-500">Course Price</span>
            </div>
            <Button
              onClick={() => onEnroll(course)}
              className="btn-primary text-sm"
              iconRight={<ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />}
            >
              View Details
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

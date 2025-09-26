import { Star, Clock, BookOpen, ArrowRight, Heart } from "lucide-react";
import Button from "../../../components/ui/Button";
import type { CourseCardProps } from "@/types/course";

export default function CourseListItem({ course, onEnroll, onToggleWishlist, isInWishlist = false }: CourseCardProps) {
  return (
    <div className="group bg-white border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all duration-300 p-4">
      <div className="flex gap-4 h-[220px] p-4">
        {/* Course Image */}
        <div className="relative w-64 h-full flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
            <img
                src={course.courseImageUrl}
                alt={course.courseName}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            
            {/* Badges */}
            <div className="absolute top-2 left-2 flex gap-1">
                {course.isPopular && (
                <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-0.5 rounded text-xs font-bold">
                    🔥 Popular
                </span>
                )}
                {course.isNew && (
                <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 py-0.5 rounded text-xs font-bold">
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
                className="absolute top-2 right-2 z-10 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white hover:scale-110 transition-all duration-200 group/heart"
              >
                <Heart 
                  className={`w-4 h-4 transition-all duration-200 ${
                    isInWishlist 
                      ? 'text-red-500 fill-red-500 scale-110' 
                      : 'text-gray-600 group-hover/heart:text-red-500 group-hover/heart:scale-110'
                  }`}
                />
              </button>
            )}
        </div>


        {/* Course Content */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Title and Category */}
          <div className="mb-2">
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors duration-300 line-clamp-2 mb-1">
              {course.courseName}
            </h3>
            <span className="inline-block bg-gradient-to-r from-accent2-200 to-accent2-200 text-primary-700 px-2 py-1 rounded text-xs font-semibold">
              {course.categoryName}
            </span>
          </div>

          {/* Description */}
          <p className="text-gray-600 text-sm mb-3 line-clamp-2 leading-relaxed">
            {course.description}
          </p>

          {/* Teacher */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">
                {course.teacherDetails?.[0]?.fullName?.charAt(0) || '?'}
              </span>
            </div>
            <span className="text-sm text-gray-600">
              by {course.teacherDetails && course.teacherDetails.length > 0 
                ? course.teacherDetails.length > 1 
                  ? `${course.teacherDetails[0].fullName} +${course.teacherDetails.length - 1} more`
                  : course.teacherDetails[0].fullName
                : 'Unknown Teacher'
              }
            </span>
          </div>

          {/* Stats Row */}
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-auto">
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-500 fill-current" />
              <span className="font-semibold text-gray-900">{course.rating}</span>
              <span className="text-gray-500">({course.studentsCount.toLocaleString()})</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-blue-500" />
              <span>{course.duration}</span>
            </div>
            <div className="flex items-center gap-1">
              <BookOpen className="w-3 h-3 text-purple-500" />
              <span className="text-purple-700 font-medium">{course.courseLevel}</span>
            </div>
          </div>
        </div>

        {/* Price and Action */}
        <div className="flex flex-col items-end justify-between flex-shrink-0 w-40">
          <div className="text-right">
            <div className="text-xl font-bold text-gray-900 mb-1">
              {course.standardPrice.toLocaleString('vi-VN')} ₫
            </div>
            <div className="text-xs text-gray-500">Course Price</div>
          </div>
          
          <Button
            onClick={() => onEnroll(course)}
            className="btn-secondary text-sm w-full"
            iconRight={<ArrowRight className="w-4 h-4" />}
          >
            View Details
          </Button>
        </div>
      </div>
    </div>
  );
}

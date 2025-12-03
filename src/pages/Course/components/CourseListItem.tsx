import { Star, Clock, BookOpen, ArrowRight, Heart, Award, CheckCircle } from "lucide-react";
import Button from "../../../components/ui/Button";
import CourseSchedule from "@/components/ui/CourseSchedule";
import type { CourseCardProps } from "@/types/course";

export default function CourseListItem({ course, onEnroll, onToggleWishlist, isInWishlist = false, isRecommended = false, isEnrolled = false }: CourseCardProps) {
  // Use schedules from course prop (already loaded from search API)
  const schedules = course.schedules || [];
  const schedulesLoading = false;
  
  return (
    <div className={`group bg-white rounded-lg hover:shadow-md transition-all duration-300 p-3 md:p-4 ${
      isEnrolled
        ? 'border-2 border-blue-300 bg-blue-50/30 opacity-90'
        : isRecommended 
          ? 'border-2 border-primary-400 shadow-lg hover:border-primary-500' 
          : 'border border-gray-200 hover:border-primary-300'
    }`}>
      <div className="flex flex-col md:flex-row gap-3 md:gap-4 md:h-[240px]">
        {/* Course Image */}
        <div className="relative w-full md:w-40 lg:w-48 xl:w-56 h-48 md:h-full flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
            <img
                src={course.courseImageUrl}
                alt={course.courseName}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            
            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              <div className="flex gap-1">
                {isEnrolled && (
                  <span className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-2 py-0.5 rounded text-xs font-bold shadow-lg flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Enrolled
                  </span>
                )}
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
              {isRecommended && (
                <span className="bg-gradient-to-r from-primary-500 to-accent-500 text-white px-2 py-0.5 rounded text-xs font-bold shadow-md animate-pulse">
                    ⭐ Recommended for you
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
          <div className="mb-2 md:mb-3">
            <h3 className="text-base md:text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors duration-300 line-clamp-2 md:line-clamp-1 mb-1 md:mb-2">
              {course.courseName}
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-block bg-secondary-200 text-primary-800 px-2 py-1 rounded text-xs font-bold ">
                {course.courseCode}
              </span>
              <span className="inline-block bg-gradient-to-r from-accent2-200 to-accent2-200 text-primary-700 px-2 py-1 rounded text-xs font-semibold">
                {course.categoryName}
              </span>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-600 text-sm mb-2 md:mb-3 leading-relaxed line-clamp-2 md:line-clamp-3">
            {course.description}
          </p>

          {/* Teacher */}
          <div className="flex items-center gap-2 mb-2 md:mb-3">
            <div className="w-5 h-5 md:w-6 md:h-6 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">
                {course.teacherDetails?.[0]?.fullName?.charAt(0) || '?'}
              </span>
            </div>
            <span className="text-xs md:text-sm text-gray-600 truncate">
              by {course.teacherDetails && course.teacherDetails.length > 0 
                ? course.teacherDetails.length > 1 
                  ? `${course.teacherDetails[0].fullName} +${course.teacherDetails.length - 1} more`
                  : course.teacherDetails[0].fullName
                : 'Unknown Teacher'
              }
            </span>
          </div>

          {/* Stats Row */}
          <div className="flex flex-wrap items-center gap-2 lg:gap-4 text-xs md:text-sm text-gray-600 mb-2 md:mb-3">
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-500 fill-current flex-shrink-0" />
              <span className="font-semibold text-gray-900">{course.rating}</span>
              <span className="text-gray-500 hidden lg:inline">({course.studentsCount.toLocaleString()})</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-blue-500 flex-shrink-0" />
              <span className="truncate">{course.duration}</span>
            </div>
            <div className="flex items-center gap-1">
              <BookOpen className="w-3 h-3 text-purple-500 flex-shrink-0" />
              <span className="text-purple-700 font-medium truncate">{course.courseLevel}</span>
            </div>
            {course.standardScore !== undefined && course.standardScore !== null && (
              <div className="flex items-center gap-1">
                <Award className="w-3 h-3 text-orange-500 flex-shrink-0" />
                <span className="text-orange-700 font-medium truncate">
                  Required Score: {course.standardScore.toFixed(1)} / 10
                </span>
              </div>
            )}
          </div>

          {/* Course Schedule */}
          <div className="mb-auto">
            {schedulesLoading ? (
              <div className="text-sm text-gray-500">Loading schedule...</div>
            ) : (
              <CourseSchedule schedules={schedules} compact={true} />
            )}
          </div>
        </div>

        {/* Price and Action */}
        <div className="flex md:flex-col items-center md:items-end justify-between md:justify-between flex-shrink-0 w-full md:w-28 lg:w-32 xl:w-36 mt-3 md:mt-0">
          <div className="text-left md:text-right">
            <div className="text-lg md:text-xl font-bold text-gray-900 mb-0 md:mb-1">
              {course.standardPrice.toLocaleString('vi-VN')} ₫
            </div>
            <div className="text-xs text-gray-500">Course Price</div>
          </div>
          
          <Button
            onClick={() => onEnroll(course)}
            className={`text-xs md:text-sm w-auto md:w-full px-3 md:px-4 py-2 ${
              isEnrolled 
                ? 'bg-blue-600 hover:bg-blue-700 text-white border-0' 
                : 'btn-secondary'
            }`}
            iconRight={isEnrolled ? <CheckCircle className="w-3 h-3 md:w-4 md:h-4" /> : <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />}
          >
            {isEnrolled ? (
              <>
                <span className="md:hidden">Enrolled</span>
                <span className="hidden md:inline">View Course</span>
              </>
            ) : (
              <>
                <span className="md:hidden">Details</span>
                <span className="hidden md:inline">View Details</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

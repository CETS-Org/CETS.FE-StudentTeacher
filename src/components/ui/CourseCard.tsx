import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "./Button";
import { Heart, Clock, Users, Star, ChevronRight } from "lucide-react";
import type { SimpleCourse, SimpleCourseCardProps } from "@/types/course";

// Re-export for backward compatibility
export type { SimpleCourse as Course };
export type { SimpleCourseCardProps as CourseCardProps };

const CourseCard: React.FC<SimpleCourseCardProps> = ({ 
  course, 
  onRemoveFromWishlist,
  onEnroll,
  onViewDetails,
  showWishlistButton = true,
  isWishlisted: initialWishlisted = true,
  className = ""
}) => {
  const navigate = useNavigate();
  const [isWishlisted, setIsWishlisted] = useState(initialWishlisted);

  const handleWishlistToggle = () => {
    if (onRemoveFromWishlist) {
      setIsWishlisted(false);
      onRemoveFromWishlist(course.id);
    } else {
      setIsWishlisted(!isWishlisted);
    }
  };

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(course);
    } else {
      navigate(`/course/${course.id}`);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Beginner": return "bg-success-100 text-success-700";
      case "Intermediate": return "bg-warning-100 text-warning-700"; 
      case "Advanced": return "bg-error-100 text-error-700";
      default: return "bg-neutral-100 text-neutral-700";
    }
  };

  const getFormatColor = (format: string) => {
    switch (format) {
      case "Online": return "bg-info-100 text-info-700";
      case "In-person": return "bg-primary-100 text-primary-700";
      case "Hybrid": return "bg-accent-100 text-accent-700";
      default: return "bg-neutral-100 text-neutral-700";
    }
  };

  const generatePlaceholderImage = (title: string) => {
    const encodedTitle = encodeURIComponent(title.substring(0, 20));
    return `data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='400' height='240' viewBox='0 0 400 240'%3e%3crect width='400' height='240' fill='%23666'/%3e%3ctext x='200' y='120' text-anchor='middle' fill='white' font-size='16'%3e${encodedTitle}%3c/text%3e%3c/svg%3e`;
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden hover:shadow-md transition-shadow duration-200 flex flex-col ${className}`}>
      {/* Course Image */}
      <div className="relative h-48 bg-neutral-600 overflow-hidden flex-shrink-0">
        <img 
          src={course.image} 
          alt={course.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = generatePlaceholderImage(course.title);
          }}
        />
        {showWishlistButton && (
          <button
            onClick={handleWishlistToggle}
            className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-sm hover:bg-neutral-50 transition-colors"
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart 
              className={`w-5 h-5 ${isWishlisted ? 'fill-error-500 text-error-500' : 'text-neutral-400 hover:text-error-500'}`}
            />
          </button>
        )}
      </div>

      {/* Course Content */}
      <div className="p-6 flex flex-col flex-grow">
        {/* Course Title*/}
        <h3 className="text-lg font-semibold text-neutral-900  line-clamp-2 min-h-[3.5rem]">
          {course.title}
        </h3>
        
        {/* Course Description  */}
        <p className="text-sm text-neutral-600 mb-3 line-clamp-2 min-h-[2.5rem]">
          {course.description || 'No description available'}
        </p>

        {/* Course Code and Tags  */}
        <div className="flex flex-wrap gap-2 mb-3 min-h-[2rem]">
          <span className="px-2 py-1 text-xs font-bold rounded-md bg-secondary-200 text-primary-800 h-fit">
            {course.code}
          </span>
          <span className={`px-2 py-1 text-xs font-medium rounded-md h-fit ${getLevelColor(course.level)}`}>
            {course.level}
          </span>
          <span className={`px-2 py-1 text-xs font-medium rounded-md h-fit ${getFormatColor(course.format)}`}>
            {course.format}
          </span>
          {course.timeOfDay && (
            <span className="px-2 py-1 text-xs font-medium rounded-md bg-neutral-100 text-neutral-700 h-fit">
              {course.timeOfDay}
            </span>
          )}
        </div>

        {/* Teachers  */}
        <div className="mb-3 min-h-[1.75rem]">
          {course.teachers && course.teachers.length > 0 ? (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">
                  {course.teachers[0]?.fullName?.charAt(0) || '?'}
                </span>
              </div>
              <span className="text-xs text-gray-600 truncate">
                by {course.teachers.length > 1 
                  ? `${course.teachers[0].fullName} +${course.teachers.length - 1} more`
                  : course.teachers[0].fullName
                }
              </span>
            </div>
          ) : (
            <div className="text-xs text-gray-400 invisible">No teacher</div>
          )}
        </div>

        {/* Rating and Students  */}
        <div className="mb-4 min-h-[1.5rem]">
          {(course.rating !== undefined || course.students !== undefined) && (
            <div className="flex items-center gap-4 text-sm text-neutral-600">
              {course.rating !== undefined && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-warning-400 text-warning-400" />
                  <span className="font-medium">{course.rating}</span>
                </div>
              )}
              {course.students !== undefined && (
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{course.students.toLocaleString()} students</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex-grow"></div>

        {/* Price and Duration */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-neutral-900">
              {course.price.toLocaleString('vi-VN')} ₫
            </span>
            {course.originalPrice && (
              <span className="text-sm text-neutral-500 line-through">
                {course.originalPrice.toLocaleString('vi-VN')} ₫
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-sm text-neutral-600">
            <Clock className="w-4 h-4" />
            <span>{course.duration}</span>
          </div>
        </div>

        {/* Action Button */}
        <Button 
          variant="primary"
          onClick={handleViewDetails}
          iconRight={<ChevronRight className="w-4 h-4" />}
          className="w-full"
        >
          View Details
        </Button>
      </div>
    </div>
  );
};

export default CourseCard;
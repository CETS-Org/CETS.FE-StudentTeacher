import React, { useState } from "react";
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
  const [isWishlisted, setIsWishlisted] = useState(initialWishlisted);

  const handleWishlistToggle = () => {
    if (onRemoveFromWishlist) {
      setIsWishlisted(false);
      onRemoveFromWishlist(course.id);
    } else {
      setIsWishlisted(!isWishlisted);
    }
  };

  const handleEnroll = () => {
    if (onEnroll) {
      onEnroll(course);
    } else {
      console.log(`Enrolling in ${course.title}`);
    }
  };

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(course);
    } else {
      console.log(`Viewing details for ${course.title}`);
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
    <div className={`bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden hover:shadow-md transition-shadow duration-200 ${className}`}>
      {/* Course Image */}
      <div className="relative h-48 bg-neutral-600 overflow-hidden">
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
      <div className="p-6">
        {/* Course Title */}
        <h3 className="text-lg font-semibold text-neutral-900 mb-2 line-clamp-2">
          {course.title}
        </h3>
        
        {/* Course Description */}
        <p className="text-sm text-neutral-600 mb-4 line-clamp-3">
          {course.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`px-2 py-1 text-xs font-medium rounded-md ${getLevelColor(course.level)}`}>
            {course.level}
          </span>
          <span className={`px-2 py-1 text-xs font-medium rounded-md ${getFormatColor(course.format)}`}>
            {course.format}
          </span>
          <span className="px-2 py-1 text-xs font-medium rounded-md bg-neutral-100 text-neutral-700">
            {course.timeOfDay}
          </span>
        </div>

        {/* Rating and Students */}
        {(course.rating || course.students) && (
          <div className="flex items-center gap-4 mb-4 text-sm text-neutral-600">
            {course.rating && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-warning-400 text-warning-400" />
                <span className="font-medium">{course.rating}</span>
              </div>
            )}
            {course.students && (
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{course.students.toLocaleString()} students</span>
              </div>
            )}
          </div>
        )}

        {/* Price and Duration */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-neutral-900">
              ${course.price}
            </span>
            {course.originalPrice && (
              <span className="text-sm text-neutral-500 line-through">
                ${course.originalPrice}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-sm text-neutral-600">
            <Clock className="w-4 h-4" />
            <span>{course.duration}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            className="flex-1" 
            variant="primary"
            onClick={handleEnroll}
          >
            Enroll Now
          </Button>
          <Button 
            variant="secondary"
            onClick={handleViewDetails}
            iconRight={<ChevronRight className="w-4 h-4" />}
            className="flex-1 sm:flex-initial"
          >
            View Details
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
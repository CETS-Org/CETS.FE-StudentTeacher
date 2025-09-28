import { Star, Package, ArrowRight, Heart, BookOpen } from "lucide-react";
import Button from "../../../components/ui/Button";
import type { CoursePackageCardProps } from "@/types/coursePackage";

export default function CoursePackageListItem({ 
  coursePackage, 
  onEnroll, 
  onToggleWishlist, 
  isInWishlist = false 
}: CoursePackageCardProps) {
  
  return (
    <div className="group bg-white border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all duration-300 p-3 md:p-4">
      <div className="flex flex-col md:flex-row gap-3 md:gap-4 md:h-[240px]">
        {/* Package Image/Icon */}
        <div className="relative w-full md:w-40 lg:w-48 xl:w-56 h-48 md:h-full flex-shrink-0 overflow-hidden rounded-lg">
            {coursePackage.packageImageUrl ? (
              <img
                src={coursePackage.packageImageUrl}
                alt={coursePackage.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Package className="w-10 h-10 text-white" />
                </div>
              </div>
            )}
            
            {/* Badges */}
            <div className="absolute top-2 left-2 flex gap-1">
              <span className="bg-gradient-to-r from-primary-500 to-accent-500 text-white px-2 py-0.5 rounded text-xs font-bold">
                📦 Package
              </span>
            </div>

            {/* Wishlist Heart Icon */}
            {onToggleWishlist && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleWishlist(coursePackage.id);
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

        {/* Package Content */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Title and Code */}
          <div className="mb-2 md:mb-3">
            <h3 className="text-base md:text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors duration-300 line-clamp-2 md:line-clamp-1 mb-1 md:mb-2">
              {coursePackage.name}
            </h3>
            <span className="inline-block bg-gradient-to-r from-accent2-200 to-accent2-200 text-primary-700 px-2 py-1 rounded text-xs font-semibold">
              {coursePackage.packageCode}
            </span>
          </div>

          {/* Description */}
          {coursePackage.description && (
            <p className="text-gray-600 text-sm mb-2 md:mb-3 leading-relaxed line-clamp-2 md:line-clamp-3">
              {coursePackage.description}
            </p>
          )}

          {/* Package Type */}
          <div className="flex items-center gap-2 mb-2 md:mb-3">
            <div className="w-5 h-5 md:w-6 md:h-6 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-3 h-3 text-white" />
            </div>
            <span className="text-xs md:text-sm text-gray-600">
              Course Package Combo
            </span>
          </div>

          {/* Stats Row */}
          <div className="flex flex-wrap items-center gap-2 lg:gap-4 text-xs md:text-sm text-gray-600 mb-2 md:mb-3">
            <div className="flex items-center gap-1">
              <Package className="w-3 h-3 text-primary-500 flex-shrink-0" />
              <span className="text-primary-700 font-medium">Multiple Courses</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-500 fill-current flex-shrink-0" />
              <span className="font-semibold text-gray-900">Combo Deal</span>
            </div>
          </div>

          {/* Course List */}
          <div className="mb-auto">
            <div className="text-sm text-gray-600 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <BookOpen className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-blue-700 font-semibold mb-1">Included Courses:</div>
                  <ul className="space-y-1">
                    {coursePackage.courseNames.slice(0, 3).map((courseName, index) => (
                      <li key={index} className="text-gray-700 text-xs leading-relaxed">
                        • {courseName}
                      </li>
                    ))}
                    {coursePackage.courseNames.length > 3 && (
                      <li className="text-blue-600 text-xs font-medium">
                        + {coursePackage.courseNames.length - 3} more courses
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Price and Action */}
        <div className="flex md:flex-col items-center md:items-end justify-between md:justify-between flex-shrink-0 w-full md:w-32 lg:w-36 xl:w-40 mt-3 md:mt-0">
          <div className="text-left md:text-right">
            {/* Original total price (crossed out) */}
            {coursePackage.totalIndividualPrice > coursePackage.totalPrice && (
              <div className="text-sm text-gray-500 line-through mb-1">
                {coursePackage.totalIndividualPrice.toLocaleString('vi-VN')} ₫
              </div>
            )}
            {/* Combo price */}
            <div className="text-lg md:text-xl font-bold text-gray-900 mb-0 md:mb-1">
              {coursePackage.totalPrice.toLocaleString('vi-VN')} ₫
            </div>
            <div className="text-xs text-gray-500">Combo Price</div>
            {/* Savings amount */}
            {coursePackage.totalIndividualPrice > coursePackage.totalPrice && (
              <div className="text-xs text-green-600 font-semibold mt-1">
                Save {(coursePackage.totalIndividualPrice - coursePackage.totalPrice).toLocaleString('vi-VN')} ₫
              </div>
            )}
          </div>
          
          <Button
            onClick={() => onEnroll(coursePackage)}
            className="btn-secondary text-xs md:text-sm w-auto md:w-full px-3 md:px-4 py-2"
            iconRight={<ArrowRight className="w-3 h-3 md:w-4 md:h-4" />}
          >
            <span className="md:hidden">Details</span>
            <span className="hidden md:inline">View Package</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

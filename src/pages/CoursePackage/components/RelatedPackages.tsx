import { useState, useEffect } from "react";
import { Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { api } from "@/lib/config";
import type { CoursePackageDetail, CoursePackage } from "@/types/coursePackage";

interface RelatedPackagesProps {
  currentPackage: CoursePackageDetail;
}

export default function RelatedPackages({ currentPackage }: RelatedPackagesProps) {
  const [relatedPackages, setRelatedPackages] = useState<CoursePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRelatedPackages = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Calculate price range (±30% of current package price)
        const priceRange = currentPackage.totalPrice * 0.3;
        const minPrice = currentPackage.totalPrice - priceRange;
        const maxPrice = currentPackage.totalPrice + priceRange;
        
        // Search for packages with similar price range
        const searchParams = {
          priceMin: Math.max(0, Math.floor(minPrice)),
          priceMax: Math.ceil(maxPrice),
          pageSize: 8, // Get more packages to have better filtering options
          isActive: true,
        };
        
        const response = await api.searchCoursePackages(searchParams);
        
        // Handle the API response structure
        const responseData = response.data;
        const packagesArray = responseData?.items || responseData || [];
        
        // Filter out the current package and limit to 4 packages
        let filteredPackages = packagesArray
          .filter((pkg: CoursePackage) => pkg.id !== currentPackage.id)
          .slice(0, 4);
        
        // If we don't have enough related packages with price filter, search without price filter
        if (filteredPackages.length < 2) {
          try {
            const fallbackParams = {
              pageSize: 8,
              isActive: true,
            };
            
            const fallbackResponse = await api.searchCoursePackages(fallbackParams);
            const fallbackData = fallbackResponse.data;
            const fallbackArray = fallbackData?.items || fallbackData || [];
            
            filteredPackages = fallbackArray
              .filter((pkg: CoursePackage) => pkg.id !== currentPackage.id)
              .slice(0, 4);
          } catch (fallbackErr) {
            console.warn("Fallback search also failed:", fallbackErr);
          }
        }
        
        setRelatedPackages(filteredPackages);
      } catch (err: any) {
        console.error("Error fetching related packages:", err);
        setError("Failed to load related packages");
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedPackages();
  }, [currentPackage.id, currentPackage.totalPrice]);

  const handlePackageClick = (packageId: string) => {
    navigate(`/course-package/${packageId}`);
  };

  if (loading) {
    return (
      <Card title="Related Packages">
        <div className="text-center py-8">
          <div className="text-gray-500">Loading related packages...</div>
        </div>
      </Card>
    );
  }

  if (error || relatedPackages.length === 0) {
    return (
      <Card title="Related Packages">
        <div className="text-center py-8 text-gray-500">
          <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No related packages found</p>
        </div>
      </Card>
    );
  }

  return (
    <Card title="Related Packages">
      <div className="grid grid-cols-1 gap-4">
        {relatedPackages.map((pkg) => (
          <div
            key={pkg.id}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handlePackageClick(pkg.id)}
          >
            <div className="flex gap-3">
              {pkg.packageImageUrl ? (
                <img
                  src={pkg.packageImageUrl}
                  alt={pkg.name}
                  className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-accent-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Package className="w-8 h-8 text-primary-600" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1">
                  {pkg.name}
                </h3>
                <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                  <span className="bg-gradient-to-r from-primary-500 to-accent-500 text-white px-2 py-1 rounded-full">
                    📦 Package
                  </span>
                  <span className="px-2 py-1 bg-gray-100 rounded-full">
                    {pkg.courseNames?.length || 0} Courses
                  </span>
                </div>
                
                {/* Course names preview */}
                {pkg.courseNames && pkg.courseNames.length > 0 && (
                  <div className="text-xs text-gray-600 mb-2">
                    {pkg.courseNames.slice(0, 2).map((courseName, index) => (
                      <div key={index} className="truncate">
                        • {courseName}
                      </div>
                    ))}
                    {pkg.courseNames.length > 2 && (
                      <div className="text-gray-500 italic">
                        + {pkg.courseNames.length - 2} more courses
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    {/* Show original price if there's a discount */}
                    {pkg.totalIndividualPrice > pkg.totalPrice && (
                      <span className="text-xs text-gray-500 line-through">
                        {pkg.totalIndividualPrice.toLocaleString('vi-VN')} ₫
                      </span>
                    )}
                    <span className="text-sm font-bold text-primary-600">
                      {pkg.totalPrice.toLocaleString('vi-VN')} ₫
                    </span>
                    {pkg.totalIndividualPrice > pkg.totalPrice && (
                      <span className="text-xs text-green-600 font-medium">
                        Save {(pkg.totalIndividualPrice - pkg.totalPrice).toLocaleString('vi-VN')} ₫
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {relatedPackages.length > 0 && (
        <div className="mt-6 text-center">
          <Button
            variant="primary"
            onClick={() => {
              navigate('/courses', { replace: false });
              // Use setTimeout to ensure navigation completes before hash update
              setTimeout(() => {
                window.location.hash = '#packages';
              }, 50);
            }}
          >
            View All Course Packages
          </Button>
        </div>
      )}
    </Card>
  );
}

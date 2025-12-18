import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "@/components/ui/PageHeader";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/card";
import Input from "@/components/ui/input";
import Select from "@/components/ui/Select";
import CourseCard, { type Course } from "@/components/ui/CourseCard";
import Pagination from "@/Shared/Pagination";
import { Heart, BookOpen, Loader2, Search, Filter } from "lucide-react";
import { useWishlist } from "@/hooks/useWishlist";
import type { WishlistItem } from "@/types/wishlist";
import type { SimpleCourse } from "@/types/course";

const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
  { value: "name", label: "Name: A-Z" },
];

// Remove the mock data as we're now using real API
export default function Wishlist() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [courses, setCourses] = useState<SimpleCourse[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const itemsPerPage = 6; // Number of courses per page (2 rows of 3 for desktop)

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceMin, setPriceMin] = useState<number>(0);
  const [priceMax, setPriceMax] = useState<number>(20000000);
  const [showFilters, setShowFilters] = useState(false);

  // Get student ID from localStorage or auth context
  const userInfoStr = localStorage.getItem('userInfo');
  const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;
  const studentId = userInfo?.id || null;

  // Use wishlist hook
  const { 
    wishlistItems, 
    loading: wishlistLoading, 
    removeCourse,
    fetchWishlist 
  } = useWishlist({ studentId, autoFetch: true });

  // Convert wishlist items to SimpleCourse format (no API calls needed - data is already in wishlist)
  useEffect(() => {
    if (wishlistItems.length === 0) {
      setCourses([]);
      setLoadingCourses(false);
      return;
    }

    // Map wishlist items directly to SimpleCourse format
    const mappedCourses: SimpleCourse[] = wishlistItems.map((item: WishlistItem) => ({
      id: item.courseId,
      code: item.courseCode,
      title: item.courseName,
      description: item.description || '',
      image: item.courseImageUrl || '',
      level: (item.courseLevel as "Beginner" | "Intermediate" | "Advanced") || "Beginner",
      format: (item.courseFormat as "Online" | "In-person" | "Hybrid") || "Online",
      category: item.categoryName || '',
      price: item.standardPrice,
      duration: item.duration,
      rating: item.rating,
      students: item.studentsCount,
      teachers: item.teacherDetails.map(t => ({
        id: t.id,
        fullName: t.fullName,
        avatarUrl: t.avatarUrl
      }))
    }));

    setCourses(mappedCourses);
    setLoadingCourses(false);
  }, [wishlistItems]);

  // Get unique levels and formats from courses
  const availableLevels = useMemo(() => {
    return Array.from(new Set(courses.map(c => c.level))).filter(Boolean);
  }, [courses]);

  const availableFormats = useMemo(() => {
    return Array.from(new Set(courses.map(c => c.format))).filter(Boolean);
  }, [courses]);

  const availableCategories = useMemo(() => {
    return Array.from(new Set(courses.map(c => c.category))).filter(Boolean) as string[];
  }, [courses]);

  // Filter and sort courses
  const filteredAndSortedCourses = useMemo(() => {
    let filtered = [...courses];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(query) ||
        course.code.toLowerCase().includes(query) ||
        course.description?.toLowerCase().includes(query)
      );
    }

    // Level filter
    if (selectedLevels.length > 0) {
      filtered = filtered.filter(course => selectedLevels.includes(course.level));
    }

    // Format filter
    if (selectedFormats.length > 0) {
      filtered = filtered.filter(course => selectedFormats.includes(course.format));
    }

    // Category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(course => course.category && selectedCategories.includes(course.category));
    }

    // Price filter
    filtered = filtered.filter(course => 
      course.price >= priceMin && course.price <= priceMax
    );

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          // Assuming newer items are at the end of the original array
          return courses.indexOf(b) - courses.indexOf(a);
        case "oldest":
          return courses.indexOf(a) - courses.indexOf(b);
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "rating":
          return (b.rating || 0) - (a.rating || 0);
        case "name":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return filtered;
  }, [courses, searchQuery, selectedLevels, selectedFormats, selectedCategories, priceMin, priceMax, sortBy]);

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (selectedLevels.length > 0) count++;
    if (selectedFormats.length > 0) count++;
    if (selectedCategories.length > 0) count++;
    if (priceMin > 0 || priceMax < 20000000) count++;
    return count;
  }, [searchQuery, selectedLevels, selectedFormats, selectedCategories, priceMin, priceMax]);

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedLevels([]);
    setSelectedFormats([]);
    setSelectedCategories([]);
    setPriceMin(0);
    setPriceMax(20000000);
    setSortBy("newest");
    setCurrentPage(1);
  };

  const handleRemoveFromWishlist = async (courseId: string) => {
    const success = await removeCourse(courseId);
    
    if (success) {
      // If removing item results in empty current page, go to previous page
      const newTotalItems = filteredAndSortedCourses.length - 1;
      const newTotalPages = Math.ceil(newTotalItems / itemsPerPage);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      }
    }
  };

  // Calculate pagination
  const totalPages = Math.ceil(filteredAndSortedCourses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCourses = filteredAndSortedCourses.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedLevels, selectedFormats, selectedCategories, priceMin, priceMax, sortBy]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of course grid
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const breadcrumbItems = [
    { label: "Wishlist" }
  ];

  const isLoading = wishlistLoading || loadingCourses;

  return (
    <div className="p-6 max-w-full space-y-8">
        {/* Breadcrumbs */}
        <Breadcrumbs items={breadcrumbItems} />
        
        {/* Page Header */}
        <PageHeader
          title="My Wishlist"
          description="Save and manage courses you're interested in taking. Keep track of your favorite courses and enroll when you're ready"
          icon={<Heart className="w-5 h-5 text-white" />}
         
        />

        {/* Search and Filters */}
        {courses.length > 0 && (
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search by course name, code, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-3 rounded-xl border-neutral-200 shadow-sm focus:!ring-1 focus:!ring-primary-500"
              />
            </div>

            {/* Controls Bar */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-neutral-100">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                  {/* Mobile filter toggle */}
                  <Button
                    variant="secondary"
                    onClick={() => setShowFilters(!showFilters)}
                    iconLeft={<Filter className="w-4 h-4" />}
                    className="lg:hidden"
                  >
                    Filters
                    {activeFiltersCount > 0 && (
                      <span className="bg-primary-500 text-white text-xs px-2 py-1 rounded-full ml-2 font-bold">
                        {activeFiltersCount}
                      </span>
                    )}
                  </Button>
                  
                  {/* Sort Dropdown */}
                  <Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="min-w-[200px] border-neutral-200 rounded-lg shadow-sm focus:!ring-1 focus:!ring-primary-500"
                    options={sortOptions}
                    placeholder="Sort by..."
                  />
                </div>

                <div className="flex items-center gap-4">
                  {/* Results Info */}
                  <div className="text-sm text-neutral-600">
                    Showing <span className="font-semibold text-primary-600">{filteredAndSortedCourses.length}</span> of <span className="font-semibold text-primary-600">{courses.length}</span> course{courses.length !== 1 ? 's' : ''}
                  </div>

                  {/* Clear Filters Button - moved to right */}
                  {activeFiltersCount > 0 && (
                    <Button
                      variant="secondary"
                      onClick={clearAllFilters}
                      className="bg-error-500 hover:bg-error-600 text-white border-0"
                    >
                      Clear All ({activeFiltersCount})
                    </Button>
                  )}
                </div>
              </div>

              {/* Desktop Filters */}
              <div className={`mt-4 pt-4 border-t border-neutral-100 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Level Filter */}
                  <div className="bg-neutral-50 rounded-lg p-4">
                    <label className="block text-sm font-semibold text-neutral-800 mb-3">
                      Level
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {availableLevels.map((level) => (
                        <button
                          key={level}
                          onClick={() => {
                            if (selectedLevels.includes(level)) {
                              setSelectedLevels(selectedLevels.filter(l => l !== level));
                            } else {
                              setSelectedLevels([...selectedLevels, level]);
                            }
                          }}
                          className={`px-3 py-1.5 text-sm rounded-full border transition-all duration-200 ${
                            selectedLevels.includes(level)
                              ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                              : 'bg-white text-neutral-700 border-neutral-300 hover:border-primary-400 hover:bg-primary-50'
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Format Filter */}
                  <div className="bg-neutral-50 rounded-lg p-4">
                    <label className="block text-sm font-semibold text-neutral-800 mb-3">
                      Format
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {availableFormats.map((format) => (
                        <button
                          key={format}
                          onClick={() => {
                            if (selectedFormats.includes(format)) {
                              setSelectedFormats(selectedFormats.filter(f => f !== format));
                            } else {
                              setSelectedFormats([...selectedFormats, format]);
                            }
                          }}
                          className={`px-3 py-1.5 text-sm rounded-full border transition-all duration-200 ${
                            selectedFormats.includes(format)
                              ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                              : 'bg-white text-neutral-700 border-neutral-300 hover:border-primary-400 hover:bg-primary-50'
                          }`}
                        >
                          {format}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Category Filter */}
                  <div className="bg-neutral-50 rounded-lg p-4">
                    <label className="block text-sm font-semibold text-neutral-800 mb-3">
                      Category
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {availableCategories.map((category) => (
                        <button
                          key={category}
                          onClick={() => {
                            if (selectedCategories.includes(category)) {
                              setSelectedCategories(selectedCategories.filter(c => c !== category));
                            } else {
                              setSelectedCategories([...selectedCategories, category]);
                            }
                          }}
                          className={`px-3 py-1.5 text-sm rounded-full border transition-all duration-200 ${
                            selectedCategories.includes(category)
                              ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                              : 'bg-white text-neutral-700 border-neutral-300 hover:border-primary-400 hover:bg-primary-50'
                          }`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price Range with Dual Slider */}
                  <div className="bg-neutral-50 rounded-lg p-4">
                    <label className="block text-sm font-semibold text-neutral-800 mb-3">
                      Price Range
                    </label>
                    <div className="space-y-3">
                      {/* Price Display */}
                      <div className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-neutral-200">
                        <span className="text-sm font-medium text-primary-600">{priceMin.toLocaleString('vi-VN')} ₫</span>
                        <span className="text-neutral-400">—</span>
                        <span className="text-sm font-medium text-primary-600">{priceMax.toLocaleString('vi-VN')} ₫</span>
                      </div>
                      {/* Dual Range Slider */}
                      <div className="relative pt-1">
                        <div className="h-2 bg-neutral-200 rounded-full">
                          <div 
                            className="absolute h-2 bg-primary-500 rounded-full"
                            style={{
                              left: `${(priceMin / 20000000) * 100}%`,
                              right: `${100 - (priceMax / 20000000) * 100}%`
                            }}
                          />
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={20000000}
                          step={100000}
                          value={priceMin}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            if (val <= priceMax) setPriceMin(val);
                          }}
                          className="absolute w-full h-2 top-1 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-primary-600 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-primary-600 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white"
                        />
                        <input
                          type="range"
                          min={0}
                          max={20000000}
                          step={100000}
                          value={priceMax}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            if (val >= priceMin) setPriceMax(val);
                          }}
                          className="absolute w-full h-2 top-1 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-primary-600 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-primary-600 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white"
                        />
                      </div>
                      {/* Quick Price Presets */}
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => { setPriceMin(0); setPriceMax(5000000); }}
                          className="flex-1 text-xs py-1.5 rounded bg-white border border-neutral-200 hover:border-primary-400 hover:bg-primary-50 transition-colors"
                        >
                          &lt; 5M
                        </button>
                        <button
                          onClick={() => { setPriceMin(5000000); setPriceMax(10000000); }}
                          className="flex-1 text-xs py-1.5 rounded bg-white border border-neutral-200 hover:border-primary-400 hover:bg-primary-50 transition-colors"
                        >
                          5-10M
                        </button>
                        <button
                          onClick={() => { setPriceMin(10000000); setPriceMax(20000000); }}
                          className="flex-1 text-xs py-1.5 rounded bg-white border border-neutral-200 hover:border-primary-400 hover:bg-primary-50 transition-colors"
                        >
                          &gt; 10M
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
            <span className="ml-3 text-neutral-600">Loading your wishlist...</span>
          </div>
        )}

        {/* Course Grid */}
        {!isLoading && courses.length > 0 && filteredAndSortedCourses.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onRemoveFromWishlist={handleRemoveFromWishlist}
                  showWishlistButton={true}
                  isWishlisted={true}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredAndSortedCourses.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        ) : !isLoading && courses.length > 0 && filteredAndSortedCourses.length === 0 ? (
          /* No Results from Filters */
          <Card className="text-center py-12">
            <div className="max-w-md mx-auto">
              <Search className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                No courses match your filters
              </h3>
              <p className="text-neutral-600 mb-6">
                Try adjusting your search criteria or filters to find what you're looking for.
              </p>
              <Button 
                variant="secondary"
                onClick={clearAllFilters}
              >
                Clear All Filters
              </Button>
            </div>
          </Card>
        ) : !isLoading && courses.length === 0 ? (
          /* Empty Wishlist State */
          <Card className="text-center py-12">
            <div className="max-w-md mx-auto">
              <Heart className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                Your wishlist is empty
              </h3>
              <p className="text-neutral-600 mb-6">
                Start browsing courses and save the ones you're interested in to your wishlist.
              </p>
              <Button 
                variant="primary"
                onClick={() => navigate('/courses')}
              >
                Browse Courses
              </Button>
            </div>
          </Card>
        ) : null}
    </div>
  );
}
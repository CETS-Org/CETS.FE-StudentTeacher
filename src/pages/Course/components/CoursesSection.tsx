import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, BookOpen } from "lucide-react";

import CourseListItem from "@/pages/Course/components/CourseListItem";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import Pagination from "@/components/ui/Pagination";
import { api } from "@/api"
import { CategoryFilter, LevelFilter, PriceFilter, SkillsFilter, RequirementsFilter, BenefitsFilter, ScheduleFilter, type FacetItem } from "./filters";

import type { Course, CourseSearchResult } from "@/types/course";

function useDebounce<T>(value: T, delay = 450) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

const MIN_PRICE = 0;
const MAX_PRICE = 20000000; // 20M VND

const sortOptions = [
  { value: "popular", label: "Most Popular" },
  { value: "newest", label: "Newest" },
  { value: "rating", label: "Highest Rated" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
];

const uiSortToServer: Record<string, string> = {
  popular: "Relevance",
  newest: "Created.desc",
  rating: "Relevance",
  "price-low": "Price.asc",
  "price-high": "Price.desc",
};

export default function CoursesSection() {
  const navigate = useNavigate();

  // UI states
  const [q, setQ] = useState("");
  const qDebounced = useDebounce(q);

  const [showFilters, setShowFilters] = useState(false);
  const [showDesktopFilters, setShowDesktopFilters] = useState(true);
  const [uiSort, setUiSort] = useState("popular");
  const [priceMin, setPriceMin] = useState(MIN_PRICE);
  const [priceMax, setPriceMax] = useState(MAX_PRICE);

  // Multi-select facets
  const [levelIds, setLevelIds] = useState<string[]>([]);
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [skillIds, setSkillIds] = useState<string[]>([]);
  const [requirementIds, setRequirementIds] = useState<string[]>([]);
  const [benefitIds, setBenefitIds] = useState<string[]>([]);
  
  // Schedule filters
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);

  // Data states
  const [items, setItems] = useState<Course[]>([]);
  const [levelsFacet, setLevelsFacet] = useState<FacetItem[]>([]);
  const [categoriesFacet, setCategoriesFacet] = useState<FacetItem[]>([]);
  const [skillsFacet, setSkillsFacet] = useState<FacetItem[]>([]);
  const [requirementsFacet, setRequirementsFacet] = useState<FacetItem[]>([]);
  const [benefitsFacet, setBenefitsFacet] = useState<FacetItem[]>([]);
  const [daysOfWeekFacet, setDaysOfWeekFacet] = useState<FacetItem[]>([]);
  const [timeSlotsFacet, setTimeSlotsFacet] = useState<FacetItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(4); 

  const [loading, setLoading] = useState(true); // Start with loading true
  const [err, setErr] = useState<string | null>(null);

  // Wishlist state
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());

  // Build querystring - always include all params to prevent re-fetches
  const buildSearchParams = () => {
    const s = new URLSearchParams();
    s.set("Sort", uiSortToServer[uiSort] ?? "Relevance");
    s.set("Page", String(page));
    s.set("PageSize", String(pageSize));
    
    // Always set these to avoid conditional logic causing re-renders
    if (qDebounced) s.set("Q", qDebounced);
    if (priceMin > MIN_PRICE) s.set("PriceMin", String(priceMin));
    if (priceMax < MAX_PRICE) s.set("PriceMax", String(priceMax));
    
    // Arrays - only add if not empty
    if (levelIds.length) s.set("LevelIds", levelIds.join(","));
    if (categoryIds.length) s.set("CategoryIds", categoryIds.join(","));
    if (skillIds.length) s.set("SkillIds", skillIds.join(","));
    if (requirementIds.length) s.set("RequirementIds", requirementIds.join(","));
    if (benefitIds.length) s.set("BenefitIds", benefitIds.join(","));
    
    selectedDays.forEach(day => s.append("DaysOfWeek", day));
    selectedTimeSlots.forEach(slot => s.append("TimeSlotNames", slot));
    
    return s;
  };

  // Fetch handler
  const fetchCourses = async (signal?: AbortSignal) => {
    setLoading(true);
    setErr(null);
    try {
      const searchParams = buildSearchParams();
      const paramsObject = Object.fromEntries(searchParams.entries());

      const response = await api.searchCourses(paramsObject, { signal });
      const data: CourseSearchResult = response.data;

      const arr = Array.isArray((data as any).items) ? (data.items as Course[]) : [];
      setItems(arr);

      setTotal((data as any).total ?? 0);
      setPageSize((data as any).pageSize ?? pageSize);

      const facets = (data as any).facets || {};
      setLevelsFacet((facets.levels as FacetItem[]) ?? []);
      setCategoriesFacet((facets.categories as FacetItem[]) ?? []);
      setSkillsFacet((facets.skills as FacetItem[]) ?? []);
      setRequirementsFacet((facets.requirements as FacetItem[]) ?? []);
      setBenefitsFacet((facets.benefits as FacetItem[]) ?? []);
      setDaysOfWeekFacet((facets.daysOfWeek as FacetItem[]) ?? []);
      setTimeSlotsFacet((facets.timeSlots as FacetItem[]) ?? []);
    } catch (e: any) {
      if (e?.name === "AbortError" || e?.code === "ERR_CANCELED") return;
      console.error("Failed to fetch courses:", e);
      setErr("Failed to load courses. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount and when filters change (batched 100ms)
  useEffect(() => {
    const abort = new AbortController();
    const timeoutId = setTimeout(() => {
      fetchCourses(abort.signal);
    }, 100); // Small delay to batch rapid changes
    
    return () => {
      clearTimeout(timeoutId);
      abort.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qDebounced, levelIds, categoryIds, skillIds, requirementIds, benefitIds, selectedDays, selectedTimeSlots, priceMin, priceMax, uiSort, page]);

  // Helpers Facet
  const toggleFacet = (setter: (v: string[]) => void, current: string[], key: string) => {
    const next = current.includes(key) ? current.filter((x) => x !== key) : [...current, key];
    setter(next);
    setPage(1);
  };

  // Active filter count
  const activeFiltersCount = useMemo(() => {
    let n = 0;
    if (qDebounced) n++;
    if (levelIds.length) n++;
    if (categoryIds.length) n++;
    if (skillIds.length) n++;
    if (requirementIds.length) n++;
    if (benefitIds.length) n++;
    if (selectedDays.length) n++;
    if (selectedTimeSlots.length) n++;
    if (priceMin > MIN_PRICE || priceMax < MAX_PRICE) n++;
    return n;
  }, [qDebounced, levelIds, categoryIds, skillIds, requirementIds, benefitIds, selectedDays, selectedTimeSlots, priceMin, priceMax]);

  const clearAll = () => {
    setQ("");
    setLevelIds([]);
    setCategoryIds([]);
    setSkillIds([]);
    setRequirementIds([]);
    setBenefitIds([]);
    setSelectedDays([]);
    setSelectedTimeSlots([]);
    setPriceMin(MIN_PRICE);
    setPriceMax(MAX_PRICE);
    setUiSort("popular");
    setPage(1);
  };

  const handleEnroll = (course: Course) => {
    navigate(`/course/${course.id}`);
  };

  const toggleWishlist = (courseId: string) => {
    setWishlist(prev => {
      const newWishlist = new Set(prev);
      if (newWishlist.has(courseId)) {
        newWishlist.delete(courseId);
      } else {
        newWishlist.add(courseId);
      }
      return newWishlist;
    });
  };

  const isInWishlist = (courseId: string) => {
    return wishlist.has(courseId);
  };

  return (
    <div id="courses" className="bg-gradient-to-b from-secondary-100 via-neutral-100 to-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-accent2-300 rounded-full text-sm font-medium mb-6 border border-primary-200">
            <BookOpen className="w-4 h-4 text-primary-600 mr-2" />
            <span className="text-primary-700">Individual Courses</span>
          </div>
          
          <h2 className="text-5xl font-bold text-neutral-900 mb-6 leading-tight">
            Explore Our <span className="bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">English Courses</span>
          </h2>
          
          <p className="text-xl text-neutral-600 max-w-4xl mx-auto leading-relaxed mb-8">
            Discover expert courses designed to accelerate your learning journey. 
            <br />
            From beginner-friendly basics to advanced specializations.
          </p>

          {/* Quick Stats */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-neutral-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-success-400 rounded-full animate-pulse"></div>
              <span className="font-medium">{total}+ Active Courses</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary-400 rounded-full"></div>
              <span className="font-medium">Expert Teachers</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-accent-400 rounded-full"></div>
              <span className="font-medium">Updated Weekly</span>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto relative mb-12">
          <div className="relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-400 w-6 h-6" />
            <Input
              type="text"
              placeholder="What do you want to learn today?"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              className="pl-16 pr-6 py-5 text-lg rounded-2xl border-0 shadow-xl bg-white focus:ring-1 focus:!ring-accent-300 transition-all"
            />
          </div>
        </div>

        {/* Enhanced Controls */}
        <div className="bg-white rounded-3xl p-8 shadow-md border border-neutral-100 mb-12 backdrop-blur-sm">
          {/* Controls */}
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-wrap items-center gap-3">
              {/* Mobile filter toggle */}
              <div className="md:hidden">
                <Button
                  variant="secondary"
                  onClick={() => setShowFilters((v) => !v)}
                  iconLeft={<Filter className="w-4 h-4" />}
                  className="bg-gradient-to-r from-neutral-100 to-neutral-200 hover:from-neutral-200 hover:to-neutral-300 border-0 shadow-md"
                >
                  Filters
                  {activeFiltersCount > 0 && (
                    <span className="bg-primary-500 text-white text-xs px-2 py-1 rounded-full ml-2 font-bold">
                      {activeFiltersCount}
                    </span>
                  )}
                </Button>
              </div>
              
              {/* Desktop filter toggle */}
              <div className="hidden lg:block">
                <Button
                  variant="secondary"
                  onClick={() => setShowDesktopFilters((v) => !v)}
                  iconLeft={<Filter className="w-4 h-4" />}
                  className="border-0 shadow-md transition-all"
                >
                  {showDesktopFilters ? 'Hide Filters' : 'Show Filters'}
                  {activeFiltersCount > 0 && (
                    <span className={`text-xs px-2 py-1 rounded-full ml-2 font-bold ${
                      showDesktopFilters 
                        ? 'bg-accent2-500 text-white' 
                        : 'bg-primary-500 text-white'
                    }`}>
                      {activeFiltersCount}
                    </span>
                  )}
                </Button>
              </div>
              
              {/* Sort Dropdown */}
              <div className="relative">
                <Select
                  value={uiSort}
                  onChange={(e) => {
                    setUiSort(e.target.value);
                    setPage(1);
                  }}
                  className="min-w-[220px] border-neutral-200 rounded-xl shadow-sm focus:!ring-1 focus:!ring-accent-500 focus:!border-transparent hover:shadow-md transition-all"
                >
                  {sortOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Clear Filters Button */}
              {activeFiltersCount > 0 && (
                <Button
                  variant="secondary"
                  onClick={clearAll}
                  className="bg-gradient-to-r from-error-500 to-error-600 hover:from-error-600 hover:to-error-700 text-white border-0 shadow-md"
                >
                  Clear All ({activeFiltersCount})
                </Button>
              )}
            </div>

            {/* Results Info */}
            <div className="flex items-center gap-4 text-sm">
              <p className="text-sm text-neutral-500">
                Showing <span className="font-semibold text-primary-600">{items.length}</span> of <span className="font-semibold text-primary-600">{total}</span> available courses
                {(selectedDays.length > 0 || selectedTimeSlots.length > 0) && (
                  <span className="text-blue-600">
                    (filtered by schedule)
                  </span>
                )}
              </p>
              {loading && (
                <div className="flex items-center gap-2 text-primary-600">
                  <div className="w-4 h-4 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                  <span className="text-sm font-medium">Updating...</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Layout */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className={`lg:w-72 flex-shrink-0 transition-all duration-300  ${
            showFilters ? 'block' : 'hidden lg:block'
          } ${
            showDesktopFilters ? 'lg:block' : 'lg:hidden'
          }`}>
            <div className="space-y-4">
               <CategoryFilter 
                 categoriesFacet={categoriesFacet}
                 selectedCategories={categoryIds}
                 onToggleCategory={(categoryId) => toggleFacet(setCategoryIds, categoryIds, categoryId)}
               />

               <LevelFilter 
                 levelsFacet={levelsFacet}
                 selectedLevels={levelIds}
                 onToggleLevel={(levelId) => toggleFacet(setLevelIds, levelIds, levelId)}
               />

               <SkillsFilter 
                 skillsFacet={skillsFacet}
                 selectedSkills={skillIds}
                 onToggleSkill={(skillId) => toggleFacet(setSkillIds, skillIds, skillId)}
               />

               <PriceFilter 
                 priceMin={priceMin}
                 priceMax={priceMax}
                 onPriceMinChange={setPriceMin}
                 onPriceMaxChange={setPriceMax}
                 onPageChange={setPage}
               />
              <ScheduleFilter 
                 selectedDays={selectedDays}
                 selectedTimeSlots={selectedTimeSlots}
                 onToggleDay={(day) => toggleFacet(setSelectedDays, selectedDays, day)}
                 onToggleTimeSlot={(timeSlot) => toggleFacet(setSelectedTimeSlots, selectedTimeSlots, timeSlot)}
                 daysOfWeekFacet={daysOfWeekFacet}
                 timeSlotsFacet={timeSlotsFacet}
               />
               <RequirementsFilter 
                 requirementsFacet={requirementsFacet}
                 selectedRequirements={requirementIds}
                 onToggleRequirement={(requirementId) => toggleFacet(setRequirementIds, requirementIds, requirementId)}
               />

               <BenefitsFilter 
                 benefitsFacet={benefitsFacet}
                 selectedBenefits={benefitIds}
                 onToggleBenefit={(benefitId) => toggleFacet(setBenefitIds, benefitIds, benefitId)}
               />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* States */}
            {loading && (
              <div className="flex justify-center items-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                <span className="ml-3 text-neutral-600">Loading courses...</span>
              </div>
            )}

            {err && !loading && (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-12 h-12 text-red-400" />
                </div>
                <h3 className="text-2xl font-semibold text-neutral-900 mb-4">Error Loading Courses</h3>
                <p className="text-neutral-600 mb-6">{err}</p>
                <Button onClick={() => window.location.reload()} variant="secondary">
                  Try Again
                </Button>
              </div>
            )}

            {!loading && !err && items.length > 0 ? (
              <>
                {/* Course Display */}
                <div className="space-y-4">
                  {items.map((course, index) => (
                    <div
                      key={course.id}
                      className="animate-in fade-in-0 slide-in-from-left-4"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <CourseListItem 
                        course={course} 
                        onEnroll={handleEnroll} 
                        onToggleWishlist={toggleWishlist}
                        isInWishlist={isInWishlist(course.id)}
                      />
                    </div>
                  ))}
                </div>

                <Pagination
                  page={page}
                  pageSize={pageSize}
                  total={total}
                  onPageChange={setPage}
                  loading={loading}
                />
              </>
            ) : !loading && !err ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-12 h-12 text-neutral-400" />
                </div>
                <h3 className="text-2xl font-semibold text-neutral-900 mb-4">No courses found</h3>
                <p className="text-neutral-600 mb-6">
                  Try adjusting your search criteria or filters to find what you're looking for.
                </p>
                <Button onClick={clearAll} variant="secondary">
                  Clear all filters
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

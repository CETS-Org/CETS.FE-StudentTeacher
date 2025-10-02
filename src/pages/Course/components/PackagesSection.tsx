import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Package, Filter } from "lucide-react";

import CoursePackageListItem from "@/pages/CoursePackage/components/CoursePackageListItem";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import Pagination from "@/components/ui/Pagination";
import { api } from "@/lib/config";
import { CategoryFilter, LevelFilter, PriceFilter, SkillsFilter, ScheduleFilter } from "./filters";
import { useAllCourseSchedules } from "@/hooks/useCourseSchedule";

import type { CoursePackage, CoursePackageSearchResult, CoursePackageSearchQuery, CoursePackageFacetItem } from "@/types/coursePackage";

function useDebounce<T>(value: T, delay = 450) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

const MIN_PRICE = 0;
const PACKAGE_MAX_PRICE = 20000000; // 50M VND for packages

const sortOptions = [
  { value: "Relevance", label: "Most Relevant" },
  { value: "Created.desc", label: "Newest" },
  { value: "Price.asc", label: "Price: Low to High" },
  { value: "Price.desc", label: "Price: High to Low" },
];

export default function PackagesSection() {
  const navigate = useNavigate();
  
  // Get all course schedules for filtering
  const { schedules: allSchedules } = useAllCourseSchedules();

  // UI states
  const [q, setQ] = useState("");
  const qDebounced = useDebounce(q);
  const [showFilters, setShowFilters] = useState(false);
  const [showDesktopFilters, setShowDesktopFilters] = useState(true);
  const [sort, setSort] = useState("Relevance");
  const [priceMin, setPriceMin] = useState(MIN_PRICE);
  const [priceMax, setPriceMax] = useState(PACKAGE_MAX_PRICE);

  // Multi-select facets
  const [levelIds, setLevelIds] = useState<string[]>([]);
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [skillIds, setSkillIds] = useState<string[]>([]);
  
  // Schedule filters
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize] = useState(4); 

  // Data states
  const [packageItems, setPackageItems] = useState<CoursePackage[]>([]);
  const [packageTotal, setPackageTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Facet states
  const [levelsFacet, setLevelsFacet] = useState<CoursePackageFacetItem[]>([]);
  const [categoriesFacet, setCategoriesFacet] = useState<CoursePackageFacetItem[]>([]);
  const [skillsFacet, setSkillsFacet] = useState<CoursePackageFacetItem[]>([]);

  // Search query parameters
  const searchQuery = useMemo((): CoursePackageSearchQuery => ({
    q: qDebounced || undefined,
    sort,
    page,
    pageSize,
    levelIds: levelIds.length > 0 ? levelIds : undefined,
    categoryIds: categoryIds.length > 0 ? categoryIds : undefined,
    skillIds: skillIds.length > 0 ? skillIds : undefined,
    daysOfWeek: selectedDays.length > 0 ? selectedDays : undefined,
    timeSlotNames: selectedTimeSlots.length > 0 ? selectedTimeSlots : undefined,
    priceMin: priceMin > MIN_PRICE ? priceMin : undefined,
    priceMax: priceMax < PACKAGE_MAX_PRICE ? priceMax : undefined,
    isActive: true, 
  }), [qDebounced, sort, page, pageSize, levelIds, categoryIds, skillIds, selectedDays, selectedTimeSlots, priceMin, priceMax]);

  // Wishlist state
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());

  // Fetch course packages with search
  useEffect(() => {
    const abort = new AbortController();
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const response = await api.searchCoursePackages(searchQuery, { signal: abort.signal });
        const data: CoursePackageSearchResult = response.data;

        setPackageItems(data.items || []);
        setPackageTotal(data.total || 0);
        
        // Update facets
        const facets = data.facets || {};
        setLevelsFacet(facets.levels || []);
        setCategoriesFacet(facets.categories || []);
        setSkillsFacet(facets.skills || []);
        
      } catch (e: any) {
        if (e?.name === "AbortError" || e?.code === "ERR_CANCELED") return;
        console.error("Failed to fetch course packages:", e);
        setErr("Failed to load course packages. Please try again later.");
      } finally {
        setLoading(false);
      }
    })();
    return () => abort.abort();
  }, [searchQuery]);

  // Helpers Facet
  const toggleFacet = (setter: (v: string[]) => void, current: string[], key: string) => {
    const next = current.includes(key) ? current.filter((x) => x !== key) : [...current, key];
    setter(next);
    setPage(1); // Reset to first page when filters change
  };

  // Reset page when search query changes (except page itself)
  useEffect(() => {
    setPage(1);
  }, [qDebounced, sort, levelIds, categoryIds, skillIds, selectedDays, selectedTimeSlots, priceMin, priceMax]);

  // Active filter count
  const activeFiltersCount = useMemo(() => {
    let n = 0;
    if (qDebounced) n++;
    if (levelIds.length) n++;
    if (categoryIds.length) n++;
    if (skillIds.length) n++;
    if (selectedDays.length) n++;
    if (selectedTimeSlots.length) n++;
    if (priceMin > MIN_PRICE || priceMax < PACKAGE_MAX_PRICE) n++;
    return n;
  }, [qDebounced, levelIds, categoryIds, skillIds, selectedDays, selectedTimeSlots, priceMin, priceMax]);

  const clearAll = () => {
    setQ("");
    setLevelIds([]);
    setCategoryIds([]);
    setSkillIds([]);
    setSelectedDays([]);
    setSelectedTimeSlots([]);
    setPriceMin(MIN_PRICE);
    setPriceMax(PACKAGE_MAX_PRICE);
    setSort("Relevance");
    setPage(1); 
  };

  const handleEnroll = (coursePackage: CoursePackage) => {
    navigate(`/course-package/${coursePackage.id}`);
  };

  const toggleWishlist = (coursePackageId: string) => {
    setWishlist(prev => {
      const newWishlist = new Set(prev);
      if (newWishlist.has(coursePackageId)) {
        newWishlist.delete(coursePackageId);
      } else {
        newWishlist.add(coursePackageId);
      }
      return newWishlist;
    });
  };

  const isInWishlist = (coursePackageId: string) => {
    return wishlist.has(coursePackageId);
  };

  return (
    <div id="packages" className="bg-gradient-to-b from-neutral-50 to-neutral-100 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-success-200 to-success-200 rounded-full text-sm font-medium mb-6 border border-primary-200">
            <Package className="w-4 h-4 text-primary-600 mr-2" />
            <span className="text-primary-700">Course Combos</span>
          </div>
          
          <h2 className="text-5xl font-bold text-neutral-900 mb-6 leading-tight">
            Save More with <span className="bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">Course Combos</span>
          </h2>
          
          <p className="text-xl text-neutral-600 max-w-4xl mx-auto leading-relaxed mb-8">
            Get the best value with our course packages designed to accelerate your learning journey.
            <br />
            Multiple courses, one great price.
          </p>

          {/* Quick Stats */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-neutral-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-success-400 rounded-full animate-pulse"></div>
              <span className="font-medium">{packageTotal}+ Available Packages</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary-400 rounded-full"></div>
              <span className="font-medium">Combo Discounts</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-accent-400 rounded-full"></div>
              <span className="font-medium">Curated Content</span>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto relative mb-12">
          <div className="relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-400 w-6 h-6" />
            <Input
              type="text"
              placeholder="Search course packages..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-16 pr-6 py-5 text-lg rounded-2xl border-0 shadow-xl bg-white focus:ring-1 focus:!ring-accent-300 transition-all"
            />
          </div>
        </div>

        {/* Enhanced Controls */}
        <div className="bg-white rounded-3xl p-8 shadow-md border border-neutral-100 mb-12 backdrop-blur-sm">
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
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
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
                Showing <span className="font-semibold text-primary-600">{packageItems.length}</span> of <span className="font-semibold text-primary-600">{packageTotal}</span> available combos
              </p>
              {loading && (
                <div className="flex items-center gap-2 text-primary-600">
                  <div className="w-4 h-4 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                  <span className="text-sm font-medium">Loading...</span>
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
                 onToggleCategory={(categoryId: string) => toggleFacet(setCategoryIds, categoryIds, categoryId)}
               />

               <LevelFilter 
                 levelsFacet={levelsFacet}
                 selectedLevels={levelIds}
                 onToggleLevel={(levelId: string) => toggleFacet(setLevelIds, levelIds, levelId)}
               />

               <SkillsFilter 
                 skillsFacet={skillsFacet}
                 selectedSkills={skillIds}
                 onToggleSkill={(skillId: string) => toggleFacet(setSkillIds, skillIds, skillId)}
               />

               <ScheduleFilter 
                 selectedDays={selectedDays}
                 selectedTimeSlots={selectedTimeSlots}
                 onToggleDay={(day: string) => toggleFacet(setSelectedDays, selectedDays, day)}
                 onToggleTimeSlot={(timeSlot: string) => toggleFacet(setSelectedTimeSlots, selectedTimeSlots, timeSlot)}
                 allSchedules={allSchedules}
               />

               <PriceFilter 
                 priceMin={priceMin}
                 priceMax={priceMax}
                 onPriceMinChange={setPriceMin}
                 onPriceMaxChange={setPriceMax}
                 onPageChange={setPage}
               />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
          {/* States */}
          {loading && (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              <span className="ml-3 text-neutral-600">Loading course packages...</span>
            </div>
          )}

          {err && !loading && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-12 h-12 text-red-400" />
              </div>
              <h3 className="text-2xl font-semibold text-neutral-900 mb-4">Error Loading Packages</h3>
              <p className="text-neutral-600 mb-6">{err}</p>
              <Button onClick={() => window.location.reload()} variant="secondary">
                Try Again
              </Button>
            </div>
          )}

          {!loading && !err && packageItems.length > 0 ? (
            <div className="space-y-4">
              {packageItems.map((coursePackage, index) => (
                <div
                  key={coursePackage.id}
                  className="animate-in fade-in-0 slide-in-from-left-4"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CoursePackageListItem 
                    coursePackage={coursePackage} 
                    onEnroll={handleEnroll} 
                    onToggleWishlist={toggleWishlist}
                    isInWishlist={isInWishlist(coursePackage.id)}
                  />
                </div>
              ))}
            </div>
          ) : !loading && !err ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="w-12 h-12 text-neutral-400" />
              </div>
              <h3 className="text-2xl font-semibold text-neutral-900 mb-4">No packages found</h3>
              <p className="text-neutral-600 mb-6">
                Try adjusting your search criteria or filters to find what you're looking for.
              </p>
              <Button onClick={clearAll} variant="secondary">
                Clear all filters
              </Button>
            </div>
          ) : null}

          <Pagination
            page={page}
            pageSize={pageSize}
            total={packageTotal}
            onPageChange={setPage}
            loading={loading}
          />
          </div>
        </div>
      </div>
    </div>
  );
}


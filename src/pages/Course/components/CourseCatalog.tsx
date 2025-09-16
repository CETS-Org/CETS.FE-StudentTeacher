import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, Star, Award, Users, BookOpen, Grid3X3, List } from "lucide-react";

import CourseCard from "@/pages/Course/components/CourseCard";
import CourseListItem from "@/pages/Course/components/CourseListItem";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { api } from "@/lib/config"

import type { Course, CourseSearchResult } from "@/types/course";

function useDebounce<T>(value: T, delay = 450) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

type FacetItem = { key: string; label?: string | null; count: number; selected?: boolean };

const priceOptions = [
  { value: "all", label: "All Prices" },
  { value: "0-2000000", label: "Under 2M VND" },
  { value: "2000000-5000000", label: "2M - 5M VND" },
  { value: "5000000-10000000", label: "5M - 10M VND" },
  { value: "10000000+", label: "Above 10M VND" },
];

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

export default function CourseCatalog() {
  const navigate = useNavigate();

  // UI states
  const [q, setQ] = useState("");
  const qDebounced = useDebounce(q);

  const [showFilters, setShowFilters] = useState(false);
  const [showDesktopFilters, setShowDesktopFilters] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [uiSort, setUiSort] = useState("popular");
  const [priceRange, setPriceRange] = useState("all");

  // Multi-select facets
  const [levelIds, setLevelIds] = useState<string[]>([]);
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [skillIds, setSkillIds] = useState<string[]>([]); // NEW

  // Data states
  const [items, setItems] = useState<Course[]>([]);
  const [levelsFacet, setLevelsFacet] = useState<FacetItem[]>([]);
  const [categoriesFacet, setCategoriesFacet] = useState<FacetItem[]>([]);
  const [skillsFacet, setSkillsFacet] = useState<FacetItem[]>([]); // NEW
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(18);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Build querystring
  function buildSearchParams() {
    const s = new URLSearchParams();
    if (qDebounced) s.set("Q", qDebounced);
    if (levelIds.length) s.set("LevelIds", levelIds.join(","));
    if (categoryIds.length) s.set("CategoryIds", categoryIds.join(","));
    if (skillIds.length) s.set("SkillIds", skillIds.join(",")); // NEW
    if (priceRange !== "all") {
      if (priceRange.endsWith("+")) {
        s.set("PriceMin", priceRange.replace("+", ""));
      } else {
        const [min, max] = priceRange.split("-");
        s.set("PriceMin", min);
        s.set("PriceMax", max);
      }
    }
    s.set("Sort", uiSortToServer[uiSort] ?? "Relevance");
    s.set("Page", String(page));
    s.set("PageSize", String(pageSize));
    return s;
  }

  // Fetch
  useEffect(() => {
    const abort = new AbortController();
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const searchParams = buildSearchParams();
        const paramsObject = Object.fromEntries(searchParams.entries());

        const response = await api.searchCourses(paramsObject, { signal: abort.signal });
        const data: CourseSearchResult = response.data;

        const arr = Array.isArray((data as any).items) ? (data.items as Course[]) : [];
        setItems(arr);

        setTotal((data as any).total ?? 0);
        setPageSize((data as any).pageSize ?? pageSize);

        const facets = (data as any).facets || {};
        setLevelsFacet((facets.levels as FacetItem[]) ?? []);
        setCategoriesFacet((facets.categories as FacetItem[]) ?? []);
        setSkillsFacet((facets.skills as FacetItem[]) ?? []); // NEW
      } catch (e: any) {
        if (e?.name === "AbortError" || e?.code === "ERR_CANCELED") return;
        console.error("Failed to fetch courses:", e);
        setErr("Failed to load courses. Please try again later.");
      } finally {
        setLoading(false);
      }
    })();
    return () => abort.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qDebounced, levelIds.join(","), categoryIds.join(","), skillIds.join(","), priceRange, uiSort, page]);

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
    if (skillIds.length) n++; // NEW
    if (priceRange !== "all") n++;
    return n;
  }, [qDebounced, levelIds, categoryIds, skillIds, priceRange]);

  const currentPriceValue = useMemo(() => priceRange, [priceRange]);

  const clearAll = () => {
    setQ("");
    setLevelIds([]);
    setCategoryIds([]);
    setSkillIds([]); // NEW
    setPriceRange("all");
    setUiSort("popular");
    setPage(1);
  };

  const handleEnroll = (course: Course) => {
    navigate(`/course/${course.id}`);
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 min-h-screen">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-500 to-accent-500">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-700/20 to-accent-600/20"></div>
          <div className="absolute top-0 left-0 w-72 h-72 bg-accent-300/10 rounded-full blur-3xl"></div>
          <div className="absolute top-20 right-0 w-96 h-96 bg-blue-300/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-accent-400/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center text-white">
            <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-8 border border-white/30">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
              Join 50,000+ learners worldwide
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-white via-blue-100 to-accent-100 bg-clip-text text-transparent whitespace-nowrap">
                Learn Without Limits
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-12 text-blue-100 max-w-4xl mx-auto leading-normal">
              Transform your career with expert-led courses. Master new skills, earn certificates, and join a global community of learners.
            </p>

            <div className="max-w-2xl mx-auto relative mb-8">
              <div className="relative">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6" />
                <Input
                  type="text"
                  placeholder="What do you want to learn today?"
                  value={q}
                  onChange={(e) => {
                    setQ(e.target.value);
                    setPage(1);
                  }}
                  className="pl-16 pr-6 py-5 text-lg rounded-2xl border-0 shadow-2xl bg-white/95 backdrop-blur-sm focus:ring-4 focus:ring-accent-300/50 focus:bg-white transition-all"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Button className="btn-secondary px-6 py-2 rounded-xl font-semibold">
                    Search
                  </Button>
                </div>
              </div>
            </div>

          
          </div>
        </div>
        
        {/* Floating elements */}
        <div className="absolute top-32 left-10 w-20 h-20 bg-gradient-to-br from-accent-400 to-primary-500 rounded-2xl rotate-12 animate-bounce opacity-20"></div>
        <div className="absolute top-20 right-20 w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full animate-pulse opacity-30"></div>
        <div className="absolute bottom-32 left-1/4 w-12 h-12 bg-gradient-to-br from-primary-400 to-accent-500 rounded-xl -rotate-12 animate-bounce delay-1000 opacity-25"></div>
        <div className="absolute top-1/2 right-10 w-8 h-8 bg-gradient-to-br from-accent-400 to-blue-500 rounded-full animate-ping opacity-20"></div>
      </div>

      {/* Stats */}
      <div className="py-20 bg-gradient-to-r from-white via-blue-50 to-accent-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Trusted by Learners Worldwide
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed text-center">
              Join thousands of students who have transformed their careers with our courses
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-accent-600 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-all duration-300 shadow-lg group-hover:shadow-xl">
                  <Users className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-bold">✓</span>
                </div>
              </div>
              <div className="text-4xl font-extrabold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent mb-2">50K+</div>
              <div className="text-gray-700 font-medium whitespace-nowrap">Happy Students</div>
              <div className="text-sm text-gray-500 mt-1 whitespace-nowrap">Across 150+ countries</div>
            </div>
            
            <div className="text-center group">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-all duration-300 shadow-lg group-hover:shadow-xl">
                  <BookOpen className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-bold">★</span>
                </div>
              </div>
              <div className="text-4xl font-extrabold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">100+</div>
              <div className="text-gray-700 font-medium whitespace-nowrap">Expert Courses</div>
              <div className="text-sm text-gray-500 mt-1 whitespace-nowrap">By industry experts</div>
            </div>
            
            <div className="text-center group">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-all duration-300 shadow-lg group-hover:shadow-xl">
                  <Star className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-pink-400 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-bold">♥</span>
                </div>
              </div>
              <div className="text-4xl font-extrabold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-2">4.8</div>
              <div className="text-gray-700 font-medium whitespace-nowrap">Average Rating</div>
              <div className="text-sm text-gray-500 mt-1 whitespace-nowrap">From 25,000+ reviews</div>
            </div>
            
            <div className="text-center group">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-all duration-300 shadow-lg group-hover:shadow-xl">
                  <Award className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-400 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-bold">🏆</span>
                </div>
              </div>
              <div className="text-4xl font-extrabold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">95%</div>
              <div className="text-gray-700 font-medium whitespace-nowrap">Success Rate</div>
              <div className="text-sm text-gray-500 mt-1 whitespace-nowrap">Course completion</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Explore Our Courses
          </h2>
          <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed text-center">
            Find the perfect course to advance your skills and career goals
          </p>
        </div>

        {/* Top controls */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8">
          <div className="flex items-center gap-4">
            {/* Mobile filter toggle */}
            <div className="md:hidden">
              <Button
                variant="secondary"
                onClick={() => setShowFilters((v) => !v)}
                iconLeft={<Filter className="w-4 h-4" />}
                className="btn-secondary border-0"
              >
                Filters
                {activeFiltersCount > 0 && (
                  <span className="bg-yellow-400 text-gray-900 text-xs px-2 py-1 rounded-full ml-2 font-bold">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
            </div>
            
            {/* Desktop filter toggle */}
            <div className="hidden md:block">
              <Button
                variant="secondary"
                onClick={() => setShowDesktopFilters((v) => !v)}
                iconLeft={<Filter className="w-4 h-4" />}
                className={`border-0 shadow-md transition-all ${
                  showDesktopFilters 
                    ? 'bg-gradient-to-r from-accent-500 to-primary-600 hover:from-accent-600 hover:to-primary-700 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {showDesktopFilters ? 'Hide Filters' : 'Show Filters'}
                {activeFiltersCount > 0 && (
                  <span className="bg-yellow-400 text-gray-900 text-xs px-2 py-1 rounded-full ml-2 font-bold">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
            </div>
            
            {/* View mode toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <Button
                variant="ghost"
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white shadow-sm text-primary-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-all ${
                  viewMode === 'list'
                    ? 'bg-white shadow-sm text-primary-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>

            <div className="relative">
              <Select
                value={uiSort}
                onChange={(e) => {
                  setUiSort(e.target.value);
                  setPage(1);
                }}
                className="min-w-[200px] bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-accent-500 focus:border-transparent"
              >
                {sortOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm text-gray-600">
            <span className="font-medium">Showing {items.length} of {total} courses</span>
            <div className="w-2 h-2 bg-accent-400 rounded-full"></div>
            <span>Updated daily</span>
          </div>
        </div>

        {/* Sidebar Layout */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className={`md:w-72 flex-shrink-0 transition-all duration-300 ${
            showFilters ? 'block' : 'hidden md:block'
          } ${
            showDesktopFilters ? 'md:block' : 'md:hidden'
          }`}>
            <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 sticky top-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Filters</h3>
                {activeFiltersCount > 0 && (
                  <Button 
                    variant="secondary" 
                    onClick={clearAll} 
                    className="text-xs bg-gradient-to-r from-error-500 to-error-600 hover:from-error-600 hover:to-error-700 text-white border-0 shadow-md px-3 py-1 rounded-lg font-semibold"
                  >
                    Clear
                  </Button>
                )}
              </div>

              <div className="space-y-4">
                {/* Category */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-5 h-5 bg-gradient-to-br from-accent-500 to-primary-600 rounded flex items-center justify-center">
                      <span className="text-white text-xs">📚</span>
                    </div>
                    <label className="text-sm font-semibold text-gray-800">Category</label>
                  </div>
                  <div className="space-y-1 max-h-32 overflow-auto">
                    {categoriesFacet.length > 0 ? (
                      categoriesFacet.map((f) => (
                        <label key={f.key} className="flex items-center gap-2 py-1 px-2 rounded hover:bg-accent-50 transition-colors cursor-pointer">
                          <input
                            type="checkbox"
                            checked={categoryIds.includes(f.key)}
                            onChange={() => toggleFacet(setCategoryIds, categoryIds, f.key)}
                            className="w-3 h-3 text-accent-600 rounded focus:ring-accent-500"
                          />
                          <span className="text-gray-700 flex-1 text-xs">
                            {f.label ?? f.key}
                          </span>
                          <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                            {f.count}
                          </span>
                        </label>
                      ))
                    ) : (
                      <div className="text-xs text-gray-500 text-center py-2">No categories</div>
                    )}
                  </div>
                </div>

                {/* Level */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-5 h-5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded flex items-center justify-center">
                      <span className="text-white text-xs">📊</span>
                    </div>
                    <label className="text-sm font-semibold text-gray-800">Level</label>
                  </div>
                  <div className="space-y-1 max-h-32 overflow-auto">
                    {levelsFacet.length > 0 ? (
                      levelsFacet.map((f) => (
                        <label key={f.key} className="flex items-center gap-2 py-1 px-2 rounded hover:bg-accent-50 transition-colors cursor-pointer">
                          <input
                            type="checkbox"
                            checked={levelIds.includes(f.key)}
                            onChange={() => toggleFacet(setLevelIds, levelIds, f.key)}
                            className="w-3 h-3 text-accent-600 rounded focus:ring-accent-500"
                          />
                          <span className="text-gray-700 flex-1 text-xs">
                            {f.label ?? f.key}
                          </span>
                          <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                            {f.count}
                          </span>
                        </label>
                      ))
                    ) : (
                      <div className="text-xs text-gray-500 text-center py-2">No levels</div>
                    )}
                  </div>
                </div>

                {/* Price */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-5 h-5 bg-gradient-to-br from-yellow-500 to-orange-600 rounded flex items-center justify-center">
                      <span className="text-white text-xs">💰</span>
                    </div>
                    <label className="text-sm font-semibold text-gray-800">Price Range</label>
                  </div>
                  <Select
                    value={currentPriceValue}
                    onChange={(e) => {
                      setPriceRange(e.target.value);
                      setPage(1);
                    }}
                    className="w-full text-xs bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                  >
                    {priceOptions.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* States */}
min        {loading && (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <span className="ml-3 text-gray-600">Loading courses...</span>
          </div>
        )}

        {err && !loading && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-red-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Error Loading Courses</h3>
            <p className="text-gray-600 mb-6">{err}</p>
            <Button onClick={() => window.location.reload()} variant="secondary">
              Try Again
            </Button>
          </div>
        )}

        {!loading && !err && items.length > 0 ? (
          <>
            {/* Course Display */}
            {viewMode === 'grid' ? (
              <div className={`grid gap-6 ${
                showDesktopFilters 
                  ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' 
                  : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              }`}>
                {items.map((course, index) => (
                  <div
                    key={course.id}
                    className="animate-in fade-in-0 slide-in-from-bottom-4"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <CourseCard course={course} onEnroll={handleEnroll} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((course, index) => (
                  <div
                    key={course.id}
                    className="animate-in fade-in-0 slide-in-from-left-4"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <CourseListItem course={course} onEnroll={handleEnroll} />
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            <div className="mt-8 flex items-center justify-center gap-2">
              <Button
                variant="secondary"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || loading}
              >
                Prev
              </Button>
              <span className="text-sm">Page {page}</span>
              <Button
                variant="secondary"
                onClick={() => setPage((p) => p + 1)}
                disabled={page * pageSize >= total || loading}
              >
                Next
              </Button>
            </div>
          </>
        ) : !loading && !err ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">No courses found</h3>
            <p className="text-gray-600 mb-6">
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

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, Star, Award, Users, BookOpen } from "lucide-react";

import CourseCard from "@/pages/Course/components/CourseCard";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { api } from "@/lib/config";

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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center text-white">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-primary-200 bg-clip-text text-transparent">
              Discover Your Perfect Course
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100 mx-auto">
              Master English with our expert-led courses. From beginner to advanced,
              we have everything you need to achieve your language goals.
            </p>

            <div className="w-[70%] mx-auto relative">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search courses, teachers, or topics..."
                  value={q}
                  onChange={(e) => {
                    setQ(e.target.value);
                    setPage(1);
                  }}
                  className="pl-12 pr-4 py-4 text-lg rounded-2xl border-0 shadow-2xl focus:ring-4 focus:ring-white/30"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full animate-bounce" />
        <div className="absolute top-40 right-20 w-16 h-16 bg-white/10 rounded-full animate-pulse" />
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-white/10 rounded-full animate-bounce delay-1000" />
      </div>

      {/* Stats */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">50K+</div>
              <div className="text-gray-600">Happy Students</div>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-accent-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">100+</div>
              <div className="text-gray-600">Expert Courses</div>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-success-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Star className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">4.8</div>
              <div className="text-gray-600">Average Rating</div>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Award className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">95%</div>
              <div className="text-gray-600">Success Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Top controls */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="secondary"
                onClick={() => setShowFilters((v) => !v)}
                iconLeft={<Filter className="w-4 h-4" />}
              >
                Filters
                {activeFiltersCount > 0 && (
                  <span className="bg-primary-600 text-white text-xs px-2 py-1 rounded-full ml-2">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>

              <Select
                value={uiSort}
                onChange={(e) => {
                  setUiSort(e.target.value);
                  setPage(1);
                }}
                className="min-w-[200px]"
              >
                {sortOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {/* Filter panel */}
          {showFilters && (
            <Card className="mt-6 animate-in slide-in-from-top-4 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <div className="space-y-2 max-h-48 overflow-auto pr-1">
                    {categoriesFacet.length > 0 ? (
                      categoriesFacet.map((f) => (
                        <label key={f.key} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={categoryIds.includes(f.key)}
                            onChange={() => toggleFacet(setCategoryIds, categoryIds, f.key)}
                          />
                          <span>
                            {f.label ?? f.key}{" "}
                            <span className="text-sm text-neutral-500">({f.count})</span>
                          </span>
                        </label>
                      ))
                    ) : (
                      <div className="text-sm text-neutral-500">No categories</div>
                    )}
                  </div>
                </div>

                {/* Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
                  <div className="space-y-2 max-h-48 overflow-auto pr-1">
                    {levelsFacet.length > 0 ? (
                      levelsFacet.map((f) => (
                        <label key={f.key} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={levelIds.includes(f.key)}
                            onChange={() => toggleFacet(setLevelIds, levelIds, f.key)}
                          />
                          <span>
                            {f.label ?? f.key}{" "}
                            <span className="text-sm text-neutral-500">({f.count})</span>
                          </span>
                        </label>
                      ))
                    ) : (
                      <div className="text-sm text-neutral-500">No levels</div>
                    )}
                  </div>
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                  <Select
                    value={currentPriceValue}
                    onChange={(e) => {
                      setPriceRange(e.target.value);
                      setPage(1);
                    }}
                  >
                    {priceOptions.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              {/* Skills (NEW) */}
              <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
                  <div className="space-y-2 max-h-48 overflow-auto pr-1">
                    {skillsFacet.length > 0 ? (
                      skillsFacet.map((f) => (
                        <label key={f.key} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={skillIds.includes(f.key)}
                            onChange={() => toggleFacet(setSkillIds, skillIds, f.key)}
                          />
                          <span>
                            {f.label ?? f.key}{" "}
                            <span className="text-sm text-neutral-500">({f.count})</span>
                          </span>
                        </label>
                      ))
                    ) : (
                      <div className="text-sm text-neutral-500">No skills</div>
                    )}
                  </div>
                </div>
              </div>

              {activeFiltersCount > 0 && (
                <div className="mt-4 flex justify-end">
                  <Button variant="secondary" onClick={clearAll} className="text-sm">
                    Clear all filters
                  </Button>
                </div>
              )}
            </Card>
          )}
        </div>

        {/* States */}
        {loading && (
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
            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
  );
}

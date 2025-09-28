import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Search } from "lucide-react";
import CoursesSection from "./components/CoursesSection";
import PackagesSection from "./components/PackagesSection";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import courseBgImage from "@/assets/course-bg.png";

export default function CourseAll() {
  const location = useLocation();

  useEffect(() => {
    // Handle hash navigation
    if (location.hash) {
      const element = document.getElementById(location.hash.substring(1));
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  }, [location.hash]);
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat blur-xs"
            style={{ backgroundImage: `url(${courseBgImage})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary-600/40 via-primary-500/30 to-primary-500/40"></div>
          <div className="absolute top-0 left-0 w-72 h-72 bg-primary-400/10 rounded-full blur-3xl"></div>
          <div className="absolute top-20 right-0 w-96 h-96 bg-accent-400/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-primary-300/10 rounded-full blur-3xl"></div>
        </div>
      
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-36">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
              <span className="text-white drop-shadow-2xl whitespace-nowrap">
                Learn Without Limits
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-12 text-white/90 max-w-5xl mx-auto leading-normal drop-shadow-lg">
              Interactive lessons, real-world practice, and personalized feedback from expert instructors.
              <br />
              Choose individual courses or save with our course packages.
            </p>

            <div className="max-w-2xl mx-auto relative mb-8">
              <div className="relative">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-400 w-6 h-6 " />
                <Input
                  type="text"
                  placeholder="What do you want to learn today?"
                  className="pl-16 pr-6 py-5 text-lg rounded-2xl border-0 shadow-2xl bg-white/95 focus:ring-1 focus:!ring-accent-300 focus:!bg-white transition-all"
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
        <div className="absolute top-32 left-10 w-20 h-20 bg-gradient-to-br from-accent-500 to-primary-600 rounded-2xl rotate-12 animate-bounce opacity-20"></div>
        <div className="absolute top-20 right-20 w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-600 rounded-full animate-pulse opacity-30"></div>
        <div className="absolute bottom-32 left-1/4 w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl -rotate-12 animate-bounce delay-1000 opacity-25"></div>
        <div className="absolute top-1/2 right-10 w-8 h-8 bg-gradient-to-br from-accent-500 to-primary-600 rounded-full animate-ping opacity-20"></div>
      </div>

      {/* Courses Section */}
      <CoursesSection />

      {/* Section Divider */}
      <div className="relative py-16">
        <div className="absolute inset-0 bg-gradient-to-r from-secondary-200 via-accent-100 to-secondary-200"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-24 h-1 bg-gradient-to-r from-primary-500 to-accent-500 mx-auto rounded-full mb-4"></div>
            <p className="text-lg text-neutral-600 font-medium">
              Or explore our money-saving course combos below
            </p>
          </div>
        </div>
      </div>

      {/* Packages Section */}
      <PackagesSection />
    </div>
  );
}
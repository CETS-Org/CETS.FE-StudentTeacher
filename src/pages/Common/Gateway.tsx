import { usePageTitle } from "../../hooks/usePageTitle";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import GateWayImg1 from "../../assets/Gateway1.png";
import GateWayImg2 from "../../assets/Gateway2.png";
import GateWayImg3 from "../../assets/Gateway3.png";

export default function Gateway() {
  usePageTitle("Gateway - Unlimited Educational Resources");

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-primary-50">
      {/* Hero Section */}
      <div className="mx-auto max-w-7xl px-4 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-4xl lg:text-5xl font-bold text-neutral-900 leading-tight">
                This is Your Gateway to Unlimited{" "}
                <span className="text-primary-600">Educational Resources</span>
              </h1>
              
              <p className="text-lg text-neutral-600 leading-relaxed">
                Discover a world of learning at your fingertips with our comprehensive educational 
                platform. Whether you're a student, educator, or lifelong learner, our site offers 
                an extensive collection of resources.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="text-base px-8 py-4">
                Learn More
              </Button>
              <Button variant="secondary" size="lg" className="text-base px-8 py-4">
                Get Started
              </Button>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-3 gap-4 pt-8">
              <Card className="text-center border-none shadow-md bg-neutral-0">
                <div className="p-4">
                  <div className="text-primary-600 mb-2">
                    <svg className="w-8 h-8 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                    </svg>
                  </div>
                  <div className="text-2xl font-bold text-neutral-900">140K</div>
                  <div className="text-sm text-neutral-600">Active Students</div>
                </div>
              </Card>

              <Card className="text-center border-none shadow-md bg-neutral-0">
                <div className="p-4">
                  <div className="text-primary-600 mb-2">
                    <svg className="w-8 h-8 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
                    </svg>
                  </div>
                  <div className="text-2xl font-bold text-neutral-900">18</div>
                  <div className="text-sm text-neutral-600">Courses</div>
                </div>
              </Card>

              <Card className="text-center border-none shadow-md bg-neutral-0">
                <div className="p-4">
                  <div className="text-primary-600 mb-2">
                    <svg className="w-8 h-8 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <div className="text-2xl font-bold text-neutral-900">45K</div>
                  <div className="text-sm text-neutral-600">Teachers</div>
                </div>
              </Card>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-4 pt-4">
              <a 
                href="#" 
                className="w-10 h-10 bg-primary-600 hover:bg-primary-700 text-white rounded-full flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              
              <a 
                href="#" 
                className="w-10 h-10 bg-primary-600 hover:bg-primary-700 text-white rounded-full flex items-center justify-center transition-colors"
                aria-label="LinkedIn"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              
              <a 
                href="#" 
                className="w-10 h-10 bg-primary-600 hover:bg-primary-700 text-white rounded-full flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.624 5.367 11.99 11.988 11.99s11.99-5.366 11.99-11.99C24.007 5.367 18.641.001 12.017.001zm5.568 16.69c-.344.329-.725.607-1.14.827-.415.22-.865.384-1.348.493-.483.108-.996.162-1.54.162h-2.555c-.544 0-1.057-.054-1.54-.162-.483-.109-.933-.273-1.348-.493-.415-.22-.796-.498-1.14-.827-.329-.344-.607-.725-.827-1.14-.22-.415-.384-.865-.493-1.348-.108-.483-.162-.996-.162-1.54V9.327c0-.544.054-1.057.162-1.54.109-.483.273-.933.493-1.348.22-.415.498-.796.827-1.14.344-.329.725-.607 1.14-.827.415-.22.865-.384 1.348-.493.483-.108.996-.162 1.54-.162h2.555c.544 0 1.057.054 1.54.162.483.109.933.273 1.348.493.415.22.796.498 1.14.827.329.344.607.725.827 1.14.22.415.384.865.493 1.348.108.483.162.996.162 1.54v2.555c0 .544-.054 1.057-.162 1.54-.109.483-.273.933-.493 1.348-.22.415-.498.796-.827 1.14z"/>
                  <path d="M12.017 5.838c-3.405 0-6.162 2.757-6.162 6.162s2.757 6.163 6.162 6.163 6.162-2.758 6.162-6.163c0-3.405-2.757-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              
              <a 
                href="#" 
                className="w-10 h-10 bg-primary-600 hover:bg-primary-700 text-white rounded-full flex items-center justify-center transition-colors"
                aria-label="YouTube"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Right Content - Hero Images */}
          <div className="relative h-[600px]">
            <div className="grid grid-cols-5 gap-4 h-full">
              {/* Left column - Gateway1 and Gateway2 */}
              <div className="col-span-3 space-y-4">
                <div className="relative h-[288px]">
                  <div className="h-full rounded-2xl overflow-hidden shadow-lg">
                    <img 
                      src={GateWayImg1} 
                      alt="Student Learning" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                
                <div className="relative h-[288px]">
                  <div className="h-full rounded-2xl overflow-hidden shadow-lg">
                    <img 
                      src={GateWayImg2} 
                      alt="Professional Teacher" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
              
              {/* Right column - Gateway3 (tall image spanning full height) */}
              <div className="col-span-2 relative">
                <div className="h-full rounded-2xl overflow-hidden shadow-lg">
                  <img 
                    src={GateWayImg3} 
                    alt="Graduate Student" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
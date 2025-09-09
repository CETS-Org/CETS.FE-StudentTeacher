import { usePageTitle } from "../../hooks/usePageTitle";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import HeroImage from "../../assets/Gateway1.png";

export default function HomePage() {
  usePageTitle("Home - Online Learning Platform");

  // Mock data for courses
  const popularCourses = [
    {
      id: 1,
      image: "/api/placeholder/300/200",
      category: "Programming",
      title: "JavaScript from Basic to Advanced",
      description: "Learn JavaScript from the most basic concepts to advanced techniques.",
      price: "$299",
      rating: 4.8,
      students: 1250,
      isBookmarked: false
    },
    {
      id: 2,
      image: "/api/placeholder/300/200", 
      category: "Design",
      title: "Professional UI/UX Design",
      description: "Master UI/UX design principles and professional tools.",
      price: "$399",
      rating: 4.9,
      students: 890,
      isBookmarked: true
    },
    {
      id: 3,
      image: "/api/placeholder/300/200",
      category: "Marketing", 
      title: "Comprehensive Digital Marketing",
      description: "Effective digital marketing strategies for modern businesses.",
      price: "$349",
      rating: 4.7,
      students: 654,
      isBookmarked: false
    }
  ];

  // Mock data for events
  const upcomingEvents = [
    {
      id: 1,
      date: "15",
      month: "DEC",
      title: "Workshop: English Speaking",
      description: "Improve your speaking skills with live tips, group practice, and real-time feedback from instructors.",
      time: "2:00 PM - 5:00 PM",
      type: "Online",
      isRegistered: false
    },
    {
      id: 2,
      date: "22", 
      month: "DEC",
      title: "Seminar: AI Trends in Education",
      description: "Explore the latest applications of AI in education and the future of digital learning.",
      time: "9:00 AM - 12:00 PM",
      type: "Conference Hall",
      isRegistered: true
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-primary-50" lang="en">
      {/* Hero Section */}
      <div className="mx-auto max-w-7xl px-4 py-12 lg:py-20 hero-section">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-4xl lg:text-5xl font-bold text-neutral-900 leading-tight">
                The leading{" "}
                <span className="text-primary-600">online learning</span>{" "}
                platform
              </h1>
              
              <p className="text-lg text-neutral-600 leading-relaxed">
                Discover thousands of high-quality courses from industry experts. 
                Learn anytime, anywhere with modern technology.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="text-base px-8 py-4">
                Explore Courses
              </Button>
              <Button variant="secondary" size="lg" className="text-base px-8 py-4">
                Watch Demo
              </Button>
            </div>
          </div>

          {/* Right Content - Hero Image */}
          <div className="relative h-[400px] lg:h-[500px]">
            <div className="h-full rounded-2xl overflow-hidden shadow-lg bg-gray-200">
              <img 
                src={HeroImage} 
                alt="Online Learning Platform"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Popular Courses Section */}
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-neutral-900">Popular Courses</h2>
          <Button variant="ghost" className="text-primary-600 hover:text-primary-700">
            View All →
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {popularCourses.map((course) => (
            <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-0">
                {/* Course Image */}
                <div className="relative h-48 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">Course Image</span>
                  {course.isBookmarked && (
                    <button className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-sm">
                      <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"/>
                      </svg>
                    </button>
                  )}
                </div>

                {/* Course Content */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-primary-600 bg-primary-50 px-2 py-1 rounded-full">
                      {course.category}
                    </span>
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                      <span className="text-sm text-neutral-600">{course.rating}</span>
                    </div>
                  </div>

                  <h3 className="font-semibold text-neutral-900 line-clamp-2">
                    {course.title}
                  </h3>

                  <p className="text-sm text-neutral-600 line-clamp-2">
                    {course.description}
                  </p>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-lg font-bold text-primary-600">
                      {course.price}
                    </span>
                    <span className="text-sm text-neutral-500">
                      {course.students.toLocaleString()} students
                    </span>
                  </div>

                  <Button className="w-full mt-3">
                    Enroll Now
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Upcoming Events Section */}
      <div className="bg-neutral-100 py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-neutral-900">Upcoming Events</h2>
            <Button variant="ghost" className="text-primary-600 hover:text-primary-700">
              View All →
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {upcomingEvents.map((event) => (
              <Card key={event.id} className="hover:shadow-lg transition-shadow">
                <div className="flex gap-4">
                  {/* Date */}
                  <div className="flex-shrink-0 text-center bg-primary-600 text-white rounded-lg p-3 min-w-[70px]">
                    <div className="text-sm font-medium">{event.month}</div>
                    <div className="text-2xl font-bold">{event.date}</div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-2">
                    <h3 className="font-semibold text-neutral-900">{event.title}</h3>
                    <p className="text-sm text-neutral-600 line-clamp-2">
                      {event.description}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-neutral-500">
                      <span>⏰ {event.time}</span>
                      <span>📍 {event.type}</span>
                    </div>

                    <Button 
                      size="sm" 
                      variant={event.isRegistered ? "secondary" : "primary"}
                      className="mt-3"
                    >
                      {event.isRegistered ? "Registered" : "Register"}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Why Choose EduCenter Section */}
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-900 mb-4">
            Why Choose EduCenter?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Expert Teachers */}
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-neutral-900">Expert Teachers</h3>
            <p className="text-neutral-600">
              Learn from certified native speakers and experienced language instructors.
            </p>
          </div>

          {/* Interactive Platform */}
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-neutral-900">Interactive Platform</h3>
            <p className="text-neutral-600">
              Engage with multimedia content, quizzes, and real-time feedback.
            </p>
          </div>

          {/* Flexible Schedule */}
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-neutral-900">Flexible Schedule</h3>
            <p className="text-neutral-600">
              Study at your own pace with live classes and recorded sessions.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      {/* <div className="bg-neutral-900 text-white py-16">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6 leading-snug break-words normal-case whitespace-normal">
            Start your learning journey today
          </h2>
          <p className="text-lg text-neutral-300 mb-10 max-w-2xl mx-auto leading-relaxed break-words whitespace-normal">
            Join thousands of students who have succeeded with our platform
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 min-w-[200px]">
              Sign Up Free
            </Button>
            <Button 
              variant="secondary" 
              size="lg" 
              className="bg-transparent border border-white text-white hover:bg-white hover:text-neutral-900 px-8 py-4 min-w-[200px]"
            >
              Contact Advisor
            </Button>
          </div>
        </div>
      </div> */}
    </div>
  );
}
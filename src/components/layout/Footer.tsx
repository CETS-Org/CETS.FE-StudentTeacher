import { 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Youtube,
  BookOpen,
  Users,
  Award,
  Heart,
  Send,
  ArrowRight,
  Globe,
  Clock,
  MessageCircle
} from "lucide-react";
import { useState } from "react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    setIsSubscribing(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubscribing(false);
      setEmail("");
      // Could show success message here
    }, 1500);
  };

  return (
    <footer className="bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Company Info */}
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-600 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                  CETS
                </h3>
              </div>
              <p className="text-neutral-300 leading-relaxed">
                Empowering learners worldwide with expert-led English courses. 
                Transform your language skills and unlock global opportunities.
              </p>
            </div>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-neutral-300 hover:text-white transition-colors">
                <MapPin className="w-4 h-4 text-primary-400 flex-shrink-0" />
                <span className="text-sm">123 Education Street, Learning City, LC 12345</span>
              </div>
              <div className="flex items-center space-x-3 text-neutral-300 hover:text-white transition-colors">
                <Phone className="w-4 h-4 text-primary-400 flex-shrink-0" />
                <span className="text-sm">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3 text-neutral-300 hover:text-white transition-colors">
                <Mail className="w-4 h-4 text-primary-400 flex-shrink-0" />
                <span className="text-sm">hello@cets.edu</span>
              </div>
              <div className="flex items-center space-x-3 text-neutral-300 hover:text-white transition-colors">
                <Clock className="w-4 h-4 text-primary-400 flex-shrink-0" />
                <span className="text-sm">Mon-Fri: 9AM-6PM EST</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-white flex items-center space-x-2">
              <Globe className="w-5 h-5 text-accent-400" />
              <span>Quick Links</span>
            </h4>
            <nav className="space-y-3">
              {[
                { name: "Courses", href: "/courses" },
                { name: "Course Categories", href: "/courses?category=all" },
                { name: "Free Courses", href: "/courses?price=free" },
                { name: "Premium Courses", href: "/courses?price=premium" },
                { name: "Live Classes", href: "/classes" },
                { name: "Student Dashboard", href: "/student" },
                { name: "Teacher Portal", href: "/teacher" },
                { name: "Success Stories", href: "/success-stories" }
              ].map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="block text-neutral-300 hover:text-white hover:translate-x-1 transition-all duration-200 group"
                >
                  <span className="flex items-center space-x-2">
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span>{link.name}</span>
                  </span>
                </a>
              ))}
            </nav>
          </div>

          {/* Learning Resources */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-white flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-accent-400" />
              <span>Learning</span>
            </h4>
            <nav className="space-y-3">
              {[
                { name: "Study Materials", href: "/materials", icon: BookOpen },
                { name: "Practice Tests", href: "/tests", icon: Award },
                { name: "Learning Path", href: "/path", icon: Users },
                { name: "Progress Tracking", href: "/progress", icon: Heart },
                { name: "Certificates", href: "/certificates", icon: Award },
                { name: "Community Forum", href: "/forum", icon: MessageCircle },
                { name: "Help Center", href: "/help", icon: MessageCircle },
                { name: "Contact Support", href: "/support", icon: MessageCircle }
              ].map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="block text-neutral-300 hover:text-white hover:translate-x-1 transition-all duration-200 group"
                >
                  <span className="flex items-center space-x-2">
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span>{link.name}</span>
                  </span>
                </a>
              ))}
            </nav>
          </div>

          {/* Newsletter & Social */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white flex items-center space-x-2">
                <Send className="w-5 h-5 text-accent-400" />
                <span>Stay Updated</span>
              </h4>
              <p className="text-neutral-300 text-sm">
                Get the latest course updates, learning tips, and exclusive offers delivered to your inbox.
              </p>
              
              {/* Newsletter Form */}
              <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    required
                  />
                  <button
                    type="submit"
                    disabled={isSubscribing}
                    className="absolute right-2 top-2 bottom-2 px-4 bg-gradient-to-r from-primary-500 to-accent-600 hover:from-primary-600 hover:to-accent-700 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isSubscribing ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 text-white" />
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Social Media */}
            <div className="space-y-4">
              <h5 className="text-sm font-semibold text-neutral-300 uppercase tracking-wider">
                Follow Us
              </h5>
              <div className="flex space-x-3">
                {[
                  { name: "facebook", Icon: Facebook, href: "#", color: "hover:bg-blue-600" },
                  { name: "twitter", Icon: Twitter, href: "#", color: "hover:bg-sky-500" },
                  { name: "instagram", Icon: Instagram, href: "#", color: "hover:bg-pink-600" },
                  { name: "linkedin", Icon: Linkedin, href: "#", color: "hover:bg-blue-700" },
                  { name: "youtube", Icon: Youtube, href: "#", color: "hover:bg-red-600" }
                ].map(({ name, Icon, href, color }) => (
                  <a
                    key={name}
                    href={href}
                    className={`w-10 h-10 bg-neutral-800 rounded-xl flex items-center justify-center text-neutral-400 hover:text-white transition-all duration-300 hover:scale-110 hover:shadow-lg ${color}`}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="space-y-3 pt-4 border-t border-neutral-700">
              <div className="flex items-center space-x-2 text-neutral-300">
                <Award className="w-4 h-4 text-yellow-400" />
                <span className="text-sm">Certified Education Platform</span>
              </div>
              <div className="flex items-center space-x-2 text-neutral-300">
                <Heart className="w-4 h-4 text-red-400" />
                <span className="text-sm">50K+ Happy Students</span>
              </div>
              <div className="flex items-center space-x-2 text-neutral-300">
                <Users className="w-4 h-4 text-green-400" />
                <span className="text-sm">Expert Instructors</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-neutral-700 bg-neutral-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-sm text-neutral-400">
        <p>
          &copy; {new Date().getFullYear()} CETS. All rights reserved.
        </p>
              <div className="hidden md:block w-1 h-1 bg-neutral-600 rounded-full"></div>
              <p>Made with ❤️ for learners worldwide</p>
            </div>
            
            <div className="flex items-center space-x-6">
              <nav className="flex items-center space-x-6 text-sm">
                {[
                  { name: "Privacy Policy", href: "/privacy" },
                  { name: "Terms of Service", href: "/terms" },
                  { name: "Cookie Policy", href: "/cookies" },
                  { name: "Accessibility", href: "/accessibility" }
                ].map((link, index) => (
                  <span key={link.name} className="flex items-center space-x-6">
                    <a
                      href={link.href}
                      className="text-neutral-400 hover:text-white transition-colors"
                    >
                      {link.name}
                    </a>
                    {index < 3 && <div className="w-1 h-1 bg-neutral-600 rounded-full"></div>}
                  </span>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

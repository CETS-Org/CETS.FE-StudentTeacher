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
  Heart
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-900 text-white border-t border-neutral-800">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">
                CETS
              </h3>
            </div>
            <p className="text-neutral-400 text-sm leading-relaxed">
              Empowering learners worldwide with expert-led English courses. 
              Transform your language skills and unlock global opportunities.
            </p>
            
            {/* Social Media */}
            <div className="flex space-x-3 pt-2">
              {[
                { name: "facebook", Icon: Facebook, href: "#" },
                { name: "twitter", Icon: Twitter, href: "#" },
                { name: "instagram", Icon: Instagram, href: "#" },
                { name: "linkedin", Icon: Linkedin, href: "#" },
                { name: "youtube", Icon: Youtube, href: "#" }
              ].map(({ name, Icon, href }) => (
                <a
                  key={name}
                  href={href}
                  className="w-9 h-9 bg-neutral-800 rounded-lg flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-700 transition-colors"
                  aria-label={name}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
              Quick Links
            </h4>
            <nav className="space-y-2">
              {[
                { name: "Courses", href: "/courses" },
                { name: "My Classes", href: "/student/my-classes" },
                { name: "Schedule", href: "/student/schedule" },
                { name: "Learning Path", href: "/student/learning-path" }
              ].map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="block text-neutral-400 hover:text-white transition-colors text-sm"
                >
                  {link.name}
                </a>
              ))}
            </nav>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
              Contact
            </h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3 text-neutral-400 text-sm">
                <Mail className="w-4 h-4 text-primary-400 flex-shrink-0 mt-0.5" />
                <span>cets.support@gmail.com</span>
              </div>
              <div className="flex items-start space-x-3 text-neutral-400 text-sm">
                <Phone className="w-4 h-4 text-primary-400 flex-shrink-0 mt-0.5" />
                <span>+84 (0) 123 456 789</span>
              </div>
              <div className="flex items-start space-x-3 text-neutral-400 text-sm">
                <MapPin className="w-4 h-4 text-primary-400 flex-shrink-0 mt-0.5" />
                <span>Da Nang City, Vietnam</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-neutral-800 bg-neutral-950/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-sm text-neutral-500">
              <p>
                &copy; {currentYear} CETS. All rights reserved.
              </p>
              <div className="hidden md:block w-1 h-1 bg-neutral-700 rounded-full"></div>
              <p className="flex items-center gap-1">
                Made with <Heart className="w-3 h-3 text-red-500" /> for learners worldwide
              </p>
            </div>
            
            <nav className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-sm">
              {[
                { name: "Privacy Policy", href: "/privacy" },
                { name: "Terms of Service", href: "/terms" },
                { name: "Cookie Policy", href: "/cookies" }
              ].map((link, index) => (
                <div key={link.name} className="flex items-center gap-4 md:gap-6">
                  <a
                    href={link.href}
                    className="text-neutral-500 hover:text-white transition-colors"
                  >
                    {link.name}
                  </a>
                  {index < 2 && <div className="hidden md:block w-1 h-1 bg-neutral-700 rounded-full"></div>}
                </div>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}

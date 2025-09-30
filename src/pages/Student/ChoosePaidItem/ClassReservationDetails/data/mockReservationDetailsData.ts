
import type { ReservationItem } from "@/types/payment"; // Used in return type of getMockReservationDetails

// Mock reservation item data - replace with actual API call

export const getMockReservationDetails = (reservationId: string) => {
  // Different mock data based on reservation ID
  switch (reservationId) {
    case "res-1":
      // Package reservation (multiple courses)
      return {
        reservation: {
          id: reservationId,
          studentID: "student-123",
          coursePackageID: "package-456",
          packageCode: "WEB-DEV-2024",
          packageName: "Complete Web Development Package",
          packageImageUrl: "",
          totalPrice: 5500000,
          description: "Master full-stack web development from HTML to React. Perfect for beginners to advanced developers.",
          reservationStatus: "pending",
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        items: [
          {
            id: "1",
            name: "HTML & CSS Fundamentals",
            type: "course",
            price: 800000,
            description: "Learn the building blocks of web development",
            status: "available"
          },
          {
            id: "2", 
            name: "JavaScript Essentials",
            type: "course",
            price: 1200000,
            description: "Master JavaScript programming language",
            status: "available"
          },
          {
            id: "3",
            name: "React Development",
            type: "course", 
            price: 1500000,
            description: "Build modern web applications with React",
            status: "available"
          },
          {
            id: "4",
            name: "Node.js Backend",
            type: "course",
            price: 1300000,
            description: "Create server-side applications with Node.js",
            status: "available"
          },
          {
            id: "5",
            name: "Web Development Textbook",
            type: "material",
            price: 450000,
            description: "Comprehensive guide to web development",
            status: "available"
          },
          {
            id: "6",
            name: "Completion Certificate",
            type: "certificate",
            price: 250000,
            description: "Official certificate upon course completion",
            status: "available"
          }
        ]
      };

    case "res-2":
      // Individual course reservation (Data Analytics)
      return {
        reservation: {
          id: reservationId,
          studentID: "student-123",
          coursePackageID: undefined,
          packageCode: undefined,
          packageName: "Python for Data Science",
          packageImageUrl: "",
          totalPrice: 1800000,
          description: "Complete Python programming course focused on data science applications, libraries, and real-world projects.",
          reservationStatus: "pending",
          expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        },
        items: [
          {
            id: "7",
            name: "Python for Data Science",
            type: "course",
            price: 1500000,
            description: "Complete Python programming course with focus on data science",
            status: "available"
          },
          {
            id: "8",
            name: "Python Programming Textbook",
            type: "material",
            price: 200000,
            description: "Comprehensive Python programming guide",
            status: "available"
          },
          {
            id: "9",
            name: "Course Completion Certificate",
            type: "certificate",
            price: 100000,
            description: "Official certificate upon course completion",
            status: "available"
          }
        ]
      };

    case "res-3":
      // Individual course reservation (Digital Marketing)
      return {
        reservation: {
          id: reservationId,
          studentID: "student-123",
          coursePackageID: undefined,
          packageCode: undefined,
          packageName: "Digital Marketing Fundamentals",
          packageImageUrl: "",
          totalPrice: 1200000,
          description: "Learn essential digital marketing strategies including social media, SEO, and online advertising.",
          reservationStatus: "confirmed",
          expiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        items: [
          {
            id: "10",
            name: "Digital Marketing Fundamentals",
            type: "course",
            price: 1000000,
            description: "Complete digital marketing course covering all major platforms",
            status: "available"
          },
          {
            id: "11",
            name: "Marketing Tools Access",
            type: "material",
            price: 150000,
            description: "Access to premium marketing tools and templates",
            status: "available"
          },
          {
            id: "12",
            name: "Professional Certificate",
            type: "certificate",
            price: 50000,
            description: "Industry-recognized digital marketing certificate",
            status: "available"
          }
        ]
      };

    case "res-4":
      // Expired individual course reservation
      return {
        reservation: {
          id: reservationId,
          studentID: "student-123",
          coursePackageID: undefined,
          packageCode: undefined,
          packageName: "Mobile App Development",
          packageImageUrl: "",
          totalPrice: 2200000,
          description: "Learn to build mobile applications for iOS and Android platforms using React Native.",
          reservationStatus: "expired",
          expiresAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
        },
        items: [
          {
            id: "13",
            name: "React Native Development",
            type: "course",
            price: 1800000,
            description: "Complete mobile app development course with React Native",
            status: "expired"
          },
          {
            id: "14",
            name: "Mobile Development Kit",
            type: "material",
            price: 300000,
            description: "Development tools and resources for mobile apps",
            status: "expired"
          },
          {
            id: "15",
            name: "Developer Certificate",
            type: "certificate",
            price: 100000,
            description: "Mobile app developer certification",
            status: "expired"
          }
        ]
      };

    default:
      // Default package reservation
      return {
        reservation: {
          id: reservationId || "1",
          studentID: "student-123",
          coursePackageID: "package-456",
          packageCode: "WEB-DEV-2024",
          packageName: "Complete Web Development Package",
          packageImageUrl: "",
          totalPrice: 5500000,
          description: "Master full-stack web development from HTML to React. Perfect for beginners to advanced developers.",
          reservationStatus: "pending",
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        items: [
          {
            id: "1",
            name: "HTML & CSS Fundamentals",
            type: "course",
            price: 800000,
            description: "Learn the building blocks of web development",
            status: "available"
          },
          {
            id: "2", 
            name: "JavaScript Essentials",
            type: "course",
            price: 1200000,
            description: "Master JavaScript programming language",
            status: "available"
          },
          {
            id: "3",
            name: "React Development",
            type: "course", 
            price: 1500000,
            description: "Build modern web applications with React",
            status: "available"
          }
        ]
      };
  }
};

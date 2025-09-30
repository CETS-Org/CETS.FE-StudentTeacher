import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ClassReservationItem from "./ClassReservationItem";
import { Package, Search } from "lucide-react";

import type { ClassReservationResponse } from "@/types/payment";

interface ClassReservationsListProps {
  className?: string;
}

export default function ClassReservationsList({ 
  className = "" 
}: ClassReservationsListProps) {
  const [reservations, setReservations] = useState<ClassReservationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Mock data - replace with actual API call
    const fetchReservations = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock reservations data
        const mockReservations: ClassReservationResponse[] = [
          {
            id: "res-1",
            studentID: "student-123",
            coursePackageID: "package-web-dev",
            packageCode: "WEB-DEV-2024",
            packageName: "Complete Web Development",
            packageImageUrl: "",
            totalPrice: 5500000,
            description: "Master full-stack web development from HTML to React. Perfect for beginners to advanced developers.",
            reservationStatus: "pending",
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: "res-2",
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
          {
            id: "res-3",
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
          {
            id: "res-4",
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
          }
        ];

        setReservations(mockReservations);
      } catch (error) {
        console.error("Error fetching reservations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, []);

  const filteredReservations = reservations.filter(reservation =>
    reservation.packageName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reservation.packageCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reservation.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search Section */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search reservations by name, code, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Reservations List */}
      {filteredReservations.length > 0 ? (
        <div className="space-y-4">
          {filteredReservations.map((reservation) => (
            <ClassReservationItem
              key={reservation.id}
              reservation={reservation}
            />
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <div className="flex flex-col items-center gap-4">
            <Package className="w-12 h-12 text-gray-400" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm ? "No reservations found" : "No class reservations"}
              </h3>
              <p className="text-gray-600">
                {searchTerm 
                  ? "Try adjusting your search terms"
                  : "You don't have any class reservations yet"
                }
              </p>
            </div>
            {searchTerm && (
              <Button
                variant="secondary"
                onClick={() => setSearchTerm("")}
              >
                Clear Search
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}

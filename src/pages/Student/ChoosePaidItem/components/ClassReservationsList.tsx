import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ClassReservationItem from "./ClassReservationItem";
import { Package, Search } from "lucide-react";
import { api } from "@/lib/config";
import { getUserInfo } from "@/lib/utils";

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
    const fetchReservations = async () => {
      try {
        setLoading(true);
        
        // Get studentId from localStorage
        const userInfo = getUserInfo();
        const studentId = userInfo?.id;
        
        if (!studentId) {
          console.error('Student ID not found in localStorage');
          setReservations([]);
          return;
        }

        // Call API to get class reservations
        const response = await api.getClassReservations(studentId);
        const apiReservations = response.data;
        
        console.log('Class Reservations API Response:', apiReservations);
        
        // Transform API response to ClassReservationResponse format
        const transformedReservations: ClassReservationResponse[] = apiReservations.map((res: any) => ({
          id: res.id,
          studentID: res.studentID,
          coursePackageID: res.coursePackageID,
          packageCode: res.packageCode,
          packageName: res.packageName,
          packageImageUrl: res.packageImageUrl,
          totalPrice: res.totalPrice,
          description: res.description,
          reservationStatus: res.reservationStatus,
          expiresAt: res.expiresAt,
          createdAt: res.createdAt
        }));
        
        setReservations(transformedReservations);
      } catch (error) {
        console.error("Error fetching reservations:", error);
        // Fallback to empty array on error
        setReservations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, []);

  const filteredReservations = reservations
    // Filter by status: only show "Đang xử lý"
    .filter(reservation => reservation.reservationStatus === "Paying")
    // Filter by search term
    .filter(reservation =>
      (reservation.packageName?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (reservation.packageCode?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (reservation.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
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
                  : "You don't have any class reservations yet. Create a reservation to get started."
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

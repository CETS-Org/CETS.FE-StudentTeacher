import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/card";
import PaymentHistoryItem from "./PaymentHistoryItem";
import { Receipt, Search, Filter } from "lucide-react";
import { api } from "@/api";
import { getUserInfo } from "@/lib/utils";

import type { PaymentHistoryRecord } from "@/types/payment";

interface PaymentHistoryListProps {
  className?: string;
}

export default function PaymentHistoryList({ 
  className = "" 
}: PaymentHistoryListProps) {
  const [payments, setPayments] = useState<PaymentHistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    const fetchPaymentHistory = async () => {
      try {
        setLoading(true);
        
        // Get studentId from localStorage
        const userInfo = getUserInfo();
        const studentId = userInfo?.id;
        
        if (!studentId) {
          console.error('Student ID not found in localStorage');
          setPayments([]);
          return;
        }

        // Call API to get payment history
        const response = await api.getPaymentHistory(studentId);
        
        // Backend returns: { success, message, data: [...] }
        if (response.data.success && response.data.data) {
          setPayments(response.data.data);
        } else {
          console.warn('No payment data returned:', response.data.message);
          setPayments([]);
        }
      } catch (error) {
        console.error("Error fetching payment history:", error);
        // Fallback to empty array on error
        setPayments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentHistory();
  }, []);

  const filteredPayments = payments
    // Filter by status
    .filter(payment => {
      if (statusFilter === "all") return true;
      return payment.invoiceStatus?.toLowerCase().includes(statusFilter.toLowerCase());
    })
    // Filter by search term
    .filter(payment =>
      (payment.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (payment.invoiceId?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (payment.paymentMethod?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (payment.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
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
      {/* Search and Filter Section */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by course name, invoice ID, payment method, or student name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="paid">Paid / Completed</option>
              <option value="1stpaid">1st Payment Done</option>
              <option value="2ndpaid">2nd Payment Done</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Payment History List */}
      {filteredPayments.length > 0 ? (
        <div className="space-y-4">
          {filteredPayments.map((payment) => (
            <PaymentHistoryItem
              key={payment.id}
              payment={payment}
            />
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <div className="flex flex-col items-center gap-4">
            <Receipt className="w-12 h-12 text-gray-400" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm || statusFilter !== "all" ? "No payments found" : "No payment history"}
              </h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search or filter"
                  : "You don't have any payment transactions yet."
                }
              </p>
            </div>
            {(searchTerm || statusFilter !== "all") && (
              <Button
                variant="secondary"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}

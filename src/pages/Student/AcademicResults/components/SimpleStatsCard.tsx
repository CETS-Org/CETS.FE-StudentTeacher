import React from "react";
import Card from "@/components/ui/card";
import { BookOpen, CheckCircle, XCircle, Clock } from "lucide-react";
import type { AcademicResultsApiResponse } from "@/types/academicResults";

interface SimpleStatsCardProps {
  stats: AcademicResultsApiResponse;
}

const SimpleStatsCard: React.FC<SimpleStatsCardProps> = ({ stats }) => {
  return (
    <Card className="p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Academic Performance Overview</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Courses */}
        <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
          <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-blue-700">Total Courses</p>
          <p className="text-2xl font-bold text-blue-600">{stats.totalCourses}</p>
        </div>
        
        {/* Passed Courses */}
        <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
          <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-green-700">Passed</p>
          <p className="text-2xl font-bold text-green-600">{stats.passedCourses}</p>
        </div>
        
        {/* Failed Courses */}
        <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
          <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-red-700">Failed</p>
          <p className="text-2xl font-bold text-red-600">{stats.failedCourses}</p>
        </div>
        
        {/* In Progress Courses */}
        <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-yellow-700">In Progress</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.inProgressCourses}</p>
        </div>
      </div>
    </Card>
  );
};

export default SimpleStatsCard;

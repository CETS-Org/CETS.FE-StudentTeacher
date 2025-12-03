// src/pages/teacher/classes/[classId]/StudentsTab.tsx
import { useState, useMemo, useEffect } from "react";
import Button from "@/components/ui/Button";
import { Search, Users, UserCheck, CheckCircle2, XCircle } from "lucide-react";
import { getStudentsInClass, bulkMarkAttendance } from "@/api/attendance.api";
import type { StudentInClass } from "@/api/attendance.api";
import Loader from "@/components/ui/Loader";
import { getTeacherId } from "@/lib/utils";
import { toast } from "@/components/ui/Toast";

// Cache for students data to avoid reloading when switching tabs
const studentsCache = new Map<string, { data: StudentInClass[]; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface StudentsTabProps {
  classId: string;
  classMeetingId?: string;
  className?: string;
}

export default function StudentsTab({ 
  classId, 
  classMeetingId,
  className = "SE17D05" 
}: StudentsTabProps) {
  const [students, setStudents] = useState<StudentInClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isTaking, setIsTaking] = useState(false);
  const [absent, setAbsent] = useState<Record<string, boolean>>({});

  // Fetch students when component mounts or classId/classMeetingId changes
  useEffect(() => {
    const fetchStudents = async () => {
      if (!classId) return;

      // Create cache key
      const cacheKey = `${classId}-${classMeetingId || 'no-meeting'}`;
      
      // Check cache first
      const cached = studentsCache.get(cacheKey);
      const now = Date.now();
      
      if (cached && (now - cached.timestamp) < CACHE_DURATION) {
        // Use cached data
        setStudents(cached.data);
        setLoading(false);
        setError(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        // Pass classMeetingId to get attendance status
        const data = await getStudentsInClass(classId, classMeetingId);
        
        // Cache the data
        studentsCache.set(cacheKey, {
          data,
          timestamp: now
        });
        
        setStudents(data);
      } catch (err) {
        console.error('Error fetching students:', err);
        setError('Failed to load students. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [classId, classMeetingId]);

  // Lọc sinh viên theo search
  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return students;
    const q = searchQuery.toLowerCase();
    return students.filter(
      (s) => 
        s.studentName.toLowerCase().includes(q) || 
        s.email.toLowerCase().includes(q) ||
        s.studentCode.toLowerCase().includes(q)
    );
  }, [searchQuery, students]);

  const toggleAbsent = (id: string, checked: boolean) => {
    setAbsent((prev) => ({ ...prev, [id]: checked }));
  };

  const startTaking = () => {
    // Pre-fill absent checkboxes based on current attendance status
    const preFilledAbsent: Record<string, boolean> = {};
    students.forEach((student) => {
      if (student.attendanceStatus === "Absent") {
        preFilledAbsent[student.studentId] = true;
      }
    });
    setAbsent(preFilledAbsent);
    setIsTaking(true);
  };
  
  const cancelTaking = () => {
    setIsTaking(false);
    setAbsent({});
  };

  const saveAttendance = async () => {
    try {
      // Get teacher ID from authentication
      const teacherId = getTeacherId();
      
      // Validate required fields
      if (!classMeetingId) {
        toast.error("Class meeting ID is required to save attendance.");
        return;
      }

      if (!teacherId) {
        toast.error("Teacher ID is not available. Please log in again.");
        return;
      }

      // Lấy danh sách studentId của những người vắng (checked = true)
      const absentStudentIds = Object.keys(absent).filter((id) => absent[id]);

      // Call bulk-mark API
      const response = await bulkMarkAttendance({
        classMeetingId,
        teacherId,
        absentStudentIds,
        notes: "", // Optional notes
      });

      // Clear cache and refetch students to get updated attendance status
      const cacheKey = `${classId}-${classMeetingId || 'no-meeting'}`;
      studentsCache.delete(cacheKey);
      
      const updatedStudents = await getStudentsInClass(classId, classMeetingId);
      
      // Update cache with fresh data
      studentsCache.set(cacheKey, {
        data: updatedStudents,
        timestamp: Date.now()
      });
      
      setStudents(updatedStudents);

      // Hiển thị thông báo thành công
      toast.success(
        `Attendance saved successfully! Total: ${response.totalStudents} | Present: ${response.presentCount} | Absent: ${response.absentCount}`
      );
      
      setIsTaking(false);
      setAbsent({});
    } catch (error: any) {
      console.error("Error saving attendance:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to save attendance. Please try again.";
      toast.error(errorMessage);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="bg-warning-50 border border-warning-200 rounded-lg p-6 text-center">
        <p className="text-warning-700 font-medium">{error}</p>
        <Button
          variant="primary"
          onClick={() => window.location.reload()}
          className="mt-4"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-primary-800">Class: {className}</h2>
            <p className="text-sm text-neutral-600">{filtered.length} students enrolled</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search students..."
              className="border border-accent-200 rounded-lg pl-9 pr-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {!isTaking && (
            <Button 
              variant="primary" 
              onClick={startTaking}
              iconLeft={<UserCheck className="w-4 h-4" />}
              className="btn-secondary"
            >
              Take Attendance
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="border border-accent-200 rounded-xl overflow-hidden shadow-lg bg-white">
        <div
          className="max-h-[520px] overflow-y-auto scrollbar-hide"
          style={{ scrollbarGutter: "stable" }}
        >
        <table className="min-w-full table-fixed">
        {/* Column widths: STT (w-20), Avatar (w-28), Name (w-1/3), Email (w-1/3), Actions (w-40) */}
        <colgroup>
          <col className="w-20" />
          <col className="w-28" />
          <col className="w-1/3" />
          <col className="w-1/3" />
          <col className="w-40" />
        </colgroup>

        <thead className="sticky top-0 z-10 bg-gradient-to-r from-accent-200 to-accent-300">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
              #
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
              Avatar
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
              {isTaking ? "Mark Absent" : "Status"}
            </th>
          </tr>
        </thead>

            <tbody className="divide-y divide-accent-100 bg-white">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center">
                    <p className="text-neutral-500">
                      {searchQuery ? 'No students found matching your search' : 'No students enrolled in this class'}
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((s, idx) => {
                  const isAbsent = !!absent[s.studentId];
                  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(s.studentName)}&background=random`;
                  
                  return (
                    <tr key={s.studentId} className="hover:bg-accent-25/50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-primary-700">
                          {idx + 1}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="relative">
                          <img
                            src={s.avatarUrl || defaultAvatar}
                            alt={s.studentName}
                            className="w-10 h-10 rounded-full bg-neutral-200 ring-2 ring-accent-200 object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = defaultAvatar;
                            }}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-primary-800">{s.studentName}</span>
                          <span className="text-xs text-neutral-500">{s.studentCode}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-neutral-600">{s.email}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {!isTaking ? (
                          // Hiển thị trạng thái attendance từ API
                          <div className="flex items-center gap-2">
                            {s.attendanceStatus === "Present" ? (
                              <>
                                <CheckCircle2 className="w-5 h-5 text-success-600" />
                                <span className="text-sm font-semibold text-success-700">Present</span>
                              </>
                            ) : s.attendanceStatus === "Absent" ? (
                              <>
                                <XCircle className="w-5 h-5 text-warning-600" />
                                <span className="text-sm font-semibold text-warning-700">Absent</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-5 h-5 text-neutral-400" />
                                <span className="text-sm font-medium text-neutral-500">Not Marked</span>
                              </>
                            )}
                          </div>
                        ) : (
                          <label className="inline-flex items-center gap-3 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={isAbsent}
                              onChange={(e) =>
                                toggleAbsent(s.studentId, e.target.checked)
                              }
                              className="w-4 h-4 text-warning-600 border-2 border-neutral-300 rounded focus:ring-warning-500 focus:ring-2"
                            />
                            <span className="text-sm font-medium text-warning-700">Absent</span>
                          </label>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {isTaking && (
          <div className="px-6 py-4 border-t border-accent-200 bg-gradient-to-r from-accent-25 to-primary-25 flex items-center gap-3">
            <Button 
              variant="primary" 
              onClick={saveAttendance}
              className="btn-secondary"
            >
              Save Attendance
            </Button>
            <Button 
              variant="secondary" 
              onClick={cancelTaking}
              className="border-neutral-300 text-neutral-700 hover:bg-neutral-50"
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

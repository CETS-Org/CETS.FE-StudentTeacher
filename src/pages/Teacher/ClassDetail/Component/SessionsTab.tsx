// src/pages/teacher/classes/[classId]/SessionsTab.tsx

import { useState, useMemo, useEffect } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { NotebookPen, Calendar, Globe, MapPin, Video, Loader2 } from "lucide-react";
import Pagination from "@/Shared/Pagination";
import { useNavigate } from "react-router-dom";
import { getClassMeetingsByClassId } from "@/api/classMeetings.api";
import type { ClassMeeting } from "@/api/classMeetings.api";
import Loader from "@/components/ui/Loader";

type Props = {
  classId?: string;
};

export default function SessionsTab({ classId }: Props) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sessions, setSessions] = useState<ClassMeeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage = 4; // Số buổi học trên mỗi trang
  const navigate = useNavigate();

  // Fetch sessions when component mounts or classId changes
  useEffect(() => {
    const fetchSessions = async () => {
      if (!classId) {
        setError("Class ID is missing");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await getClassMeetingsByClassId(classId);
        // Sort by date ascending (oldest first)
        const sortedData = data.sort((a, b) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        setSessions(sortedData);
      } catch (err) {
        console.error('Error fetching class meetings:', err);
        setError('Failed to load sessions. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [classId]);

  const totalPages = Math.ceil(sessions.length / itemsPerPage);

  // Lấy ra danh sách các buổi học cho trang hiện tại
  const currentSessions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sessions.slice(startIndex, endIndex);
  }, [currentPage, sessions]);
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get session number based on index
  const getSessionNumber = (index: number) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return startIndex + index + 1;
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
      <h2 className="text-xl font-bold text-primary-800 mb-6">
        Sessions ({sessions.length})
      </h2>
      
      {sessions.length === 0 ? (
        <Card className="p-8 text-center border border-accent-100">
          <div className="flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-accent-100 to-accent-200 rounded-full flex items-center justify-center mb-4">
              <NotebookPen className="w-8 h-8 text-accent-600" />
            </div>
            <h3 className="text-lg font-semibold text-primary-800 mb-2">
              No Sessions Yet
            </h3>
            <p className="text-neutral-600">
              There are no sessions scheduled for this class yet.
            </p>
          </div>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {currentSessions.map((session, index) => (
              <Card key={session.id} className="p-6 border border-accent-100 shadow-lg bg-white hover:bg-gradient-to-br hover:from-white hover:to-accent-25/30 transition-all duration-300 hover:shadow-xl">
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <NotebookPen className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-primary-800 text-lg">
                          Session {getSessionNumber(index)}
                        </h3>
                        {session.isStudy && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-success-400 to-success-500 text-white">
                            Study Session
                          </span>
                        )}
                        {!session.isActive && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-neutral-400 to-neutral-500 text-white">
                            Inactive
                          </span>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-neutral-600">
                          <Calendar className="w-4 h-4 text-accent-500" />
                          <span className="font-medium">{formatDate(session.date)}</span>
                        </div>
                        
                        {session.onlineMeetingUrl && (
                          <div className="flex items-center gap-2 text-sm text-neutral-600">
                            <Globe className="w-4 h-4 text-accent-500" />
                            <span className="font-medium">Online Meeting</span>
                            {session.passcode && (
                              <span className="ml-2 px-2 py-1 bg-accent-100 rounded text-xs font-semibold text-accent-700">
                                Code: {session.passcode}
                              </span>
                            )}
                          </div>
                        )}
                        
                        {session.roomID && !session.onlineMeetingUrl && (
                          <div className="flex items-center gap-2 text-sm text-neutral-600">
                            <MapPin className="w-4 h-4 text-accent-500" />
                            <span className="font-medium">In-person</span>
                          </div>
                        )}
                        
                        {session.recordingUrl && (
                          <div className="flex items-center gap-2 text-sm text-neutral-600">
                            <Video className="w-4 h-4 text-accent-500" />
                            <span className="font-medium">Recording Available</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 lg:flex-shrink-0">
                    {session.onlineMeetingUrl && (
                      <Button 
                        variant="secondary" 
                        className="border-accent-300 text-accent-700 hover:bg-accent-50"
                        onClick={() => window.open(session.onlineMeetingUrl!, '_blank')}
                        iconLeft={<Globe className="w-4 h-4" />}
                      >
                        Join
                      </Button>
                    )}
                    <Button 
                      variant="primary" 
                      className="btn-secondary"
                      onClick={() => navigate(`/teacher/class/${classId}/session/${session.id}`)}
                    >
                      Go to Session
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 pt-6 border-t border-neutral-200">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={sessions.length}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
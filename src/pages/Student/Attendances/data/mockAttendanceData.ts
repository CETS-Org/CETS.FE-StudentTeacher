import type { StudentAttendanceReport } from "@/types/attendance";

export const mockAttendanceReport: StudentAttendanceReport = {
  studentId: "student-1",
  studentName: "John Doe",
  reportPeriod: {
    startDate: "2024-01-15",
    endDate: "2024-04-15"
  },
  overallStats: {
    totalClasses: 4,
    totalSessions: 48,
    totalAttended: 42,
    totalAbsent: 6,
    overallAttendanceRate: 87.5
  },
  classSummaries: [
    {
      classId: "1",
      className: "Advanced Business English - Class A1",
      courseCode: "ABE101",
      courseName: "Advanced Business English",
      instructor: "Sarah Johnson",
      totalSessions: 18,
      attendedSessions: 16,
      absentSessions: 2,
      attendanceRate: 88.9,
      records: [
        {
          id: "att-1",
          meetingId: "meeting-1",
          studentId: "student-1",
          attendanceStatusId: "status-1",
          attendanceStatus: "Present",
          checkedBy: "teacher-1",
          checkedByName: "Sarah Johnson",
          createdAt: "2024-02-15T19:00:00Z",
          meeting: {
            id: "meeting-1",
            startsAt: "2024-02-15T19:00:00Z",
            endsAt: "2024-02-15T21:00:00Z",
            roomName: "Room 201",
            coveredTopic: "Business Communication Fundamentals"
          }
        },
        {
          id: "att-2",
          meetingId: "meeting-2",
          studentId: "student-1",
          attendanceStatusId: "status-1",
          attendanceStatus: "Present",
          checkedBy: "teacher-1",
          checkedByName: "Sarah Johnson",
          createdAt: "2024-02-17T19:00:00Z",
          meeting: {
            id: "meeting-2",
            startsAt: "2024-02-17T19:00:00Z",
            endsAt: "2024-02-17T21:00:00Z",
            roomName: "Room 201",
            coveredTopic: "Email Writing Skills"
          }
        },
        {
          id: "att-3",
          meetingId: "meeting-3",
          studentId: "student-1",
          attendanceStatusId: "status-2",
          attendanceStatus: "Absent",
          checkedBy: "teacher-1",
          checkedByName: "Sarah Johnson",
          createdAt: "2024-02-19T19:00:00Z",
          notes: "Student was sick",
          meeting: {
            id: "meeting-3",
            startsAt: "2024-02-19T19:00:00Z",
            endsAt: "2024-02-19T21:00:00Z",
            roomName: "Room 201",
            coveredTopic: "Meeting and Presentation Skills"
          }
        },
        {
          id: "att-4",
          meetingId: "meeting-4",
          studentId: "student-1",
          attendanceStatusId: "status-1",
          attendanceStatus: "Present",
          checkedBy: "teacher-1",
          checkedByName: "Sarah Johnson",
          createdAt: "2024-02-22T19:00:00Z",
          meeting: {
            id: "meeting-4",
            startsAt: "2024-02-22T19:00:00Z",
            endsAt: "2024-02-22T21:00:00Z",
            roomName: "Room 201",
            coveredTopic: "Negotiation Skills"
          }
        }
      ]
    },
    {
      classId: "2",
      className: "IELTS Test Preparation - Class B2",
      courseCode: "IELTS201",
      courseName: "IELTS Test Preparation",
      instructor: "Michael Chen",
      totalSessions: 12,
      attendedSessions: 11,
      absentSessions: 1,
      attendanceRate: 91.7,
      records: []
    },
    {
      classId: "3",
      className: "English Conversation Club - Class C1",
      courseCode: "ECC101",
      courseName: "English Conversation Club",
      instructor: "Emma Wilson",
      totalSessions: 8,
      attendedSessions: 7,
      absentSessions: 1,
      attendanceRate: 87.5,
      records: []
    },
    {
      classId: "4",
      className: "Grammar Fundamentals - Class F1",
      courseCode: "GF101",
      courseName: "Grammar Fundamentals",
      instructor: "James Miller",
      totalSessions: 10,
      attendedSessions: 8,
      absentSessions: 2,
      attendanceRate: 80.0,
      records: []
    }
  ]
};

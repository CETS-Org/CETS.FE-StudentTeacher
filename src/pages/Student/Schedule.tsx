import StudentLayout from "@/Shared/StudentLayout";
import StudentWeekSchedule from "@/pages/Student/components/StudentWeekSchedule";
import type { StudentSession } from "@/pages/Student/components/StudentWeekSchedule";

/* ===== Helpers: tuần hiện tại + format yyyy:MM:dd:HH:mm ===== */
const mondayOfThisWeek = (() => {
  const d = new Date();
  const day = (d.getDay() + 6) % 7; // Mon=0..Sun=6
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
})();

function dateOfThisWeek(offsetDay: number, h: number, m: number) {
  const d = new Date(mondayOfThisWeek);
  d.setDate(d.getDate() + offsetDay);
  d.setHours(h, m, 0, 0);
  return d;
}

function fmtCustom(d: Date) {
  const zp = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}:${zp(d.getMonth() + 1)}:${zp(d.getDate())}:${zp(d.getHours())}:${zp(
    d.getMinutes()
  )}`;
}

/* ===== Student Schedule Data (Tuần hiện tại) ===== */
const studentSessions: StudentSession[] = [
  // Chủ nhật tuần trước (past day for demo)
  { 
    id: "0", 
    title: "Weekend Review", 
    classCode: "WR001", 
    room: "Online", 
    instructor: "Self Study",
    start: fmtCustom(dateOfThisWeek(-1, 10, 0)),
    attendanceStatus: "attended"
  },

  // Thứ 2 (Mon=0)
  { 
    id: "1", 
    title: "Basic English Grammar", 
    classCode: "BE101", 
    room: "A-201", 
    instructor: "Ms. Johnson",
    start: fmtCustom(dateOfThisWeek(0, 8, 0)),
    attendanceStatus: "attended"
  },
  { 
    id: "2", 
    title: "English Conversation",  
    classCode: "EC102", 
    room: "A-201", 
    instructor: "Mr. Smith",
    start: fmtCustom(dateOfThisWeek(0, 14, 0)),
    attendanceStatus: "absent"
  },

  // Thứ 3
  { 
    id: "3", 
    title: "Reading Comprehension", 
    classCode: "RC201", 
    room: "B-102", 
    instructor: "Dr. Wilson",
    start: fmtCustom(dateOfThisWeek(1, 9, 30)),
    attendanceStatus: "attended"
  },
  { 
    id: "4", 
    title: "Writing Skills", 
    classCode: "WS201", 
    room: "B-102", 
    instructor: "Prof. Davis",
    start: fmtCustom(dateOfThisWeek(1, 15, 30)),
    attendanceStatus: "attended"
  },

  // Thứ 4
  { 
    id: "5", 
    title: "Listening Practice", 
    classCode: "LP301", 
    room: "C-301", 
    instructor: "Ms. Brown",
    start: fmtCustom(dateOfThisWeek(2, 10, 0)),
    attendanceStatus: "upcoming"
  },

  // Thứ 5
  { 
    id: "6", 
    title: "Vocabulary Building", 
    classCode: "VB401", 
    room: "A-105", 
    instructor: "Mr. Miller",
    start: fmtCustom(dateOfThisWeek(3, 13, 0)),
    attendanceStatus: "upcoming"
  },

  // Thứ 6
  { 
    id: "7", 
    title: "Pronunciation Class", 
    classCode: "PC501", 
    room: "D-202", 
    instructor: "Dr. Taylor",
    start: fmtCustom(dateOfThisWeek(4, 11, 0)),
    attendanceStatus: "upcoming"
  },

  // Thứ 7
  { 
    id: "8", 
    title: "Study Group Session", 
    classCode: "SG601", 
    room: "Library", 
    instructor: "Peer Tutor",
    start: fmtCustom(dateOfThisWeek(5, 14, 0)),
    attendanceStatus: "upcoming"
  },
];

export default function Schedule() {
  return (
    <StudentLayout>
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary-800">My Schedule</h1>
              <p className="text-neutral-600 mt-2">View and manage your weekly class schedule</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-accent-50 px-4 py-2 rounded-lg border border-accent-200">
                <div className="flex items-center gap-2 text-accent-700">
                  <div className="w-3 h-3 bg-accent-500 rounded-full"></div>
                  <span className="text-sm font-medium">{studentSessions.length} Classes This Week</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Schedule Grid */}
        <div className="bg-white rounded-xl border border-accent-200 shadow-lg">
          <StudentWeekSchedule sessions={studentSessions} startHour={8} slots={10} slotMinutes={90} />
        </div>
      </div>
    </StudentLayout>
  );
}
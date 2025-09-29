// src/pages/Teacher/SchedulePage.tsx
import { useState } from "react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import TeacherWeekSchedule from "@/pages/Teacher/SchedulePage/Component/TeacherWeekSchedule";
import ScheduleRegistrationDialog, { type DaySchedule } from "@/pages/Teacher/SchedulePage/Component/ScheduleRegistrationDialog";
import PageHeader from "@/components/ui/PageHeader";
import { Calendar, BookOpen, Plus } from "lucide-react";
import type { Session } from "@/pages/Teacher/SchedulePage/Component/TeacherWeekSchedule";

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

/* ===== Teacher Schedule Data (Tuần hiện tại) ===== */
const sessions: Session[] = [
  // Thứ 2 (Mon=0)
  { id: "1", title: "Intermediate English", classCode: "IE101", room: "A-301", start: fmtCustom(dateOfThisWeek(0, 8, 0)) },
  { id: "2", title: "Elementary English",  classCode: "EE102", room: "A-301", start: fmtCustom(dateOfThisWeek(0, 10, 30)) },
  { id: "3", title: "TOEFL Preparation",   classCode: "TP201", room: "B-203", start: fmtCustom(dateOfThisWeek(0, 14, 0)) },
  { id: "4", title: "Advanced Grammar",    classCode: "AG301", room: "B-203", start: fmtCustom(dateOfThisWeek(0, 16, 30)) },

  // Thứ 3
  { id: "5", title: "Business English",     classCode: "BE201", room: "C-102", start: fmtCustom(dateOfThisWeek(1, 9, 0)) },
  { id: "6", title: "Elementary English",   classCode: "EE102", room: "A-301", start: fmtCustom(dateOfThisWeek(1, 13, 30)) },
  { id: "7", title: "Speaking Practice",    classCode: "SP301", room: "D-201", start: fmtCustom(dateOfThisWeek(1, 15, 30)) },

  // Thứ 4
  { id: "8", title: "Business English",     classCode: "BE201", room: "C-102", start: fmtCustom(dateOfThisWeek(2, 8, 30)) },
  { id: "9", title: "IELTS Writing",       classCode: "IW401", room: "B-105", start: fmtCustom(dateOfThisWeek(2, 14, 0)) },

  // Thứ 5
  { id: "10", title: "Advanced English",    classCode: "AE401", room: "A-205", start: fmtCustom(dateOfThisWeek(3, 10, 0)) },
  { id: "11", title: "Conversation Class",  classCode: "CC201", room: "D-301", start: fmtCustom(dateOfThisWeek(3, 16, 0)) },

  // Thứ 6
  { id: "12", title: "IELTS Preparation",   classCode: "IP301", room: "B-203", start: fmtCustom(dateOfThisWeek(4, 9, 30)) },
  { id: "13", title: "Academic Writing",    classCode: "AW501", room: "C-201", start: fmtCustom(dateOfThisWeek(4, 14, 30)) },

  // Thứ 7
  { id: "14", title: "Weekend Workshop",    classCode: "WW101", room: "A-Hall", start: fmtCustom(dateOfThisWeek(5, 10, 0)) },
  { id: "15", title: "English Club",        classCode: "EC901", room: "Student Lounge", start: fmtCustom(dateOfThisWeek(5, 16, 0)) },
];

export default function SchedulePage() {
  const [isRegistrationDialogOpen, setIsRegistrationDialogOpen] = useState(false);

  const breadcrumbItems = [
    { label: "Schedule" }
  ];

  const handleRegisterClick = () => {
    setIsRegistrationDialogOpen(true);
  };

  const handleRegistrationDialogClose = () => {
    setIsRegistrationDialogOpen(false);
  };

  const handleRegistrationSubmit = (daySchedules: DaySchedule) => {
    // Here you would typically make an API call to register for the schedule
    console.log('Registering for schedule:', daySchedules);
    
    // You could add a toast notification here for success feedback
    // For example: toast.success('Schedule registration successful!');
  };

  return (
    <div className="p-6 max-w-full space-y-8">
      <Breadcrumbs items={breadcrumbItems} />

        
        <PageHeader
          title="My Teaching Schedule"
          description="View and manage your weekly teaching schedule"
          icon={<Calendar className="w-5 h-5 text-white" />}
          controls={[
            {
              type: 'button',
              label: 'Register for Schedule',
              variant: 'primary',
              icon: <Plus className="w-4 h-4" />,
              onClick: handleRegisterClick
            },
           
            {
              type: 'button',
              label: 'View All Classes',
              variant: 'secondary',
              icon: <BookOpen className="w-4 h-4" />
            }
          ]}
        />

        {/* Schedule Grid */}
        <div className="bg-white rounded-xl border border-accent-200 shadow-lg">
          <TeacherWeekSchedule sessions={sessions} startHour={8} slots={10} slotMinutes={90} />
        </div>

        {/* Schedule Registration Dialog */}
        <ScheduleRegistrationDialog
          isOpen={isRegistrationDialogOpen}
          onClose={handleRegistrationDialogClose}
          onSubmit={handleRegistrationSubmit}
        />
    </div>
  );
}


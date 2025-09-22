import { Routes, Route } from 'react-router-dom'
import Footer from './components/layout/Footer'
import Requests from './pages/Requests'
import Reports from './pages/Reports'
import Dev_Dashboard from './pages/Dev_Dashboard'
import Gateway from './pages/Common/Gateway'
import HomePage from './pages/Common/HomePage'
import LoginPage from './pages/Common/Login'
import RegisterPage from './pages/Common/Register'
import ForgotPassword from './pages/Common/ForgotPassword'
import OtpVerification from './pages/Common/OtpVerification'
import ResetPassword from './pages/Common/ResetPassword'
import Wishlist from './pages/Student/Wishlist'
import Schedule from './pages/Student/Schedule'
import Feedback from './pages/Student/Feedback'
import Materials from './pages/Student/Materials'
import TechnicalReport from './pages/Common/TechnicalReport'
import AcademicReport from './pages/Common/AcademicReport'
import TechnicalIssueReportDetail from './pages/Common/TechnicalIssueReportDetail'
import AcademicChangeRequestDetail from './pages/Common/AcademicChangeRequestDetail'
import Classes from './pages/Teacher/ClassesPage/Classes'
import Courses from './pages/Teacher/CoursesPage/Courses'
import ClassesDetail from './pages/Teacher/ClassDetail/ClassDetail'
import SessionDetail from './pages/Teacher/ClassDetail/SessionDetail'
import TeacherReport from './pages/Teacher/ReportPage/Report'
import TeacherProfile from './pages/Teacher/TeacherProfilePage/Profile'
import TeacherSchedule from './pages/Teacher/SchedulePage/TeacherSchedule'
import Dev_Home from './pages/Dev_Home'
import CourseDetailPage from './pages/Course/CourseDetailPage'
import CourseAll from './pages/Course/CourseAll'
import GoogleCallback from './pages/Common/GoogleCallback'
import ChangePassword from './pages/Common/ChangePassword'
import MyClasses from './pages/Student/MyClasses'
import ClassSession from './pages/Student/ClassSession'
import AttendanceReport from './pages/Student/Attendances/AttendanceReport'


export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      
      <main className="flex-1">
         <div className="px-0">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/courses" element={<CourseAll />} />
            <Route path="/course/:courseId" element={<CourseDetailPage />} />
            <Route path="/gateway" element={<Gateway />} />
            <Route path="/requests" element={<Requests />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/dev" element={<Dev_Home />} />
            <Route path="/dev/dashboard" element={<Dev_Dashboard />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/google-callback" element={<GoogleCallback />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgotPassword" element={<ForgotPassword />} /> 
            <Route path="/otpVerification" element={<OtpVerification />} /> 
            <Route path="/resetPassword" element={<ResetPassword />} />          
            <Route path="/change-password" element={<ChangePassword />} />
            <Route path="/student/wishlist" element={<Wishlist />} /> 
            <Route path="/student/my-classes" element={<MyClasses />} /> 
            <Route path="/student/class/:classId" element={<ClassSession />} />
            <Route path="/student/schedule" element={<Schedule />} />
            <Route path="/student/attendance" element={<AttendanceReport />} />
            <Route path="/student/feedback" element={<Feedback />} />
            <Route path="/student/materials" element={<Materials />} /> 
            <Route path="/student/request-issue/technical" element={<TechnicalReport />} />
            <Route path="/student/request-issue/academic" element={<AcademicReport />} />
            <Route path="/student/request-issue/detail/:id" element={<TechnicalIssueReportDetail />} />
            <Route path="/student/academic-request/detail/:id" element={<AcademicChangeRequestDetail />} />
            <Route path="/teacher/classes" element={<Classes />} />
            <Route path="/teacher/courses" element={<Courses />} />
            <Route path="/teacher/courses/:courseId/classes" element={<Classes />} />
            <Route path="/teacher/classesDetail" element={<ClassesDetail />} />
            <Route path="/teacher/sessionDetail" element={<SessionDetail />} />
            <Route path="/teacher/teacherProfile" element={<TeacherProfile />} />

            

            
            <Route path="/teacher/schedule" element={<TeacherSchedule />} />
            <Route path="/teacher/request-issue/:category" element={<TeacherReport />} />
            
          </Routes>
        </div>
      </main>
      <Footer />
    </div>
    
  )
}

import { Routes, Route } from 'react-router-dom'
import Footer from './components/layout/Footer'
import Home from './pages/home/Home'
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
import MyCourses from './pages/Student/MyCourses'
import CourseSession from './pages/Student/CourseSession'
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


export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      
      <main className="flex-1">
         <div className="px-0">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/homePage" element={<HomePage />} />
            <Route path="/gateway" element={<Gateway />} />
            <Route path="/requests" element={<Requests />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/dev" element={<Dev_Home />} />
            <Route path="/dev/dashboard" element={<Dev_Dashboard />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgotPassword" element={<ForgotPassword />} /> 
            <Route path="/otpVerification" element={<OtpVerification />} /> 
            <Route path="/resetPassword" element={<ResetPassword />} />          
            <Route path="/student/wishlist" element={<Wishlist />} /> 
            <Route path="/student/myCourses" element={<MyCourses />} /> 
            <Route path="/student/Course/:courseId" element={<CourseSession />} />
            <Route path="/student/schedule" element={<Schedule />} />
            <Route path="/student/feedback" element={<Feedback />} />
            <Route path="/student/materials" element={<Materials />} /> 
            <Route path="/student/report-issue/technical" element={<TechnicalReport />} />
            <Route path="/student/report-issue/academic" element={<AcademicReport />} />
            <Route path="/student/report-issue/detail/:id" element={<TechnicalIssueReportDetail />} />
            <Route path="/student/academic-request/detail/:id" element={<AcademicChangeRequestDetail />} />
            <Route path="/student/Course/:courseId" element={<CourseSession />} /> 
            <Route path="/teacher/classes" element={<Classes />} />
            <Route path="/teacher/courses" element={<Courses />} />
            <Route path="/teacher/courses/:courseId/classes" element={<Classes />} />
            <Route path="/teacher/classesDetail" element={<ClassesDetail />} />
            <Route path="/teacher/sessionDetail" element={<SessionDetail />} />
            <Route path="/teacher/teacherProfile" element={<TeacherProfile />} />

            

            
            <Route path="/teacher/teacherSchedule" element={<TeacherSchedule />} />
            <Route path="/teacher/TeacherReport/:category" element={<TeacherReport />} />
            
          </Routes>
        </div>
      </main>
      <Footer />
    </div>
    
  )
}

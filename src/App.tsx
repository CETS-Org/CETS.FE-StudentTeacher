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
import CoursePackageDetail from './pages/CoursePackage/CoursePackageDetail'
import GoogleCallback from './pages/Common/GoogleCallback'
import VerificationSuccess from './pages/Common/VerificationSuccess'
import VerificationError from './pages/Common/VerificationError'
import ChangePassword from './pages/Common/ChangePassword'
import MyClasses from './pages/Student/MyClasses'
import ClassSession from './pages/Student/ClassSession/ClassDetaill'
import StudentSessionDetail from './pages/Student/ClassSession/SessionDetail'
import StudentAssignmentPreview from './pages/Student/Assignment/StudentAssignmentPreview'
import StudentAssignmentTaking from './pages/Student/Assignment/StudentAssignmentTaking'
import TestPage from './pages/Student/Assignment/TestPage'
import AttendanceReport from './pages/Student/Attendances/AttendanceReport'
import AcademicResults from './pages/Student/AcademicResults/AcademicResults'
import LearningPath from './pages/Student/LearningPath'
import ChoosePaidItem from './pages/Student/ChoosePaidItem/ChoosePaidItem'
import PaymentSuccess from './pages/Student/ChoosePaidItem/PaymentSuccess'
import PaymentCancel from './pages/Student/ChoosePaidItem/PaymentCancel'
import PaymentCallback from './pages/Common/PaymentCallback'
import ClassReservationDetails from './pages/Student/ChoosePaidItem/ClassReservationDetails/ClassReservationDetails'
import PaymentHistory from './pages/Student/ChoosePaidItem/PaymentHistory/PaymentHistory'
import UniversalLayout from './Shared/UniversalLayout'
import StudentDetailPage from './pages/Student/Profile/StudentDetailPage'
import ScrollToTop from './components/ScrollToTop'
import WeeklyFeedback from '@/pages/Student/WeeklyFeedback'
import ToastContainer from './components/ui/ToastContainer'
import TakePlacementTestPage from '@/pages/Student/PlacementTest/TakePlacementTestPage'


export default function App() {
  return (
    <>
      <ScrollToTop />
      <ToastContainer />
      <Routes>
      {/* Public routes - no layout */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/gateway" element={<Gateway />} />
      <Route path="/forgotPassword" element={<ForgotPassword />} /> 
      <Route path="/otpVerification" element={<OtpVerification />} /> 
      <Route path="/resetPassword" element={<ResetPassword />} />
      <Route path="/google-callback" element={<GoogleCallback />} />
      <Route path="/verification-success" element={<VerificationSuccess />} />
      <Route path="/verification-error" element={<VerificationError />} />
      
      {/* All other routes with UniversalLayout */}
      <Route path="/*" element={
        <UniversalLayout>
          <div className="flex-1 flex flex-col min-h-[calc(100vh-5rem)]">
            <Routes>
              <Route path="/" element={<HomePage />} />
            <Route path="/courses" element={<CourseAll />} />
            <Route path="/course/:courseId" element={<CourseDetailPage />} />
            <Route path="/course-package/:id" element={<CoursePackageDetail />} />
            <Route path="/requests" element={<Requests />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/dev" element={<Dev_Home />} />
            <Route path="/dev/dashboard" element={<Dev_Dashboard />} />
            <Route path="/change-password" element={<ChangePassword />} />
            
            {/* Student routes */}
            <Route path="/student/wishlist" element={<Wishlist />} /> 
            <Route path="/student/my-classes" element={<MyClasses />} /> 
            <Route path="/student/class/:classId" element={<ClassSession />} />
            <Route path="/student/class/:classId/session/:sessionId" element={<StudentSessionDetail />} />
            <Route path="/student/assignment/:assignmentId/preview" element={<StudentAssignmentPreview />} />
            <Route path="/student/assignment/:assignmentId/take" element={<StudentAssignmentTaking />} />
            <Route path="/student/assignment/test" element={<TestPage />} />
            <Route path="/student/schedule" element={<Schedule />} />
            <Route path="/student/attendance" element={<AttendanceReport />} />
            <Route path="/student/academic-results" element={<AcademicResults />} />
            <Route path="/student/learning-path" element={<LearningPath />} />
            <Route path="/student/feedback" element={<Feedback />} />
            <Route path="/student/weekly-feedback" element={<WeeklyFeedback />} />
            <Route path="/student/placement-test" element={<TakePlacementTestPage />} />
            <Route path="/student/choose-paid-item" element={<ChoosePaidItem />} /> 
            <Route path="/student/payment-history" element={<PaymentHistory />} />
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/payment/cancel" element={<PaymentCancel />} />
            <Route path="/payment/callback" element={<PaymentCallback />} />
            <Route path="/student/choose-paid-item/reservations/:reservationId" element={<ClassReservationDetails />} />
            <Route path="/student/materials" element={<Materials />} />
            <Route path="/student/request-issue/technical" element={<TechnicalReport />} />
            <Route path="/student/request-issue/academic" element={<AcademicReport />} />
            <Route path="/student/request-issue/detail/:id" element={<TechnicalIssueReportDetail />} />
            <Route path="/student/academic-request/detail/:id" element={<AcademicChangeRequestDetail />} />
            <Route path="/student/profile" element={<StudentDetailPage />} />

            {/* Teacher routes */}
            <Route path="/teacher/classes" element={<Classes />} />
            <Route path="/teacher/courses" element={<Courses />} />
            <Route path="/teacher/courses/:courseId/classes" element={<Classes />} />
            <Route path="/teacher/class/:id" element={<ClassesDetail />} />
            <Route path="/teacher/class/:id/session/:sessionId" element={<SessionDetail />} />
            <Route path="/teacher/teacherProfile" element={<TeacherProfile />} />
            <Route path="/teacher/schedule" element={<TeacherSchedule />} />
            <Route path="/teacher/request-issue/:category" element={<TeacherReport />} />
            </Routes>
          </div>
          <Footer />
        </UniversalLayout>
      } />
    </Routes>
    </>
  )
}

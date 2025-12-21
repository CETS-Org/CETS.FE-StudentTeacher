import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Footer from './components/layout/Footer'
import Requests from './pages/Requests'
import Reports from './pages/Reports'
import Dev_Dashboard from './pages/Dev_Dashboard'
import Gateway from './pages/Common/Gateway'
import LoginPage from './pages/Common/Login'
import RegisterPage from './pages/Common/Register'
import ForgotPassword from './pages/Common/ForgotPassword'
import OtpVerification from './pages/Common/OtpVerification'
import ResetPassword from './pages/Common/ResetPassword'
import ProtectedRoute from './components/auth/ProtectedRoute'
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
import TermsOfService from './pages/Common/TermsOfService'
import PrivacyPolicy from './pages/Common/PrivacyPolicy'
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
import WeeklyFeedback from './pages/Student/WeeklyFeedback'
import ToastContainer from './components/ui/ToastContainer'
import TakePlacementTestPage from '@/pages/Student/PlacementTest/TakePlacementTestPage'
import ChatWidget from './Shared/Chat/components/ChatWidget';
import PostponeConfirmationPage from './Shared/Verification/PostponeConfirmationPage';


// Component to conditionally render Footer and ChatWidget
function LayoutContent() {
  const location = useLocation();
  
  // Pages that should hide footer and chat widget (test pages)
  const shouldHideFooterAndChat = 
    location.pathname === '/student/placement-test' ||
    (location.pathname.startsWith('/student/assignment/') && location.pathname.endsWith('/take'));
  
  return (
    <>
      <ScrollToTop />
      <ToastContainer />
      <Routes>
      {/* Public routes - no layout */}
      <Route path="/login" element={
        <ProtectedRoute requireAuth={false}>
          <LoginPage />
        </ProtectedRoute>
      } />
      <Route path="/register" element={
        <ProtectedRoute requireAuth={false}>
          <RegisterPage />
        </ProtectedRoute>
      } />
      <Route path="/gateway" element={<Gateway />} />
      <Route path="/forgotPassword" element={<ForgotPassword />} /> 
      <Route path="/otpVerification" element={<OtpVerification />} /> 
      <Route path="/resetPassword" element={<ResetPassword />} />
      <Route path="/google-callback" element={<GoogleCallback />} />
      <Route path="/verification-success" element={<VerificationSuccess />} />
      <Route path="/verification-error" element={<VerificationError />} />
      <Route path="/postpone-confirmation" element={<PostponeConfirmationPage />} />
      
      {/* All other routes with UniversalLayout */}
      <Route path="/*" element={
        <UniversalLayout>
          <div className="flex-1 flex flex-col min-h-[calc(100vh-5rem)]">
            <Routes>
              <Route path="/" element={<Navigate to="/courses" replace />} />
            <Route path="/courses" element={<CourseAll />} />
            <Route path="/course/:courseId" element={<CourseDetailPage />} />
            <Route path="/course-package/:id" element={<CoursePackageDetail />} />
            <Route path="/requests" element={<Requests />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/dev" element={<Dev_Home />} />
            <Route path="/dev/dashboard" element={<Dev_Dashboard />} />
            <Route path="/change-password" element={
              <ProtectedRoute>
                <ChangePassword />
              </ProtectedRoute>
            } />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            
            {/* Student routes - protected with Student role */}
            <Route path="/student/wishlist" element={
              <ProtectedRoute allowedRoles={['Student']}>
                <Wishlist />
              </ProtectedRoute>
            } /> 
            <Route path="/student/my-classes" element={
              <ProtectedRoute allowedRoles={['Student']}>
                <MyClasses />
              </ProtectedRoute>
            } /> 
            <Route path="/student/class/:classId" element={
              <ProtectedRoute allowedRoles={['Student']}>
                <ClassSession />
              </ProtectedRoute>
            } />
            <Route path="/student/class/:classId/session/:sessionId" element={
              <ProtectedRoute allowedRoles={['Student']}>
                <StudentSessionDetail />
              </ProtectedRoute>
            } />
            <Route path="/student/assignment/:assignmentId/preview" element={
              <ProtectedRoute allowedRoles={['Student']}>
                <StudentAssignmentPreview />
              </ProtectedRoute>
            } />
            <Route path="/student/assignment/:assignmentId/take" element={
              <ProtectedRoute allowedRoles={['Student']}>
                <StudentAssignmentTaking />
              </ProtectedRoute>
            } />
            <Route path="/student/assignment/test" element={
              <ProtectedRoute allowedRoles={['Student']}>
                <TestPage />
              </ProtectedRoute>
            } />
            <Route path="/student/schedule" element={
              <ProtectedRoute allowedRoles={['Student']}>
                <Schedule />
              </ProtectedRoute>
            } />
            <Route path="/student/attendance" element={
              <ProtectedRoute allowedRoles={['Student']}>
                <AttendanceReport />
              </ProtectedRoute>
            } />
            <Route path="/student/academic-results" element={
              <ProtectedRoute allowedRoles={['Student']}>
                <AcademicResults />
              </ProtectedRoute>
            } />
            <Route path="/student/learning-path" element={
              <ProtectedRoute allowedRoles={['Student']}>
                <LearningPath />
              </ProtectedRoute>
            } />
            <Route path="/student/feedback" element={
              <ProtectedRoute allowedRoles={['Student']}>
                <Feedback />
              </ProtectedRoute>
            } />
            <Route path="/student/weekly-feedback" element={
              <ProtectedRoute allowedRoles={['Student']}>
                <WeeklyFeedback />
              </ProtectedRoute>
            } />
            <Route path="/student/placement-test" element={
              <ProtectedRoute allowedRoles={['Student']}>
                <TakePlacementTestPage />
              </ProtectedRoute>
            } />
            <Route path="/student/choose-paid-item" element={
              <ProtectedRoute allowedRoles={['Student']}>
                <ChoosePaidItem />
              </ProtectedRoute>
            } /> 
            <Route path="/student/payment-history" element={
              <ProtectedRoute allowedRoles={['Student']}>
                <PaymentHistory />
              </ProtectedRoute>
            } />
            <Route path="/payment/success" element={
              <ProtectedRoute allowedRoles={['Student']}>
                <PaymentSuccess />
              </ProtectedRoute>
            } />
            <Route path="/payment/cancel" element={
              <ProtectedRoute allowedRoles={['Student']}>
                <PaymentCancel />
              </ProtectedRoute>
            } />
            <Route path="/payment/callback" element={
              <ProtectedRoute allowedRoles={['Student']}>
                <PaymentCallback />
              </ProtectedRoute>
            } />
            <Route path="/student/choose-paid-item/reservations/:reservationId" element={
              <ProtectedRoute allowedRoles={['Student']}>
                <ClassReservationDetails />
              </ProtectedRoute>
            } />
            <Route path="/student/materials" element={
              <ProtectedRoute allowedRoles={['Student']}>
                <Materials />
              </ProtectedRoute>
            } />
            <Route path="/student/request-issue/technical" element={
              <ProtectedRoute allowedRoles={['Student']}>
                <TechnicalReport />
              </ProtectedRoute>
            } />
            <Route path="/student/request-issue/academic" element={
              <ProtectedRoute allowedRoles={['Student']}>
                <AcademicReport />
              </ProtectedRoute>
            } />
            <Route path="/student/request-issue/detail/:id" element={
              <ProtectedRoute allowedRoles={['Student']}>
                <TechnicalIssueReportDetail />
              </ProtectedRoute>
            } />
            <Route path="/student/academic-request/detail/:id" element={
              <ProtectedRoute allowedRoles={['Student']}>
                <AcademicChangeRequestDetail />
              </ProtectedRoute>
            } />
            <Route path="/student/profile" element={
              <ProtectedRoute allowedRoles={['Student']}>
                <StudentDetailPage />
              </ProtectedRoute>
            } />

            {/* Teacher routes - protected with Teacher role */}
            <Route path="/teacher/classes" element={
              <ProtectedRoute allowedRoles={['Teacher']}>
                <Classes />
              </ProtectedRoute>
            } />
            <Route path="/teacher/courses" element={
              <ProtectedRoute allowedRoles={['Teacher']}>
                <Courses />
              </ProtectedRoute>
            } />
            <Route path="/teacher/courses/:courseId/classes" element={
              <ProtectedRoute allowedRoles={['Teacher']}>
                <Classes />
              </ProtectedRoute>
            } />
            <Route path="/teacher/class/:id" element={
              <ProtectedRoute allowedRoles={['Teacher']}>
                <ClassesDetail />
              </ProtectedRoute>
            } />
            <Route path="/teacher/class/:id/session/:sessionId" element={
              <ProtectedRoute allowedRoles={['Teacher']}>
                <SessionDetail />
              </ProtectedRoute>
            } />
            <Route path="/teacher/teacherProfile" element={
              <ProtectedRoute allowedRoles={['Teacher']}>
                <TeacherProfile />
              </ProtectedRoute>
            } />
            <Route path="/teacher/schedule" element={
              <ProtectedRoute allowedRoles={['Teacher']}>
                <TeacherSchedule />
              </ProtectedRoute>
            } />
            <Route path="/teacher/request-issue/:category" element={
              <ProtectedRoute allowedRoles={['Teacher']}>
                <TeacherReport />
              </ProtectedRoute>
            } />
            </Routes>
          </div>
          {!shouldHideFooterAndChat && <ChatWidget />}
          {!shouldHideFooterAndChat && <Footer />}
        </UniversalLayout>
      } />
    </Routes>
    </>
  );
}

export default function App() {
  return <LayoutContent />;
}

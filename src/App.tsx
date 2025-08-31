import { Routes, Route } from 'react-router-dom'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import Home from './pages/Home'
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


export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/homePage" element={<HomePage />} />
            <Route path="/gateway" element={<Gateway />} />
            <Route path="/requests" element={<Requests />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/dev" element={<Dev_Dashboard />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgotPassword" element={<ForgotPassword />} /> 
            <Route path="/otpVerification" element={<OtpVerification />} /> 
            <Route path="/resetPassword" element={<ResetPassword />} /> 
            
            <Route path="/student/wishlist" element={<Wishlist />} /> 
            <Route path="/student/myCourses" element={<MyCourses />} /> 
            <Route path="/student/Course/:courseId" element={<CourseSession />} /> 
          </Routes>
        </div>
      </main>
      <Footer />
    </div>
  )
}

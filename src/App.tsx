import { Routes, Route } from 'react-router-dom'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import Home from './pages/Home'
import Requests from './pages/Requests'
import Reports from './pages/Reports'
import Dev_Dashboard from './pages/Dev_Dashboard'

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/requests" element={<Requests />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/dev" element={<Dev_Dashboard />} />
          </Routes>
        </div>
      </main>
      <Footer />
    </div>
  )
}

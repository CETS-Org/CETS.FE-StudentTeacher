import { usePageTitle } from "@/hooks/usePageTitle";
import { FileText, Calendar } from "lucide-react";

export default function TermsOfService() {
  usePageTitle("Terms of Service");

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 md:p-12">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-primary-100 rounded-lg">
              <FileText className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
              <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-gray max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                By accessing and using the CETS (Center for English Training Services) platform, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Use License</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Permission is granted to temporarily access the materials on CETS's platform for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose or for any public display</li>
                <li>Attempt to reverse engineer any software contained on the platform</li>
                <li>Remove any copyright or other proprietary notations from the materials</li>
                <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Course Enrollment and Payment</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                When you enroll in a course:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>You agree to pay the fees associated with the course as displayed at the time of enrollment</li>
                <li>Payment plans are subject to the terms specified at the time of purchase</li>
                <li>Refunds are subject to our refund policy, which may vary by course</li>
                <li>Class reservations expire after 7 days if payment is not completed</li>
                <li>We reserve the right to cancel or reschedule classes due to unforeseen circumstances</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. User Accounts</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                You are responsible for maintaining the confidentiality of your account and password. You agree to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Provide accurate, current, and complete information during registration</li>
                <li>Maintain and promptly update your account information</li>
                <li>Maintain the security of your password and identification</li>
                <li>Accept responsibility for all activities that occur under your account</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Academic Integrity</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                All students are expected to maintain high standards of academic integrity. This includes:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Completing assignments independently unless group work is explicitly assigned</li>
                <li>Not engaging in plagiarism or academic dishonesty</li>
                <li>Respecting intellectual property rights</li>
                <li>Following all examination and assessment guidelines</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Limitation of Liability</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                In no event shall CETS or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on CETS's platform, even if CETS or a CETS authorized representative has been notified orally or in writing of the possibility of such damage.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Revisions and Errata</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                The materials appearing on CETS's platform could include technical, typographical, or photographic errors. CETS does not warrant that any of the materials on its platform are accurate, complete, or current. CETS may make changes to the materials contained on its platform at any time without notice.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Contact Information</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have any questions about these Terms of Service, please contact us through our support channels or visit our contact page.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}


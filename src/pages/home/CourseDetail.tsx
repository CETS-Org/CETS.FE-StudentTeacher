import { useState } from "react";
import { Star, Clock, Users, BookOpen, CheckCircle, Play, Download, Award, Shield, Headphones } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from "@/components/ui/Dialog";

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  price: number;
  originalPrice?: number;
  rating: number;
  studentsCount: number;
  image: string;
  category: string;
  features: string[];
  isPopular?: boolean;
  isNew?: boolean;
  detailedDescription?: string;
  curriculum?: string[];
  requirements?: string[];
  whatYouWillLearn?: string[];
  instructorBio?: string;
  instructorImage?: string;
  instructorRating?: number;
  instructorStudents?: number;
  instructorCourses?: number;
}

interface CourseDetailProps {
  course: Course;
}

export default function CourseDetail({ course }: CourseDetailProps) {
  const [showEnrollmentDialog, setShowEnrollmentDialog] = useState(false);
  const [enrollmentData, setEnrollmentData] = useState({
    fullName: "",
    email: "",
    phone: "",
    paymentMethod: "credit_card",
    paymentPlan: "one_time", // "one_time" or "quarterly"
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: ""
  });

  const discountPercentage = course.originalPrice 
    ? Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)
    : 0;

  // Calculate payment amounts
  const getPaymentAmount = () => {
    if (enrollmentData.paymentPlan === "quarterly") {
      return Math.round(course.price / 4);
    }
    return course.price;
  };

  const getTotalAmount = () => {
    if (enrollmentData.paymentPlan === "quarterly") {
      return course.price;
    }
    return course.price;
  };

  const handleEnroll = () => {
    setShowEnrollmentDialog(true);
  };

  const handleEnrollmentSubmit = () => {
    // Handle enrollment submission
    console.log("Enrollment data:", enrollmentData);
    setShowEnrollmentDialog(false);
    // You can add success notification here
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
           
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
              <p className="text-gray-600">by {course.instructor}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Course Hero */}
            <Card>
              <div className="relative">
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-64 object-cover rounded-t-lg"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  {course.isPopular && (
                    <span className="bg-primary-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      🔥 Popular
                    </span>
                  )}
                  {course.isNew && (
                    <span className="bg-accent-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      ✨ New
                    </span>
                  )}
                  {discountPercentage > 0 && (
                    <span className="bg-success-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      -{discountPercentage}%
                    </span>
                  )}
                </div>
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                  <Button className="bg-white/90 hover:bg-white text-gray-900">
                    <Play className="w-5 h-5 mr-2" />
                    Preview Course
                  </Button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <span className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium">
                    {course.category}
                  </span>
                  <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                    {course.level}
                  </span>
                </div>
                
                <h2 className="text-3xl font-bold text-gray-900 mb-4">{course.title}</h2>
                <p className="text-lg text-gray-600 mb-6">{course.description}</p>
                
                <div className="flex items-center gap-6 text-sm text-gray-600 mb-6">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="font-medium">{course.rating}</span>
                    <span>({course.studentsCount.toLocaleString()} students)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    <span>{course.level}</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* What You'll Learn */}
            <Card title="What You'll Learn">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {course.whatYouWillLearn?.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-success-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Course Curriculum */}
            <Card title="Course Curriculum">
              <div className="space-y-4">
                {course.curriculum?.map((lesson, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-semibold">
                        {index + 1}
                      </div>
                      <span className="font-medium">{lesson}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>15 min</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Requirements */}
            <Card title="Requirements">
              <ul className="space-y-2">
                {course.requirements?.map((req, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary-600 mt-1">•</span>
                    <span className="text-gray-700">{req}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Instructor */}
            <Card title="About the Instructor">
              <div className="flex items-start gap-6">
                <img
                  src={course.instructorImage || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"}
                  alt={course.instructor}
                  className="w-20 h-20 rounded-full object-cover"
                />
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{course.instructor}</h3>
                  <p className="text-gray-600 mb-4">{course.instructorBio}</p>
                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span>{course.instructorRating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{course.instructorStudents?.toLocaleString()} students</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      <span>{course.instructorCourses} courses</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Enrollment Card */}
            <Card className="sticky top-8">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-3xl font-bold text-gray-900">${course.price}</span>
                  {course.originalPrice && (
                    <span className="text-xl text-gray-400 line-through">${course.originalPrice}</span>
                  )}
                </div>
                {discountPercentage > 0 && (
                  <span className="text-sm text-success-600 font-medium">
                    Save {discountPercentage}% today!
                  </span>
                )}
              </div>

              <Button
                onClick={handleEnroll}
                 className="w-full font-semibold mb-4"
              >
                Enroll Now
              </Button>

              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success-600" />
                  <span>Lifetime access</span>
                </div>
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-success-600" />
                  <span>Downloadable resources</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-success-600" />
                  <span>Certificate of completion</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-success-600" />
                  <span>30-day money-back guarantee</span>
                </div>
                <div className="flex items-center gap-2">
                  <Headphones className="w-4 h-4 text-success-600" />
                  <span>24/7 support</span>
                </div>
              </div>
            </Card>

            {/* Course Stats */}
            <Card title="Course Statistics">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Students enrolled</span>
                  <span className="font-semibold">{course.studentsCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Average rating</span>
                  <span className="font-semibold flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    {course.rating}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Course duration</span>
                  <span className="font-semibold">{course.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Level</span>
                  <span className="font-semibold">{course.level}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Enrollment Dialog */}
      <Dialog open={showEnrollmentDialog} onOpenChange={setShowEnrollmentDialog}>
        <DialogContent size="lg">
          <DialogHeader>
            <DialogTitle>Complete Your Enrollment</DialogTitle>
          </DialogHeader>
        
          <DialogBody>
          <div className="space-y-6">
            {/* Course Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-4">
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{course.title}</h3>
                  <p className="text-sm text-gray-600">by {course.instructor}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-lg font-bold text-primary-600">${course.price}</span>
                    {course.originalPrice && (
                      <span className="text-sm text-gray-400 line-through">${course.originalPrice}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <Input
                    type="text"
                    value={enrollmentData.fullName}
                    onChange={(e) => setEnrollmentData({...enrollmentData, fullName: e.target.value})}
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <Input
                    type="email"
                    value={enrollmentData.email}
                    onChange={(e) => setEnrollmentData({...enrollmentData, email: e.target.value})}
                    placeholder="Enter your email"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <Input
                    type="tel"
                    value={enrollmentData.phone}
                    onChange={(e) => setEnrollmentData({...enrollmentData, phone: e.target.value})}
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                  <Select
                    value={enrollmentData.paymentMethod}
                    onChange={(e) => setEnrollmentData({...enrollmentData, paymentMethod: e.target.value})}
                  >
                    <option value="credit_card">Credit Card</option>
                    <option value="debit_card">Debit Card</option>
                    <option value="paypal">PayPal</option>
                    <option value="bank_transfer">Bank Transfer</option>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Plan</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div 
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        enrollmentData.paymentPlan === "one_time" 
                          ? "border-primary-600 bg-primary-50" 
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setEnrollmentData({...enrollmentData, paymentPlan: "one_time"})}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <input 
                          type="radio" 
                          checked={enrollmentData.paymentPlan === "one_time"}
                          onChange={() => {}}
                          className="text-primary-600"
                        />
                        <span className="font-semibold text-gray-900">One-time Payment</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <div className="font-medium text-lg text-primary-600">${course.price}</div>
                        <div>Pay once and get lifetime access</div>
                      </div>
                    </div>
                    
                    <div 
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        enrollmentData.paymentPlan === "quarterly" 
                          ? "border-primary-600 bg-primary-50" 
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setEnrollmentData({...enrollmentData, paymentPlan: "quarterly"})}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <input 
                          type="radio" 
                          checked={enrollmentData.paymentPlan === "quarterly"}
                          onChange={() => {}}
                          className="text-primary-600"
                        />
                        <span className="font-semibold text-gray-900">Quarterly Payment</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <div className="font-medium text-lg text-primary-600">${getPaymentAmount()}/quarter</div>
                        <div>4 payments of ${getPaymentAmount()} each</div>
                        <div className="text-xs text-gray-500 mt-1">Total: ${getTotalAmount()}</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {enrollmentData.paymentMethod === "credit_card" || enrollmentData.paymentMethod === "debit_card" ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
                      <Input
                        type="text"
                        value={enrollmentData.cardNumber}
                        onChange={(e) => setEnrollmentData({...enrollmentData, cardNumber: e.target.value})}
                        placeholder="1234 5678 9012 3456"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                        <Input
                          type="text"
                          value={enrollmentData.expiryDate}
                          onChange={(e) => setEnrollmentData({...enrollmentData, expiryDate: e.target.value})}
                          placeholder="MM/YY"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                        <Input
                          type="text"
                          value={enrollmentData.cvv}
                          onChange={(e) => setEnrollmentData({...enrollmentData, cvv: e.target.value})}
                          placeholder="123"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Cardholder Name</label>
                      <Input
                        type="text"
                        value={enrollmentData.cardholderName}
                        onChange={(e) => setEnrollmentData({...enrollmentData, cardholderName: e.target.value})}
                        placeholder="Name on card"
                      />
                    </div>
                  </>
                ) : (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">
                      {enrollmentData.paymentMethod === "paypal" 
                        ? "You will be redirected to PayPal to complete your payment."
                        : "Bank transfer details will be provided after enrollment."
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <input type="checkbox" className="mt-1" />
                <div className="text-sm text-gray-600">
                  <p>I agree to the <a href="#" className="text-primary-600 hover:underline">Terms of Service</a> and <a href="#" className="text-primary-600 hover:underline">Privacy Policy</a>.</p>
                  <p className="mt-1">I understand that I have 30 days to request a refund if I'm not satisfied with the course.</p>
                </div>
              </div>
            </div>
          </div>
          </DialogBody>
          
          <DialogFooter>
          <div className="flex justify-between items-center w-full">
            <div className="text-lg font-semibold">
              {enrollmentData.paymentPlan === "quarterly" ? (
                <div>
                  <div>Per Quarter: <span className="text-primary-600">${getPaymentAmount()}</span></div>
                  <div className="text-sm text-gray-600">Total: <span className="text-primary-600">${getTotalAmount()}</span></div>
                </div>
              ) : (
                <div>Total: <span className="text-primary-600">${getPaymentAmount()}</span></div>
              )}
            </div>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setShowEnrollmentDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleEnrollmentSubmit}
                className="bg-primary-600 hover:bg-primary-700"
              >
                Complete Enrollment
              </Button>
            </div>
          </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
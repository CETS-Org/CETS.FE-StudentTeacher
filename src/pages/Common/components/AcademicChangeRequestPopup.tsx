import React, { useState } from "react";
import { X, AlertCircle } from "lucide-react";
import Button from "@/components/ui/Button";

interface AcademicChangeRequestPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AcademicChangeRequestData) => void;
}

interface AcademicChangeRequestData {
  studentTeacherId: string;
  fullName: string;
  fromClass: string;
  toClass: string;
  reasonForChange: string;
}

const classes = [
  "Select current class",
  "Class A - Mathematics",
  "Class B - Physics", 
  "Class C - Chemistry",
  "Class D - Biology",
  "Class E - Computer Science",
  "Class F - Literature",
  "Class G - History",
  "Class H - Geography"
];

const targetClasses = [
  "Select target class",
  "Class A - Mathematics",
  "Class B - Physics",
  "Class C - Chemistry", 
  "Class D - Biology",
  "Class E - Computer Science",
  "Class F - Literature",
  "Class G - History",
  "Class H - Geography"
];

const AcademicChangeRequestPopup: React.FC<AcademicChangeRequestPopupProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<AcademicChangeRequestData>({
    studentTeacherId: "",
    fullName: "",
    fromClass: "",
    toClass: "",
    reasonForChange: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
    // Reset form
    setFormData({
      studentTeacherId: "",
      fullName: "",
      fromClass: "",
      toClass: "",
      reasonForChange: "",
    });
  };

  const handleCancel = () => {
    onClose();
    // Reset form
    setFormData({
      studentTeacherId: "",
      fullName: "",
      fromClass: "",
      toClass: "",
      reasonForChange: "",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-black/20 backdrop-blur-sm transition-opacity px-4 sm:px-6 md:px-8 scrollbar-hide">
      <div className="bg-white rounded-lg shadow-xl w-full mx-40 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Academic Change Request</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Student/Teacher ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Student/Teacher ID
            </label>
            <input
              type="text"
              name="studentTeacherId"
              value={formData.studentTeacherId}
              onChange={handleInputChange}
              placeholder="Enter your ID"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* From Class and To Class */}
          <div className="grid grid-cols-2 gap-4">
            {/* From Class */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Class
              </label>
              <select
                name="fromClass"
                value={formData.fromClass}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                {classes.map((className, index) => (
                  <option 
                    key={index} 
                    value={index === 0 ? "" : className}
                    disabled={index === 0}
                  >
                    {className}
                  </option>
                ))}
              </select>
            </div>

            {/* To Class */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To Class
              </label>
              <select
                name="toClass"
                value={formData.toClass}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                {targetClasses.map((className, index) => (
                  <option 
                    key={index} 
                    value={index === 0 ? "" : className}
                    disabled={index === 0}
                  >
                    {className}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Reason for Change */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason for Change
            </label>
            <textarea
              name="reasonForChange"
              value={formData.reasonForChange}
              onChange={handleInputChange}
              placeholder="Please explain why you need to make this change..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              required
            />
          </div>

          {/* Important Notice */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-orange-800 mb-1">
                  Important Notice
                </h4>
                <p className="text-sm text-orange-700">
                  Class changes are subject to availability and approval. Processing may take 3-5 business days.
                </p>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <Button
              type="submit"
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
            >
              Submit Request
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AcademicChangeRequestPopup;
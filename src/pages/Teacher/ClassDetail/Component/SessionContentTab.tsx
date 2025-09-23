// src/components/teacher/SessionContentTab.tsx

import { useState } from "react";
import Card from "@/components/ui/Card";
import { CheckCircle, Link as LinkIcon, BookText, Target, ExternalLink, Upload } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import UploadAssignmentPopup from "@/pages/Teacher/ClassDetail/Component/Popup/UploadAssignmentPopup";

// Định nghĩa cấu trúc dữ liệu cho nội dung buổi học
type SessionContent = {
  topicTitle: string;
  objectives: string[];
  contentSummary: string;
  preReadingUrl?: string;
};

// Định nghĩa props cho component
type Props = {
  content: SessionContent;
};

// Variants cho Framer Motion animations
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
};

const iconBackgroundClasses = {
  objectives: "bg-gradient-to-br from-green-400 to-emerald-500",
  summary: "bg-gradient-to-br from-blue-400 to-indigo-500",
  prereading: "bg-gradient-to-br from-purple-400 to-fuchsia-500",
};

export default function SessionContentTab({ content }: Props) {
  const [isUploadOpen, setUploadOpen] = useState(false);

  const handleAssignmentSubmit = (assignmentData: any) => {
    console.log("Assignment submitted from Session Content:", assignmentData);
    alert(`Assignment "${assignmentData.title}" submitted!`);
    // Logic xử lý upload file sẽ được đặt ở đây
  };

  return (
    <>
      <motion.div
        className="space-y-10 py-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* 1. Topic Title */}
        <motion.div variants={itemVariants} className="text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 leading-tight">
            {content.topicTitle}
          </h2>
          <p className="text-lg text-gray-600 mt-3">
            Deep dive into the core concepts and learning objectives.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cột bên trái: Mục tiêu */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <Card className="h-full shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1 border border-gray-200 shadow-md">
              <div className="p-6">
                <div className="flex items-center gap-4 mb-5">
                  <div className={`p-3 rounded-full ${iconBackgroundClasses.objectives} text-white shadow-md`}>
                    <Target size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">
                    Learning Objectives
                  </h3>
                </div>
                <ul className="space-y-4">
                  {content.objectives.map((objective, index) => (
                    <motion.li 
                      key={index} 
                      variants={itemVariants}
                      className="flex items-start gap-4 p-2 -ml-2 rounded-md hover:bg-gray-50 transition-colors duration-200"
                    >
                      <CheckCircle size={20} className="text-green-500 mt-1 flex-shrink-0" />
                      <span className="text-gray-700 text-base">{objective}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </Card>
          </motion.div>

          {/* Cột bên phải: Tóm tắt và Tài liệu */}
          <div className="lg:col-span-2 space-y-8">
            {/* Card Tóm tắt nội dung */}
            <motion.div variants={itemVariants}>
              <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1 border border-gray-200 shadow-md">
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-5">
                    <div className={`p-3 rounded-full ${iconBackgroundClasses.summary} text-white shadow-md`}>
                      <BookText size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">
                      Session Overview
                    </h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed text-base whitespace-pre-wrap">
                    {content.contentSummary}
                  </p>
                </div>
              </Card>
            </motion.div>

            {/* Card Tài liệu đọc trước */}
            {content.preReadingUrl && (
              <motion.div variants={itemVariants}>
                <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1 border border-gray-200 shadow-md">
                  <div className="p-6">
                    <div className="flex items-center gap-4 mb-5">
                        <div className={`p-3 rounded-full ${iconBackgroundClasses.prereading} text-white shadow-md`}>
                            <ExternalLink size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">
                            Pre-reading Resources
                        </h3>
                    </div>
                    <p className="text-base text-gray-600 mb-4">
                        Explore these essential materials to prepare for the session.
                    </p>
                    <a
                      href={content.preReadingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-3 text-blue-600 font-bold hover:underline group text-base"
                    >
                      <span>Access Additional Materials</span>
                      <LinkIcon size={18} className="group-hover:translate-x-1 transition-transform duration-200" />
                    </a>
                  </div>
                </Card>
              </motion.div>
            )}

          
       

          </div>
        </div>
      </motion.div>

      {/* Render Popup (chỉ hiển thị khi state là true) */}
      <UploadAssignmentPopup
        open={isUploadOpen}
        onOpenChange={setUploadOpen}
        onSubmit={handleAssignmentSubmit}
      />
    </>
  );
}
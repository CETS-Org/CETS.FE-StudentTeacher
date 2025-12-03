// src/pages/common/PostponeConfirmationPage.tsx
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle2, XCircle, ArrowRight, Home, Clock, Wallet } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function PostponeConfirmationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const status = searchParams.get("status"); // 'success' | 'error'
  const type = searchParams.get("type");     // 'refund' | 'wait'
  const code = searchParams.get("code");     // Mã lỗi từ backend
  const courseName = searchParams.get("course");

  // Hàm xác định nội dung hiển thị dựa trên tham số URL
  const getContent = () => {
    // --- CASE 1: THÀNH CÔNG - YÊU CẦU HOÀN TIỀN (REFUND) ---
    if (status === "success" && type === "refund") {
      return {
        icon: <Wallet className="w-16 h-16 text-blue-500" />,
        title: "Refund Requested Successfully",
        message: `We have received your refund request for the course "${courseName}". An academic request has been created and our team will process it shortly.`,
        subMessage: "Please check your email for the confirmation details.",
        color: "blue"
      };
    }

    // --- CASE 2: THÀNH CÔNG - ĐỒNG Ý CHỜ (WAIT) ---
    if (status === "success" && type === "wait") {
      return {
        icon: <Clock className="w-16 h-16 text-green-500" />,
        title: "You are on the Waiting List",
        message: `Thank you for choosing to wait. We have updated your enrollment status for "${courseName}".`,
        subMessage: "We will notify you as soon as the new schedule is finalized.",
        color: "green"
      };
    }

    // --- CASE 3: LỖI - ĐÃ THỰC HIỆN TRƯỚC ĐÓ ---
    if (code === "already_refunded") {
      return {
        icon: <CheckCircle2 className="w-16 h-16 text-gray-400" />,
        title: "Request Already Processed",
        message: "You have already requested a refund for this course.",
        subMessage: "No further action is needed.",
        color: "gray"
      };
    }

    if (code === "already_waiting") {
      return {
        icon: <CheckCircle2 className="w-16 h-16 text-gray-400" />,
        title: "You are already waiting",
        message: "You have already confirmed to wait for the next class.",
        subMessage: "We will keep you updated.",
        color: "gray"
      };
    }

    // --- CASE 4: LỖI CHUNG / LINK KHÔNG HỢP LỆ ---
    return {
      icon: <XCircle className="w-16 h-16 text-red-500" />,
      title: "Something went wrong",
      message: "We couldn't process your request. The link might be invalid or expired.",
      subMessage: "Please contact support if you need assistance.",
      color: "red"
    };
  };

  const content = getContent();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      
      {/* Card thông báo chính */}
      <Card className={`max-w-md w-full p-8 text-center shadow-lg border-t-4 ${getBorderClass(content.color)}`}>
        
        <div className="flex justify-center mb-6">
          <div className={`p-4 rounded-full ${getBgColor(content.color)}`}>
            {content.icon}
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          {content.title}
        </h1>
        
        <p className="text-gray-600 mb-2 text-lg">
          {content.message}
        </p>
        
        <p className="text-sm text-gray-400 mb-8">
          {content.subMessage}
        </p>

        <div className="flex flex-col gap-3">
          <Button onClick={() => navigate("/login")} className="w-full justify-center bg-blue-600 hover:bg-blue-700 text-white">
            Go to Login <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Button variant="secondary" onClick={() => window.location.href = "/"} className="w-full justify-center">
            <Home className="w-4 h-4 mr-2" /> Back to Homepage
          </Button>
        </div>
      </Card>

      <div className="mt-8 text-center text-gray-400 text-sm">
        &copy; {new Date().getFullYear()} CETS - Center of English Training Systems
      </div>
    </div>
  );
}

// --- HELPER FUNCTIONS (Styling) ---

function getBgColor(color: string) {
  switch(color) {
    case 'green': return 'bg-green-50';
    case 'blue': return 'bg-blue-50';
    case 'red': return 'bg-red-50';
    default: return 'bg-gray-50';
  }
}

function getBorderClass(color: string) {
  switch(color) {
    case 'green': return 'border-green-500';
    case 'blue': return 'border-blue-500';
    case 'red': return 'border-red-500';
    default: return 'border-gray-300';
  }
}
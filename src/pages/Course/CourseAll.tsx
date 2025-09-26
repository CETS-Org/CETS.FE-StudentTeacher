import CourseCatalog from "./components/CourseCatalog";
import StudentNavbar from "@/Shared/StudentNavbar";

export default function CourseAll() {
  return (
    <div className="min-h-screen bg-gray-50">
      <StudentNavbar fullWidth />
      <div className="pt-16">
        <CourseCatalog />
      </div>
    </div>
  );
}
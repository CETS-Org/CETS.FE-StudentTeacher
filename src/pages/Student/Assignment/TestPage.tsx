import { useState } from "react";
import StudentLayout from "@/Shared/StudentLayout";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/card";
import StudentAssignmentTakingTest from "./StudentAssignmentTakingTest";

export default function TestPage() {
  const [showTest, setShowTest] = useState(false);

  if (showTest) {
    return <StudentAssignmentTakingTest />;
  }

  return (
    <StudentLayout>
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8">
            <h1 className="text-2xl font-bold text-neutral-900 mb-4">
              Assignment UI Test Page
            </h1>
            <p className="text-neutral-600 mb-6">
              This page allows you to test the Student Assignment Taking UI with mock data.
              You can switch between different skill types (Reading, Listening, Writing, Speaking)
              to see how the interface adapts to different assignment types.
            </p>
            
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-neutral-800">
                Features to Test:
              </h2>
              <ul className="list-disc list-inside space-y-2 text-neutral-600">
                <li>Different question types (Multiple Choice, True/False, Fill in the Blank, Short Answer, Essay, Matching)</li>
                <li>Question navigation sidebar with progress tracking</li>
                <li>Timer functionality with visual warnings</li>
                <li>Auto-save functionality</li>
                <li>Responsive design for different screen sizes</li>
                <li>Skill-specific UI adaptations (Reading, Listening, Writing, Speaking)</li>
                <li>Submit confirmation dialogs</li>
                <li>Exit confirmation with progress saving</li>
              </ul>
            </div>

            <div className="mt-8">
              <Button
                variant="primary"
                size="lg"
                onClick={() => setShowTest(true)}
              >
                Start Test Assignment
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </StudentLayout>
  );
}
import { useState } from "react";
import { ArrowLeft, Save, Send, Headphones, BookOpen, PenTool, MessageSquare, FileText, Mic, AlertTriangle, Clock } from "lucide-react";
import Button from "@/components/ui/Button";
import { Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/Dialog";

interface AssignmentHeaderProps {
  title: string;
  skillName: string | null;
  lastSaved: Date | null;
  isSaving?: boolean;
  onBack: () => void;
  onSave?: () => void;
  onSubmit: () => void;
  canSubmit: boolean;
  timeRemaining?: number | null;
  timeLimitSeconds?: number | null;
  formatTime?: (seconds: number | null) => string;
}

/**
 * Header component for assignment taking page
 * Shows title, skill icon, and action buttons
 */
export default function AssignmentHeader({
  title,
  skillName,
  lastSaved,
  isSaving,
  onBack,
  onSave,
  onSubmit,
  canSubmit,
  timeRemaining,
  timeLimitSeconds,
  formatTime,
}: AssignmentHeaderProps) {
  const [showExitDialog, setShowExitDialog] = useState(false);

  const getSkillIcon = (skillName: string | null) => {
    if (!skillName) return <FileText className="w-5 h-5" />;
    const skill = skillName.toLowerCase();
    if (skill.includes("listening")) return <Headphones className="w-5 h-5" />;
    if (skill.includes("reading")) return <BookOpen className="w-5 h-5" />;
    if (skill.includes("writing")) return <PenTool className="w-5 h-5" />;
    if (skill.includes("speaking")) return <Mic className="w-5 h-5" />;
    return <MessageSquare className="w-5 h-5" />;
  };

  const handleBackClick = () => {
    setShowExitDialog(true);
  };

  const confirmExit = () => {
    setShowExitDialog(false);
    onBack();
  };

  return (
    <>
      <div className="bg-white border-b border-neutral-200 sticky top-0 z-10 mt-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Back button and title */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleBackClick}
                className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back</span>
              </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center text-white">
                {getSkillIcon(skillName)}
              </div>
              <div>
                <h1 className="text-xl font-bold text-neutral-900">{title}</h1>
                {skillName && <p className="text-sm text-neutral-600">{skillName}</p>}
              </div>
            </div>
          </div>

          {/* Right: Timer, Save status and submit button */}
          <div className="flex items-center gap-4">
            {lastSaved && (
              <span className="text-sm text-neutral-400">
                Last saved: {lastSaved.toLocaleTimeString()}
              </span>
            )}
            {timeRemaining != null && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-red-100">
                <Clock className="w-4 h-4 text-red-600" />
                <span className="text-sm font-semibold text-red-600 tracking-wide">
                  {formatTime ? formatTime(timeRemaining) : `${Math.max(0, Math.ceil(timeRemaining / 60))} min`}
                </span>
              </div>
            )}
            {onSave && (
              <Button
                variant="secondary"
                onClick={onSave}
                disabled={isSaving}
                className="flex items-center gap-2"
                iconLeft={<Save className="w-4 h-4" />}
              >
                
                {isSaving ? "Saving..." : "Save Progress"}
              </Button>
            )}
            <Button
              variant="primary"
              onClick={onSubmit}
              disabled={!canSubmit}
              className="flex items-center gap-2"
              iconLeft={<Send className="w-4 h-4" />}
            >
              Submit Assignment
            </Button>
          </div>
        </div>
      </div>
      </div>

      {/* Exit Confirmation Dialog */}
      <Dialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-yellow-600">
              <AlertTriangle className="w-5 h-5" />
              Exit Assignment?
            </DialogTitle>
          </DialogHeader>
          <DialogBody>
            <div className="space-y-3">
              <p className="text-neutral-700">
                Are you sure you want to leave this assignment?
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800 font-medium">
                  ⚠️ Important: This attempt will still be counted even if you leave without submitting.
                </p>
                <p className="text-sm text-yellow-700 mt-2">
                  Your progress has been auto-saved, but you will need to start a new attempt if you want to complete this assignment.
                </p>
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setShowExitDialog(false)}>
              Stay on Assignment
            </Button>
            <Button variant="danger" onClick={confirmExit}>
              Exit Assignment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

import React, { useEffect, useMemo, useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { X, Loader2, User, ListChecks, StickyNote } from "lucide-react";
import { getStudentsInClass } from "@/api/attendance.api";
import type { StudentInClass } from "@/api/attendance.api"; // type-only import
import { submitWeeklyFeedback, type WeeklyFeedbackPayload } from "@/services/teachingClassesService";
import { getTeacherId } from "@/lib/utils";

type Props = {
  classId: string;
  classMeetingId: string;
  weekNumber: number;
  isOpen: boolean;
  onClose: () => void;
};

type PerStudentForm = {
  insights: string[];     // 3-4 dòng
  customNote?: string;
};

const REQUIRED_MIN = 3;
const REQUIRED_MAX = 4;

const WeeklyFeedbackModal: React.FC<Props> = ({ classId,classMeetingId, weekNumber, isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<StudentInClass[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mapForm, setMapForm] = useState<Record<string, PerStudentForm>>({});
  const [submitting, setSubmitting] = useState(false);

  // Load student list when open
 useEffect(() => {
  if (!isOpen) return;

  (async () => {
    setLoading(true);
    try {
      const list = await getStudentsInClass(classId, classMeetingId); 
      console.log(list);

      setStudents(list);

      const init: Record<string, PerStudentForm> = {};
      list.forEach(s => {
        init[s.studentId] = { insights: ["", "", ""] };
      });

      setMapForm(init);
      setSelectedId(list[0]?.studentId ?? null);
    } finally {
      setLoading(false);
    }
  })();
}, [isOpen, classId, classMeetingId]);


  // Derived
  const selected = useMemo(
    () => (selectedId ? students.find(s => s.studentId === selectedId) : undefined),
    [students, selectedId]
  );
  const selectedForm = selectedId ? mapForm[selectedId] : undefined;

  // Helpers
  const setInsight = (index: number, value: string) => {
    if (!selectedId) return;
    setMapForm(prev => {
      const cur = prev[selectedId] ?? { insights: ["", "", ""] };
      const nextInsights = [...cur.insights];
      // ensure 4 slots
      while (nextInsights.length < REQUIRED_MAX) nextInsights.push("");
      nextInsights[index] = value;
      return { ...prev, [selectedId]: { ...cur, insights: nextInsights } };
    });
  };

  const setNote = (value: string) => {
    if (!selectedId) return;
    setMapForm(prev => ({
      ...prev,
      [selectedId]: { ...(prev[selectedId] ?? { insights: ["", "", ""] }), customNote: value }
    }));
  };

  const isValidStudent = (sid: string) => {
    const f = mapForm[sid];
    if (!f) return false;
    const count = (f.insights || []).filter(x => x.trim() !== "").length;
    return count >= REQUIRED_MIN; // max 4 đã giới hạn ở UI
  };

  const allValid = students.length > 0 && students.every(s => isValidStudent(s.studentId));

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const teacherId = getTeacherId()!; // đã đăng nhập
      const payload: WeeklyFeedbackPayload = {
        classId,
        teacherId,
        weekNumber,
        studentFeedback: students.map(s => {
          const f = mapForm[s.studentId];
          return {
            studentId: s.studentId,
            insights: (f?.insights || [])
              .map(x => x.trim())
              .filter(Boolean)
              .slice(0, REQUIRED_MAX),
            customNote: f?.customNote?.trim() || undefined
          };
        })
      };
      await submitWeeklyFeedback(payload);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center">
      <div className="w-full max-w-5xl bg-white rounded-xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Weekly Feedback</h3>
            <p className="text-sm text-neutral-600">ISO Week: <b>{weekNumber}</b></p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-neutral-100">
            <X className="w-5 h-5 text-neutral-600" />
          </button>
        </div>

        {/* Body */}
        <div className="p-0 flex min-h-[60vh]">
          {/* Left: student list */}
          <div className="w-64 border-r p-4 overflow-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
              </div>
            ) : (
              students.map((s, idx) => {
                const ok = isValidStudent(s.studentId);
                const active = selectedId === s.studentId;
                return (
                  <button
                    key={s.studentId}
                    onClick={() => setSelectedId(s.studentId)}
                    className={`w-full text-left px-3 py-2 rounded-lg mb-2 border ${
                      active ? "bg-primary-50 border-primary-300" : "bg-white border-neutral-200"
                    } hover:bg-neutral-50`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-md bg-primary-100 flex items-center justify-center">
                        <User className="w-4 h-4 text-primary-600" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{s.studentName}</div>
                        <div className="text-xs text-neutral-500">#{idx + 1}</div>
                      </div>
                      {ok ? (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-green-100 text-green-700">
                          Ready
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-yellow-100 text-yellow-700">
                          3 insights
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Right: per-student form */}
          <div className="flex-1 p-6 overflow-auto">
            {!selected ? (
              <div className="text-center text-neutral-500">Select a student to write feedback.</div>
            ) : (
              <Card className="p-5 border border-accent-100">
                <div className="mb-4">
                  <div className="text-sm text-neutral-500">Student</div>
                  <div className="text-lg font-semibold">{selected.studentName}</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[0, 1, 2, 3].map(i => (
                    <div key={i} className="flex gap-2">
                      <ListChecks className="w-4 h-4 text-accent-600 mt-2" />
                      <textarea
                        rows={2}
                        placeholder={`Insight ${i + 1}`}
                        value={selectedForm?.insights?.[i] ?? ""}
                        onChange={e => setInsight(i, e.target.value)}
                        className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary-300"
                      />
                    </div>
                  ))}

                  <div className="md:col-span-2 flex gap-2">
                    <StickyNote className="w-4 h-4 text-accent-600 mt-2" />
                    <textarea
                      rows={2}
                      placeholder="Custom note (optional)"
                      value={selectedForm?.customNote ?? ""}
                      onChange={e => setNote(e.target.value)}
                      className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary-300"
                    />
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex justify-between items-center">
          <span className="text-xs text-neutral-500">
            * Each student requires at least <b>3 insights</b> (max 4).
          </span>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button variant="primary" disabled={!allValid || submitting} onClick={handleSubmit}>
              {submitting ? "Submitting..." : "Submit weekly feedback"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyFeedbackModal;

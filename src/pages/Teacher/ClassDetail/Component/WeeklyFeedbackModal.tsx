// src/pages/Teacher/ClassDetail/Component/WeeklyFeedbackModal.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { X, Loader2, User, Sparkles, Lightbulb } from "lucide-react";
import { getStudentsInClass, type StudentInClass } from "@/api/attendance.api";
import { upsertOneWeeklyFeedback } from "@/api/weeklyFeedback.api";
import type { UpsertWeeklyFeedbackRequest } from "@/services/teachingClassesService";
import { getTeacherId } from "@/lib/utils";

/** Suggestion rút gọn */
const SUGGESTIONS = {
  Participation: [
    { label: "Active discussion", full: "Actively engaged in class discussions and asked relevant questions." },
    { label: "Needs more participation", full: "Needs to participate more frequently and share ideas with peers." },
    { label: "Good teamwork", full: "Shows strong collaboration skills during group activities." },
  ],
  AssignmentQuality: [
    { label: "On-time & accurate", full: "Submits assignments on time with good accuracy and attention to detail." },
    { label: "Late submission", full: "Occasionally submits assignments late; please improve time management." },
    { label: "Improve structure", full: "Assignment structure needs clearer organization and stronger arguments." },
  ],
  SkillProgress: [
    { label: "Speaking ↑", full: "Speaking skill has improved; communicates more confidently in class." },
    { label: "Listening ↑", full: "Listening comprehension has improved; follows instructions well." },
    { label: "Grammar/Vocab ↑", full: "Better grammar control and vocabulary usage in recent tasks." },
  ],
  NextStep: [
    { label: "Practice speaking", full: "Practice speaking daily for 10–15 minutes to boost fluency." },
    { label: "Revise grammar", full: "Revise basic grammar tenses and complete extra exercises." },
    { label: "Expand vocabulary", full: "Learn 10–15 new words per week with context sentences." },
  ],
} as const;

type Props = {
  classId: string;
  classMeetingId: string; // buổi cuối tuần (nếu có)
  weekNumber: number;     // dùng weekNumber
  isOpen: boolean;
  onClose: () => void;
};

type FieldKey =
  | "participation"
  | "assignmentQuality"
  | "skillProgress"
  | "nextStep"
  | "customNote";

type PerStudentForm = {
  participation: string;
  assignmentQuality: string;
  skillProgress: string;
  nextStep?: string | null;
  customNote?: string | null;
  // local state
  status?: "draft" | "submitted" | "idle";
};

const WeeklyFeedbackModal: React.FC<Props> = ({
  classId,
  classMeetingId,
  weekNumber,
  isOpen,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<StudentInClass[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mapForm, setMapForm] = useState<Record<string, PerStudentForm>>({});
  const [busy, setBusy] = useState(false);

  const [openSuggestOf, setOpenSuggestOf] = useState<{ sid: string; field: FieldKey } | null>(
    null
  );
  const portalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      setLoading(true);
      try {
        const list = await getStudentsInClass(classId, classMeetingId);
        setStudents(list);
        const init: Record<string, PerStudentForm> = {};
        list.forEach((s) => {
          init[s.studentId] = {
            participation: "",
            assignmentQuality: "",
            skillProgress: "",
            nextStep: "",
            customNote: "",
            status: "idle",
          };
        });
        setMapForm(init);
        setSelectedId(list[0]?.studentId ?? null);
      } finally {
        setLoading(false);
      }
    })();
  }, [isOpen, classId, classMeetingId]);

  const selected = useMemo(
    () => (selectedId ? students.find((s) => s.studentId === selectedId) : undefined),
    [students, selectedId]
  );

  const setValue = (sid: string, key: FieldKey, val: string) => {
    setMapForm((prev) => ({
      ...prev,
      [sid]: { ...(prev[sid] ?? {}), [key]: val },
    }));
  };

  const isValid = (sid: string) => {
    const f = mapForm[sid];
    if (!f) return false;
    return (
      (f.participation || "").trim().length > 0 &&
      (f.assignmentQuality || "").trim().length > 0 &&
      (f.skillProgress || "").trim().length > 0
    );
  };

  const doSaveOrSubmit = async (sid: string, submit: boolean) => {
    const f = mapForm[sid];
    if (!f) return;
    if (submit && !isValid(sid)) return;

    setBusy(true);
    try {
      await upsertOneWeeklyFeedback({
        classId,
        classMeetingId,
        teacherId: getTeacherId()!,
        weekNumber,
        submit,
        item: {
          studentId: sid,
          participation: (f.participation || "").trim(),
          assignmentQuality: (f.assignmentQuality || "").trim(),
          skillProgress: (f.skillProgress || "").trim(),
          nextStep: (f.nextStep || "") || null,
          customNote: (f.customNote || "") || null,
        },
      });

      setMapForm((prev) => ({
        ...prev,
        [sid]: {
          ...prev[sid],
          status: submit ? "submitted" : "draft",
        },
      }));
    } finally {
      setBusy(false);
    }
  };

  const SuggestionDropdown: React.FC<{
    sid: string;
    field: FieldKey;
    onClose: () => void;
  }> = ({ sid, field, onClose }) => {
    const bucket =
      field === "participation"
        ? SUGGESTIONS.Participation
        : field === "assignmentQuality"
        ? SUGGESTIONS.AssignmentQuality
        : field === "skillProgress"
        ? SUGGESTIONS.SkillProgress
        : SUGGESTIONS.NextStep;

    return (
      <div
        className="absolute z-[10000] mt-1 w-[320px] max-h-[260px] overflow-auto rounded-lg border border-neutral-200 bg-white shadow-xl"
        role="listbox"
      >
        {bucket.map((sug, idx) => (
          <button
            key={idx}
            className="group w-full text-left px-3 py-2 hover:bg-primary-50 focus:bg-primary-50"
            onMouseEnter={() => setValue(sid, field, sug.full)}
            onClick={() => {
              setValue(sid, field, sug.full);
              onClose();
            }}
          >
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-accent-600" />
              <span className="text-sm font-medium text-neutral-800 truncate">
                {sug.label}
              </span>
            </div>
            <div className="text-xs text-neutral-500 line-clamp-2">{sug.full}</div>
          </button>
        ))}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99] bg-black/40 flex items-center justify-center">
      <div className="w-full max-w-6xl bg-white rounded-xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Weekly Feedback</h3>
            <p className="text-sm text-neutral-600">
              ISO Week: <b>{weekNumber}</b>
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-neutral-100">
            <X className="w-5 h-5 text-neutral-600" />
          </button>
        </div>

        {/* Body */}
        <div className="p-0 flex min-h-[70vh]">
          {/* Left: student list */}
          <div className="w-72 border-r p-4 overflow-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
              </div>
            ) : (
              students.map((s, idx) => {
                const active = selectedId === s.studentId;
                const ok = isValid(s.studentId);
                const st = mapForm[s.studentId]?.status ?? "idle";
                return (
                  <button
                    key={s.studentId}
                    onClick={() => setSelectedId(s.studentId)}
                    className={`w-full text-left px-3 py-2 rounded-lg mb-2 border ${
                      active ? "bg-primary-50 border-primary-300" : "bg-white border-neutral-200"
                    } hover:bg-neutral-50`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-md bg-primary-100 flex items-center justify-center">
                        <User className="w-4 h-4 text-primary-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{s.studentName}</div>
                        <div className="text-[11px] text-neutral-500">#{idx + 1}</div>
                      </div>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          st === "submitted"
                            ? "bg-green-100 text-green-700"
                            : ok
                            ? "bg-blue-100 text-blue-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {st === "submitted" ? "Submitted" : ok ? "Ready" : "Need 3"}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Right: form */}
          <div className="flex-1 p-6 overflow-auto relative">
            {!selected ? (
              <div className="text-center text-neutral-500">
                Select a student to write feedback.
              </div>
            ) : (
              <Card className="p-5 border border-accent-100">
                <div className="mb-4">
                  <div className="text-sm text-neutral-500">Student</div>
                  <div className="text-lg font-semibold">{selected.studentName}</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FieldWithSuggest
                    title="Participation"
                    sid={selected.studentId}
                    field="participation"
                    value={mapForm[selected.studentId]?.participation ?? ""}
                    placeholder="Write a concrete note about participation…"
                    onChange={(v) => setValue(selected.studentId!, "participation", v)}
                    openSuggestOf={openSuggestOf}
                    setOpenSuggestOf={setOpenSuggestOf}
                    SuggestionDropdown={SuggestionDropdown}
                  />

                  <FieldWithSuggest
                    title="Assignment / Homework Quality"
                    sid={selected.studentId}
                    field="assignmentQuality"
                    value={mapForm[selected.studentId]?.assignmentQuality ?? ""}
                    placeholder="Clarity, accuracy, timeliness…"
                    onChange={(v) => setValue(selected.studentId!, "assignmentQuality", v)}
                    openSuggestOf={openSuggestOf}
                    setOpenSuggestOf={setOpenSuggestOf}
                    SuggestionDropdown={SuggestionDropdown}
                  />

                  <FieldWithSuggest
                    title="Skill Focus Progress"
                    sid={selected.studentId}
                    field="skillProgress"
                    value={mapForm[selected.studentId]?.skillProgress ?? ""}
                    placeholder="Listening/Speaking/Grammar/Vocabulary…"
                    onChange={(v) => setValue(selected.studentId!, "skillProgress", v)}
                    openSuggestOf={openSuggestOf}
                    setOpenSuggestOf={setOpenSuggestOf}
                    SuggestionDropdown={SuggestionDropdown}
                  />

                  <FieldWithSuggest
                    title="Actionable Next Step (optional)"
                    sid={selected.studentId}
                    field="nextStep"
                    value={mapForm[selected.studentId]?.nextStep ?? ""}
                    placeholder="Recommendation for the next week…"
                    onChange={(v) => setValue(selected.studentId!, "nextStep", v)}
                    openSuggestOf={openSuggestOf}
                    setOpenSuggestOf={setOpenSuggestOf}
                    SuggestionDropdown={SuggestionDropdown}
                  />

                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-primary-800 block mb-1">
                      Custom note (optional)
                    </label>
                    <textarea
                      rows={3}
                      value={mapForm[selected.studentId]?.customNote ?? ""}
                      onChange={(e) =>
                        setValue(selected.studentId!, "customNote", e.target.value)
                      }
                      className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary-300"
                      placeholder="Private note only visible to teachers…"
                    />
                  </div>
                </div>

                {/* Actions for this student */}
                <div className="mt-4 flex gap-2 justify-end">
                  <Button
                    variant="secondary"
                    disabled={busy}
                    onClick={() => doSaveOrSubmit(selected.studentId, false)}
                  >
                    {busy ? "Saving…" : "Save draft"}
                  </Button>
                  <Button
                    variant="primary"
                    disabled={!isValid(selected.studentId) || busy}
                    onClick={() => doSaveOrSubmit(selected.studentId, true)}
                  >
                    {busy ? "Submitting…" : "Submit"}
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex justify-between items-center">
          <span className="text-xs text-neutral-500">
            * Required: Participation, Assignment Quality, Skill Progress. “Next Step” is optional.
          </span>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>

      {/* Portal container */}
      <div ref={portalRef} />
    </div>
  );
};

export default WeeklyFeedbackModal;

/* ============ Subcomponent ============ */
type FieldWithSuggestProps = {
  title: string;
  sid: string;
  field: FieldKey;
  value: string;
  placeholder?: string;
  onChange: (v: string) => void;
  openSuggestOf: { sid: string; field: FieldKey } | null;
  setOpenSuggestOf: (s: { sid: string; field: FieldKey } | null) => void;
  SuggestionDropdown: React.FC<{ sid: string; field: FieldKey; onClose: () => void }>;
};

const FieldWithSuggest: React.FC<FieldWithSuggestProps> = ({
  title,
  sid,
  field,
  value,
  placeholder,
  onChange,
  openSuggestOf,
  setOpenSuggestOf,
  SuggestionDropdown,
}) => {
  const isOpen = openSuggestOf?.sid === sid && openSuggestOf?.field === field;

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-1">
        <label className="text-sm font-medium text-primary-800">{title}</label>
        <button
          type="button"
          className="inline-flex items-center gap-1 text-xs px-2 py-1 border rounded-md hover:bg-neutral-50"
          onClick={() => setOpenSuggestOf(isOpen ? null : { sid, field })}
        >
          <Sparkles className="w-3.5 h-3.5 text-accent-600" />
          Suggestions
        </button>
      </div>
      <textarea
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary-300"
      />
      {isOpen && (
        <div className="absolute left-0 top-full z-[10001]">
          <SuggestionDropdown sid={sid} field={field} onClose={() => setOpenSuggestOf(null)} />
        </div>
      )}
    </div>
  );
};

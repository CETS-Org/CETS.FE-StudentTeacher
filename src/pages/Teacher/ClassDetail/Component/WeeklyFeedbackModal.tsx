// src/pages/Teacher/ClassDetail/Component/WeeklyFeedbackModal.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import Card from "@/components/ui/card";
import Button from "@/components/ui/Button";
import { X, Loader2, User, Sparkles, Lightbulb } from "lucide-react";
import { getStudentsInClass, type StudentInClass } from "@/api/attendance.api";
import {
  upsertOneWeeklyFeedback,
  getWeeklyFeedbackByClassWeek,
} from "@/api/weeklyFeedback.api";
import type { WeeklyFeedbackView } from "@/services/teachingClassesService";
import { getTeacherId } from "@/lib/utils";

/** Suggestion rút gọn */
const SUGGESTIONS = {
  Participation: [
    {
      label: "Active discussion",
      full: "Actively engaged in class discussions and asked relevant questions.",
    },
    {
      label: "Needs more participation",
      full: "Needs to participate more frequently and share ideas with peers.",
    },
    {
      label: "Good teamwork",
      full: "Shows strong collaboration skills during group activities.",
    },
  ],
  AssignmentQuality: [
    {
      label: "On-time & accurate",
      full: "Submits assignments on time with good accuracy and attention to detail.",
    },
    {
      label: "Late submission",
      full: "Occasionally submits assignments late; please improve time management.",
    },
    {
      label: "Improve structure",
      full: "Assignment structure needs clearer organization and stronger arguments.",
    },
  ],
  SkillProgress: [
    {
      label: "Speaking ↑",
      full: "Speaking skill has improved; communicates more confidently in class.",
    },
    {
      label: "Listening ↑",
      full: "Listening comprehension has improved; follows instructions well.",
    },
    {
      label: "Grammar/Vocab ↑",
      full: "Better grammar control and vocabulary usage in recent tasks.",
    },
  ],
  NextStep: [
    {
      label: "Practice speaking",
      full: "Practice speaking daily for 10–15 minutes to boost fluency.",
    },
    {
      label: "Revise grammar",
      full: "Revise basic grammar tenses and complete extra exercises.",
    },
    {
      label: "Expand vocabulary",
      full: "Learn 10–15 new words per week with context sentences.",
    },
  ],
} as const;

type Props = {
  classId: string;
  classMeetingId: string; // buổi cuối tuần
  weekNumber: number; // tuần học
  isOpen: boolean;
  onClose: () => void;
  /** Nếu false => tuần đang bị khóa (chưa tới hoặc đã qua), chỉ được xem, không được edit */
  canEditWeek?: boolean;
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
  status?: "draft" | "submitted" | "idle";
};

const WeeklyFeedbackModal: React.FC<Props> = ({
  classId,
  classMeetingId,
  weekNumber,
  isOpen,
  onClose,
  canEditWeek = true,
}) => {
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<StudentInClass[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mapForm, setMapForm] = useState<Record<string, PerStudentForm>>({});
  const [busy, setBusy] = useState(false);

  // map học viên đã submit (Status = 2) -> chỉ view
  const [readOnlyMap, setReadOnlyMap] = useState<Record<string, boolean>>({});

  const [openSuggestOf, setOpenSuggestOf] =
    useState<{ sid: string; field: FieldKey } | null>(null);
  const portalRef = useRef<HTMLDivElement>(null);

  // Tuần bị khóa (chưa tới hoặc đã qua)
  const weekLocked = !canEditWeek;

  useEffect(() => {
    if (!isOpen) return;

    (async () => {
      setLoading(true);
      try {
        // 1) Load danh sách học viên + feedback
        const [list, fbRes] = await Promise.all([
          getStudentsInClass(classId, classMeetingId),
          getWeeklyFeedbackByClassWeek(classId, weekNumber),
        ]);

        setStudents(list);

        // Hỗ trợ cả 2 kiểu: API trả thẳng array hoặc AxiosResponse
        let feedbackList: WeeklyFeedbackView[] = [];
        if (Array.isArray(fbRes)) {
          feedbackList = fbRes;
        } else if (fbRes && Array.isArray((fbRes as any).data)) {
          feedbackList = (fbRes as any).data as WeeklyFeedbackView[];
        }

        // 2) Init form per student
        const initForm: Record<string, PerStudentForm> = {};
        const readOnlyFlags: Record<string, boolean> = {};

        list.forEach((s) => {
          // API đã filter theo classId + weekNumber rồi, nên chỉ cần match studentId
          const fb = feedbackList.find((f) => f.studentId === s.studentId);

          if (fb) {
            const isSubmitted = fb.status === 2;
            initForm[s.studentId] = {
              participation: fb.participation ?? "",
              assignmentQuality: fb.assignmentQuality ?? "",
              skillProgress: fb.skillProgress ?? "",
              nextStep: fb.nextStep ?? "",
              customNote: fb.customNote ?? "",
              status: isSubmitted ? "submitted" : "draft",
            };

            if (isSubmitted) {
              readOnlyFlags[s.studentId] = true;
            }
          } else {
            initForm[s.studentId] = {
              participation: "",
              assignmentQuality: "",
              skillProgress: "",
              nextStep: "",
              customNote: "",
              status: "idle",
            };
          }
        });

        setMapForm(initForm);
        setReadOnlyMap(readOnlyFlags);
        setSelectedId(list[0]?.studentId ?? null);
      } finally {
        setLoading(false);
      }
    })();
  }, [isOpen, classId, classMeetingId, weekNumber]);

  const selected = useMemo(
    () =>
      selectedId
        ? students.find((s) => s.studentId === selectedId)
        : undefined,
    [students, selectedId]
  );

  const setValue = (sid: string, key: FieldKey, val: string) => {
    setMapForm((prev) => ({
      ...prev,
      [sid]: { ...(prev[sid] ?? {}), [key]: val },
    }));
  };

  const isValid = (sid: string) => {
    if (weekLocked || readOnlyMap[sid]) return true; // tuần lock hoặc đã submitted -> khỏi check

    const f = mapForm[sid];
    if (!f) return false;
    return (
      (f.participation || "").trim().length > 0 &&
      (f.assignmentQuality || "").trim().length > 0 &&
      (f.skillProgress || "").trim().length > 0
    );
  };

  const doSaveOrSubmit = async (sid: string, submit: boolean) => {
    if (weekLocked || readOnlyMap[sid]) return; // tuần bị khóa hoặc đã submitted -> không gửi

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

      if (submit) {
        setReadOnlyMap((prev) => ({
          ...prev,
          [sid]: true,
        }));
      }
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
        className="w-[280px] sm:w-[320px] max-h-[260px] overflow-auto rounded-lg border border-neutral-200 bg-white shadow-xl"
        role="listbox"
        onClick={(e) => e.stopPropagation()}
      >
        {bucket.map((sug, idx) => (
          <button
            key={idx}
            type="button"
            className="group w-full text-left px-3 py-2 hover:bg-primary-50 focus:bg-primary-50"
            onMouseEnter={() => setValue(sid, field, sug.full)}
            onClick={(e) => {
              e.stopPropagation();
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
            <div className="text-xs text-neutral-500 line-clamp-2">
              {sug.full}
            </div>
          </button>
        ))}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99] bg-black/40 flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-7xl h-[100vh] sm:h-[95vh] bg-white rounded-xl shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b flex items-center justify-between flex-shrink-0">
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-semibold">Weekly Feedback</h3>
            <p className="text-xs sm:text-sm text-neutral-600">
              Week: <b>{weekNumber}</b>
            </p>
            {weekLocked && (
              <p className="mt-1 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 sm:px-3 py-1 inline-block">
                Feedback for this week is currently locked. You can only view
                existing entries.
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-neutral-100 flex-shrink-0 ml-2"
          >
            <X className="w-5 h-5 text-neutral-600" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 flex flex-col sm:flex-row overflow-hidden min-h-0">
          {/* Left: student list */}
          <div className="w-full sm:w-64 lg:w-72 border-b sm:border-b-0 sm:border-r p-3 sm:p-4 overflow-y-auto flex-shrink-0 sm:flex-shrink">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
              </div>
            ) : (
              <div className="space-y-2">
                {students.map((s, idx) => {
                  const active = selectedId === s.studentId;
                  const ok = isValid(s.studentId);
                  const st = mapForm[s.studentId]?.status ?? "idle";
                  const isReadOnlyStudent = !!readOnlyMap[s.studentId];
                  const isReadOnly = weekLocked || isReadOnlyStudent;

                  return (
                    <button
                      key={s.studentId}
                      onClick={() => setSelectedId(s.studentId)}
                      className={`w-full text-left px-2 sm:px-3 py-2 rounded-lg border transition-colors ${
                        active
                          ? "bg-secondary-100 border-primary-300 shadow-sm"
                          : "bg-white border-neutral-200 hover:bg-neutral-50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-md bg-accent-50 flex items-center justify-center flex-shrink-0">
                          <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs sm:text-sm font-medium truncate">
                            {s.studentName}
                          </div>
                          <div className="text-[10px] sm:text-[11px] text-neutral-500">
                            #{idx + 1}
                          </div>
                        </div>
                        <span
                          className={`text-[9px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded flex-shrink-0 ${
                            isReadOnly
                              ? "bg-green-100 text-green-700"
                              : st === "submitted"
                              ? "bg-green-100 text-green-700"
                              : ok
                              ? "bg-blue-100 text-blue-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {isReadOnly
                            ? "Locked"
                            : st === "submitted"
                            ? "Submitted"
                            : ok
                            ? "Ready"
                            : "Need 3"}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: form */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto relative min-w-0">
            {!selected ? (
              <div className="text-center text-neutral-500 py-4">
                Select a student to view feedback.
              </div>
            ) : (
              <Card className="p-2 sm:p-2 border border-accent-100">
                <div className="mb-4">
                  <div className="text-xs sm:text-sm text-neutral-500">Student</div>
                  <div className="text-base sm:text-lg font-semibold mt-1">
                    {selected.studentName}
                  </div>
                  {readOnlyMap[selected.studentId] && (
                    <p className="mt-2 text-xs text-green-700 bg-green-50 border border-green-200 rounded px-2 sm:px-3 py-1.5 inline-block">
                      Feedback already submitted for this student. You can only
                      view it.
                    </p>
                  )}
                  {weekLocked && (
                    <p className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 sm:px-3 py-1.5 inline-block">
                      Feedback for this week is locked by schedule. Editing is
                      disabled.
                    </p>
                  )}
                </div>

                {(() => {
                  const isReadOnlyStudent = !!readOnlyMap[selected.studentId];
                  const isReadOnly = weekLocked || isReadOnlyStudent;

                  return (
                    <>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                        <FieldWithSuggest
                          title="Participation"
                          sid={selected.studentId}
                          field="participation"
                          value={
                            mapForm[selected.studentId]?.participation ?? ""
                          }
                          placeholder="Write a concrete note about participation…"
                          onChange={(v) =>
                            setValue(selected.studentId!, "participation", v)
                          }
                          openSuggestOf={openSuggestOf}
                          setOpenSuggestOf={setOpenSuggestOf}
                          SuggestionDropdown={SuggestionDropdown}
                          readOnly={isReadOnly}
                        />

                        <FieldWithSuggest
                          title="Assignment / Homework Quality"
                          sid={selected.studentId}
                          field="assignmentQuality"
                          value={
                            mapForm[selected.studentId]?.assignmentQuality ??
                            ""
                          }
                          placeholder="Clarity, accuracy, timeliness…"
                          onChange={(v) =>
                            setValue(
                              selected.studentId!,
                              "assignmentQuality",
                              v
                            )
                          }
                          openSuggestOf={openSuggestOf}
                          setOpenSuggestOf={setOpenSuggestOf}
                          SuggestionDropdown={SuggestionDropdown}
                          readOnly={isReadOnly}
                        />

                        <FieldWithSuggest
                          title="Skill Focus Progress"
                          sid={selected.studentId}
                          field="skillProgress"
                          value={
                            mapForm[selected.studentId]?.skillProgress ?? ""
                          }
                          placeholder="Listening/Speaking/Grammar/Vocabulary…"
                          onChange={(v) =>
                            setValue(selected.studentId!, "skillProgress", v)
                          }
                          openSuggestOf={openSuggestOf}
                          setOpenSuggestOf={setOpenSuggestOf}
                          SuggestionDropdown={SuggestionDropdown}
                          readOnly={isReadOnly}
                        />

                        <FieldWithSuggest
                          title="Actionable Next Step (optional)"
                          sid={selected.studentId}
                          field="nextStep"
                          value={mapForm[selected.studentId]?.nextStep ?? ""}
                          placeholder="Recommendation for the next week…"
                          onChange={(v) =>
                            setValue(selected.studentId!, "nextStep", v)
                          }
                          openSuggestOf={openSuggestOf}
                          setOpenSuggestOf={setOpenSuggestOf}
                          SuggestionDropdown={SuggestionDropdown}
                          readOnly={isReadOnly}
                        />

                        <div className="lg:col-span-2">
                          <label className="text-xs sm:text-sm font-medium text-primary-800 block mb-1">
                            Custom note (optional)
                          </label>
                          <textarea
                            rows={3}
                            value={
                              mapForm[selected.studentId]?.customNote ?? ""
                            }
                            onChange={(e) =>
                              setValue(
                                selected.studentId!,
                                "customNote",
                                e.target.value
                              )
                            }
                            className="w-full border border-neutral-300 rounded-md px-3 py-2 text-xs sm:text-sm  disabled:bg-neutral-50 disabled:text-neutral-500"
                            placeholder="Private note only visible to teachers…"
                            disabled={isReadOnly}
                          />
                        </div>
                      </div>

                      {!isReadOnly && (
                        <div className="mt-4 flex flex-col sm:flex-row gap-2 sm:justify-end">
                          <Button
                            variant="secondary"
                            disabled={busy}
                            onClick={() =>
                              doSaveOrSubmit(selected.studentId, false)
                            }
                            className="w-full sm:w-auto"
                          >
                            {busy ? "Saving…" : "Save draft"}
                          </Button>
                          <Button
                            variant="primary"
                            disabled={!isValid(selected.studentId) || busy}
                            onClick={() =>
                              doSaveOrSubmit(selected.studentId, true)
                            }
                            className="w-full sm:w-auto"
                          >
                            {busy ? "Submitting…" : "Submit"}
                          </Button>
                        </div>
                      )}
                    </>
                  );
                })()}
              </Card>
            )}
          </div>
        </div>

      </div>

      {/* Portal container (nếu sau này dùng Portal) */}
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
  SuggestionDropdown: React.FC<{
    sid: string;
    field: FieldKey;
    onClose: () => void;
  }>;
  readOnly?: boolean;
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
  readOnly,
}) => {
  const isOpen = openSuggestOf?.sid === sid && openSuggestOf?.field === field;

  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const dropdownWidth = 320;
      const dropdownHeight = 260;
      
      // Calculate position
      let left = rect.left;
      let top = rect.bottom + 4;
      
      // Adjust if dropdown would overflow right edge
      if (left + dropdownWidth > viewportWidth) {
        left = viewportWidth - dropdownWidth - 8;
      }
      
      // Adjust if dropdown would overflow bottom edge
      if (top + dropdownHeight > viewportHeight) {
        top = rect.top - dropdownHeight - 4;
      }
      
      // Ensure it doesn't go off the left edge
      if (left < 8) {
        left = 8;
      }
      
      // Ensure it doesn't go off the top edge
      if (top < 8) {
        top = rect.bottom + 4;
      }
      
      setDropdownPosition({
        top,
        left,
      });
    } else {
      setDropdownPosition(null);
    }
  }, [isOpen]);

  return (
    <div className="relative">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0 mb-1">
        <label className="text-xs sm:text-sm font-medium text-primary-800">
          {title}
        </label>
        <button
          ref={buttonRef}
          type="button"
          className={`inline-flex items-center gap-1 text-[10px] sm:text-xs px-2 py-1 border rounded-md hover:bg-neutral-50 self-start sm:self-auto ${
            readOnly ? "opacity-50 cursor-default pointer-events-none" : ""
          }`}
          onClick={() =>
            !readOnly && setOpenSuggestOf(isOpen ? null : { sid, field })
          }
          disabled={readOnly}
        >
          <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-accent-600" />
          Suggestions
        </button>
      </div>
      <textarea
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-neutral-300 rounded-md px-3 py-2 text-xs sm:text-sm  disabled:bg-neutral-50 disabled:text-neutral-500 resize-y"
        disabled={readOnly}
      />
      {isOpen && !readOnly && dropdownPosition && (
        <>
          {/* Backdrop to close on outside click */}
          <div
            className="fixed inset-0 z-[10000]"
            onClick={() => setOpenSuggestOf(null)}
          />
          <div 
            className="fixed z-[10001]"
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <SuggestionDropdown
              sid={sid}
              field={field}
              onClose={() => setOpenSuggestOf(null)}
            />
          </div>
        </>
      )}
    </div>
  );
};

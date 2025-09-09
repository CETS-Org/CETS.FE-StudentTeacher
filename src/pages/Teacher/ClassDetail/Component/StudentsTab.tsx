// src/pages/teacher/classes/[classId]/StudentsTab.tsx
import React, { useState, useMemo } from "react";
import Button from "@/components/ui/Button";
import { Search, MessageSquare } from "lucide-react";

const mockStudents = Array.from({ length: 23 }, (_, i) => ({
  id: i + 1,
  avatar: `/api/placeholder/40/40?text=S${i + 1}`,
  name: `Student Name ${i + 1}`,
  email: `student${i + 1}@email.com`,
}));

export default function StudentsTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isTaking, setIsTaking] = useState(false);
  const [absent, setAbsent] = useState<Record<number, boolean>>({});

  // Lọc sinh viên theo search
  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return mockStudents;
    const q = searchQuery.toLowerCase();
    return mockStudents.filter(
      (s) => s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const toggleAbsent = (id: number, checked: boolean) => {
    setAbsent((prev) => ({ ...prev, [id]: checked }));
  };

  const startTaking = () => setIsTaking(true);
  const cancelTaking = () => {
    setIsTaking(false);
    setAbsent({});
  };

  const saveAttendance = () => {
    const absentList = Object.keys(absent).filter((id) => absent[+id]);
    alert(`Absent students: ${absentList.join(", ") || "None"}`);
    setIsTaking(false);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Class : SE17D05</h2>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search students..."
              className="border rounded-md pl-9 pr-3 py-2 text-sm w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {!isTaking && (
            <Button variant="primary" onClick={startTaking}>
              Take Attendance
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden ">
        <div
          className="max-h-[520px] overflow-y-auto scrollbar-hide"
          style={{ scrollbarGutter: "stable" }}
        >
        <table className="min-w-full table-fixed">
        <colgroup>
          <col className="w-20" />     {/* STT rộng hơn */}
          <col className="w-28" />     {/* Avatar */}
          <col className="w-1/3" />    {/* Name */}
          <col className="w-1/3" />    {/* Email */}
          <col className="w-40" />     {/* Actions */}
        </colgroup>

        <thead className="sticky top-0 z-10 bg-sky-200">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider">
              STT
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider">
              Avatar
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider">
              {isTaking ? "Mark Absent" : "Actions"}
            </th>
          </tr>
        </thead>

            <tbody className="divide-y divide-gray-200 bg-white">
              {filtered.map((s, idx) => {
                const isAbsent = !!absent[s.id];
                return (
                  <tr key={s.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {idx + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <img
                        src={s.avatar}
                        alt={s.name}
                        className="w-10 h-10 rounded-full bg-gray-200"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{s.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{s.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {!isTaking ? (
                        <Button
                          variant="secondary"
                          size="sm"
                          iconLeft={<MessageSquare className="w-4 h-4" />}
                        >
                          Message
                        </Button>
                      ) : (
                        <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={isAbsent}
                            onChange={(e) =>
                              toggleAbsent(s.id, e.target.checked)
                            }
                          />
                          <span className="text-gray-700">Absent</span>
                        </label>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {isTaking && (
          <div className="px-4 py-3 border-t flex items-center gap-2">
            <Button variant="primary" onClick={saveAttendance}>
              Save Attendance
            </Button>
            <Button variant="secondary" onClick={cancelTaking}>
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

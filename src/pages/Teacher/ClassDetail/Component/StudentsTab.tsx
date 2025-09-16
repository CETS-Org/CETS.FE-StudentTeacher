// src/pages/teacher/classes/[classId]/StudentsTab.tsx
import { useState, useMemo } from "react";
import Button from "@/components/ui/Button";
import { Search, MessageSquare, Users, UserCheck } from "lucide-react";

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
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-primary-800">Class: SE17D05</h2>
            <p className="text-sm text-neutral-600">{filtered.length} students enrolled</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search students..."
              className="border border-accent-200 rounded-lg pl-9 pr-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {!isTaking && (
            <Button 
              variant="primary" 
              onClick={startTaking}
              iconLeft={<UserCheck className="w-4 h-4" />}
              className="bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 shadow-lg shadow-accent-500/25 hover:shadow-accent-600/30 transition-all duration-200"
            >
              Take Attendance
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="border border-accent-200 rounded-xl overflow-hidden shadow-lg bg-white">
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

        <thead className="sticky top-0 z-10 bg-gradient-to-r from-accent-200 to-accent-300">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
              #
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
              Avatar
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
              {isTaking ? "Mark Absent" : "Actions"}
            </th>
          </tr>
        </thead>

            <tbody className="divide-y divide-accent-100 bg-white">
              {filtered.map((s, idx) => {
                const isAbsent = !!absent[s.id];
                return (
                  <tr key={s.id} className="hover:bg-accent-25/50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-primary-700">
                        {idx + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="relative">
                        <img
                          src={s.avatar}
                          alt={s.name}
                          className="w-10 h-10 rounded-full bg-neutral-200 ring-2 ring-accent-200"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-primary-800">{s.name}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-neutral-600">{s.email}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {!isTaking ? (
                        <Button
                          variant="primary"
                          size="sm"
                          iconLeft={<MessageSquare className="w-4 h-4" />}
                          className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-md hover:shadow-lg transition-all duration-200"
                        >
                          Message
                        </Button>
                      ) : (
                        <label className="inline-flex items-center gap-3 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={isAbsent}
                            onChange={(e) =>
                              toggleAbsent(s.id, e.target.checked)
                            }
                            className="w-4 h-4 text-warning-600 border-2 border-neutral-300 rounded focus:ring-warning-500 focus:ring-2"
                          />
                          <span className="text-sm font-medium text-warning-700">Absent</span>
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
          <div className="px-6 py-4 border-t border-accent-200 bg-gradient-to-r from-accent-25 to-primary-25 flex items-center gap-3">
            <Button 
              variant="primary" 
              onClick={saveAttendance}
              className="bg-gradient-to-r from-success-500 to-success-600 hover:from-success-600 hover:to-success-700 shadow-lg shadow-success-500/25 hover:shadow-success-600/30 transition-all duration-200"
            >
              Save Attendance
            </Button>
            <Button 
              variant="secondary" 
              onClick={cancelTaking}
              className="border-neutral-300 text-neutral-700 hover:bg-neutral-50"
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

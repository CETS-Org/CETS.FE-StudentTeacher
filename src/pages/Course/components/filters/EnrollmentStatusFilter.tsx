import { UserCheck } from 'lucide-react';
import CollapsibleFilter from './CollapsibleFilter';

export type EnrollmentStatus = 'all' | 'enrolled' | 'not-enrolled';

interface EnrollmentStatusFilterProps {
  enrollmentStatus: EnrollmentStatus;
  onEnrollmentStatusChange: (status: EnrollmentStatus) => void;
  isLoggedIn: boolean;
}

export default function EnrollmentStatusFilter({ 
  enrollmentStatus, 
  onEnrollmentStatusChange,
  isLoggedIn
}: EnrollmentStatusFilterProps) {
  const icon = (
    <div className="w-6 h-6 bg-gradient-to-br from-success-500 to-success-600 rounded-lg flex items-center justify-center shadow-sm">
      <UserCheck className="w-3 h-3 text-white" />
    </div>
  );

  // Don't show filter if user is not logged in
  if (!isLoggedIn) {
    return null;
  }

  const options = [
    { value: 'all' as EnrollmentStatus, label: 'All Courses' },
    { value: 'enrolled' as EnrollmentStatus, label: 'Enrolled Courses' },
    { value: 'not-enrolled' as EnrollmentStatus, label: 'Not Enrolled' },
  ];

  const selectedCount = enrollmentStatus === 'all' ? 0 : 1;

  return (
    <CollapsibleFilter
      title="Enrollment Status"
      subtitle="Filter by enrollment"
      icon={icon}
      selectedCount={selectedCount}
    >
      <div className="space-y-2">
        {options.map((option) => (
          <label 
            key={option.value} 
            className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-neutral-50 transition-colors cursor-pointer"
          >
            <input
              type="radio"
              name="enrollmentStatus"
              value={option.value}
              checked={enrollmentStatus === option.value}
              onChange={() => onEnrollmentStatusChange(option.value)}
              className="w-4 h-4 text-success-600 focus:ring-success-500 focus:ring-1"
            />
            <span className="text-neutral-700 flex-1 text-sm">
              {option.label}
            </span>
          </label>
        ))}
      </div>
    </CollapsibleFilter>
  );
}


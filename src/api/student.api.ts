//import type { FilterUserParam } from "@/types/filter.type";
import type { AssignmentSubmited, CourseEnrollment, Student, TotalStudentAttendanceByCourse, UpdateStudent, AddStudent } from "@/types/student.type";
import { api, endpoint } from "./api";


/**
 * Get all students
 */
export const getStudents = async (): Promise<Student[]> => {
  try {
    const url = `${endpoint.account}`;
    
    const response = await api.get<Student[]>(url, {
      params: {   
        RoleName: 'Student',     
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching students:', error);
    if (error instanceof Error && 'response' in error) {
      const axiosError = error as any;
      console.error("Response status:", axiosError.response?.status);
      console.error("Response data:", axiosError.response?.data);
      console.error("Response headers:", axiosError.response?.headers);
    }
    throw error;
  }
};

/**
 * Get a single student by ID
 */
export const getStudentById = async (id: string): Promise<Student> => {
  try {
    const url = `${endpoint.account}/${id}`;
    
    const response = await api.get<Student>(url);
    return response.data;
  } catch (error) {
    console.error(`Error fetching student ${id}:`, error);
    if (error instanceof Error && 'response' in error) {
      const axiosError = error as any;
      console.error("Response status:", axiosError.response?.status);
      console.error("Response data:", axiosError.response?.data);
      console.error("Response headers:", axiosError.response?.headers);
    }
    throw error;
  }
};



export const getListCourseEnrollment = async (studentId: string): Promise<CourseEnrollment[]> => {
  try {
    const response = await api.get<CourseEnrollment[]>(`${endpoint.enrollment}/CoursesByStudent/${studentId}`);
    return response.data as CourseEnrollment[];
  } catch (error) {
    console.error('Error fetching list course enrollment:', error);
    throw error;
  }
}

export const getTotalAssignmentByStudentId = async (studentId: string, courseId: string): Promise<AssignmentSubmited> => {
  try {
    const response = await api.get<AssignmentSubmited>(`/api/ACAD_Submissions/courses/assignments-summary/${courseId}/students/${studentId}`);
    return response.data ;
  } catch (error) {
    console.error('Error fetching assignment by student id:', error);
    throw error;
  }
}
export const getTotalAttendceByStudentId = async (studentId: string, courseId: string): Promise<TotalStudentAttendanceByCourse> => {
  try {
    const response = await api.get<TotalStudentAttendanceByCourse>(`${endpoint.attendance}/courses/${courseId}/students/${studentId}/summary`);
    return response.data ;
  } catch (error) {
    console.error('Error fetching attendance by student id:', error);
    throw error;
  }
}

/**
 * Create a new student
 */
export const createStudent = async (studentData: AddStudent): Promise<Student> => {
  try {
    const response = await api.post<Student>(`${endpoint.account}`, {
      ...studentData,
      roleNames: ['Student']
    });
    return response.data;
  } catch (error) {
    console.error('Error creating student:', error);
    throw error;
  }
};

/**
 * Update a student
 */
export const updateStudent = async (id: string, studentData: UpdateStudent): Promise<UpdateStudent> => {
  try {
    const response = await api.patch<UpdateStudent>(`${endpoint.student}/${id}`, studentData);
    return response.data;
  } catch (error) {
    console.error(`Error updating student ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a student
 */
export const deleteStudent = async (id: string): Promise<void> => {
  try {
    await api.delete(`/api/IDN_Account/${id}`);
  } catch (error) {
    console.error(`Error deleting student ${id}:`, error);
    throw error;
  }
};

/**
 * Update student status
 */
export const updateStudentStatus = async (id: string, status: string): Promise<Student> => {
  try {
    const response = await api.patch<Student>(`/api/IDN_Account/${id}/status`, { status });
    return response.data;
  } catch (error) {
    console.error(`Error updating student status ${id}:`, error);
    throw error;
  }
};

/**
 * Upload student avatar
 */
// export const uploadStudentAvatar = async (id: string, file: File): Promise<Student> => {
//   try {
//     const formData = new FormData();
//     formData.append('avatar', file);
    
//     const response = await api.post<Student>(
//       `/api/IDN_Account/${id}/avatar`, 
//       formData,
//       {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//         },
//       }
//     );
//     return response.data;
//   } catch (error) {
//     console.error(`Error uploading avatar for student ${id}:`, error);
//     throw error;
//   }
// };


export async function uploadAvatar(file : File ): Promise<string> {
  // Gọi API backend để lấy URL upload
  const res = await api.get(`${endpoint.student}/avatar/upload-url`, {
    params: { fileName: file.name, contentType: file.type },
  });

  const { uploadUrl, publicUrl } = res.data;

  // Upload trực tiếp file lên Cloudflare R2 bằng fetch (không dùng axios instance)
  const uploadResponse = await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type,
    },
  });

  if (!uploadResponse.ok) {
    throw new Error(`Failed to upload avatar: ${uploadResponse.status} ${uploadResponse.statusText}`);
  }

  // publicUrl là link public ảnh trên cloudflare
  return publicUrl;
}

/**
 * Search students
 */
export const searchStudents = async (query: string): Promise<Student[]> => {
  try {
    const response = await api.get<Student[]>('/api/IDN_Account/search', {
      params: {
        q: query,
        RoleName: 'Student'
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error searching students with query "${query}":`, error);
    throw error;
  }
};

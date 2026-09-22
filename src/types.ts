/**
 * Data structures and types for "Trợ lý chủ nhiệm lớp 12A9"
 */

export type Gender = 'Nam' | 'Nu';

export type StudentRole =
  | 'Lớp trưởng'
  | 'Lớp phó học tập'
  | 'Lớp phó văn thể mỹ'
  | 'Lớp phó lao động'
  | 'Bí thư Chi đoàn'
  | 'Phó Bí thư'
  | 'Tổ trưởng'
  | 'Tổ phó'
  | 'Cán sự môn'
  | 'Thành viên';

export interface Student {
  id: string;
  studentCode: string;
  fullName: string;
  gender: Gender;
  groupId: string; // 'to-1', 'to-2', 'to-3', 'to-4'
  role: StudentRole;
  phoneParent?: string;
  birthDate?: string;
  address?: string;
  notes?: string;
  avatarSeed?: string;
  customFields?: Record<string, string>;
}

export interface Group {
  id: string;
  name: string; // "Tổ 1", "Tổ 2", ...
  leaderStudentId?: string;
  colorTag: string; // hex or tailwind token
  note?: string;
}

export type AttendanceStatus =
  | 'present'     // Có mặt
  | 'excused'     // Vắng có phép
  | 'unexcused'   // Vắng không phép
  | 'late'        // Đi muộn
  | 'early_leave'; // Về sớm

export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  studentId: string;
  status: AttendanceStatus;
  note?: string;
  period?: number; // Tiết học nếu có
}

export type CriteriaCategory =
  | 'chuyen_can'
  | 'ne_nep'
  | 'hoc_tap'
  | 've_sinh'
  | 'tap_the'
  | 'y_thuc'
  | 'khen_thuong'
  | 'vi_pham'
  | 'khac';

export interface Criteria {
  id: string;
  code: string;
  name: string;
  category: CriteriaCategory;
  pointsDelta: number; // e.g. +5 or -3
  targetScope: 'student' | 'group' | 'both';
  enabled: boolean;
  description?: string;
}

export interface ConductEntry {
  id: string;
  date: string; // YYYY-MM-DD
  targetType: 'student' | 'group';
  targetId: string; // studentId or groupId
  criteriaId?: string;
  criteriaName: string;
  category: CriteriaCategory;
  pointsDelta: number;
  note?: string;
  appliedBy?: string;
}

export type RewardCategory =
  | 'hoc_tap'
  | 'ne_nep'
  | 'trach_nhiem'
  | 'tap_the'
  | 'viec_tot'
  | 'tien_bo'
  | 'khac';

export interface RewardRecord {
  id: string;
  date: string; // YYYY-MM-DD
  studentId: string;
  title: string;
  category: RewardCategory;
  pointsDelta: number;
  description?: string;
  honoredInMeeting?: boolean; // Tuyên dương trong tiết sinh hoạt
}

export type DisciplineSeverity =
  | 'nhac_nho'                // Nhắc nhở tích cực
  | 'vi_pham_nhe'            // Vi phạm lần 1 / nhẹ
  | 'can_phoi_hop_ph'        // Cần trao đổi phụ huynh
  | 'vi_pham_nghiem_trong';  // Vi phạm quy chế trường

export interface DisciplineRecord {
  id: string;
  date: string; // YYYY-MM-DD
  studentId: string;
  title: string;
  severity: DisciplineSeverity;
  pointsDelta: number; // Typically negative, e.g. -2, -5
  actionTaken: string; // Hướng giáo dục: Nhắc nhở, Gặp riêng, Gọi điện phụ huynh...
  notes?: string;
  resolved: boolean;   // Đã tiến bộ / đã khắc phục
}

export interface QuickReminder {
  id: string;
  text: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
}

export interface AssignedTask {
  id: string;
  title: string;
  assignee: string; // Tên học sinh hoặc Tổ
  deadline: string;
  status: 'pending' | 'in_progress' | 'done';
  notes?: string;
}

export interface WeeklyMeeting {
  weekNumber: number;
  date: string; // YYYY-MM-DD
  title: string;
  reviewSummary: string;
  strengths: string;
  weaknesses: string;
  nextWeekPlan: string;
  honoredStudentIds: string[];
  honoredGroupId?: string;
  assignedTasks: AssignedTask[];
}

export interface AppConfig {
  className: string;
  schoolName: string;
  schoolYear: string;
  semester: string;
  homeroomTeacher: string;
  motto: string;
  baselineStudentPoints: number; // e.g. 100
  enableLeaderboard: boolean;
  themeColor: 'indigo' | 'emerald' | 'blue' | 'purple' | 'amber';
  soundEnabled: boolean;
  ambientMusicEnabled: boolean;
  projectorMode: boolean;
}

export type ClassConfig = AppConfig;

export interface AppState {
  config: AppConfig;
  groups: Group[];
  students: Student[];
  criteriaList: Criteria[];
  attendanceRecords: AttendanceRecord[];
  conductEntries: ConductEntry[];
  rewardRecords: RewardRecord[];
  disciplineRecords: DisciplineRecord[];
  quickReminders: QuickReminder[];
  weeklyMeeting: WeeklyMeeting;
}

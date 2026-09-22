import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Download, 
  FileText, 
  Phone, 
  ShieldAlert, 
  Check, 
  X,
  UserCheck
} from 'lucide-react';
import { AppState, Student, StudentRole, Gender } from '../types';
import { exportStudentsToCsv, calculateStudentPoints } from '../utils/storage';
import { soundEngine } from '../utils/audio';

interface StudentsViewProps {
  state: AppState;
  onUpdateState: (updater: (prev: AppState) => AppState) => void;
}

const ROLES: StudentRole[] = [
  'Lớp trưởng',
  'Lớp phó học tập',
  'Lớp phó văn thể mỹ',
  'Lớp phó lao động',
  'Bí thư Chi đoàn',
  'Phó Bí thư',
  'Tổ trưởng',
  'Tổ phó',
  'Cán sự môn',
  'Thành viên',
];

export const StudentsView: React.FC<StudentsViewProps> = ({ state, onUpdateState }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGroup, setFilterGroup] = useState<string>('all');
  const [filterRole, setFilterRole] = useState<string>('all');

  // Add / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Form Fields
  const [formFullName, setFormFullName] = useState('');
  const [formStudentCode, setFormStudentCode] = useState('');
  const [formGender, setFormGender] = useState<Gender>('Nam');
  const [formGroupId, setFormGroupId] = useState<string>('to-1');
  const [formRole, setFormRole] = useState<StudentRole>('Thành viên');
  const [formPhoneParent, setFormPhoneParent] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // Delete Confirmation State
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);

  // Quick Batch Add Modal
  const [isBatchOpen, setIsBatchOpen] = useState(false);
  const [batchText, setBatchText] = useState('');
  const [batchGroupId, setBatchGroupId] = useState('to-1');

  // Filtered students
  const filteredStudents = useMemo(() => {
    return state.students.filter(student => {
      const matchName = student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        student.studentCode.toLowerCase().includes(searchTerm.toLowerCase());
      const matchGroup = filterGroup === 'all' || student.groupId === filterGroup;
      const matchRole = filterRole === 'all' || student.role === filterRole;
      return matchName && matchGroup && matchRole;
    });
  }, [state.students, searchTerm, filterGroup, filterRole]);

  // Open modal for Create
  const handleOpenAdd = () => {
    setEditingStudent(null);
    const nextStt = String(state.students.length + 1).padStart(2, '0');
    setFormStudentCode(`${state.config.className}-${nextStt}`);
    setFormFullName('');
    setFormGender('Nam');
    setFormGroupId(state.groups[0]?.id || 'to-1');
    setFormRole('Thành viên');
    setFormPhoneParent('');
    setFormNotes('');
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setFormStudentCode(student.studentCode);
    setFormFullName(student.fullName);
    setFormGender(student.gender);
    setFormGroupId(student.groupId);
    setFormRole(student.role);
    setFormPhoneParent(student.phoneParent || '');
    setFormNotes(student.notes || '');
    setIsModalOpen(true);
  };

  // Save student
  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFullName.trim()) return;

    if (editingStudent) {
      // Update
      onUpdateState(prev => ({
        ...prev,
        students: prev.students.map(s => 
          s.id === editingStudent.id 
            ? {
                ...s,
                studentCode: formStudentCode.trim(),
                fullName: formFullName.trim(),
                gender: formGender,
                groupId: formGroupId,
                role: formRole,
                phoneParent: formPhoneParent.trim() || undefined,
                notes: formNotes.trim() || undefined,
              }
            : s
        ),
      }));
    } else {
      // Create new
      const newStudent: Student = {
        id: `hs-${Date.now()}`,
        studentCode: formStudentCode.trim(),
        fullName: formFullName.trim(),
        gender: formGender,
        groupId: formGroupId,
        role: formRole,
        phoneParent: formPhoneParent.trim() || undefined,
        notes: formNotes.trim() || undefined,
      };
      onUpdateState(prev => ({
        ...prev,
        students: [...prev.students, newStudent],
      }));
    }

    soundEngine.playSuccess(state.config.soundEnabled);
    setIsModalOpen(false);
  };

  // Confirm delete
  const handleConfirmDelete = () => {
    if (!deletingStudent) return;
    onUpdateState(prev => ({
      ...prev,
      students: prev.students.filter(s => s.id !== deletingStudent.id),
      attendanceRecords: prev.attendanceRecords.filter(a => a.studentId !== deletingStudent.id),
      conductEntries: prev.conductEntries.filter(c => c.targetId !== deletingStudent.id),
      rewardRecords: prev.rewardRecords.filter(r => r.studentId !== deletingStudent.id),
      disciplineRecords: prev.disciplineRecords.filter(d => d.studentId !== deletingStudent.id),
    }));
    setDeletingStudent(null);
    soundEngine.playSuccess(state.config.soundEnabled);
  };

  // Quick Batch Add logic
  const handleBatchAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const lines = batchText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length === 0) return;

    const baseCount = state.students.length;
    const newStudents: Student[] = lines.map((name, idx) => {
      const code = `${state.config.className}-${String(baseCount + idx + 1).padStart(2, '0')}`;
      return {
        id: `hs-${Date.now()}-${idx}`,
        studentCode: code,
        fullName: name,
        gender: 'Nam',
        groupId: batchGroupId,
        role: 'Thành viên',
        notes: 'Thêm hàng loạt',
      };
    });

    onUpdateState(prev => ({
      ...prev,
      students: [...prev.students, ...newStudents],
    }));

    setBatchText('');
    setIsBatchOpen(false);
    soundEngine.playSuccess(state.config.soundEnabled);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            Quản lý hồ sơ học sinh lớp {state.config.className}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Tổng cộng <span className="font-bold text-slate-800">{state.students.length}</span> học sinh • Phân bổ 4 tổ
          </p>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => exportStudentsToCsv(state)}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Xuất CSV</span>
          </button>
          <button
            onClick={() => setIsBatchOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <FileText className="w-4 h-4" />
            <span>Dán danh sách nhanh</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm học sinh</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên hoặc mã HS (vd: Long, 12A9-01)..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
          />
        </div>

        {/* Filter by Group */}
        <div>
          <select
            value={filterGroup}
            onChange={e => setFilterGroup(e.target.value)}
            className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="all">Tất cả các Tổ ({state.students.length} HS)</option>
            {state.groups.map(g => (
              <option key={g.id} value={g.id}>
                {g.name} ({state.students.filter(s => s.groupId === g.id).length} HS)
              </option>
            ))}
          </select>
        </div>

        {/* Filter by Role */}
        <div>
          <select
            value={filterRole}
            onChange={e => setFilterRole(e.target.value)}
            className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="all">Tất cả chức vụ</option>
            {ROLES.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Student Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-[11px] sm:text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                <th className="py-3.5 px-4 w-12 text-center">STT</th>
                <th className="py-3.5 px-4 w-24">Mã HS</th>
                <th className="py-3.5 px-4">Họ và tên</th>
                <th className="py-3.5 px-4 w-20">Giới tính</th>
                <th className="py-3.5 px-4">Tổ</th>
                <th className="py-3.5 px-4">Chức vụ</th>
                <th className="py-3.5 px-4 text-center w-28">Điểm thi đua</th>
                <th className="py-3.5 px-4">Ghi chú & SĐT</th>
                <th className="py-3.5 px-4 text-right w-24">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    Không tìm thấy học sinh phù hợp với điều kiện tìm kiếm.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, idx) => {
                  const group = state.groups.find(g => g.id === student.groupId);
                  const points = calculateStudentPoints(student.id, state);

                  return (
                    <tr 
                      key={student.id} 
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      <td className="py-3 px-4 text-center font-bold text-slate-400">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-indigo-700 text-xs">
                        {student.studentCode}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{student.fullName}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          student.gender === 'Nam' ? 'bg-blue-50 text-blue-700' : 'bg-pink-50 text-pink-700'
                        }`}>
                          {student.gender === 'Nam' ? 'Nam' : 'Nữ'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-700">
                          {group?.name || 'Chưa phân tổ'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          student.role === 'Lớp trưởng' || student.role === 'Bí thư Chi đoàn'
                            ? 'bg-purple-100 text-purple-800'
                            : student.role.includes('Lớp phó') || student.role === 'Tổ trưởng'
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {student.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className="font-extrabold text-slate-900 text-sm">
                            {points.total}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            (+{points.bonus} / -{points.penalty})
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <div className="truncate max-w-xs">{student.notes || '-'}</div>
                        {student.phoneParent && (
                          <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{student.phoneParent}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(student)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="Sửa thông tin"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingStudent(student)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Xóa học sinh"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Student Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-bold text-slate-900">
                {editingStudent ? 'Chỉnh sửa học sinh' : 'Thêm học sinh mới'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mã học sinh</label>
                  <input
                    type="text"
                    required
                    value={formStudentCode}
                    onChange={e => setFormStudentCode(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Giới tính</label>
                  <select
                    value={formGender}
                    onChange={e => setFormGender(e.target.value as Gender)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:outline-none"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nu">Nữ</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Họ và tên học sinh *</label>
                <input
                  type="text"
                  required
                  placeholder="Nhập họ và tên..."
                  value={formFullName}
                  onChange={e => setFormFullName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tổ / Nhóm</label>
                  <select
                    value={formGroupId}
                    onChange={e => setFormGroupId(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:outline-none"
                  >
                    {state.groups.map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Chức vụ trong lớp</label>
                  <select
                    value={formRole}
                    onChange={e => setFormRole(e.target.value as StudentRole)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:outline-none"
                  >
                    {ROLES.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Số điện thoại phụ huynh (tùy chọn)</label>
                <input
                  type="text"
                  placeholder="Ví dụ: 0912345678"
                  value={formPhoneParent}
                  onChange={e => setFormPhoneParent(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Ghi chú của GVCN</label>
                <textarea
                  rows={2}
                  placeholder="Ghi chú về học lực, nề nếp, năng khiếu..."
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
                >
                  {editingStudent ? 'Lưu thay đổi' : 'Thêm học sinh'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600 mb-4">
              <div className="p-3 bg-rose-50 rounded-xl">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Xóa học sinh này?</h3>
            </div>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              Bạn có chắc chắn muốn xóa học sinh <span className="font-bold text-slate-900">{deletingStudent.fullName}</span> ({deletingStudent.studentCode})? Toàn bộ dữ liệu điểm danh và thi đua liên quan sẽ được dọn sạch.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeletingStudent(null)}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-xl"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs"
              >
                Xóa ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Batch Add Modal */}
      {isBatchOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-bold text-slate-900">Dán danh sách học sinh nhanh</h3>
              <button
                onClick={() => setIsBatchOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Dán danh sách họ tên học sinh, mỗi bạn trên một dòng riêng biệt. Hệ thống sẽ tự động gán mã học sinh theo lớp {state.config.className}.
            </p>
            <form onSubmit={handleBatchAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phân vào Tổ</label>
                <select
                  value={batchGroupId}
                  onChange={e => setBatchGroupId(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:outline-none"
                >
                  {state.groups.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Danh sách họ tên (mỗi dòng 1 bạn)</label>
                <textarea
                  rows={6}
                  required
                  placeholder={`Nguyễn Văn An\nTrần Thị Bình\nLê Hoàng Cúc...`}
                  value={batchText}
                  onChange={e => setBatchText(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-mono"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsBatchOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
                >
                  Thêm vào lớp
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

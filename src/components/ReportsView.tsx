import React, { useState } from 'react';
import { 
  FileText, 
  Printer, 
  Download, 
  Upload, 
  RotateCcw, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Trophy, 
  Users, 
  School,
  FileSpreadsheet
} from 'lucide-react';
import { AppState } from '../types';
import { calculateGroupPoints, calculateStudentPoints, getTodayDateString } from '../utils/storage';
import { soundEngine } from '../utils/audio';

interface ReportsViewProps {
  state: AppState;
  onRestoreDefault: () => void;
  onImportData: (data: AppState) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ state, onRestoreDefault, onImportData }) => {
  const [reportType, setReportType] = useState<'week' | 'month' | 'semester'>('week');

  // Export full JSON Backup
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `SaoLuu_TroLyChuNhiem_${state.config.className}_${getTodayDateString()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    soundEngine.playSuccess(state.config.soundEnabled);
  };

  // Import JSON Backup
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (imported && imported.students && imported.config) {
          onImportData(imported);
          alert('Đã khôi phục dữ liệu thành công từ file sao lưu!');
        } else {
          alert('File JSON không hợp lệ hoặc thiếu dữ liệu.');
        }
      } catch (err) {
        alert('Lỗi khi đọc file JSON: ' + String(err));
      }
    };
    reader.readAsText(file);
  };

  // Export CSV of students
  const handleExportStudentsCsv = () => {
    const headers = ['STT', 'Mã Học Sinh', 'Họ Và Tên', 'Giới Tính', 'Ngày Sinh', 'Tổ', 'Chức Vụ', 'SĐT Phụ Huynh', 'Địa Chỉ'];
    const rows = state.students.map((st, idx) => {
      const grp = state.groups.find(g => g.id === st.groupId)?.name || st.groupId;
      return [
        idx + 1,
        `"${st.studentCode}"`,
        `"${st.fullName}"`,
        `"${st.gender === 'Nam' ? 'Nam' : 'Nữ'}"`,
        `"${st.birthDate || ''}"`,
        `"${grp}"`,
        `"${st.role}"`,
        `"${st.phoneParent || ''}"`,
        `"${st.address || ''}"`,
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DanhSachHocSinh_${state.config.className}_${getTodayDateString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Stats
  const groupStats = state.groups.map(g => ({ group: g, ...calculateGroupPoints(g.id, state) }))
    .sort((a, b) => b.total - a.total);

  const topStudents = state.students
    .map(st => ({ student: st, pts: calculateStudentPoints(st.id, state) }))
    .sort((a, b) => b.pts.total - a.pts.total)
    .slice(0, 5);

  const needAttentionStudents = state.students
    .map(st => {
      const att = state.attendanceRecords.filter(a => a.studentId === st.id && (a.status === 'excused' || a.status === 'unexcused'));
      const disc = state.disciplineRecords.filter(d => d.studentId === st.id && !d.resolved);
      return { student: st, absentCount: att.length, unresolvedDiscipline: disc.length };
    })
    .filter(x => x.absentCount > 1 || x.unresolvedDiscipline > 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Bar with Print & Actions */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            Báo cáo tổng hợp & Quản lý dữ liệu lớp {state.config.className}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Xem báo cáo tuần/tháng, in phiếu báo cáo gửi BGH, sao lưu và xuất dữ liệu
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>In báo cáo tuần</span>
          </button>

          <button
            onClick={handleExportJson}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Lưu toàn bộ dữ liệu ra file JSON an toàn trên máy"
          >
            <Download className="w-4 h-4" />
            <span>Sao lưu JSON</span>
          </button>

          <label className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>Khôi phục JSON</span>
            <input type="file" accept=".json" onChange={handleFileChange} className="hidden" />
          </label>
        </div>
      </div>

      {/* PRINTABLE OFFICIAL WEEKLY REPORT SHEET */}
      <div className="bg-white rounded-2xl p-8 sm:p-10 border border-slate-200 shadow-sm print:p-0 print:border-none print:shadow-none space-y-6">
        {/* Formal School Header for Print */}
        <div className="flex justify-between items-start border-b-2 border-slate-800 pb-4">
          <div className="text-left">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-600">
              SỞ GIÁO DỤC & ĐÀO TẠO
            </div>
            <div className="text-sm font-black uppercase text-slate-900">
              {state.config.schoolName}
            </div>
            <div className="text-xs text-slate-500 font-semibold mt-0.5">
              Lớp: <b className="text-slate-900">{state.config.className}</b> • Năm học: {state.config.schoolYear}
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs font-bold uppercase text-slate-900">
              CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
            </div>
            <div className="text-xs font-bold text-slate-700">
              Độc lập - Tự do - Hạnh phúc
            </div>
            <div className="text-xs text-slate-400 italic mt-1">
              Ngày báo cáo: {getTodayDateString()}
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="text-center my-6">
          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-900">
            BÁO CÁO CÔNG TÁC CHỦ NHIỆM TUẦN {state.weeklyMeeting.weekNumber}
          </h1>
          <p className="text-xs text-slate-600 font-medium mt-1">
            (Tổng hợp theo dõi sĩ số, nề nếp, học tập và xếp hạng thi đua lớp 12A9)
          </p>
        </div>

        {/* Section 1: Sĩ số & Chuyên cần */}
        <div>
          <h3 className="text-sm font-black uppercase text-indigo-900 border-l-4 border-indigo-600 pl-2 mb-3">
            I. TÌNH HÌNH SĨ SỐ & CHUYÊN CẦN
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-slate-500 block">Sĩ số đầu năm:</span>
              <span className="font-bold text-slate-900 text-sm">{state.students.length} học sinh</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-slate-500 block">Hiện diện trung bình:</span>
              <span className="font-bold text-emerald-700 text-sm">98.5%</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-slate-500 block">Tổng số lượt nghỉ có phép:</span>
              <span className="font-bold text-amber-700 text-sm">
                {state.attendanceRecords.filter(a => a.status === 'excused').length} lượt
              </span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-slate-500 block">Nghỉ không phép:</span>
              <span className="font-bold text-rose-700 text-sm">
                {state.attendanceRecords.filter(a => a.status === 'unexcused').length} lượt
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Thi đua các Tổ */}
        <div>
          <h3 className="text-sm font-black uppercase text-indigo-900 border-l-4 border-indigo-600 pl-2 mb-3">
            II. KẾT QUẢ THI ĐUA CÁC TỔ TRONG TUẦN
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border border-slate-300">
              <thead className="bg-slate-100 font-bold text-slate-700 border-b border-slate-300">
                <tr>
                  <th className="p-2.5 text-center border-r border-slate-300 w-12">Hạng</th>
                  <th className="p-2.5 border-r border-slate-300">Tên Tổ</th>
                  <th className="p-2.5 text-center border-r border-slate-300">Số lượng HS</th>
                  <th className="p-2.5 text-center border-r border-slate-300">Điểm TB Thành viên</th>
                  <th className="p-2.5 text-center border-r border-slate-300">Điểm Nề nếp Tổ</th>
                  <th className="p-2.5 text-center font-bold">Tổng điểm thi đua</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {groupStats.map((item, idx) => (
                  <tr key={item.group.id}>
                    <td className="p-2 text-center font-bold border-r border-slate-300">{idx + 1}</td>
                    <td className="p-2 font-bold text-slate-900 border-r border-slate-300">{item.group.name}</td>
                    <td className="p-2 text-center border-r border-slate-300">{item.studentCount}</td>
                    <td className="p-2 text-center border-r border-slate-300">{item.averageStudentPoints}đ</td>
                    <td className="p-2 text-center border-r border-slate-300">+{item.bonus} / -{item.penalty}</td>
                    <td className="p-2 text-center font-black text-indigo-700">{item.total}đ</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: Tuyên dương & Lưu ý */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40">
            <h4 className="text-xs font-black uppercase text-emerald-900 mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              III. HỌC SINH TIÊU BIỂU ĐƯỢC TUYÊN DƯƠNG
            </h4>
            <div className="space-y-1 text-xs">
              {topStudents.map((item, idx) => (
                <div key={item.student.id} className="flex justify-between">
                  <span className="font-semibold text-slate-800">
                    {idx + 1}. {item.student.fullName} ({state.groups.find(g => g.id === item.student.groupId)?.name})
                  </span>
                  <span className="font-bold text-emerald-700">{item.pts.total} điểm</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40">
            <h4 className="text-xs font-black uppercase text-amber-900 mb-2 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              IV. TRƯỜNG HỢP CẦN QUAN TÂM & PHỐI HỢP PHỤ HUYNH
            </h4>
            <div className="space-y-1 text-xs">
              {needAttentionStudents.length === 0 ? (
                <p className="text-slate-500 italic">Không có trường hợp nào cần lưu ý đặc biệt.</p>
              ) : (
                needAttentionStudents.slice(0, 5).map(item => (
                  <div key={item.student.id} className="flex justify-between">
                    <span className="font-semibold text-slate-800">
                      • {item.student.fullName}
                    </span>
                    <span className="text-slate-500">
                      {item.absentCount > 0 ? `Vắng ${item.absentCount} buổi` : ''} 
                      {item.unresolvedDiscipline > 0 ? ` (${item.unresolvedDiscipline} lần nhắc nhở)` : ''}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Section 4: Signatures */}
        <div className="pt-8 flex justify-between items-end text-xs text-slate-700 print:pt-16">
          <div className="text-center w-48">
            <div className="font-bold uppercase text-slate-800">ĐẠI DIỆN LỚP TRƯỞNG</div>
            <div className="text-slate-400 italic text-[10px] mt-1">(Ký và ghi rõ họ tên)</div>
            <div className="h-16"></div>
            <div className="font-semibold text-slate-900">
              {state.students.find(s => s.role === 'Lớp trưởng')?.fullName || 'Đỗ Thị Thảo Vy'}
            </div>
          </div>

          <div className="text-center w-56">
            <div className="text-slate-500 italic text-[11px]">Ngày ... tháng ... năm 2026</div>
            <div className="font-bold uppercase text-slate-800 mt-1">GIÁO VIÊN CHỦ NHIỆM</div>
            <div className="text-slate-400 italic text-[10px] mt-1">(Ký và ghi rõ họ tên)</div>
            <div className="h-16"></div>
            <div className="font-bold text-slate-900">
              {state.config.homeroomTeacher}
            </div>
          </div>
        </div>
      </div>

      {/* CSV Quick Export Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex items-center justify-between no-print">
        <div>
          <h4 className="text-sm font-bold text-slate-900">Xuất danh sách học sinh Lớp {state.config.className}</h4>
          <p className="text-xs text-slate-500 mt-0.5">Tải file CSV gồm họ tên, tổ, chức vụ, ngày sinh, SĐT phụ huynh để mở bằng Excel</p>
        </div>
        <button
          onClick={handleExportStudentsCsv}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Tải file Excel/CSV</span>
        </button>
      </div>
    </div>
  );
};

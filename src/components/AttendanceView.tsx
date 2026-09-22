import React, { useState, useMemo } from 'react';
import { 
  CalendarCheck2, 
  Calendar, 
  CheckCheck, 
  UserCheck, 
  UserX, 
  Clock, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';
import { AppState, AttendanceStatus, AttendanceRecord } from '../types';
import { getTodayDateString } from '../utils/storage';
import { soundEngine } from '../utils/audio';

interface AttendanceViewProps {
  state: AppState;
  onUpdateState: (updater: (prev: AppState) => AppState) => void;
}

const STATUS_CONFIG: Record<AttendanceStatus, { label: string; short: string; bg: string; text: string; border: string }> = {
  present: {
    label: 'Có mặt',
    short: 'Đủ',
    bg: 'bg-emerald-50 hover:bg-emerald-100',
    text: 'text-emerald-700',
    border: 'border-emerald-300',
  },
  excused: {
    label: 'Nghỉ có phép',
    short: 'P',
    bg: 'bg-amber-50 hover:bg-amber-100',
    text: 'text-amber-700',
    border: 'border-amber-300',
  },
  unexcused: {
    label: 'Nghỉ không phép',
    short: 'KP',
    bg: 'bg-rose-50 hover:bg-rose-100',
    text: 'text-rose-700',
    border: 'border-rose-300',
  },
  late: {
    label: 'Đi học muộn',
    short: 'M',
    bg: 'bg-orange-50 hover:bg-orange-100',
    text: 'text-orange-700',
    border: 'border-orange-300',
  },
  early_leave: {
    label: 'Về sớm',
    short: 'VS',
    bg: 'bg-blue-50 hover:bg-blue-100',
    text: 'text-blue-700',
    border: 'border-blue-300',
  },
};

export const AttendanceView: React.FC<AttendanceViewProps> = ({ state, onUpdateState }) => {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'stats'>('day');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGroup, setFilterGroup] = useState<string>('all');

  // Change selected date
  const handleDateChange = (offsetDays: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + offsetDays);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    setSelectedDate(`${y}-${m}-${day}`);
  };

  // Quick action: Mark all present for selected date
  const handleMarkAllPresent = () => {
    onUpdateState(prev => {
      const otherRecords = prev.attendanceRecords.filter(a => a.date !== selectedDate);
      const newDayRecords: AttendanceRecord[] = prev.students.map(st => ({
        id: `att-${selectedDate}-${st.id}`,
        date: selectedDate,
        studentId: st.id,
        status: 'present',
      }));
      return {
        ...prev,
        attendanceRecords: [...otherRecords, ...newDayRecords],
      };
    });
    soundEngine.playSuccess(state.config.soundEnabled);
  };

  // Update a single student status
  const handleSetStudentStatus = (studentId: string, status: AttendanceStatus) => {
    onUpdateState(prev => {
      const existingIdx = prev.attendanceRecords.findIndex(
        a => a.date === selectedDate && a.studentId === studentId
      );
      if (existingIdx >= 0) {
        const updated = [...prev.attendanceRecords];
        updated[existingIdx] = {
          ...updated[existingIdx],
          status,
        };
        return { ...prev, attendanceRecords: updated };
      } else {
        const newRecord: AttendanceRecord = {
          id: `att-${selectedDate}-${studentId}`,
          date: selectedDate,
          studentId,
          status,
        };
        return { ...prev, attendanceRecords: [...prev.attendanceRecords, newRecord] };
      }
    });
    soundEngine.playSuccess(state.config.soundEnabled);
  };

  // Update note for single student
  const handleSetStudentNote = (studentId: string, note: string) => {
    onUpdateState(prev => {
      const existingIdx = prev.attendanceRecords.findIndex(
        a => a.date === selectedDate && a.studentId === studentId
      );
      if (existingIdx >= 0) {
        const updated = [...prev.attendanceRecords];
        updated[existingIdx] = {
          ...updated[existingIdx],
          note,
        };
        return { ...prev, attendanceRecords: updated };
      } else {
        const newRecord: AttendanceRecord = {
          id: `att-${selectedDate}-${studentId}`,
          date: selectedDate,
          studentId,
          status: 'present',
          note,
        };
        return { ...prev, attendanceRecords: [...prev.attendanceRecords, newRecord] };
      }
    });
  };

  // Day metrics
  const dayRecords = state.attendanceRecords.filter(a => a.date === selectedDate);
  const presentCount = dayRecords.filter(a => a.status === 'present').length;
  const excusedCount = dayRecords.filter(a => a.status === 'excused').length;
  const unexcusedCount = dayRecords.filter(a => a.status === 'unexcused').length;
  const lateCount = dayRecords.filter(a => a.status === 'late').length;
  const earlyCount = dayRecords.filter(a => a.status === 'early_leave').length;

  // Filtered students
  const filteredStudents = useMemo(() => {
    return state.students.filter(s => {
      const matchName = s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        s.studentCode.toLowerCase().includes(searchTerm.toLowerCase());
      const matchGroup = filterGroup === 'all' || s.groupId === filterGroup;
      return matchName && matchGroup;
    });
  }, [state.students, searchTerm, filterGroup]);

  // Week Dates calculation (Monday to Saturday of current selectedDate)
  const weekDates = useMemo(() => {
    const current = new Date(selectedDate);
    const day = current.getDay(); // 0 is Sunday, 1 is Monday...
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const monday = new Date(current);
    monday.setDate(current.getDate() + diffToMonday);

    const dates: { dateStr: string; label: string }[] = [];
    const dayNames = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    for (let i = 0; i < 6; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dayStr = String(d.getDate()).padStart(2, '0');
      dates.push({
        dateStr: `${y}-${m}-${dayStr}`,
        label: `${dayNames[i]} (${dayStr}/${m})`,
      });
    }
    return dates;
  }, [selectedDate]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Date Header & View Mode Selector */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <CalendarCheck2 className="w-5 h-5 text-indigo-600" />
            Sĩ số & Chuyên cần Lớp {state.config.className}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Ghi nhận có mặt, vắng phép, không phép, đi muộn nhanh chóng bằng 1 chạm
          </p>
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setViewMode('day')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'day' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Theo Ngày
          </button>
          <button
            onClick={() => setViewMode('week')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'week' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Ma Trận Tuần
          </button>
          <button
            onClick={() => setViewMode('stats')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'stats' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Thống Kê Cá Nhân
          </button>
        </div>
      </div>

      {/* Date Picker Bar & Summary Cards (Only in Day View) */}
      {viewMode === 'day' && (
        <>
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
            {/* Date navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDateChange(-1)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                title="Hôm trước"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="text-xs sm:text-sm font-bold text-slate-800 bg-transparent focus:outline-none"
                />
              </div>
              <button
                onClick={() => handleDateChange(1)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                title="Hôm sau"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setSelectedDate(getTodayDateString())}
                className="px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors"
              >
                Hôm nay
              </button>
            </div>

            {/* Quick action button */}
            <button
              onClick={handleMarkAllPresent}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Đánh dấu tất cả Có mặt</span>
            </button>
          </div>

          {/* Quick KPIs for the selected date */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500">Có mặt</span>
              <div className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">{presentCount}</div>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500">Nghỉ có phép</span>
              <div className="text-xl sm:text-2xl font-black text-amber-600 mt-1">{excusedCount}</div>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500">Nghỉ không phép</span>
              <div className="text-xl sm:text-2xl font-black text-rose-600 mt-1">{unexcusedCount}</div>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500">Đi học muộn</span>
              <div className="text-xl sm:text-2xl font-black text-orange-600 mt-1">{lateCount}</div>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500">Về sớm</span>
              <div className="text-xl sm:text-2xl font-black text-blue-600 mt-1">{earlyCount}</div>
            </div>
          </div>
        </>
      )}

      {/* Filter and Search */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm học sinh theo tên..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
        <div>
          <select
            value={filterGroup}
            onChange={e => setFilterGroup(e.target.value)}
            className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none"
          >
            <option value="all">Tất cả các Tổ</option>
            {state.groups.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* VIEW MODE 1: DAY VIEW */}
      {viewMode === 'day' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 text-[11px] sm:text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4 w-12 text-center">STT</th>
                  <th className="py-3 px-4">Họ và tên</th>
                  <th className="py-3 px-4 w-28">Tổ</th>
                  <th className="py-3 px-4 text-center">Trạng thái điểm danh ngày {selectedDate}</th>
                  <th className="py-3 px-4">Lý do / Ghi chú</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {filteredStudents.map((student, idx) => {
                  const record = state.attendanceRecords.find(
                    a => a.date === selectedDate && a.studentId === student.id
                  );
                  const currentStatus: AttendanceStatus = record?.status || 'present';
                  const note = record?.note || '';
                  const group = state.groups.find(g => g.id === student.groupId);

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 text-center font-bold text-slate-400">{idx + 1}</td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{student.fullName}</div>
                        <div className="text-[11px] font-mono text-slate-400">{student.studentCode}</div>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-600">{group?.name}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          {(['present', 'excused', 'unexcused', 'late', 'early_leave'] as AttendanceStatus[]).map(stKey => {
                            const conf = STATUS_CONFIG[stKey];
                            const isSelected = currentStatus === stKey;
                            return (
                              <button
                                key={stKey}
                                onClick={() => handleSetStudentStatus(student.id, stKey)}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                                  isSelected
                                    ? `${conf.bg} ${conf.text} ${conf.border} shadow-xs font-black ring-1 ring-offset-1 ring-indigo-400`
                                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-100'
                                }`}
                              >
                                {conf.label}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          placeholder={currentStatus !== 'present' ? 'Ghi rõ lý do (vd: ốm, hỏng xe)...' : 'Ghi chú thêm (nếu có)...'}
                          value={note}
                          onChange={e => handleSetStudentNote(student.id, e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: WEEK MATRIX VIEW */}
      {viewMode === 'week' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">
              Bảng ma trận chuyên cần tuần (Thứ 2 - Thứ 7)
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              Ký hiệu: <b className="text-emerald-600">Đủ</b>: Có mặt • <b className="text-amber-600">P</b>: Có phép • <b className="text-rose-600">KP</b>: Không phép • <b className="text-orange-600">M</b>: Muộn
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/70 text-slate-700 text-[11px] sm:text-xs font-bold uppercase border-b border-slate-200">
                  <th className="py-3 px-4 w-12 text-center">STT</th>
                  <th className="py-3 px-4">Họ và tên</th>
                  <th className="py-3 px-4 w-24">Tổ</th>
                  {weekDates.map(wd => (
                    <th key={wd.dateStr} className="py-3 px-2 text-center text-xs">
                      <div>{wd.label.split(' ')[0]}</div>
                      <div className="text-[10px] font-normal text-slate-500">{wd.dateStr.slice(5)}</div>
                    </th>
                  ))}
                  <th className="py-3 px-3 text-center w-24">Tổng vắng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredStudents.map((student, idx) => {
                  let studentAbsents = 0;
                  const group = state.groups.find(g => g.id === student.groupId);

                  return (
                    <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-4 text-center font-bold text-slate-400">{idx + 1}</td>
                      <td className="py-2.5 px-4 font-bold text-slate-800">{student.fullName}</td>
                      <td className="py-2.5 px-4 font-medium text-slate-500">{group?.name}</td>
                      {weekDates.map(wd => {
                        const rec = state.attendanceRecords.find(
                          a => a.date === wd.dateStr && a.studentId === student.id
                        );
                        const status = rec?.status || 'present';
                        if (status === 'excused' || status === 'unexcused') studentAbsents++;
                        const conf = STATUS_CONFIG[status];

                        return (
                          <td key={wd.dateStr} className="py-2.5 px-2 text-center">
                            <span 
                              title={rec?.note ? `${conf.label}: ${rec.note}` : conf.label}
                              className={`inline-block w-8 py-1 rounded-md text-[11px] font-extrabold border ${conf.bg} ${conf.text} ${conf.border}`}
                            >
                              {conf.short}
                            </span>
                          </td>
                        );
                      })}
                      <td className="py-2.5 px-3 text-center">
                        <span className={`font-black ${studentAbsents > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                          {studentAbsents} buổi
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW MODE 3: STATS PER STUDENT */}
      {viewMode === 'stats' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-800">
              Tổng hợp tỷ lệ chuyên cần & số buổi vắng/muộn từ đầu kỳ
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/70 text-slate-700 text-[11px] sm:text-xs font-bold uppercase border-b border-slate-200">
                  <th className="py-3 px-4 w-12 text-center">STT</th>
                  <th className="py-3 px-4">Họ và tên</th>
                  <th className="py-3 px-4">Tổ</th>
                  <th className="py-3 px-4 text-center">Có phép</th>
                  <th className="py-3 px-4 text-center">Không phép</th>
                  <th className="py-3 px-4 text-center">Đi muộn</th>
                  <th className="py-3 px-4 text-center">Về sớm</th>
                  <th className="py-3 px-4 text-center">Tỷ lệ chuyên cần</th>
                  <th className="py-3 px-4">Đánh giá nề nếp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {filteredStudents.map((student, idx) => {
                  const studentRecords = state.attendanceRecords.filter(a => a.studentId === student.id);
                  const pCount = studentRecords.filter(a => a.status === 'excused').length;
                  const kpCount = studentRecords.filter(a => a.status === 'unexcused').length;
                  const late = studentRecords.filter(a => a.status === 'late').length;
                  const early = studentRecords.filter(a => a.status === 'early_leave').length;
                  const totalRecordedDays = Math.max(1, new Set(state.attendanceRecords.map(a => a.date)).size);
                  const absents = pCount + kpCount;
                  const rate = Math.max(0, Math.round(((totalRecordedDays - absents) / totalRecordedDays) * 100));
                  const group = state.groups.find(g => g.id === student.groupId);

                  return (
                    <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 text-center font-bold text-slate-400">{idx + 1}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{student.fullName}</td>
                      <td className="py-3 px-4 font-medium text-slate-600">{group?.name}</td>
                      <td className="py-3 px-4 text-center font-semibold text-amber-600">{pCount}</td>
                      <td className="py-3 px-4 text-center font-bold text-rose-600">{kpCount}</td>
                      <td className="py-3 px-4 text-center font-semibold text-orange-600">{late}</td>
                      <td className="py-3 px-4 text-center font-semibold text-blue-600">{early}</td>
                      <td className="py-3 px-4 text-center font-black">
                        <span className={rate >= 95 ? 'text-emerald-600' : rate >= 85 ? 'text-indigo-600' : 'text-rose-600'}>
                          {rate}%
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {rate >= 98 && late === 0 ? (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Chuyên cần gương mẫu
                          </span>
                        ) : kpCount > 0 ? (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            Cần nhắc nhở phụ huynh
                          </span>
                        ) : late > 1 ? (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            Chú ý đi học đúng giờ
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600">
                            Bình thường
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

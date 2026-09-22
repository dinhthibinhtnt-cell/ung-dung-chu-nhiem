import React, { useState } from 'react';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  Award, 
  AlertTriangle, 
  CheckCircle2, 
  Trophy, 
  Plus, 
  Calendar, 
  ArrowRight,
  TrendingUp,
  Sparkles,
  Trash2,
  ListTodo
} from 'lucide-react';
import { AppState, QuickReminder } from '../types';
import { getTodayDateString, calculateGroupPoints, calculateStudentPoints } from '../utils/storage';
import { soundEngine } from '../utils/audio';

interface DashboardViewProps {
  state: AppState;
  setActiveTab: (tab: string) => void;
  onUpdateState: (updater: (prev: AppState) => AppState) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  state,
  setActiveTab,
  onUpdateState,
}) => {
  const today = getTodayDateString();
  const [newReminderText, setNewReminderText] = useState('');
  const [newReminderPriority, setNewReminderPriority] = useState<'low' | 'medium' | 'high'>('medium');

  // Attendance metrics for today
  const todayAttendance = state.attendanceRecords.filter(a => a.date === today);
  const totalStudents = state.students.length;
  
  const presentCount = todayAttendance.filter(a => a.status === 'present').length;
  const excusedCount = todayAttendance.filter(a => a.status === 'excused').length;
  const unexcusedCount = todayAttendance.filter(a => a.status === 'unexcused').length;
  const lateCount = todayAttendance.filter(a => a.status === 'late').length;
  const earlyCount = todayAttendance.filter(a => a.status === 'early_leave').length;

  const totalAbsents = excusedCount + unexcusedCount;
  const attendanceRate = totalStudents > 0 
    ? Math.round(((totalStudents - totalAbsents) / totalStudents) * 100) 
    : 100;

  // Conduct & discipline metrics
  const violationsToday = state.disciplineRecords.filter(d => d.date === today).length;
  const rewardsToday = state.rewardRecords.filter(r => r.date === today).length;

  // Calculate student average score
  let totalStudentPts = 0;
  state.students.forEach(s => {
    totalStudentPts += calculateStudentPoints(s.id, state).total;
  });
  const avgStudentScore = totalStudents > 0 ? (totalStudentPts / totalStudents).toFixed(1) : '100.0';

  // Group scores
  const groupStats = state.groups.map(g => {
    const stats = calculateGroupPoints(g.id, state);
    return {
      group: g,
      ...stats,
    };
  }).sort((a, b) => b.total - a.total);

  // Recent 6 days attendance history for chart
  const recentDays = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (5 - i));
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${day}`;
    const dayName = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][d.getDay()];

    const records = state.attendanceRecords.filter(a => a.date === dateStr);
    const absents = records.filter(a => a.status === 'excused' || a.status === 'unexcused').length;
    const lates = records.filter(a => a.status === 'late').length;
    const rate = totalStudents > 0 ? Math.max(0, Math.round(((totalStudents - absents) / totalStudents) * 100)) : 100;

    return {
      date: dateStr,
      label: `${dayName} (${day}/${m})`,
      rate,
      absents,
      lates,
    };
  });

  // Handle reminder toggling
  const toggleReminder = (id: string) => {
    onUpdateState(prev => ({
      ...prev,
      quickReminders: prev.quickReminders.map(r => r.id === id ? { ...r, completed: !r.completed } : r),
    }));
    soundEngine.playSuccess(state.config.soundEnabled);
  };

  const addReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReminderText.trim()) return;
    const item: QuickReminder = {
      id: `rem-${Date.now()}`,
      text: newReminderText.trim(),
      completed: false,
      priority: newReminderPriority,
      dueDate: today,
    };
    onUpdateState(prev => ({
      ...prev,
      quickReminders: [item, ...prev.quickReminders],
    }));
    setNewReminderText('');
    soundEngine.playSuccess(state.config.soundEnabled);
  };

  const deleteReminder = (id: string) => {
    onUpdateState(prev => ({
      ...prev,
      quickReminders: prev.quickReminders.filter(r => r.id !== id),
    }));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Welcome & Slogan Header Card */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-800 text-white rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold tracking-wider uppercase">
                {state.config.semester} • {state.config.schoolYear}
              </span>
              <span className="px-3 py-1 bg-emerald-500/30 text-emerald-100 border border-emerald-300/30 rounded-full text-xs font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Lớp trưởng: {state.students.find(s => s.role === 'Lớp trưởng')?.fullName || 'Đỗ Thị Thảo Vy'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Bảng điều khiển Lớp {state.config.className}
            </h2>
            <p className="text-indigo-100 text-sm max-w-2xl italic">
              "{state.config.motto}"
            </p>
          </div>

          {/* Action Quick Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                setActiveTab('attendance');
                soundEngine.playSuccess(state.config.soundEnabled);
              }}
              className="px-4 py-2.5 rounded-xl bg-white text-indigo-700 font-bold text-sm shadow-md hover:bg-indigo-50 transition-all flex items-center gap-2"
            >
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span>Điểm danh hôm nay</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('meeting');
                soundEngine.playSuccess(state.config.soundEnabled);
              }}
              className="px-4 py-2.5 rounded-xl bg-indigo-500/40 hover:bg-indigo-500/60 border border-white/30 text-white font-semibold text-sm transition-all flex items-center gap-2 backdrop-blur-sm"
            >
              <Trophy className="w-4 h-4 text-amber-300" />
              <span>Tiết sinh hoạt lớp</span>
            </button>
          </div>
        </div>

        {/* Decorative background circle */}
        <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Students */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-200 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Sĩ số lớp</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">{totalStudents}</div>
          <p className="text-xs text-slate-500 mt-1">
            {state.students.filter(s => s.gender === 'Nam').length} Nam • {state.students.filter(s => s.gender === 'Nu').length} Nữ
          </p>
        </div>

        {/* Present Today */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-200 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Có mặt hôm nay</span>
            <UserCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600">{presentCount}</div>
          <p className="text-xs text-emerald-700 font-medium mt-1">
            Đạt {attendanceRate}% sĩ số
          </p>
        </div>

        {/* Absents */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-rose-200 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Vắng hôm nay</span>
            <UserX className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-600">{totalAbsents}</div>
          <p className="text-xs text-slate-500 mt-1">
            {excusedCount} có phép • {unexcusedCount} không phép
          </p>
        </div>

        {/* Late */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-200 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Đi muộn / Về sớm</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600">{lateCount}</div>
          <p className="text-xs text-slate-500 mt-1">
            {earlyCount} trường hợp về sớm
          </p>
        </div>

        {/* Average Competition Score */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-200 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Điểm thi đua TB</span>
            <Award className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-indigo-600">{avgStudentScore}</div>
          <p className="text-xs text-slate-500 mt-1">
            Mốc chuẩn {state.config.baselineStudentPoints} điểm
          </p>
        </div>

        {/* Leading Group */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-200 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Tổ dẫn đầu</span>
            <Trophy className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-lg sm:text-xl font-extrabold text-amber-600 truncate">
            {groupStats[0]?.group.name || 'Tổ 1'}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {groupStats[0]?.total || 100} điểm tổng
          </p>
        </div>
      </div>

      {/* Visual Charts & Group Ranking Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Rate History Chart (2 Columns on large) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                Diễn biến chuyên cần 6 ngày gần nhất
              </h3>
              <p className="text-xs text-slate-500">Tỷ lệ đi học đúng giờ và sĩ số của lớp 12A9</p>
            </div>
            <button
              onClick={() => setActiveTab('attendance')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              Xem chi tiết <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* SVG Interactive Bar Chart */}
          <div className="h-52 w-full pt-4">
            <div className="grid grid-cols-6 h-full items-end gap-2 sm:gap-4 px-2">
              {recentDays.map((d) => {
                const heightPercent = Math.max(15, d.rate);
                return (
                  <div key={d.date} className="flex flex-col items-center h-full justify-end group relative">
                    {/* Tooltip on hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-10 bg-slate-900 text-white text-xs py-1 px-2 rounded-lg pointer-events-none whitespace-nowrap z-20 shadow-md">
                      {d.label}: {d.rate}% (Vắng {d.absents}, Muộn {d.lates})
                    </div>

                    {/* Bar container */}
                    <div className="w-full max-w-[48px] bg-slate-100 rounded-t-xl overflow-hidden flex flex-col justify-end h-40">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full transition-all duration-500 rounded-t-xl ${
                          d.rate >= 95
                            ? 'bg-gradient-to-t from-emerald-600 to-emerald-400'
                            : d.rate >= 90
                            ? 'bg-gradient-to-t from-indigo-600 to-indigo-400'
                            : 'bg-gradient-to-t from-amber-500 to-amber-400'
                        }`}
                      />
                    </div>
                    {/* Percentage text */}
                    <span className="text-xs font-bold text-slate-700 mt-2">{d.rate}%</span>
                    {/* Date label */}
                    <span className="text-[11px] font-medium text-slate-400 truncate max-w-full text-center">
                      {d.label.split(' ')[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Group Comparison Standings */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                Thi đua 4 Tổ trong tuần
              </h3>
              <button
                onClick={() => setActiveTab('ranking')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                Vinh danh
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Điểm tổng hợp từ nề nếp, chuyên cần và học tập
            </p>

            <div className="space-y-3">
              {groupStats.map((item, idx) => {
                const rankBadges = [
                  { label: 'Hạng 1', bg: 'bg-amber-100 text-amber-800 border-amber-300' },
                  { label: 'Hạng 2', bg: 'bg-slate-100 text-slate-700 border-slate-300' },
                  { label: 'Hạng 3', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
                  { label: 'Hạng 4', bg: 'bg-slate-50 text-slate-600 border-slate-200' },
                ];
                const badge = rankBadges[idx] || rankBadges[3];

                return (
                  <div 
                    key={item.group.id}
                    className="p-3 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded-md text-xs font-extrabold border ${badge.bg}`}>
                        {badge.label}
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{item.group.name}</h4>
                        <p className="text-xs text-slate-500">{item.studentCount} học sinh</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-extrabold text-indigo-700">{item.total}</span>
                      <span className="text-xs text-slate-400 ml-1">điểm</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Tiêu chí: Mặc định 100đ</span>
            <button
              onClick={() => setActiveTab('competition')}
              className="text-indigo-600 font-semibold hover:underline"
            >
              Xem bảng điểm chi tiết →
            </button>
          </div>
        </div>
      </div>

      {/* Quick Reminders & Today Log Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Homeroom Reminders (Việc cần làm của GVCN) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ListTodo className="w-4 h-4 text-indigo-600" />
              Việc cần xử lý & Ghi nhớ của GVCN
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
              {state.quickReminders.filter(r => !r.completed).length} việc chưa xong
            </span>
          </div>

          {/* Add Reminder Input */}
          <form onSubmit={addReminder} className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Thêm việc cần làm (vd: Thu phiếu khảo sát, gọi điện PH em...)"
              value={newReminderText}
              onChange={e => setNewReminderText(e.target.value)}
              className="flex-1 px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
            <select
              value={newReminderPriority}
              onChange={e => setNewReminderPriority(e.target.value as 'low' | 'medium' | 'high')}
              className="px-2.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none"
            >
              <option value="high">Gấp</option>
              <option value="medium">Bình thường</option>
              <option value="low">Thong thả</option>
            </select>
            <button
              type="submit"
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold flex items-center justify-center transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
            </button>
          </form>

          {/* Reminders List */}
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {state.quickReminders.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">Chưa có ghi chú việc cần làm.</p>
            ) : (
              state.quickReminders.map(rem => (
                <div
                  key={rem.id}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                    rem.completed 
                      ? 'bg-slate-50 border-slate-100 opacity-60' 
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <button
                      onClick={() => toggleReminder(rem.id)}
                      className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                        rem.completed ? 'bg-emerald-600 text-white' : 'border border-slate-300 hover:border-indigo-600'
                      }`}
                    >
                      {rem.completed && <CheckCircle2 className="w-4 h-4" />}
                    </button>
                    <span className={`text-sm text-slate-800 truncate ${rem.completed ? 'line-through text-slate-400' : ''}`}>
                      {rem.text}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {rem.priority === 'high' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200">
                        Ưu tiên
                      </span>
                    )}
                    <button
                      onClick={() => deleteReminder(rem.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                      title="Xóa việc này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Positive Rewards & Highlights Today */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Ghi nhận khen thưởng & Việc tốt gần đây
              </h3>
              <button
                onClick={() => setActiveTab('rewards')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                Xem tất cả ({state.rewardRecords.length})
              </button>
            </div>

            <div className="space-y-2.5">
              {state.rewardRecords.slice(0, 3).map(rew => {
                const student = state.students.find(s => s.id === rew.studentId);
                return (
                  <div key={rew.id} className="p-3 rounded-xl bg-amber-50/60 border border-amber-100 flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-amber-100 text-amber-700 shrink-0">
                      <Award className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {student?.fullName || 'Học sinh'} ({student?.studentCode})
                        </h4>
                        <span className="text-xs font-extrabold text-amber-700 shrink-0">
                          +{rew.pointsDelta}đ
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium mt-0.5 line-clamp-1">
                        {rew.title}
                      </p>
                    </div>
                  </div>
                );
              })}

              {state.rewardRecords.length === 0 && (
                <p className="text-xs text-slate-400 py-6 text-center">Chưa có ghi nhận khen thưởng nào trong tuần.</p>
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => setActiveTab('rewards')}
              className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ghi nhận khen thưởng / việc tốt mới</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

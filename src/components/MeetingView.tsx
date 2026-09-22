import React, { useState } from 'react';
import { 
  Presentation, 
  Sparkles, 
  Trophy, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar, 
  Users, 
  Edit3, 
  Save, 
  PartyPopper, 
  Plus, 
  Trash2,
  Check,
  Maximize2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AppState, WeeklyMeeting, AssignedTask } from '../types';
import { calculateGroupPoints, calculateStudentPoints, getTodayDateString } from '../utils/storage';
import { soundEngine } from '../utils/audio';

interface MeetingViewProps {
  state: AppState;
  onUpdateState: (updater: (prev: AppState) => AppState) => void;
}

export const MeetingView: React.FC<MeetingViewProps> = ({ state, onUpdateState }) => {
  const meeting = state.weeklyMeeting;
  const [isEditing, setIsEditing] = useState(false);
  const [presentationSlide, setPresentationSlide] = useState<number>(0);

  // Editable Form States
  const [title, setTitle] = useState(meeting.title);
  const [weekNumber, setWeekNumber] = useState(meeting.weekNumber);
  const [reviewSummary, setReviewSummary] = useState(meeting.reviewSummary);
  const [strengths, setStrengths] = useState(meeting.strengths);
  const [weaknesses, setWeaknesses] = useState(meeting.weaknesses);
  const [nextWeekPlan, setNextWeekPlan] = useState(meeting.nextWeekPlan);
  const [honoredGroupId, setHonoredGroupId] = useState(meeting.honoredGroupId || 'to-1');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');
  const [newTaskDeadline, setNewTaskDeadline] = useState('Thứ Sáu tuần sau');

  const triggerCelebrate = () => {
    soundEngine.playCelebration(state.config.soundEnabled);
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
      });
    } catch {}
  };

  const handleSaveMeeting = () => {
    onUpdateState(prev => ({
      ...prev,
      weeklyMeeting: {
        ...prev.weeklyMeeting,
        title,
        weekNumber,
        reviewSummary,
        strengths,
        weaknesses,
        nextWeekPlan,
        honoredGroupId,
      },
    }));
    setIsEditing(false);
    soundEngine.playSuccess(state.config.soundEnabled);
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const task: AssignedTask = {
      id: `task-${Date.now()}`,
      title: newTaskTitle.trim(),
      assignee: newTaskAssignee.trim() || 'Cả lớp',
      deadline: newTaskDeadline.trim() || 'Tuần tới',
      status: 'pending',
    };

    onUpdateState(prev => ({
      ...prev,
      weeklyMeeting: {
        ...prev.weeklyMeeting,
        assignedTasks: [...prev.weeklyMeeting.assignedTasks, task],
      },
    }));

    setNewTaskTitle('');
    setNewTaskAssignee('');
  };

  const handleToggleTask = (taskId: string) => {
    onUpdateState(prev => ({
      ...prev,
      weeklyMeeting: {
        ...prev.weeklyMeeting,
        assignedTasks: prev.weeklyMeeting.assignedTasks.map(t =>
          t.id === taskId
            ? { ...t, status: t.status === 'done' ? 'pending' : 'done' }
            : t
        ),
      },
    }));
    soundEngine.playSuccess(state.config.soundEnabled);
  };

  const handleDeleteTask = (taskId: string) => {
    onUpdateState(prev => ({
      ...prev,
      weeklyMeeting: {
        ...prev.weeklyMeeting,
        assignedTasks: prev.weeklyMeeting.assignedTasks.filter(t => t.id !== taskId),
      },
    }));
  };

  // Leading Group and Top Students
  const leadingGroup = state.groups.find(g => g.id === honoredGroupId) || state.groups[0];
  const topStudents = state.students
    .map(s => ({ student: s, pts: calculateStudentPoints(s.id, state) }))
    .sort((a, b) => b.pts.total - a.pts.total)
    .slice(0, 4);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-800 via-indigo-700 to-purple-800 text-white rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-0.5 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
              Kịch bản Sinh Hoạt Lớp 12A9
            </span>
            <span className="px-3 py-0.5 rounded-full bg-amber-400/20 text-amber-200 text-xs font-bold">
              Tuần {meeting.weekNumber}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {meeting.title}
          </h2>
          <p className="text-indigo-200 text-xs mt-1">
            Chủ trì: GVCN {state.config.homeroomTeacher} • Lớp trưởng {state.students.find(s => s.role === 'Lớp trưởng')?.fullName}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={triggerCelebrate}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs sm:text-sm shadow-md flex items-center gap-2 transition-all"
          >
            <PartyPopper className="w-4 h-4" />
            <span>Chúc mừng Tổ xuất sắc</span>
          </button>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs sm:text-sm transition-all flex items-center gap-2"
          >
            {isEditing ? <Save className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
            <span>{isEditing ? 'Lưu kịch bản' : 'Sửa nội dung'}</span>
          </button>
        </div>
      </div>

      {/* EDIT MODE FORM */}
      {isEditing && (
        <div className="bg-white rounded-2xl p-6 border-2 border-indigo-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-indigo-600" />
            Chỉnh sửa nội dung tiết sinh hoạt tuần {weekNumber}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tiêu đề tiết sinh hoạt</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tuần học thứ</label>
              <input
                type="number"
                value={weekNumber}
                onChange={e => setWeekNumber(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Tổ được tuyên dương tuần này</label>
            <select
              value={honoredGroupId}
              onChange={e => setHonoredGroupId(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:outline-none"
            >
              {state.groups.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Tổng kết chung nề nếp & sĩ số tuần</label>
            <textarea
              rows={2}
              value={reviewSummary}
              onChange={e => setReviewSummary(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Ưu điểm & Điểm mạnh</label>
              <textarea
                rows={3}
                value={strengths}
                onChange={e => setStrengths(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tồn tại & Vấn đề cần khắc phục</label>
              <textarea
                rows={3}
                value={weaknesses}
                onChange={e => setWeaknesses(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Kế hoạch & Trọng tâm tuần tới</label>
            <textarea
              rows={3}
              value={nextWeekPlan}
              onChange={e => setNextWeekPlan(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-xl"
            >
              Đóng
            </button>
            <button
              onClick={handleSaveMeeting}
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
            >
              Lưu thay đổi kịch bản
            </button>
          </div>
        </div>
      )}

      {/* PRESENTATION CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. Tuyên dương Tổ & Học sinh dẫn đầu */}
        <div className="md:col-span-1 bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-white rounded-2xl p-6 border-2 border-amber-300 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="px-2.5 py-1 rounded-full text-xs font-black bg-amber-500 text-white flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5" />
                Vinh danh tuần
              </span>
              <button
                onClick={triggerCelebrate}
                className="text-xs text-amber-700 font-bold hover:underline"
              >
                Tung hoa 🎉
              </button>
            </div>

            <div className="text-center py-4">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Tập thể Tổ Xuất Sắc Nhất Tuần
              </div>
              <h3 className="text-2xl font-black text-slate-900 mt-1">
                {leadingGroup?.name}
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                {leadingGroup?.note}
              </p>
            </div>

            <div className="mt-4 pt-4 border-t border-amber-200/60">
              <div className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Học sinh tiêu biểu tuần:
              </div>
              <div className="space-y-1.5">
                {topStudents.map((item, idx) => (
                  <div key={item.student.id} className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-white border border-amber-100">
                    <span className="font-bold text-slate-900">
                      {idx + 1}. {item.student.fullName}
                    </span>
                    <span className="text-[11px] font-extrabold text-indigo-700">
                      {item.pts.total}đ
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 text-center">
            <p className="text-[11px] text-amber-800 font-medium italic">
              "Khen ngợi nỗ lực của từng tổ và từng học sinh!"
            </p>
          </div>
        </div>

        {/* 2. Đánh giá Ưu điểm & Tồn tại */}
        <div className="md:col-span-2 space-y-6">
          {/* Review Summary */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Presentation className="w-4 h-4 text-indigo-600" />
              Tổng kết nề nếp tuần qua
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed">
              {meeting.reviewSummary}
            </p>
          </div>

          {/* Strengths & Weaknesses 2-column box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 shadow-xs">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Ưu điểm & Điểm sáng
              </div>
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                {meeting.strengths}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 shadow-xs">
              <div className="flex items-center gap-2 text-amber-800 font-bold text-sm mb-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Vấn đề cần chấn chỉnh
              </div>
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                {meeting.weaknesses}
              </p>
            </div>
          </div>

          {/* Plan for next week */}
          <div className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-200 shadow-xs">
            <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm mb-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              Kế hoạch & Nhiệm vụ trọng tâm tuần tới
            </div>
            <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-line">
              {meeting.nextWeekPlan}
            </p>
          </div>
        </div>
      </div>

      {/* Task Assignment Table for Next Week */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-600" />
            Phân công nhiệm vụ cụ thể cho cán sự & các tổ
          </h3>
          <span className="text-xs text-slate-400">
            {meeting.assignedTasks.filter(t => t.status === 'done').length}/{meeting.assignedTasks.length} nhiệm vụ đã xong
          </span>
        </div>

        {/* Add Task Form */}
        <form onSubmit={handleAddTask} className="grid grid-cols-1 sm:grid-cols-4 gap-2 mb-4">
          <input
            type="text"
            required
            placeholder="Tên nhiệm vụ (vd: Lau máy chiếu, kiểm tra vở...)"
            value={newTaskTitle}
            onChange={e => setNewTaskTitle(e.target.value)}
            className="sm:col-span-2 px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
          <input
            type="text"
            required
            placeholder="Người phụ trách (Tổ 1 / Lớp trưởng...)"
            value={newTaskAssignee}
            onChange={e => setNewTaskAssignee(e.target.value)}
            className="px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Thời hạn..."
              value={newTaskDeadline}
              onChange={e => setNewTaskDeadline(e.target.value)}
              className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
            >
              Giao việc
            </button>
          </div>
        </form>

        {/* Tasks List */}
        <div className="space-y-2">
          {meeting.assignedTasks.map(task => (
            <div
              key={task.id}
              className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                task.status === 'done' ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <button
                  onClick={() => handleToggleTask(task.id)}
                  className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                    task.status === 'done' ? 'bg-emerald-600 text-white' : 'border border-slate-300 hover:border-indigo-600'
                  }`}
                >
                  {task.status === 'done' && <Check className="w-3.5 h-3.5" />}
                </button>
                <div className="min-w-0">
                  <p className={`text-xs sm:text-sm font-bold text-slate-800 truncate ${task.status === 'done' ? 'line-through text-slate-400' : ''}`}>
                    {task.title}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Phụ trách: <b className="text-slate-700">{task.assignee}</b> • Hạn: {task.deadline}
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleDeleteTask(task.id)}
                className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                title="Xóa nhiệm vụ"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

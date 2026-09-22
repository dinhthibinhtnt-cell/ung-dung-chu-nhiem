import React, { useState } from 'react';
import { 
  Settings, 
  School, 
  Users, 
  Volume2, 
  VolumeX, 
  Tv, 
  RotateCcw, 
  Save, 
  Sliders, 
  ShieldAlert,
  Music,
  CheckCircle2
} from 'lucide-react';
import { AppState, ClassConfig, Group } from '../types';
import { soundEngine } from '../utils/audio';

interface SettingsViewProps {
  state: AppState;
  onUpdateConfig: (newConfig: Partial<ClassConfig>) => void;
  onUpdateState: (updater: (prev: AppState) => AppState) => void;
  onRestoreDefault: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ 
  state, 
  onUpdateConfig, 
  onUpdateState, 
  onRestoreDefault 
}) => {
  const [className, setClassName] = useState(state.config.className);
  const [schoolName, setSchoolName] = useState(state.config.schoolName);
  const [schoolYear, setSchoolYear] = useState(state.config.schoolYear);
  const [homeroomTeacher, setHomeroomTeacher] = useState(state.config.homeroomTeacher);
  const [baselinePoints, setBaselinePoints] = useState(state.config.baselineStudentPoints || 100);

  // Group editing
  const [groups, setGroups] = useState<Group[]>(state.groups);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveGeneralConfig = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateConfig({
      className: className.trim(),
      schoolName: schoolName.trim(),
      schoolYear: schoolYear.trim(),
      homeroomTeacher: homeroomTeacher.trim(),
      baselineStudentPoints: baselinePoints,
    });

    onUpdateState(prev => ({
      ...prev,
      groups,
    }));

    setSavedSuccess(true);
    soundEngine.playSuccess(state.config.soundEnabled);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleGroupNoteChange = (groupId: string, newNote: string) => {
    setGroups(prev => prev.map(g => g.id === groupId ? { ...g, note: newNote } : g));
  };

  const handleGroupNameChange = (groupId: string, newName: string) => {
    setGroups(prev => prev.map(g => g.id === groupId ? { ...g, name: newName } : g));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-600" />
            Cài đặt & Tùy biến lớp học
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Tùy biến thông tin trường, lớp, giáo viên, trọng số điểm và các tổ thi đua
          </p>
        </div>

        {savedSuccess && (
          <div className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Đã lưu thành công cài đặt!</span>
          </div>
        )}
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSaveGeneralConfig} className="space-y-6">
        {/* Card 1: School & Class Info */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <School className="w-4 h-4 text-indigo-600" />
            1. Thông tin trường & lớp
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tên lớp học</label>
              <input
                type="text"
                required
                value={className}
                onChange={e => setClassName(e.target.value)}
                className="w-full px-3 py-2 text-sm font-bold text-slate-900 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tên trường</label>
              <input
                type="text"
                required
                value={schoolName}
                onChange={e => setSchoolName(e.target.value)}
                className="w-full px-3 py-2 text-sm font-medium text-slate-900 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Năm học</label>
              <input
                type="text"
                required
                value={schoolYear}
                onChange={e => setSchoolYear(e.target.value)}
                className="w-full px-3 py-2 text-sm font-medium text-slate-900 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Giáo viên chủ nhiệm</label>
              <input
                type="text"
                required
                value={homeroomTeacher}
                onChange={e => setHomeroomTeacher(e.target.value)}
                className="w-full px-3 py-2 text-sm font-bold text-indigo-700 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Points & Competition baseline */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-600" />
            2. Trọng số & Điểm chuẩn thi đua
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Điểm chuẩn đầu tuần của mỗi học sinh
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="1000"
                  value={baselinePoints}
                  onChange={e => setBaselinePoints(Number(e.target.value))}
                  className="w-32 px-3 py-2 text-base font-black text-indigo-700 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                <span className="text-xs text-slate-500">điểm (thông thường là 100 điểm)</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Tổng điểm thi đua = Điểm chuẩn + Điểm thưởng nề nếp - Điểm trừ vi phạm
              </p>
            </div>
          </div>
        </div>

        {/* Card 3: Groups Customization */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-600" />
            3. Thiết lập thông tin các Tổ thi đua
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {groups.map((grp, idx) => (
              <div key={grp.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-700">Tổ #{idx + 1}</span>
                  <span className="text-[10px] font-semibold text-slate-400">
                    {state.students.filter(s => s.groupId === grp.id).length} học sinh
                  </span>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Tên Tổ</label>
                  <input
                    type="text"
                    value={grp.name}
                    onChange={e => handleGroupNameChange(grp.id, e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Khẩu hiệu / Ghi chú</label>
                  <input
                    type="text"
                    value={grp.note || ''}
                    onChange={e => handleGroupNoteChange(grp.id, e.target.value)}
                    placeholder="Vd: Đoàn kết - Sáng tạo..."
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Lưu tất cả thiết lập</span>
          </button>
        </div>
      </form>

      {/* Danger Zone: Restore Default Data */}
      <div className="bg-rose-50/50 rounded-2xl p-6 border border-rose-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-rose-900 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            Khôi phục dữ liệu mẫu ban đầu
          </h4>
          <p className="text-xs text-rose-700 mt-1">
            Đặt lại toàn bộ danh sách 40 học sinh lớp 12A9, tiêu chí chuẩn và dữ liệu thực hành mẫu.
          </p>
        </div>

        <button
          onClick={onRestoreDefault}
          className="px-4 py-2 bg-white hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Đặt lại dữ liệu mẫu</span>
        </button>
      </div>
    </div>
  );
};

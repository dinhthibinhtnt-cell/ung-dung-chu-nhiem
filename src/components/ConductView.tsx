import React, { useState } from 'react';
import { 
  ClipboardCheck, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  Edit3, 
  Users, 
  User, 
  Calendar, 
  Settings2,
  AlertTriangle,
  History
} from 'lucide-react';
import { AppState, ConductEntry, Criteria } from '../types';
import { getTodayDateString } from '../utils/storage';
import { soundEngine } from '../utils/audio';

interface ConductViewProps {
  state: AppState;
  onUpdateState: (updater: (prev: AppState) => AppState) => void;
}

export const ConductView: React.FC<ConductViewProps> = ({ state, onUpdateState }) => {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [targetType, setTargetType] = useState<'student' | 'group'>('student');
  const [targetId, setTargetId] = useState<string>(state.students[0]?.id || '');
  const [selectedCriteriaId, setSelectedCriteriaId] = useState<string>('');
  const [customDelta, setCustomDelta] = useState<number>(0);
  const [customNote, setCustomNote] = useState<string>('');

  // Manage Criteria Modal state
  const [isCriteriaModalOpen, setIsCriteriaModalOpen] = useState(false);
  const [editingCriteria, setEditingCriteria] = useState<Criteria | null>(null);
  const [critName, setCritName] = useState('');
  const [critCode, setCritCode] = useState('');
  const [critPoints, setCritPoints] = useState<number>(2);
  const [critScope, setCritScope] = useState<'student' | 'group' | 'both'>('student');
  const [critCategory, setCritCategory] = useState<Criteria['category']>('ne_nep');

  // Filter criteria applicable to ne_nep
  const conductCriteria = state.criteriaList.filter(c => c.category === 'ne_nep' || c.category === 've_sinh');

  // When criteria selection changes, update delta
  const handleSelectCriteria = (id: string) => {
    setSelectedCriteriaId(id);
    const crit = state.criteriaList.find(c => c.id === id);
    if (crit) {
      setCustomDelta(crit.pointsDelta);
    }
  };

  // Submit conduct entry
  const handleSubmitEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const crit = state.criteriaList.find(c => c.id === selectedCriteriaId);
    if (!crit) return;

    const newEntry: ConductEntry = {
      id: `cnd-${Date.now()}`,
      date: selectedDate,
      targetType,
      targetId,
      criteriaId: crit.id,
      criteriaName: crit.name,
      category: crit.category,
      pointsDelta: customDelta,
      note: customNote.trim() || undefined,
      appliedBy: state.config.homeroomTeacher || 'GVCN',
    };

    onUpdateState(prev => ({
      ...prev,
      conductEntries: [newEntry, ...prev.conductEntries],
    }));

    setCustomNote('');
    soundEngine.playSuccess(state.config.soundEnabled);
  };

  // Delete conduct log
  const handleDeleteEntry = (id: string) => {
    onUpdateState(prev => ({
      ...prev,
      conductEntries: prev.conductEntries.filter(c => c.id !== id),
    }));
  };

  // Toggle criteria enabled
  const handleToggleCriteria = (id: string) => {
    onUpdateState(prev => ({
      ...prev,
      criteriaList: prev.criteriaList.map(c => c.id === id ? { ...c, enabled: !c.enabled } : c),
    }));
  };

  // Open criteria add modal
  const handleOpenAddCriteria = () => {
    setEditingCriteria(null);
    setCritCode(`NN${String(state.criteriaList.length + 1).padStart(2, '0')}`);
    setCritName('');
    setCritPoints(2);
    setCritScope('student');
    setCritCategory('ne_nep');
    setIsCriteriaModalOpen(true);
  };

  // Save criteria
  const handleSaveCriteria = (e: React.FormEvent) => {
    e.preventDefault();
    if (!critName.trim()) return;

    if (editingCriteria) {
      onUpdateState(prev => ({
        ...prev,
        criteriaList: prev.criteriaList.map(c => 
          c.id === editingCriteria.id 
            ? { ...c, code: critCode, name: critName.trim(), pointsDelta: critPoints, targetScope: critScope, category: critCategory }
            : c
        ),
      }));
    } else {
      const newCrit: Criteria = {
        id: `c-custom-${Date.now()}`,
        code: critCode.trim(),
        name: critName.trim(),
        category: critCategory,
        pointsDelta: critPoints,
        targetScope: critScope,
        enabled: true,
      };
      onUpdateState(prev => ({
        ...prev,
        criteriaList: [...prev.criteriaList, newCrit],
      }));
    }

    setIsCriteriaModalOpen(false);
    soundEngine.playSuccess(state.config.soundEnabled);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-indigo-600" />
            Theo dõi nề nếp & Vệ sinh lớp {state.config.className}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Ghi nhận kiểm tra đồng phục, trật tự, trực nhật lớp, sách vở và tác phong
          </p>
        </div>

        <button
          onClick={handleOpenAddCriteria}
          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors self-start md:self-auto"
        >
          <Settings2 className="w-4 h-4" />
          <span>Tùy chỉnh tiêu chí nề nếp</span>
        </button>
      </div>

      {/* 2 Column Layout: Record Form & Active Criteria */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Record Form (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4 text-indigo-600" />
            Ghi nhận nề nếp mới
          </h3>

          <form onSubmit={handleSubmitEntry} className="space-y-4">
            {/* Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Ngày ghi nhận</label>
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl">
                <Calendar className="w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="w-full text-xs sm:text-sm font-semibold text-slate-800 bg-transparent focus:outline-none"
                />
              </div>
            </div>

            {/* Target Type: Student or Group */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Đối tượng áp dụng</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setTargetType('student');
                    if (!targetId || targetId.startsWith('to-')) setTargetId(state.students[0]?.id || '');
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                    targetType === 'student'
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>Cá nhân học sinh</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTargetType('group');
                    setTargetId(state.groups[0]?.id || 'to-1');
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                    targetType === 'group'
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Toàn bộ Tổ</span>
                </button>
              </div>
            </div>

            {/* Select Target */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {targetType === 'student' ? 'Chọn học sinh' : 'Chọn Tổ'}
              </label>
              <select
                value={targetId}
                onChange={e => setTargetId(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                {targetType === 'student' ? (
                  state.students.map(s => {
                    const grp = state.groups.find(g => g.id === s.groupId);
                    return (
                      <option key={s.id} value={s.id}>
                        {s.fullName} ({s.studentCode} - {grp?.name || 'Tổ'})
                      </option>
                    );
                  })
                ) : (
                  state.groups.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))
                )}
              </select>
            </div>

            {/* Criteria */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Chọn tiêu chí nề nếp</label>
              <select
                required
                value={selectedCriteriaId}
                onChange={e => handleSelectCriteria(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="">-- Chọn tiêu chí --</option>
                {conductCriteria.filter(c => c.enabled).map(c => (
                  <option key={c.id} value={c.id}>
                    [{c.code}] {c.name} ({c.pointsDelta > 0 ? `+${c.pointsDelta}` : c.pointsDelta}đ)
                  </option>
                ))}
              </select>
            </div>

            {/* Points Delta Adjust */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mức điểm cộng / trừ (có thể tùy chỉnh)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="1"
                  value={customDelta}
                  onChange={e => setCustomDelta(Number(e.target.value))}
                  className="w-28 px-3 py-2 text-sm font-bold rounded-xl border border-slate-200 text-center focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                <span className={`text-xs font-extrabold ${customDelta > 0 ? 'text-emerald-600' : customDelta < 0 ? 'text-rose-600' : 'text-slate-500'}`}>
                  {customDelta > 0 ? `Cộng ${customDelta} điểm thi đua` : customDelta < 0 ? `Trừ ${Math.abs(customDelta)} điểm thi đua` : '0 điểm'}
                </span>
              </div>
            </div>

            {/* Note */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Chi tiết / Diễn biến</label>
              <textarea
                rows={2}
                placeholder="Ghi chú thêm về hoàn cảnh, tiết học (vd: Tiết 2 môn Hóa, trực nhật bàn ghế sạch sẽ...)"
                value={customNote}
                onChange={e => setCustomNote(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <button
              type="submit"
              disabled={!selectedCriteriaId}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Ghi nhận vào sổ nề nếp</span>
            </button>
          </form>
        </div>

        {/* Quick Criteria Grid & Recent Log (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Quick Criteria Cards */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-800">
                Các tiêu chí nề nếp chuẩn đang áp dụng
              </h3>
              <span className="text-xs text-slate-400">Bấm để bật/tắt</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {conductCriteria.map(crit => (
                <div
                  key={crit.id}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                    crit.enabled 
                      ? 'bg-slate-50/70 border-slate-200 hover:border-indigo-300' 
                      : 'bg-slate-100/50 border-slate-200 opacity-50'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono font-bold text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                        {crit.code}
                      </span>
                      <span className={`text-xs font-bold ${crit.pointsDelta > 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {crit.pointsDelta > 0 ? `+${crit.pointsDelta}` : crit.pointsDelta}đ
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-slate-800 mt-1 truncate">
                      {crit.name}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleCriteria(crit.id)}
                    className={`text-xs font-bold px-2 py-1 rounded-lg transition-colors ${
                      crit.enabled 
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                        : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                    }`}
                  >
                    {crit.enabled ? 'Đang bật' : 'Tắt'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Conduct History Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-600" />
                Nhật ký nề nếp gần đây ({state.conductEntries.length})
              </h3>
            </div>

            <div className="overflow-x-auto max-h-80">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/70 text-slate-600 text-[11px] font-bold uppercase border-b border-slate-200">
                    <th className="py-2.5 px-3">Ngày</th>
                    <th className="py-2.5 px-3">Đối tượng</th>
                    <th className="py-2.5 px-3">Nội dung</th>
                    <th className="py-2.5 px-3 text-center">Điểm</th>
                    <th className="py-2.5 px-3 text-right">Xóa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {state.conductEntries.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        Chưa có bản ghi nề nếp nào.
                      </td>
                    </tr>
                  ) : (
                    state.conductEntries.map(entry => {
                      const student = entry.targetType === 'student' ? state.students.find(s => s.id === entry.targetId) : null;
                      const group = entry.targetType === 'group' ? state.groups.find(g => g.id === entry.targetId) : null;
                      const targetName = student ? student.fullName : (group?.name || 'Tổ');

                      return (
                        <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-2.5 px-3 font-mono text-slate-500">{entry.date.slice(5)}</td>
                          <td className="py-2.5 px-3 font-bold text-slate-900">
                            {targetName}
                            {student && <span className="block text-[10px] text-slate-400 font-normal">{student.studentCode}</span>}
                          </td>
                          <td className="py-2.5 px-3 text-slate-700">
                            <span className="font-semibold">{entry.criteriaName}</span>
                            {entry.note && <span className="block text-[11px] text-slate-500 italic">{entry.note}</span>}
                          </td>
                          <td className="py-2.5 px-3 text-center font-black">
                            <span className={entry.pointsDelta > 0 ? 'text-emerald-600' : 'text-rose-600'}>
                              {entry.pointsDelta > 0 ? `+${entry.pointsDelta}` : entry.pointsDelta}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              onClick={() => handleDeleteEntry(entry.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                              title="Xóa bản ghi này"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Add / Edit Criteria Modal */}
      {isCriteriaModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              Thêm tiêu chí nề nếp mới
            </h3>

            <form onSubmit={handleSaveCriteria} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mã tiêu chí</label>
                <input
                  type="text"
                  required
                  value={critCode}
                  onChange={e => setCritCode(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tên tiêu chí nề nếp</label>
                <input
                  type="text"
                  required
                  placeholder="Vd: Không mang dép lê, Tự giác nhặt rác..."
                  value={critName}
                  onChange={e => setCritName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Điểm cộng / trừ</label>
                  <input
                    type="number"
                    step="1"
                    required
                    value={critPoints}
                    onChange={e => setCritPoints(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Điểm âm (-) nếu là vi phạm</span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Áp dụng cho</label>
                  <select
                    value={critScope}
                    onChange={e => setCritScope(e.target.value as 'student' | 'group' | 'both')}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:outline-none"
                  >
                    <option value="student">Học sinh</option>
                    <option value="group">Tổ</option>
                    <option value="both">Cả hai</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCriteriaModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
                >
                  Lưu tiêu chí
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

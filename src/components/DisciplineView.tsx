import React, { useState } from 'react';
import { 
  AlertCircle, 
  Plus, 
  ShieldAlert, 
  CheckCircle, 
  Trash2, 
  User, 
  Calendar, 
  PhoneCall, 
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { AppState, DisciplineRecord, DisciplineSeverity } from '../types';
import { getTodayDateString } from '../utils/storage';
import { soundEngine } from '../utils/audio';

interface DisciplineViewProps {
  state: AppState;
  onUpdateState: (updater: (prev: AppState) => AppState) => void;
}

const SEVERITY_CONFIG: Record<DisciplineSeverity, { label: string; bg: string; text: string; border: string; defaultPoints: number }> = {
  nhac_nho: {
    label: 'Nhắc nhở sư phạm nhẹ',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
    defaultPoints: -2,
  },
  vi_pham_nhe: {
    label: 'Vi phạm lần đầu',
    bg: 'bg-orange-50',
    text: 'text-orange-800',
    border: 'border-orange-200',
    defaultPoints: -3,
  },
  can_phoi_hop_ph: {
    label: 'Cần trao đổi với phụ huynh',
    bg: 'bg-rose-50',
    text: 'text-rose-800',
    border: 'border-rose-200',
    defaultPoints: -5,
  },
  vi_pham_nghiem_trong: {
    label: 'Vi phạm quy chế trường',
    bg: 'bg-red-50',
    text: 'text-red-900',
    border: 'border-red-300',
    defaultPoints: -10,
  },
};

export const DisciplineView: React.FC<DisciplineViewProps> = ({ state, onUpdateState }) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(state.students[0]?.id || '');
  const [severity, setSeverity] = useState<DisciplineSeverity>('nhac_nho');
  const [title, setTitle] = useState('');
  const [pointsDelta, setPointsDelta] = useState<number>(-2);
  const [actionTaken, setActionTaken] = useState('Gặp riêng trao đổi, nhắc nhở và phân công bạn cùng tiến hỗ trợ');
  const [notes, setNotes] = useState('');

  const handleSeverityChange = (newSev: DisciplineSeverity) => {
    setSeverity(newSev);
    setPointsDelta(SEVERITY_CONFIG[newSev].defaultPoints);
  };

  const handleAddDiscipline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !selectedStudentId) return;

    const newRecord: DisciplineRecord = {
      id: `disc-${Date.now()}`,
      date: getTodayDateString(),
      studentId: selectedStudentId,
      title: title.trim(),
      severity,
      pointsDelta: pointsDelta < 0 ? pointsDelta : -Math.abs(pointsDelta),
      actionTaken: actionTaken.trim() || 'Giáo viên nhắc nhở định hướng',
      notes: notes.trim() || undefined,
      resolved: false,
    };

    onUpdateState(prev => ({
      ...prev,
      disciplineRecords: [newRecord, ...prev.disciplineRecords],
    }));

    setTitle('');
    setNotes('');
    soundEngine.playSuccess(state.config.soundEnabled);
  };

  const handleToggleResolved = (id: string) => {
    onUpdateState(prev => ({
      ...prev,
      disciplineRecords: prev.disciplineRecords.map(d => 
        d.id === id ? { ...d, resolved: !d.resolved } : d
      ),
    }));
    soundEngine.playSuccess(state.config.soundEnabled);
  };

  const handleDeleteDiscipline = (id: string) => {
    onUpdateState(prev => ({
      ...prev,
      disciplineRecords: prev.disciplineRecords.filter(d => d.id !== id),
    }));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-indigo-600" />
            Sổ Nhắc Nhở & Hỗ Trợ Rèn Luyện Lớp {state.config.className}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Ghi nhận vi phạm với tinh thần sư phạm nhân văn, định hướng giáo dục và theo dõi sự chuyển biến tích cực
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-indigo-50 text-indigo-800 border border-indigo-200 rounded-full text-xs font-bold flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-indigo-600" />
            {state.disciplineRecords.filter(d => !d.resolved).length} trường hợp đang đồng hành
          </span>
        </div>
      </div>

      {/* 2 Column Layout: Form & History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4 text-indigo-600" />
            Ghi nhận trường hợp cần nhắc nhở
          </h3>

          <form onSubmit={handleAddDiscipline} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Chọn học sinh</label>
              <select
                value={selectedStudentId}
                onChange={e => setSelectedStudentId(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                {state.students.map(s => {
                  const grp = state.groups.find(g => g.id === s.groupId);
                  return (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.studentCode} - {grp?.name})
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mức độ xem xét</label>
                <select
                  value={severity}
                  onChange={e => handleSeverityChange(e.target.value as DisciplineSeverity)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 focus:outline-none"
                >
                  {Object.entries(SEVERITY_CONFIG).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Điểm trừ thi đua</label>
                <input
                  type="number"
                  step="1"
                  value={pointsDelta}
                  onChange={e => setPointsDelta(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm font-bold text-rose-600 rounded-xl border border-slate-200 text-center focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nội dung sự việc cần nhắc nhở *</label>
              <input
                type="text"
                required
                placeholder="Vd: Chưa làm bài tập Lý, Nói chuyện trong giờ..."
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Biện pháp giáo dục / Hướng xử lý của GVCN</label>
              <textarea
                rows={2}
                value={actionTaken}
                onChange={e => setActionTaken(e.target.value)}
                placeholder="Vd: Trao đổi riêng sau giờ học, đổi chỗ ngồi, phối hợp phụ huynh hỗ trợ..."
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Ghi chú theo dõi chuyển biến</label>
              <input
                type="text"
                placeholder="Vd: Em đã xin lỗi và hứa hoàn thành bài tập..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Ghi nhận vào sổ theo dõi</span>
            </button>
          </form>
        </div>

        {/* List of cases (7 Cols) */}
        <div className="lg:col-span-7 space-y-3">
          {state.disciplineRecords.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center text-slate-400">
              Lớp 12A9 hiện không có vi phạm nào chưa xử lý! Nề nếp lớp đang rất tốt.
            </div>
          ) : (
            state.disciplineRecords.map(disc => {
              const student = state.students.find(s => s.id === disc.studentId);
              const group = state.groups.find(g => g.id === student?.groupId);
              const conf = SEVERITY_CONFIG[disc.severity] || SEVERITY_CONFIG.nhac_nho;

              return (
                <div
                  key={disc.id}
                  className={`bg-white rounded-2xl p-5 border shadow-xs transition-all ${
                    disc.resolved ? 'border-slate-200 bg-slate-50/50' : `${conf.border}`
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-slate-900">
                        {student?.fullName}
                      </h4>
                      <span className="text-xs text-slate-500">
                        ({student?.studentCode} • {group?.name})
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${conf.bg} ${conf.text} ${conf.border}`}>
                        {conf.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-rose-600">
                        {disc.pointsDelta}đ
                      </span>
                      <button
                        onClick={() => handleToggleResolved(disc.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 ${
                          disc.resolved 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                        }`}
                        title="Đánh dấu học sinh đã có tiến bộ và khắc phục"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>{disc.resolved ? 'Đã khắc phục / tiến bộ' : 'Đang theo dõi'}</span>
                      </button>
                      <button
                        onClick={() => handleDeleteDiscipline(disc.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs font-bold text-slate-800">
                    {disc.title}
                  </p>

                  <div className="mt-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                    <p className="text-slate-700">
                      <span className="font-semibold text-slate-900">Hướng giáo dục: </span>
                      {disc.actionTaken}
                    </p>
                    {disc.notes && (
                      <p className="text-slate-500 italic">
                        <span className="font-semibold text-slate-700">Ghi chú: </span>
                        {disc.notes}
                      </p>
                    )}
                  </div>

                  <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
                    <span>Ngày ghi nhận: {disc.date}</span>
                    {student?.phoneParent && (
                      <span>SĐT Phụ huynh: {student.phoneParent}</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

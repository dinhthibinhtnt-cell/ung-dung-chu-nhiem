import React, { useState } from 'react';
import { 
  HeartHandshake, 
  Plus, 
  Sparkles, 
  Award, 
  Star, 
  Trash2, 
  Printer, 
  Calendar, 
  X,
  FileCheck2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AppState, RewardCategory, RewardRecord } from '../types';
import { getTodayDateString } from '../utils/storage';
import { soundEngine } from '../utils/audio';

interface RewardsViewProps {
  state: AppState;
  onUpdateState: (updater: (prev: AppState) => AppState) => void;
}

const CATEGORY_LABELS: Record<RewardCategory, string> = {
  hoc_tap: 'Thành tích học tập',
  ne_nep: 'Thành tích nề nếp',
  trach_nhiem: 'Tinh thần trách nhiệm',
  tap_the: 'Hoạt động tập thể',
  viec_tot: 'Gương việc tốt',
  tien_bo: 'Tiến bộ vượt bậc',
  khac: 'Nội dung khác',
};

export const RewardsView: React.FC<RewardsViewProps> = ({ state, onUpdateState }) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(state.students[0]?.id || '');
  const [rewardCategory, setRewardCategory] = useState<RewardCategory>('hoc_tap');
  const [rewardTitle, setRewardTitle] = useState('');
  const [rewardPoints, setRewardPoints] = useState<number>(5);
  const [rewardDescription, setRewardDescription] = useState('');
  const [honorInMeeting, setHonorInMeeting] = useState(true);

  // Certificate Modal View
  const [certificateRecord, setCertificateRecord] = useState<RewardRecord | null>(null);

  const handleAddReward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rewardTitle.trim() || !selectedStudentId) return;

    const newRecord: RewardRecord = {
      id: `rew-${Date.now()}`,
      date: getTodayDateString(),
      studentId: selectedStudentId,
      title: rewardTitle.trim(),
      category: rewardCategory,
      pointsDelta: rewardPoints,
      description: rewardDescription.trim() || undefined,
      honoredInMeeting: honorInMeeting,
    };

    onUpdateState(prev => ({
      ...prev,
      rewardRecords: [newRecord, ...prev.rewardRecords],
    }));

    setRewardTitle('');
    setRewardDescription('');
    soundEngine.playCelebration(state.config.soundEnabled);

    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    } catch {}
  };

  const handleDeleteReward = (id: string) => {
    onUpdateState(prev => ({
      ...prev,
      rewardRecords: prev.rewardRecords.filter(r => r.id !== id),
    }));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-amber-500" />
            Sổ Khen Thưởng & Ghi Nhận Việc Tốt Lớp {state.config.className}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Ghi nhận và tôn vinh hành động đẹp, thành tích học tập và sự tiến bộ của học sinh
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-xs font-bold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            {state.rewardRecords.length} lần khen thưởng ghi nhận
          </span>
        </div>
      </div>

      {/* Main Grid: Form + Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form to add reward (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4 text-amber-500" />
            Tạo bản ghi khen thưởng mới
          </h3>

          <form onSubmit={handleAddReward} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Chọn học sinh được khen</label>
              <select
                value={selectedStudentId}
                onChange={e => setSelectedStudentId(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20"
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">Lĩnh vực khen thưởng</label>
                <select
                  value={rewardCategory}
                  onChange={e => setRewardCategory(e.target.value as RewardCategory)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 focus:outline-none"
                >
                  {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Điểm cộng thi đua</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={rewardPoints}
                    onChange={e => setRewardPoints(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm font-bold text-emerald-600 rounded-xl border border-slate-200 text-center focus:outline-none"
                  />
                  <span className="text-xs font-bold text-emerald-600">điểm</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tiêu đề khen thưởng / Việc tốt *</label>
              <input
                type="text"
                required
                placeholder="Vd: Đạt điểm 10 môn Toán, Giúp đỡ bạn cùng tiến..."
                value={rewardTitle}
                onChange={e => setRewardTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Chi tiết tuyên dương</label>
              <textarea
                rows={2}
                placeholder="Ghi rõ hành động cụ thể để tuyên dương trước lớp trong tiết sinh hoạt..."
                value={rewardDescription}
                onChange={e => setRewardDescription(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>

            <div className="flex items-center gap-2 p-3 bg-amber-50/70 border border-amber-200 rounded-xl">
              <input
                type="checkbox"
                id="honorMeeting"
                checked={honorInMeeting}
                onChange={e => setHonorInMeeting(e.target.checked)}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
              />
              <label htmlFor="honorMeeting" className="text-xs font-semibold text-amber-900 cursor-pointer">
                Đưa vào danh sách tuyên dương trong tiết sinh hoạt lớp cuối tuần
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Ghi nhận & Tuyên dương ngay</span>
            </button>
          </form>
        </div>

        {/* List of Rewards (7 Cols) */}
        <div className="lg:col-span-7 space-y-3">
          {state.rewardRecords.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center text-slate-400">
              Chưa có ghi nhận khen thưởng nào. Hãy thêm các tấm gương người tốt việc tốt của lớp 12A9!
            </div>
          ) : (
            state.rewardRecords.map(rew => {
              const student = state.students.find(s => s.id === rew.studentId);
              const group = state.groups.find(g => g.id === student?.groupId);

              return (
                <div
                  key={rew.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-amber-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-slate-900">
                          {student?.fullName}
                        </h4>
                        <span className="text-xs text-slate-500 font-medium">
                          ({student?.studentCode} • {group?.name})
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          {CATEGORY_LABELS[rew.category] || 'Khen thưởng'}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-800 mt-1">
                        {rew.title}
                      </p>
                      {rew.description && (
                        <p className="text-xs text-slate-500 mt-0.5 italic">
                          "{rew.description}"
                        </p>
                      )}
                      <div className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        <span>Ngày ghi nhận: {rew.date}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="text-right">
                      <span className="text-lg font-black text-emerald-600">+{rew.pointsDelta}</span>
                      <span className="text-[10px] text-slate-400 block">điểm thi đua</span>
                    </div>

                    <button
                      onClick={() => setCertificateRecord(rew)}
                      className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold transition-colors flex items-center gap-1"
                      title="Xem và in thư khen"
                    >
                      <FileCheck2 className="w-3.5 h-3.5" />
                      <span>Thư khen</span>
                    </button>

                    <button
                      onClick={() => handleDeleteReward(rew.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Xóa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Honor Certificate Modal for Projector / Print */}
      {certificateRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-8 shadow-2xl border-4 border-amber-300 relative text-center animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setCertificateRecord(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto text-amber-600 mb-3 shadow-inner">
              <Star className="w-8 h-8 fill-amber-500 text-amber-500" />
            </div>

            <div className="uppercase text-xs font-black text-amber-700 tracking-widest mb-1">
              {state.config.schoolName}
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              THƯ KHEN & TUYÊN DƯƠNG
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Tập thể Lớp {state.config.className} • Năm học {state.config.schoolYear}
            </p>

            <div className="py-4 px-6 bg-amber-50/70 border border-amber-200 rounded-2xl mb-6">
              <p className="text-xs text-slate-600 mb-1">Giáo viên chủ nhiệm trân trọng tuyên dương em:</p>
              <h3 className="text-2xl font-extrabold text-indigo-900">
                {state.students.find(s => s.id === certificateRecord.studentId)?.fullName}
              </h3>
              <p className="text-xs font-semibold text-slate-700 mt-1">
                Lớp {state.config.className} ({state.groups.find(g => g.id === state.students.find(s => s.id === certificateRecord.studentId)?.groupId)?.name})
              </p>
            </div>

            <div className="space-y-2 mb-6">
              <p className="text-sm font-bold text-slate-900">
                "{certificateRecord.title}"
              </p>
              {certificateRecord.description && (
                <p className="text-xs text-slate-600 italic">
                  {certificateRecord.description}
                </p>
              )}
              <div className="inline-block mt-2 px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-extrabold rounded-full">
                Ghi nhận thưởng +{certificateRecord.pointsDelta} điểm thi đua
              </div>
            </div>

            <div className="flex justify-between items-end pt-4 border-t border-slate-100 text-xs text-slate-500">
              <div className="text-left">
                <span>Ngày: {certificateRecord.date}</span>
                <span className="block text-[10px] text-slate-400">Lưu vào sổ chủ nhiệm</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-slate-800 block">Giáo viên chủ nhiệm</span>
                <span className="italic text-slate-700">{state.config.homeroomTeacher}</span>
              </div>
            </div>

            <div className="mt-6 flex justify-center gap-3 no-print">
              <button
                onClick={() => window.print()}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs"
              >
                <Printer className="w-4 h-4" />
                <span>In thư khen này</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

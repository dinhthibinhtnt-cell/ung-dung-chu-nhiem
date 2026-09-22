import React, { useState } from 'react';
import { 
  Trophy, 
  Medal, 
  Crown, 
  Sparkles, 
  Star, 
  Eye, 
  EyeOff, 
  Heart, 
  PartyPopper,
  CheckCircle2,
  TrendingUp,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AppState } from '../types';
import { calculateGroupPoints, calculateStudentPoints } from '../utils/storage';
import { soundEngine } from '../utils/audio';

interface RankingViewProps {
  state: AppState;
  onUpdateConfig: (newConfig: Partial<AppState['config']>) => void;
}

export const RankingView: React.FC<RankingViewProps> = ({ state, onUpdateConfig }) => {
  const [rankingTarget, setRankingTarget] = useState<'group' | 'student'>('group');

  const triggerConfetti = () => {
    soundEngine.playCelebration(state.config.soundEnabled);
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore if blocked
    }
  };

  // Group Rankings
  const groupRankings = state.groups.map(g => {
    const stats = calculateGroupPoints(g.id, state);
    return {
      group: g,
      ...stats,
    };
  }).sort((a, b) => b.total - a.total);

  // Student Rankings (Sorted from top, without public low-score humiliation)
  const studentRankings = state.students.map(st => {
    const pts = calculateStudentPoints(st.id, state);
    const group = state.groups.find(g => g.id === st.groupId);
    const rewards = state.rewardRecords.filter(r => r.studentId === st.id);
    const disciplines = state.disciplineRecords.filter(d => d.studentId === st.id);

    return {
      student: st,
      group,
      ...pts,
      rewardsCount: rewards.length,
      disciplineCount: disciplines.length,
      topReward: rewards[0]?.title,
    };
  }).sort((a, b) => b.total - a.total);

  const topStudents = studentRankings.slice(0, 10); // Only highlight top exemplary students

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header with Enable / Disable toggle */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              Xếp hạng & Bảng vàng thi đua lớp {state.config.className}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
              Vinh danh tích cực
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tuyên dương các tập thể tổ và cá nhân gương mẫu, không bêu tên hay tạo áp lực tiêu cực
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Toggle Leaderboard Visibility */}
          <button
            onClick={() => onUpdateConfig({ enableLeaderboard: !state.config.enableLeaderboard })}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border ${
              state.config.enableLeaderboard
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
            }`}
          >
            {state.config.enableLeaderboard ? <Eye className="w-4 h-4 text-emerald-600" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
            <span>{state.config.enableLeaderboard ? 'Bảng xếp hạng đang Bật' : 'Bảng xếp hạng đang Tắt'}</span>
          </button>

          {/* Celebrate Confetti Button */}
          <button
            onClick={triggerConfetti}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-amber-200 transition-all"
          >
            <PartyPopper className="w-4 h-4" />
            <span>Pháo hoa chúc mừng</span>
          </button>
        </div>
      </div>

      {/* When disabled */}
      {!state.config.enableLeaderboard ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-3">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <EyeOff className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Chức năng xếp hạng hiện đang tắt</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Giáo viên đã tạm ẩn bảng xếp hạng để tập trung vào việc khích lệ và đồng hành cá nhân với học sinh. Bấm nút phía trên để bật lại bất cứ lúc nào.
          </p>
        </div>
      ) : (
        <>
          {/* Target Tabs (Group / Student) */}
          <div className="flex items-center justify-center">
            <div className="p-1 bg-slate-200/70 rounded-xl flex items-center gap-1">
              <button
                onClick={() => setRankingTarget('group')}
                className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${
                  rankingTarget === 'group'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Xếp hạng 4 Tổ
              </button>
              <button
                onClick={() => setRankingTarget('student')}
                className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${
                  rankingTarget === 'student'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Gương mặt tiêu biểu (Top 10)
              </button>
            </div>
          </div>

          {/* GROUP RANKINGS PODIUM & LIST */}
          {rankingTarget === 'group' && (
            <div className="space-y-6">
              {/* Podium Visual */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {groupRankings.map((item, idx) => {
                  const podiumColors = [
                    { border: 'border-amber-400', bg: 'bg-gradient-to-b from-amber-50 to-white', badge: 'bg-amber-500 text-white', icon: Crown, title: 'Quán quân tuần' },
                    { border: 'border-slate-300', bg: 'bg-gradient-to-b from-slate-50 to-white', badge: 'bg-slate-600 text-white', icon: Medal, title: 'Á quân 1' },
                    { border: 'border-amber-700/30', bg: 'bg-gradient-to-b from-amber-50/40 to-white', badge: 'bg-amber-700 text-white', icon: Medal, title: 'Á quân 2' },
                    { border: 'border-indigo-200', bg: 'bg-gradient-to-b from-indigo-50/30 to-white', badge: 'bg-indigo-600 text-white', icon: TrendingUp, title: 'Tổ nỗ lực' },
                  ];
                  const style = podiumColors[idx] || podiumColors[3];
                  const Icon = style.icon;

                  return (
                    <div
                      key={item.group.id}
                      className={`rounded-2xl p-6 border-2 ${style.border} ${style.bg} shadow-xs relative overflow-hidden flex flex-col justify-between`}
                    >
                      <div className="flex items-start justify-between">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-black flex items-center gap-1 ${style.badge}`}>
                          <Icon className="w-3.5 h-3.5" />
                          Hạng {idx + 1}
                        </span>
                        <span className="text-2xl font-black text-indigo-700">
                          {item.total}đ
                        </span>
                      </div>

                      <div className="my-6 text-center">
                        <h3 className="text-lg font-black text-slate-900">{item.group.name}</h3>
                        <p className="text-xs font-semibold text-slate-500 mt-1">{style.title}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{item.group.note}</p>
                      </div>

                      <div className="pt-3 border-t border-slate-200/70 text-xs space-y-1 text-slate-600">
                        <div className="flex justify-between">
                          <span>Sĩ số thành viên:</span>
                          <span className="font-bold">{item.studentCount} HS</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Điểm TB cá nhân:</span>
                          <span className="font-bold text-slate-800">{item.averageStudentPoints}đ</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Điểm nề nếp Tổ:</span>
                          <span className="font-bold text-emerald-600">+{item.bonus} / -{item.penalty}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STUDENT TOP EXEMPLARY LIST */}
          {rankingTarget === 'student' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    Bảng vinh danh Top 10 học sinh tích cực & tiến bộ nhất
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Tuyên dương các bạn có điểm thi đua cao, việc tốt và tinh thần trách nhiệm
                  </p>
                </div>
                <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  Sao sáng tuần 12A9
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100/70 text-slate-600 text-[11px] font-bold uppercase border-b border-slate-200">
                      <th className="py-3 px-4 w-16 text-center">Vị trí</th>
                      <th className="py-3 px-4">Họ và tên</th>
                      <th className="py-3 px-4">Tổ</th>
                      <th className="py-3 px-4 text-center">Điểm thi đua</th>
                      <th className="py-3 px-4">Thành tích nổi bật</th>
                      <th className="py-3 px-4 text-center">Huy hiệu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                    {topStudents.map((item, idx) => (
                      <tr key={item.student.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4 text-center">
                          {idx === 0 ? (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-400 text-white font-black text-xs shadow-xs">
                              🥇
                            </span>
                          ) : idx === 1 ? (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-300 text-slate-800 font-black text-xs shadow-xs">
                              🥈
                            </span>
                          ) : idx === 2 ? (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-600 text-white font-black text-xs shadow-xs">
                              🥉
                            </span>
                          ) : (
                            <span className="font-bold text-slate-400">{idx + 1}</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{item.student.fullName}</div>
                          <div className="text-[11px] text-slate-400">{item.student.role}</div>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-600">
                          {item.group?.name}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="text-base font-black text-indigo-700">{item.total}</span>
                          <span className="text-[10px] text-slate-400 block">(+{item.bonus} / -{item.penalty})</span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {item.topReward || (item.bonus > 0 ? 'Chuyên cần & nề nếp tốt' : 'Gương mẫu hoàn thành nhiệm vụ')}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                            {idx === 0 ? 'Sao Gương Mẫu' : idx < 3 ? 'Sao Chăm Ngoan' : 'Sao Nỗ Lực'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

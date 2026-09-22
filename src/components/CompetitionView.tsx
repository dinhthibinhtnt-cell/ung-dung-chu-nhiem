import React, { useState, useMemo } from 'react';
import { 
  Award, 
  Search, 
  Download, 
  Trophy, 
  TrendingUp, 
  Filter, 
  SlidersHorizontal,
  ChevronDown,
  Layers,
  CheckCircle,
  Plus
} from 'lucide-react';
import { AppState, CriteriaCategory } from '../types';
import { calculateStudentPoints, calculateGroupPoints, getTodayDateString } from '../utils/storage';
import { soundEngine } from '../utils/audio';

interface CompetitionViewProps {
  state: AppState;
  onUpdateState: (updater: (prev: AppState) => AppState) => void;
}

const CATEGORY_NAMES: Record<CriteriaCategory, string> = {
  chuyen_can: 'Chuyên cần',
  ne_nep: 'Nề nếp',
  hoc_tap: 'Học tập',
  ve_sinh: 'Vệ sinh & Trực nhật',
  tap_the: 'Hoạt động tập thể',
  y_thuc: 'Ý thức & Trách nhiệm',
  khen_thuong: 'Khen thưởng',
  vi_pham: 'Vi phạm',
  khac: 'Khác',
};

export const CompetitionView: React.FC<CompetitionViewProps> = ({ state, onUpdateState }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGroup, setFilterGroup] = useState<string>('all');
  const [viewTab, setViewTab] = useState<'students' | 'groups' | 'criteria'>('students');

  // Export competition score sheet to CSV
  const handleExportScoresCsv = () => {
    const headers = ['STT', 'Mã HS', 'Họ Và Tên', 'Tổ', 'Điểm Chuẩn', 'Điểm Cộng', 'Điểm Trừ', 'Tổng Điểm Thi Đua', 'Xếp Loại'];
    const rows = state.students.map((st, idx) => {
      const group = state.groups.find(g => g.id === st.groupId)?.name || st.groupId;
      const pts = calculateStudentPoints(st.id, state);
      let rank = 'Tốt';
      if (pts.total >= 105) rank = 'Xuất sắc';
      else if (pts.total >= 100) rank = 'Tốt';
      else if (pts.total >= 90) rank = 'Khá';
      else rank = 'Cần cố gắng';

      return [
        idx + 1,
        `"${st.studentCode}"`,
        `"${st.fullName}"`,
        `"${group}"`,
        state.config.baselineStudentPoints || 100,
        pts.bonus,
        pts.penalty,
        pts.total,
        `"${rank}"`,
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BangDiemThiDua_${state.config.className}_${getTodayDateString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filtered students with scores
  const studentScores = useMemo(() => {
    return state.students
      .map(st => {
        const pts = calculateStudentPoints(st.id, state);
        const group = state.groups.find(g => g.id === st.groupId);
        let rank = 'Tốt';
        let badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        if (pts.total >= 105) {
          rank = 'Xuất sắc';
          badgeColor = 'bg-indigo-50 text-indigo-700 border-indigo-200';
        } else if (pts.total >= 100) {
          rank = 'Tốt';
          badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        } else if (pts.total >= 90) {
          rank = 'Khá';
          badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
        } else {
          rank = 'Cần cố gắng';
          badgeColor = 'bg-rose-50 text-rose-700 border-rose-200';
        }

        return {
          student: st,
          group,
          ...pts,
          rank,
          badgeColor,
        };
      })
      .filter(item => {
        const matchName = item.student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.student.studentCode.toLowerCase().includes(searchTerm.toLowerCase());
        const matchGroup = filterGroup === 'all' || item.student.groupId === filterGroup;
        return matchName && matchGroup;
      })
      .sort((a, b) => b.total - a.total);
  }, [state, searchTerm, filterGroup]);

  // Group scores summary
  const groupScores = useMemo(() => {
    return state.groups.map(g => {
      const stats = calculateGroupPoints(g.id, state);
      return {
        group: g,
        ...stats,
      };
    }).sort((a, b) => b.total - a.total);
  }, [state]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-600" />
            Bảng điểm & Hệ thống thi đua lớp {state.config.className}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Tổng hợp điểm chuyên cần, nề nếp, học tập, trực nhật và khen thưởng vi phạm
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportScoresCsv}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Xuất bảng điểm CSV</span>
          </button>
          <div className="p-1 bg-slate-100 rounded-xl flex items-center gap-1">
            <button
              onClick={() => setViewTab('students')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewTab === 'students' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              Điểm học sinh ({state.students.length})
            </button>
            <button
              onClick={() => setViewTab('groups')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewTab === 'groups' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              Điểm 4 Tổ
            </button>
            <button
              onClick={() => setViewTab('criteria')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewTab === 'criteria' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              Hệ thống tiêu chí
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: STUDENT SCORES */}
      {viewTab === 'students' && (
        <>
          {/* Filters */}
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

          {/* Scores Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 text-[11px] sm:text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                    <th className="py-3.5 px-4 w-12 text-center">Hạng</th>
                    <th className="py-3.5 px-4">Họ và tên</th>
                    <th className="py-3.5 px-4 w-28">Tổ</th>
                    <th className="py-3.5 px-4 text-center">Điểm gốc</th>
                    <th className="py-3.5 px-4 text-center">Điểm cộng (+)</th>
                    <th className="py-3.5 px-4 text-center">Điểm trừ (-)</th>
                    <th className="py-3.5 px-4 text-center">Tổng điểm thi đua</th>
                    <th className="py-3.5 px-4 text-center">Xếp loại</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                  {studentScores.map((item, idx) => (
                    <tr key={item.student.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 text-center font-bold">
                        {idx === 0 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-xs font-black">1</span>
                        ) : idx === 1 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 text-slate-800 text-xs font-black">2</span>
                        ) : idx === 2 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-50 text-amber-700 text-xs font-black">3</span>
                        ) : (
                          <span className="text-slate-400">{idx + 1}</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{item.student.fullName}</div>
                        <div className="text-[11px] font-mono text-slate-400">{item.student.studentCode}</div>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-600">
                        {item.group?.name}
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-slate-400">
                        {state.config.baselineStudentPoints || 100}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-emerald-600">
                        +{item.bonus}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-rose-600">
                        -{item.penalty}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-base font-black text-indigo-700">
                          {item.total}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${item.badgeColor}`}>
                          {item.rank}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* TAB 2: GROUP COMPARISON */}
      {viewTab === 'groups' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {groupScores.map((item, idx) => (
            <div 
              key={item.group.id}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg ${
                    idx === 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                    #{idx + 1}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{item.group.name}</h3>
                    <p className="text-xs text-slate-500">{item.studentCount} thành viên • {item.group.note}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-indigo-700">{item.total}</span>
                  <span className="text-xs text-slate-400 block">điểm tổng</span>
                </div>
              </div>

              {/* Stats breakdown */}
              <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl text-center text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">TB Thành viên</span>
                  <span className="font-bold text-slate-800">{item.averageStudentPoints}đ</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Điểm Tổ cộng</span>
                  <span className="font-bold text-emerald-600">+{item.bonus}đ</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Điểm Tổ trừ</span>
                  <span className="font-bold text-rose-600">-{item.penalty}đ</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: CRITERIA REPOSITORY */}
      {viewTab === 'criteria' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Danh mục các nhóm tiêu chí thi đua (Toàn diện)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Bao gồm: Chuyên cần, Nề nếp, Học tập, Vệ sinh trực nhật, Hoạt động tập thể, Ý thức, Khen thưởng và Vi phạm
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.keys(CATEGORY_NAMES).map(catKey => {
              const category = catKey as CriteriaCategory;
              const items = state.criteriaList.filter(c => c.category === category);
              if (items.length === 0) return null;

              return (
                <div key={category} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                  <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      {CATEGORY_NAMES[category]} ({items.length})
                    </h4>
                  </div>

                  <div className="space-y-2">
                    {items.map(crit => (
                      <div key={crit.id} className="flex items-center justify-between text-xs py-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-mono text-[10px] text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                            {crit.code}
                          </span>
                          <span className="font-medium text-slate-800 truncate">{crit.name}</span>
                        </div>
                        <span className={`font-black ml-2 shrink-0 ${crit.pointsDelta > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {crit.pointsDelta > 0 ? `+${crit.pointsDelta}` : crit.pointsDelta}đ
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

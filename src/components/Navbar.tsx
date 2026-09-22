import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  CalendarCheck2, 
  ClipboardCheck, 
  Award, 
  Trophy, 
  HeartHandshake, 
  AlertCircle, 
  Presentation, 
  BarChart3, 
  Settings, 
  Volume2, 
  VolumeX, 
  Music, 
  Tv, 
  Printer, 
  Download, 
  Upload, 
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { AppState } from '../types';
import { soundEngine } from '../utils/audio';
import { exportAppState } from '../utils/storage';

interface NavbarProps {
  state: AppState;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onUpdateConfig: (newConfig: Partial<AppState['config']>) => void;
  onRestoreSampleData: () => void;
  onImportJson: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  state,
  activeTab,
  setActiveTab,
  onUpdateConfig,
  onRestoreSampleData,
  onImportJson,
}) => {
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const navItems = [
    { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'students', label: 'Học sinh', icon: Users },
    { id: 'attendance', label: 'Chuyên cần', icon: CalendarCheck2 },
    { id: 'conduct', label: 'Nề nếp', icon: ClipboardCheck },
    { id: 'competition', label: 'Thi đua', icon: Award },
    { id: 'ranking', label: 'Xếp hạng', icon: Trophy },
    { id: 'rewards', label: 'Khen thưởng', icon: HeartHandshake },
    { id: 'discipline', label: 'Nhắc nhở', icon: AlertCircle },
    { id: 'meeting', label: 'Sinh hoạt lớp', icon: Presentation },
    { id: 'reports', label: 'Báo cáo', icon: BarChart3 },
    { id: 'settings', label: 'Cấu hình', icon: Settings },
  ];

  const toggleSound = () => {
    const next = !state.config.soundEnabled;
    onUpdateConfig({ soundEnabled: next });
    if (next) soundEngine.playSuccess(true);
  };

  const toggleAmbient = () => {
    const next = !state.config.ambientMusicEnabled;
    onUpdateConfig({ ambientMusicEnabled: next });
    soundEngine.toggleAmbient(next);
  };

  const toggleProjector = () => {
    const next = !state.config.projectorMode;
    onUpdateConfig({ projectorMode: next });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs no-print">
      {/* Top Banner Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Class and Teacher Info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-800 text-white flex items-center justify-center font-extrabold text-base shadow-sm shadow-indigo-200">
            {state.config.className || '12A9'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Trợ lý chủ nhiệm lớp {state.config.className}
              </h1>
              <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                Năm học {state.config.schoolYear}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              GVCN: <span className="text-slate-700 font-semibold">{state.config.homeroomTeacher || 'Chưa đặt'}</span> • {state.config.schoolName}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {/* Quick Notice Pill */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Dữ liệu mẫu 12A9</span>
          </div>

          {/* Projector Mode Toggle */}
          <button
            onClick={toggleProjector}
            title={state.config.projectorMode ? 'Tắt chế độ máy chiếu' : 'Bật chế độ máy chiếu (chữ to)'}
            className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              state.config.projectorMode
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Tv className="w-4 h-4" />
            <span className="hidden sm:inline">Máy chiếu</span>
          </button>

          {/* Sound FX Toggle */}
          <button
            onClick={toggleSound}
            title={state.config.soundEnabled ? 'Tắt âm thanh hiệu ứng' : 'Bật âm thanh hiệu ứng'}
            className={`p-2 rounded-lg text-xs font-medium transition-colors ${
              state.config.soundEnabled
                ? 'bg-slate-100 text-indigo-700 hover:bg-slate-200'
                : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
            }`}
          >
            {state.config.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Ambient Music Toggle */}
          <button
            onClick={toggleAmbient}
            title={state.config.ambientMusicEnabled ? 'Tắt nhạc nền nhẹ' : 'Bật nhạc chuông êm dịu tập trung'}
            className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors ${
              state.config.ambientMusicEnabled
                ? 'bg-emerald-100 text-emerald-800 animate-pulse'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            <Music className="w-4 h-4" />
            <span className="hidden md:inline text-xs">
              {state.config.ambientMusicEnabled ? 'Đang phát nhạc' : 'Nhạc nền'}
            </span>
          </button>

          {/* Print Quick Button */}
          <button
            onClick={handlePrint}
            title="In báo cáo / Lưu PDF"
            className="p-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-medium"
          >
            <Printer className="w-4 h-4" />
          </button>

          {/* Backup / Export */}
          <button
            onClick={() => exportAppState(state)}
            title="Xuất sao lưu dữ liệu (JSON)"
            className="p-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-medium"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Import JSON input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={onImportJson}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Phục hồi dữ liệu từ file JSON"
            className="p-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-medium"
          >
            <Upload className="w-4 h-4" />
          </button>

          {/* Restore Sample Data */}
          <button
            onClick={() => setShowRestoreModal(true)}
            title="Khôi phục dữ liệu mẫu ban đầu"
            className="p-2 rounded-lg bg-slate-100 text-amber-700 hover:bg-amber-100 text-xs font-medium"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-2 sm:px-6">
        <nav className="flex space-x-1 overflow-x-auto py-1 scrollbar-none" aria-label="Tabs">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`tab-btn-${item.id}`}
                onClick={() => {
                  setActiveTab(item.id);
                  if (state.config.soundEnabled) soundEngine.playSuccess(true);
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Restore Confirmation Modal */}
      {showRestoreModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-amber-600 mb-4">
              <div className="p-3 bg-amber-50 rounded-xl">
                <RefreshCw className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Khôi phục dữ liệu mẫu?</h3>
            </div>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              Thao tác này sẽ đặt lại danh sách 36 học sinh lớp 12A9, điểm danh tuần mẫu và các tiêu chí chuẩn. Dữ liệu tự chỉnh sửa hiện tại sẽ được thay thế bằng dữ liệu mẫu.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowRestoreModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-xl"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => {
                  onRestoreSampleData();
                  setShowRestoreModal(false);
                }}
                className="px-4 py-2 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs"
              >
                Xác nhận khôi phục
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

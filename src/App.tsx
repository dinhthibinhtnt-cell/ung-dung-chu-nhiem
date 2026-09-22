import React, { useState, useEffect } from 'react';
import { AppState, ClassConfig } from './types';
import { 
  loadAppState, 
  saveAppState, 
  generateDefaultAppState 
} from './utils/storage';
import { soundEngine } from './utils/audio';

import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { StudentsView } from './components/StudentsView';
import { AttendanceView } from './components/AttendanceView';
import { ConductView } from './components/ConductView';
import { CompetitionView } from './components/CompetitionView';
import { RankingView } from './components/RankingView';
import { RewardsView } from './components/RewardsView';
import { DisciplineView } from './components/DisciplineView';
import { MeetingView } from './components/MeetingView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';

export default function App() {
  const [state, setState] = useState<AppState>(() => loadAppState());
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Auto-save to localStorage whenever state changes
  useEffect(() => {
    saveAppState(state);
  }, [state]);

  // Projector mode class on document.body
  useEffect(() => {
    if (state.config.projectorMode) {
      document.body.classList.add('projector-mode');
    } else {
      document.body.classList.remove('projector-mode');
    }
  }, [state.config.projectorMode]);

  // Update whole config
  const handleUpdateConfig = (newConfig: Partial<ClassConfig>) => {
    setState(prev => ({
      ...prev,
      config: {
        ...prev.config,
        ...newConfig,
      },
    }));
  };

  // State updater function for child views
  const handleUpdateState = (updater: (prev: AppState) => AppState) => {
    setState(prev => updater(prev));
  };

  // Reset to default initial state
  const handleRestoreDefault = () => {
    const defaultData = generateDefaultAppState();
    setState(defaultData);
    soundEngine.playSuccess(defaultData.config.soundEnabled);
  };

  // Import JSON backup file
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (imported && imported.students && imported.config) {
          setState(imported);
          soundEngine.playSuccess(imported.config?.soundEnabled);
          alert('Đã khôi phục thành công dữ liệu từ tệp sao lưu JSON!');
        } else {
          alert('Tệp sao lưu không đúng định dạng của Trợ lý chủ nhiệm 12A9.');
        }
      } catch (err) {
        alert('Lỗi khi đọc tệp sao lưu: ' + String(err));
      }
    };
    reader.readAsText(file);
  };

  // Set imported state directly
  const handleImportDataDirect = (newData: AppState) => {
    setState(newData);
    soundEngine.playSuccess(newData.config.soundEnabled);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* Top Main Navigation Bar */}
      <Navbar
        state={state}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onUpdateConfig={handleUpdateConfig}
        onRestoreSampleData={handleRestoreDefault}
        onImportJson={handleImportJson}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView 
            state={state} 
            setActiveTab={setActiveTab} 
            onUpdateState={handleUpdateState} 
          />
        )}

        {activeTab === 'students' && (
          <StudentsView 
            state={state} 
            onUpdateState={handleUpdateState} 
          />
        )}

        {activeTab === 'attendance' && (
          <AttendanceView 
            state={state} 
            onUpdateState={handleUpdateState} 
          />
        )}

        {activeTab === 'conduct' && (
          <ConductView 
            state={state} 
            onUpdateState={handleUpdateState} 
          />
        )}

        {activeTab === 'competition' && (
          <CompetitionView 
            state={state} 
            onUpdateState={handleUpdateState} 
          />
        )}

        {activeTab === 'ranking' && (
          <RankingView 
            state={state} 
            onUpdateConfig={handleUpdateConfig} 
          />
        )}

        {activeTab === 'rewards' && (
          <RewardsView 
            state={state} 
            onUpdateState={handleUpdateState} 
          />
        )}

        {activeTab === 'discipline' && (
          <DisciplineView 
            state={state} 
            onUpdateState={handleUpdateState} 
          />
        )}

        {activeTab === 'meeting' && (
          <MeetingView 
            state={state} 
            onUpdateState={handleUpdateState} 
          />
        )}

        {activeTab === 'reports' && (
          <ReportsView 
            state={state} 
            onRestoreDefault={handleRestoreDefault} 
            onImportData={handleImportDataDirect} 
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView 
            state={state} 
            onUpdateConfig={handleUpdateConfig} 
            onUpdateState={handleUpdateState} 
            onRestoreDefault={handleRestoreDefault} 
          />
        )}
      </main>

      {/* Footer */}
      <footer className="no-print mt-auto border-t border-slate-200 bg-white/70 py-4 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">Trợ lý chủ nhiệm lớp {state.config.className}</span>
            <span>•</span>
            <span>{state.config.schoolName}</span>
            <span>•</span>
            <span>Năm học {state.config.schoolYear}</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>GVCN: <b className="text-slate-600">{state.config.homeroomTeacher}</b></span>
            <span>•</span>
            <span className="text-emerald-700 font-medium">100% Offline & Bảo mật thiết bị</span>
          </div>
        </div>
      </footer>
    </div>
  );
}


import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Planner from './components/Planner';
import CalendarView from './components/CalendarView';
import Assistant from './components/Assistant';
import { ViewState, StudyPlan, UserProfile } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [activePlan, setActivePlan] = useState<StudyPlan | null>(() => {
    const saved = localStorage.getItem('omnistudy_plan');
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    // Ensure variants exist if it's an old save
    return parsed.variants ? parsed : null;
  });

  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('omnistudy_user');
    return saved ? JSON.parse(saved) : { name: 'Guest Student', planType: 'Free Plan', avatar: 'https://picsum.photos/seed/omni/40/40' };
  });

  useEffect(() => {
    localStorage.setItem('omnistudy_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    if (activePlan) {
      localStorage.setItem('omnistudy_plan', JSON.stringify(activePlan));
    } else {
      localStorage.removeItem('omnistudy_plan');
    }
  }, [activePlan]);

  const handleUpdateName = (newName: string) => {
    setUser(prev => ({ ...prev, name: newName }));
  };

  const handleToggleTask = (dayNum: number, taskId: string) => {
    if (!activePlan) return;

    const intensity = activePlan.selectedIntensity;
    const newVariants = { ...activePlan.variants };
    const variant = { ...newVariants[intensity] };
    const newSchedule = variant.schedule.map(day => {
      if (day.day === dayNum) {
        return {
          ...day,
          tasks: day.tasks.map(task => 
            task.id === taskId ? { ...task, completed: !task.completed } : task
          )
        };
      }
      return day;
    });

    variant.schedule = newSchedule;
    newVariants[intensity] = variant;

    setActivePlan({
      ...activePlan,
      variants: newVariants
    });
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard plan={activePlan} user={user} onToggleTask={handleToggleTask} />;
      case 'planner':
        return <Planner onPlanGenerated={setActivePlan} activePlan={activePlan} onToggleTask={handleToggleTask} />;
      case 'calendar':
        return <CalendarView plan={activePlan} />;
      case 'assistant':
        return <Assistant />;
      default:
        return <Dashboard plan={activePlan} user={user} onToggleTask={handleToggleTask} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0d1117] text-slate-100 overflow-x-hidden selection:bg-indigo-500/30">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} user={user} onUpdateName={handleUpdateName} />
      
      <main className="flex-1 px-4 py-8 md:px-10 md:py-12 max-h-screen overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {renderView()}
        </div>
      </main>

      {/* Persistent Action Bar for Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#161b22] border-t border-slate-800 flex justify-around p-3 z-50">
        <button onClick={() => setCurrentView('dashboard')} className={`flex flex-col items-center gap-1 ${currentView === 'dashboard' ? 'text-indigo-400' : 'text-slate-500'}`}>
          <i className="fas fa-chart-line text-sm"></i>
          <span className="text-[10px] font-bold">Dash</span>
        </button>
        <button onClick={() => setCurrentView('planner')} className={`flex flex-col items-center gap-1 ${currentView === 'planner' ? 'text-indigo-400' : 'text-slate-500'}`}>
          <i className="fas fa-calendar-plus text-sm"></i>
          <span className="text-[10px] font-bold">Plan</span>
        </button>
        <button onClick={() => setCurrentView('calendar')} className={`flex flex-col items-center gap-1 ${currentView === 'calendar' ? 'text-indigo-400' : 'text-slate-500'}`}>
          <i className="fas fa-calendar-alt text-sm"></i>
          <span className="text-[10px] font-bold">Cal</span>
        </button>
        <button onClick={() => setCurrentView('assistant')} className={`flex flex-col items-center gap-1 ${currentView === 'assistant' ? 'text-indigo-400' : 'text-slate-500'}`}>
          <i className="fas fa-robot text-sm"></i>
          <span className="text-[10px] font-bold">AI</span>
        </button>
      </div>
    </div>
  );
};

export default App;

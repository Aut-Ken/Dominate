import React, { useState, useEffect } from 'react';
import { View, Project, Task, Notification as NotificationType, TeamMember } from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Projects from './components/Projects';
import Team from './components/Team';
import Calendar from './components/Calendar';
import Settings from './components/Settings';
import MyTasks from './components/MyTasks';
import Reports from './components/Reports';
import Profile from './components/Profile';
import Chat from './components/Chat';
import TaskDetailModal from './components/TaskDetailModal';
import Wiki from './components/Wiki';
import Sprints from './components/Sprints';
import AIChatPanel from './components/AIChatPanel';
import NewProjectModal from './components/NewProjectModal';
import TaskModal from './components/TaskModal';
import Login from './components/Login';
import GanttChart from './components/GanttChart';
import ActivityFeed from './components/ActivityFeed';
import { api } from './services/api';

const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [userId, setUserId] = useState<string | null>(localStorage.getItem('userId'));

  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [darkMode, setDarkMode] = useState(true);
  const [allTeamMembers, setAllTeamMembers] = useState<TeamMember[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notifications, setNotifications] = useState<NotificationType[]>([]);

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskModalType, setTaskModalType] = useState<'task' | 'mission'>('task');
  const [calendarTargetDate, setCalendarTargetDate] = useState<string | null>(null);
  const [targetTaskStatus, setTargetTaskStatus] = useState<Task['status']>('To Do');
  const [targetProjectId, setTargetProjectId] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  const fetchData = async () => {
    try {
      const [projectsData, tasksData, teamData] = await Promise.all([
        api.getProjects(),
        api.getTasks(),
        api.getTeamMembers()
      ]);
      setProjects(Array.isArray(projectsData) ? projectsData : []);
      setTasks(Array.isArray(tasksData) ? tasksData : []);
      setAllTeamMembers(Array.isArray(teamData) ? teamData : []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  };

  const handleLogin = (newToken: string, newUserId: string) => {
    setToken(newToken);
    setUserId(newUserId);
    localStorage.setItem('token', newToken);
    localStorage.setItem('userId', newUserId);
  };

  const handleLogout = () => {
    setToken(null);
    setUserId(null);
    setProjects([]);
    setTasks([]);
    setAllTeamMembers([]);
    setNotifications([]);
    setCurrentView(View.DASHBOARD);
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
  };

  if (!token) {
    return <Login onLogin={handleLogin} />;
  }

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleCreateProject = async (name: string) => {
    try {
      const newProject = await api.createProject(name);
      setProjects([newProject, ...projects]);
      setIsProjectModalOpen(false);
    } catch (error) {
      console.error("Failed to create project:", error);
      alert("Failed to create project");
    }
  };

  const handleJoinProject = (code: string) => {
    // TODO: Implement join project API
    alert(`Successfully joined project with key: ${code}`);
    setIsProjectModalOpen(false);
  };

  const handleAddTask = async (taskData: Partial<Task>) => {
    try {
      const newTask = await api.createTask({
        ...taskData,
        projectId: taskData.projectId || targetProjectId || projects[0]?.id,
        assigneeId: taskData.assigneeId || userId || undefined,
        type: taskModalType,
        status: taskModalType === 'mission' ? 'To Do' : (taskData.status || targetTaskStatus),
        dueDate: taskData.dueDate || calendarTargetDate || new Date().toISOString().split('T')[0],
      });
      setTasks([newTask, ...tasks]);
      setIsTaskModalOpen(false);
      setCalendarTargetDate(null);
    } catch (error) {
      console.error("Failed to create task:", error);
      alert("Failed to create task");
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: Task['status']) => {
    try {
      await api.updateTask(taskId, { status: newStatus });
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    } catch (error) {
      console.error("Failed to update task status:", error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await api.deleteTask(taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  const handleUpdateMember = (updatedMember: TeamMember) => {
    setAllTeamMembers(prev => prev.map(m => m.id === updatedMember.id ? updatedMember : m));
  };

  const handleSearch = (query: string) => {
    const lowerQuery = query.toLowerCase();
    const views = Object.values(View);
    const foundView = views.find(v => v.toLowerCase().includes(lowerQuery));
    if (foundView) {
      setCurrentView(foundView);
    } else {
      const foundProject = projects.find(p => p.name.toLowerCase().includes(lowerQuery));
      if (foundProject) setCurrentView(View.PROJECTS);
    }
  };

  const handleNavigateToProfile = (member?: TeamMember) => {
    const target = member || allTeamMembers.find(m => m.userId === userId);
    if (target) {
      setSelectedMemberId(target.id);
      setCurrentView(View.PROFILE);
    }
  };

  const handleMarkNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
  };

  const openTaskModal = (type: 'task' | 'mission', status: Task['status'] = 'To Do', dateOrProjectId?: string, projectId?: string) => {
    setTaskModalType(type);
    setTargetTaskStatus(status);
    if (type === 'mission' && dateOrProjectId) {
      setCalendarTargetDate(dateOrProjectId);
      setTargetProjectId(null);
    } else if (type === 'task' && dateOrProjectId) {
      setTargetProjectId(dateOrProjectId);
      setCalendarTargetDate(null);
    } else {
      setCalendarTargetDate(null);
      setTargetProjectId(null);
    }
    setIsTaskModalOpen(true);
  };

  const currentProfileMember = allTeamMembers.find(m => m.id === selectedMemberId) || allTeamMembers.find(m => m.userId === userId) || {
    id: 'guest',
    name: 'Guest',
    role: 'Guest',
    avatar: '',
    status: 'Online',
    department: 'None',
    location: 'Remote',
    tasksCount: 0,
    email: 'guest@example.com',
    bio: 'Please login properly.'
  } as TeamMember;

  const currentUser = allTeamMembers.find(m => m.userId === userId);

  // Calculate dynamic badge count for My Tasks (pending real tasks assigned to me)
  const myPendingTasksCount = tasks.filter(t =>
    (t.assigneeId === userId) &&
    t.status !== 'Done' &&
    t.type !== 'mission'
  ).length;

  const renderView = () => {
    const actualTasks = tasks.filter(t => t.type !== 'mission');
    switch (currentView) {
      case View.DASHBOARD:
        return <Dashboard tasks={actualTasks} projects={projects} team={allTeamMembers} />;
      case View.PROJECTS:
        return <Projects projects={projects} tasks={tasks} onOpenModal={(status, projId) => openTaskModal('task', status, projId)} onUpdateStatus={handleUpdateTaskStatus} onAddTask={(t) => setTasks([t, ...tasks])} currentUserId={userId} onTaskClick={(t) => { setSelectedTask(t); setIsTaskDetailOpen(true); }} onProjectsRefresh={fetchData} />;
      case View.MY_TASKS:
        return <MyTasks tasks={actualTasks} onUpdateStatus={handleUpdateTaskStatus} onDeleteTask={handleDeleteTask} currentUserId={userId} />;
      case View.TEAM:
        return <Team tasks={actualTasks} members={allTeamMembers} onNavigateToProfile={handleNavigateToProfile} onUpdateMember={handleUpdateMember} />;
      case View.REPORTS:
        return <Reports tasks={actualTasks} projects={projects} currentUserId={userId} />;
      case View.CALENDAR:
        return <Calendar tasks={tasks} onAddClick={(date) => openTaskModal('mission', 'To Do', date)} />;
      case View.CHAT:
        return <Chat currentUser={currentUser} currentUserId={userId} team={allTeamMembers} />;
      case View.PROFILE:
        return <Profile tasks={actualTasks} member={currentProfileMember} isMe={currentProfileMember.userId === userId} onUpdate={handleUpdateMember} />;
      case View.SETTINGS:
        return <Settings toggleTheme={toggleTheme} darkMode={darkMode} onLogout={handleLogout} userId={userId} />;
      case View.WIKI:
        return <Wiki projects={projects} currentUserId={userId || ''} currentUserName={currentUser.name} />;
      case View.SPRINTS:
        return <Sprints projects={projects} tasks={tasks} currentUserId={userId || ''} />;
      case View.GANTT:
        return <GanttChart projects={projects} />;
      case View.ACTIVITY:
        return <ActivityFeed />;
      default:
        return <Dashboard tasks={actualTasks} projects={projects} team={allTeamMembers} />;
    }
  };

  return (
    <div className="flex h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 overflow-hidden font-display">
      <Sidebar
        activeView={currentView}
        onNavigate={setCurrentView}
        onProfileClick={() => handleNavigateToProfile()}
        myTasksCount={myPendingTasksCount}
        user={currentUser}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          currentView={currentView}
          onNewAction={() => setIsProjectModalOpen(true)}
          onSearch={handleSearch}
          notifications={notifications}
          onMarkRead={handleMarkNotificationRead}
          onNotificationClick={() => setCurrentView(View.MY_TASKS)}
          user={currentUser}
          onLogout={handleLogout}
          onNavigateToProfile={() => handleNavigateToProfile()}
          onNavigateToSettings={() => setCurrentView(View.SETTINGS)}
        />
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          {renderView()}
        </main>
      </div>

      {isProjectModalOpen && (
        <NewProjectModal onClose={() => setIsProjectModalOpen(false)} onCreate={handleCreateProject} onJoin={handleJoinProject} />
      )}

      {isTaskModalOpen && (
        <TaskModal
          type={taskModalType}
          dateHint={calendarTargetDate}
          projects={projects}
          teamMembers={allTeamMembers}
          currentUser={currentUser}
          defaultProjectId={targetProjectId}
          onClose={() => { setIsTaskModalOpen(false); setCalendarTargetDate(null); setTargetProjectId(null); }}
          onSave={handleAddTask}
        />
      )}

      {isTaskDetailOpen && selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          isOpen={isTaskDetailOpen}
          onClose={() => { setIsTaskDetailOpen(false); setSelectedTask(null); }}
          currentUser={currentUser}
          currentUserId={userId}
          onUpdateTask={async (taskId, updates) => {
            try {
              await api.updateTask(taskId, updates);
              setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));
              setSelectedTask(prev => prev ? { ...prev, ...updates } : prev);
            } catch (e) { console.error(e); }
          }}
        />
      )}

      {/* Global AI Chat Panel */}
      {currentUser && <AIChatPanel projects={projects} currentUserName={currentUser.name} />}
    </div>
  );
};

export default App;

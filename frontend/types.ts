
export enum View {
  DASHBOARD = 'Dashboard',
  PROJECTS = 'Projects',
  MY_TASKS = 'My Tasks',
  TEAM = 'Team',
  REPORTS = 'Reports',
  CALENDAR = 'Calendar',
  SETTINGS = 'Settings',
  PROFILE = 'Profile',
}

export interface Project {
  id: string;
  name: string;
  inviteCode: string;
  description?: string;
  memberCount: number;
  status: 'Active' | 'On Hold' | 'Completed';
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'To Do' | 'In Progress' | 'Review' | 'Done';
  assignee?: string;
  assigneeId?: string;
  assigneeAvatar?: string;
  dueDate?: string;
  progress?: number;
  tags?: string[];
  imageUrl?: string;
  commentsCount?: number;
  type?: 'task' | 'mission'; // Mission is a personal calendar entry
}

export interface TeamMember {
  id: string;
  userId: string;
  name: string;
  role: string;
  avatar: string;
  status: 'Online' | 'Offline' | 'Away';
  department: string;
  location: 'Remote' | 'In-Office';
  tasksCount: number;
  email?: string;
  bio?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'task' | 'deadline' | 'system';
  unread: boolean;
}

export interface Stat {
  label: string;
  value: string | number;
  change: string;
  isPositive: boolean;
  icon: string;
  color: string;
}

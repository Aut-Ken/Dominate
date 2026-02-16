
export enum View {
  DASHBOARD = 'Dashboard',
  PROJECTS = 'Projects',
  MY_TASKS = 'My Tasks',
  TEAM = 'Team',
  CHAT = 'Chat',
  REPORTS = 'Reports',
  CALENDAR = 'Calendar',
  WIKI = 'Wiki',
  SPRINTS = 'Sprints',
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
  type?: 'task' | 'mission';
  sprintId?: string;
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

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  msgType?: string;
  fileName?: string;
  channel: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  taskId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
}

export interface TimeLog {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  hours: number;
  note: string;
  loggedAt: string;
}

export interface Sprint {
  id: string;
  projectId: string;
  name: string;
  goal: string;
  startDate: string;
  endDate: string;
  status: 'Planning' | 'Active' | 'Completed';
  createdAt: string;
}

export interface WikiPage {
  id: string;
  projectId: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  updatedAt: string;
  createdAt: string;
}

export interface WebhookConfig {
  id: string;
  projectId: string;
  name: string;
  url: string;
  events: string;
  active: boolean;
  createdAt: string;
}

export interface BurndownPoint {
  day: number;
  date: string;
  ideal: number;
  actual: number;
}


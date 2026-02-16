import { Project, Task, TeamMember } from '../types';

const API_BASE_URL = 'http://localhost:8080/api';

export const api = {
    // Auth
    register: async (username: string, password: string, name?: string) => {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, name }),
        });
        return response.json();
    },

    login: async (username: string, password: string) => {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        return response.json();
    },

    // Projects
    getProjects: async (): Promise<Project[]> => {
        const response = await fetch(`${API_BASE_URL}/projects`);
        return response.json();
    },

    createProject: async (name: string, description?: string): Promise<Project> => {
        const response = await fetch(`${API_BASE_URL}/projects`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, description }),
        });
        return response.json();
    },

    // Tasks
    getTasks: async (projectId?: string): Promise<Task[]> => {
        const url = projectId ? `${API_BASE_URL}/tasks?project_id=${projectId}` : `${API_BASE_URL}/tasks`;
        const response = await fetch(url);
        return response.json();
    },

    createTask: async (task: Partial<Task>): Promise<Task> => {
        // Backend expects snake_case fields
        const payload = {
            project_id: task.projectId,
            title: task.title,
            description: task.description,
            priority: task.priority,
            status: task.status,
            assignee_id: task.assigneeId,
            due_date: task.dueDate,
            type: task.type,
        };
        const response = await fetch(`${API_BASE_URL}/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        return response.json();
    },

    updateTask: async (id: string, updates: Partial<Task>): Promise<void> => {
        await fetch(`${API_BASE_URL}/tasks/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
        });
    },

    deleteTask: async (id: string): Promise<void> => {
        await fetch(`${API_BASE_URL}/tasks/${id}`, {
            method: 'DELETE',
        });
    },

    // Team
    getTeamMembers: async (): Promise<TeamMember[]> => {
        const response = await fetch(`${API_BASE_URL}/team`);
        return response.json();
    },

    // Chat
    getMessages: async (channel: string = 'general'): Promise<any[]> => {
        const response = await fetch(`${API_BASE_URL}/messages?channel=${encodeURIComponent(channel)}`);
        return response.json();
    },

    sendMessage: async (senderId: string, senderName: string, senderAvatar: string, content: string, channel: string = 'general', msgType: string = 'text', fileName: string = ''): Promise<any> => {
        const response = await fetch(`${API_BASE_URL}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ senderId, senderName, senderAvatar, content, channel, msgType, fileName }),
        });
        return response.json();
    },

    uploadFile: async (file: File): Promise<{ url: string; fileName: string }> => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await fetch(`${API_BASE_URL}/upload`, {
            method: 'POST',
            body: formData,
        });
        return response.json();
    },

    // Comments
    getComments: async (taskId: string): Promise<any[]> => {
        const response = await fetch(`${API_BASE_URL}/comments?task_id=${taskId}`);
        return response.json();
    },

    addComment: async (taskId: string, authorId: string, authorName: string, authorAvatar: string, content: string): Promise<any> => {
        const response = await fetch(`${API_BASE_URL}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ taskId, authorId, authorName, authorAvatar, content }),
        });
        return response.json();
    },

    // Search
    search: async (query: string): Promise<{ projects: Project[]; tasks: Task[]; members: TeamMember[] }> => {
        const response = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}`);
        return response.json();
    },

    // Join Project
    joinProject: async (inviteCode: string): Promise<Project> => {
        const response = await fetch(`${API_BASE_URL}/projects/join`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ inviteCode }),
        });
        return response.json();
    },

    // Change Password
    changePassword: async (userId: string, oldPassword: string, newPassword: string): Promise<any> => {
        const response = await fetch(`${API_BASE_URL}/auth/password`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, oldPassword, newPassword }),
        });
        return response.json();
    },

    // Update Avatar
    updateAvatar: async (memberId: string, file: File): Promise<{ avatar: string }> => {
        const formData = new FormData();
        formData.append('avatar', file);
        const response = await fetch(`${API_BASE_URL}/team/${memberId}/avatar`, {
            method: 'PUT',
            body: formData,
        });
        return response.json();
    },

    // Time Tracking
    getTimeLogs: async (taskId?: string): Promise<any[]> => {
        const url = taskId ? `${API_BASE_URL}/timelogs?task_id=${taskId}` : `${API_BASE_URL}/timelogs`;
        const response = await fetch(url);
        return response.json();
    },
    addTimeLog: async (taskId: string, userId: string, userName: string, hours: number, note: string): Promise<any> => {
        const response = await fetch(`${API_BASE_URL}/timelogs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ taskId, userId, userName, hours, note }),
        });
        return response.json();
    },
    getTimeStats: async (userId?: string, projectId?: string): Promise<{ totalHours: number; taskCount: number }> => {
        const params = new URLSearchParams();
        if (userId) params.set('user_id', userId);
        if (projectId) params.set('project_id', projectId);
        const response = await fetch(`${API_BASE_URL}/timelogs/stats?${params}`);
        return response.json();
    },

    // Sprints
    getSprints: async (projectId?: string): Promise<any[]> => {
        const url = projectId ? `${API_BASE_URL}/sprints?project_id=${projectId}` : `${API_BASE_URL}/sprints`;
        const response = await fetch(url);
        return response.json();
    },
    createSprint: async (projectId: string, name: string, goal: string, startDate: string, endDate: string): Promise<any> => {
        const response = await fetch(`${API_BASE_URL}/sprints`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ projectId, name, goal, startDate, endDate }),
        });
        return response.json();
    },
    updateSprint: async (id: string, updates: any): Promise<any> => {
        const response = await fetch(`${API_BASE_URL}/sprints/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
        });
        return response.json();
    },

    // Wiki
    getWikiPages: async (projectId?: string): Promise<any[]> => {
        const url = projectId ? `${API_BASE_URL}/wiki?project_id=${projectId}` : `${API_BASE_URL}/wiki`;
        const response = await fetch(url);
        return response.json();
    },
    getWikiPage: async (id: string): Promise<any> => {
        const response = await fetch(`${API_BASE_URL}/wiki/${id}`);
        return response.json();
    },
    createWikiPage: async (projectId: string, title: string, content: string, authorId: string, authorName: string): Promise<any> => {
        const response = await fetch(`${API_BASE_URL}/wiki`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ projectId, title, content, authorId, authorName }),
        });
        return response.json();
    },
    updateWikiPage: async (id: string, updates: any): Promise<any> => {
        const response = await fetch(`${API_BASE_URL}/wiki/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
        });
        return response.json();
    },
    deleteWikiPage: async (id: string): Promise<void> => {
        await fetch(`${API_BASE_URL}/wiki/${id}`, { method: 'DELETE' });
    },

    // Webhooks
    getWebhooks: async (projectId?: string): Promise<any[]> => {
        const url = projectId ? `${API_BASE_URL}/webhooks?project_id=${projectId}` : `${API_BASE_URL}/webhooks`;
        const response = await fetch(url);
        return response.json();
    },
    createWebhook: async (projectId: string, name: string, url: string, events: string): Promise<any> => {
        const response = await fetch(`${API_BASE_URL}/webhooks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ projectId, name, url, events }),
        });
        return response.json();
    },
    deleteWebhook: async (id: string): Promise<void> => {
        await fetch(`${API_BASE_URL}/webhooks/${id}`, { method: 'DELETE' });
    },
    toggleWebhook: async (id: string): Promise<any> => {
        const response = await fetch(`${API_BASE_URL}/webhooks/${id}/toggle`, { method: 'PUT' });
        return response.json();
    },

    // Burndown
    getBurndownData: async (sprintId?: string, projectId?: string): Promise<any> => {
        const params = new URLSearchParams();
        if (sprintId) params.set('sprint_id', sprintId);
        if (projectId) params.set('project_id', projectId);
        const response = await fetch(`${API_BASE_URL}/burndown?${params}`);
        return response.json();
    },

    // AI Assistant
    aiAssist: async (prompt: string, type: string): Promise<{ response: string }> => {
        const response = await fetch(`${API_BASE_URL}/ai/assist`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, type }),
        });
        return response.json();
    },
    aiChat: async (messages: { role: string; content: string }[], projectId?: string): Promise<{ response: string }> => {
        const response = await fetch(`${API_BASE_URL}/ai/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages, projectId }),
        });
        return response.json();
    },
    setAIKey: async (apiKey: string): Promise<{ message: string; configured: boolean }> => {
        const response = await fetch(`${API_BASE_URL}/ai/key`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ apiKey }),
        });
        return response.json();
    },
    getAIStatus: async (): Promise<{ configured: boolean; model: string }> => {
        const response = await fetch(`${API_BASE_URL}/ai/status`);
        return response.json();
    },
};

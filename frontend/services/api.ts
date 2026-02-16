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

    // Team
    getTeamMembers: async (): Promise<TeamMember[]> => {
        const response = await fetch(`${API_BASE_URL}/team`);
        return response.json();
    },
};

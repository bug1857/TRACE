import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' }
});

export async function uploadOcelFile(file: File, mappingOverride?: string, workspaceId?: number) {
  const formData = new FormData();
  formData.append('file', file);
  if (mappingOverride) {
    formData.append('mapping_override', mappingOverride);
  }
  if (workspaceId !== undefined && workspaceId !== null) {
    formData.append('workspace_id', workspaceId.toString());
  }
  const response = await api.post('/api/ocel/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}

export async function postAuditLog(actionType: string, target: string, details?: string) {
  const response = await api.post('/api/audit-logs', {
    action_type: actionType,
    target,
    details
  });
  return response.data;
}

export async function getAuditLogs() {
  const response = await api.get('/api/audit-logs');
  return response.data;
}

export async function getOrganizations() {
  const response = await api.get('/api/organizations');
  return response.data;
}

export async function createOrganization(name: string) {
  const response = await api.post('/api/organizations', { name });
  return response.data;
}

export async function deleteOrganization(id: number) {
  const response = await api.delete(`/api/organizations/${id}`);
  return response.data;
}

export async function getProjects(orgId: number) {
  const response = await api.get(`/api/organizations/${orgId}/projects`);
  return response.data;
}

export async function createProject(orgId: number, name: string) {
  const response = await api.post(`/api/organizations/${orgId}/projects`, { name });
  return response.data;
}

export async function deleteProject(id: number) {
  const response = await api.delete(`/api/projects/${id}`);
  return response.data;
}

export async function getWorkspaces(projectId: number) {
  const response = await api.get(`/api/projects/${projectId}/workspaces`);
  return response.data;
}

export async function createWorkspace(projectId: number, name: string) {
  const response = await api.post(`/api/projects/${projectId}/workspaces`, { name });
  return response.data;
}

export async function deleteWorkspace(id: number) {
  const response = await api.delete(`/api/workspaces/${id}`);
  return response.data;
}

export async function getLatestAnalysis(workspaceId: number) {
  const response = await api.get(`/api/workspaces/${workspaceId}/latest-analysis`);
  return response.data;
}

export default api;

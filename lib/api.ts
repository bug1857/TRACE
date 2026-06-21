import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' }
});

export async function uploadOcelFile(file: File, mappingOverride?: string) {
  const formData = new FormData();
  formData.append('file', file);
  if (mappingOverride) {
    formData.append('mapping_override', mappingOverride);
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

export default api;

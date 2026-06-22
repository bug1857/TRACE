'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getOrganizations, getProjects, getWorkspaces, getLatestAnalysis } from './api';
import { useAnalysis } from './AnalysisContext';

export interface BackendOrganization {
  id: number;
  name: string;
  country: string | null;
  fiscal_year: string | null;
  created_at: string;
}

export interface BackendProject {
  id: number;
  org_id: number;
  name: string;
  created_at: string;
}

export interface BackendWorkspace {
  id: number;
  project_id: number;
  name: string;
  created_at: string;
}

interface WorkspaceContextType {
  organizations: BackendOrganization[];
  projects: BackendProject[];
  workspaces: BackendWorkspace[];
  activeOrgId: number | null;
  activeProjectId: number | null;
  activeWorkspaceId: number | null;
  setActiveOrgId: (id: number | null) => void;
  setActiveProjectId: (id: number | null) => void;
  setActiveWorkspaceId: (id: number | null) => void;
  refreshOrganizations: () => Promise<BackendOrganization[]>;
  refreshProjects: (orgId: number) => Promise<BackendProject[]>;
  refreshWorkspaces: (projectId: number) => Promise<BackendWorkspace[]>;
  loading: boolean;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { setAnalysis } = useAnalysis();

  const [organizations, setOrganizations] = useState<BackendOrganization[]>([]);
  const [projects, setProjects] = useState<BackendProject[]>([]);
  const [workspaces, setWorkspaces] = useState<BackendWorkspace[]>([]);

  const [activeOrgId, setActiveOrgIdState] = useState<number | null>(null);
  const [activeProjectId, setActiveProjectIdState] = useState<number | null>(null);
  const [activeWorkspaceId, setActiveWorkspaceIdState] = useState<number | null>(null);

  const [loading, setLoading] = useState<boolean>(true);

  // Helper setters that also persist to sessionStorage
  const setActiveOrgId = (id: number | null) => {
    setActiveOrgIdState(id);
    if (id !== null) {
      sessionStorage.setItem('trace_active_org_id', id.toString());
    } else {
      sessionStorage.removeItem('trace_active_org_id');
    }
  };

  const setActiveProjectId = (id: number | null) => {
    setActiveProjectIdState(id);
    if (id !== null) {
      sessionStorage.setItem('trace_active_project_id', id.toString());
    } else {
      sessionStorage.removeItem('trace_active_project_id');
    }
  };

  const setActiveWorkspaceId = (id: number | null) => {
    setActiveWorkspaceIdState(id);
    if (id !== null) {
      sessionStorage.setItem('trace_active_workspace_id', id.toString());
    } else {
      sessionStorage.removeItem('trace_active_workspace_id');
    }
  };

  const refreshOrganizations = async () => {
    try {
      const data = await getOrganizations();
      setOrganizations(data);
      return data;
    } catch (e) {
      console.error("Failed to load organizations:", e);
      return [];
    }
  };

  const refreshProjects = async (orgId: number) => {
    try {
      const data = await getProjects(orgId);
      setProjects(data);
      return data;
    } catch (e) {
      console.error("Failed to load projects:", e);
      setProjects([]);
      return [];
    }
  };

  const refreshWorkspaces = async (projectId: number) => {
    try {
      const data = await getWorkspaces(projectId);
      setWorkspaces(data);
      return data;
    } catch (e) {
      console.error("Failed to load workspaces:", e);
      setWorkspaces([]);
      return [];
    }
  };

  // Load organizations on initial mount
  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      const orgs = await refreshOrganizations();
      
      const savedOrgId = sessionStorage.getItem('trace_active_org_id');
      let currentOrgId: number | null = null;
      
      if (savedOrgId) {
        const parsed = parseInt(savedOrgId);
        if (orgs.some((o: BackendOrganization) => o.id === parsed)) {
          currentOrgId = parsed;
        }
      }
      
      if (!currentOrgId && orgs.length > 0) {
        currentOrgId = orgs[0].id;
      }

      setActiveOrgId(currentOrgId);
      setLoading(false);
    };

    initialize();
  }, []);

  // Update projects list when activeOrgId changes
  useEffect(() => {
    const loadProjects = async () => {
      if (activeOrgId === null) {
        setProjects([]);
        setActiveProjectId(null);
        return;
      }

      const projs = await refreshProjects(activeOrgId);

      const savedProjId = sessionStorage.getItem('trace_active_project_id');
      let currentProjId: number | null = null;

      if (savedProjId) {
        const parsed = parseInt(savedProjId);
        if (projs.some((p: BackendProject) => p.id === parsed)) {
          currentProjId = parsed;
        }
      }

      if (!currentProjId && projs.length > 0) {
        currentProjId = projs[0].id;
      }

      setActiveProjectId(currentProjId);
    };

    loadProjects();
  }, [activeOrgId]);

  // Update workspaces list when activeProjectId changes
  useEffect(() => {
    const loadWorkspaces = async () => {
      if (activeProjectId === null) {
        setWorkspaces([]);
        setActiveWorkspaceId(null);
        return;
      }

      const works = await refreshWorkspaces(activeProjectId);

      const savedWorkId = sessionStorage.getItem('trace_active_workspace_id');
      let currentWorkId: number | null = null;

      if (savedWorkId) {
        const parsed = parseInt(savedWorkId);
        if (works.some((w: BackendWorkspace) => w.id === parsed)) {
          currentWorkId = parsed;
        }
      }

      if (!currentWorkId && works.length > 0) {
        currentWorkId = works[0].id;
      }

      setActiveWorkspaceId(currentWorkId);
    };

    loadWorkspaces();
  }, [activeProjectId]);

  // Fetch latest analysis when activeWorkspaceId changes and directly update AnalysisContext
  useEffect(() => {
    const loadAnalysis = async () => {
      if (activeWorkspaceId === null) {
        setAnalysis(null);
        return;
      }

      try {
        const analysisData = await getLatestAnalysis(activeWorkspaceId);
        setAnalysis(analysisData);
      } catch {
        // 404 means no analysis exists yet for this workspace, which is clean and expected
        setAnalysis(null);
      }
    };

    loadAnalysis();
  }, [activeWorkspaceId, setAnalysis]);

  return (
    <WorkspaceContext.Provider
      value={{
        organizations,
        projects,
        workspaces,
        activeOrgId,
        activeProjectId,
        activeWorkspaceId,
        setActiveOrgId,
        setActiveProjectId,
        setActiveWorkspaceId,
        refreshOrganizations,
        refreshProjects,
        refreshWorkspaces,
        loading
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}

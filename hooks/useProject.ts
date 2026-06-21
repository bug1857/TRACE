import { useState } from 'react';
import { mockProjects } from '@/lib/mockData';
import { Project } from '@/lib/types';

export function useProject() {
  const [currentProject, setCurrentProject] = useState<Project>(mockProjects[0]);
  
  return {
    currentProject,
    setCurrentProject
  };
}

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Briefcase, Plus, Trash2, ArrowRight, Building2 } from 'lucide-react';
import { useWorkspace, BackendProject } from '@/lib/WorkspaceContext';
import { createProject, deleteProject } from '@/lib/api';
import PageHeader from '@/components/shared/PageHeader';
import DataTable, { Column } from '@/components/shared/DataTable';
import EmptyState from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

export default function ProjectsPage() {
  const router = useRouter();
  const {
    projects,
    activeOrgId,
    activeProjectId,
    setActiveProjectId,
    refreshProjects
  } = useWorkspace();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [validationError, setValidationError] = useState('');

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      setValidationError('Please enter a project name.');
      return;
    }

    if (activeOrgId === null) {
      setValidationError('No active organization selected.');
      return;
    }

    try {
      const created = await createProject(activeOrgId, newName.trim());
      await refreshProjects(activeOrgId);
      if (created?.id) {
        setActiveProjectId(created.id);
      }
      setNewName('');
      setValidationError('');
      setIsDialogOpen(false);
    } catch (err) {
      console.error(err);
      setValidationError('Failed to create project on backend.');
    }
  };

  const handleDeleteProject = async (id: number) => {
    if (activeOrgId === null) return;
    try {
      await deleteProject(id);
      const remaining = await refreshProjects(activeOrgId);
      if (activeProjectId === id) {
        if (remaining.length > 0) {
          setActiveProjectId(remaining[0].id);
        } else {
          setActiveProjectId(null);
        }
      }
    } catch (err) {
      console.error(err);
      alert('Failed to delete project on backend.');
    }
  };

  const columns: Column<BackendProject>[] = [
    {
      header: 'Name',
      accessorKey: 'name',
      sortable: true,
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-medium text-[var(--foreground)]">{row.name}</span>
        </div>
      )
    },
    {
      header: 'Created',
      accessorKey: 'created_at',
      sortable: true,
      cell: (row) => (
        <span className="text-[var(--muted-foreground)] text-[13px]">
          {new Date(row.created_at).toLocaleDateString()}
        </span>
      )
    },
    {
      header: 'Actions',
      accessorKey: 'actions',
      cell: (row) => {
        const isActive = activeProjectId === row.id;
        return (
          <div className="flex items-center gap-2">
            {!isActive ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setActiveProjectId(row.id);
                  router.push('/workspaces');
                }}
                className="h-[28px] text-[11px] font-sans text-[var(--primary)] border-[var(--primary)] hover:bg-[var(--accent)] hover:text-[var(--primary)] flex items-center gap-1 rounded-md"
              >
                <span>Enter Project</span>
                <ArrowRight className="w-3 h-3" />
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-medium text-[var(--primary)] bg-[var(--accent)] px-2.5 py-1 rounded-md">
                  Active
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/workspaces')}
                  className="h-[28px] text-[11px] font-sans text-[var(--primary)] border-[var(--primary)] hover:bg-[var(--accent)] hover:text-[var(--primary)] flex items-center gap-1 rounded-md"
                >
                  <span>Go to Workspaces</span>
                  <ArrowRight className="w-3 h-3" />
                </Button>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                if (confirm("WARNING: Deleting this project will permanently delete all its workspaces and stored audit analysis snapshots. Are you sure you want to proceed?")) {
                  handleDeleteProject(row.id);
                }
              }}
              className="h-[28px] w-[28px] p-0 text-[var(--destructive)] hover:bg-[var(--trace-danger-light)] hover:text-[var(--destructive)] rounded-md"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        );
      }
    }
  ];

  if (activeOrgId === null) {
    return (
      <div className="flex flex-col flex-1">
        <PageHeader title="Projects" subtitle="Operational audits and carbon-fitness monitors." />
        <EmptyState
          icon={Building2}
          title="No active organization"
          description="Please select or create an organization first to manage projects."
          actionText="Go to Organizations"
          onAction={() => router.push('/organizations')}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1">
      <PageHeader
        title="Projects"
        subtitle="Operational audits and carbon-fitness monitors."
        action={
          <div className="flex gap-2">
            <Button
              onClick={() => setIsDialogOpen(true)}
              variant="outline"
              className="h-[32px] text-[12px] font-sans font-medium border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--accent)] hover:text-[var(--primary)] flex items-center gap-1.5 rounded-md"
            >
              <Plus className="w-4 h-4" />
              <span>New Project</span>
            </Button>
          </div>
        }
      />

      {projects.length > 0 ? (
        <DataTable
          columns={columns}
          data={projects}
          onRowClick={(row) => {
            setActiveProjectId(row.id);
            router.push('/workspaces');
          }}
        />
      ) : (
        <EmptyState
          icon={Briefcase}
          title="No projects yet"
          description="Create a project to map event logs, check ESG alignment, and run simulations."
          actionText="Create Project"
          onAction={() => setIsDialogOpen(true)}
        />
      )}

      {/* New Project Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[400px] bg-[var(--background)] border border-[var(--border)] rounded-md shadow-sm">
          <DialogHeader>
            <DialogTitle className="text-[16px] font-sans font-medium text-[var(--foreground)]">
              New Project
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateProject} className="space-y-4 py-2">
            {validationError && (
              <div className="p-2 bg-[var(--trace-danger-light)] text-[var(--destructive)] text-[11px] font-sans rounded-md border border-[var(--destructive)]/10">
                {validationError}
              </div>
            )}
            
            <div className="space-y-1">
              <label className="text-[10px] font-sans font-medium text-[var(--muted-foreground)] uppercase tracking-wider block">
                Project Name
              </label>
              <Input
                placeholder="e.g. Q3 Supply Chain Audit 2024"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="h-[34px] text-[13px] bg-[var(--card)] border-[var(--border)] text-[var(--foreground)] rounded-md focus:border-[var(--primary)]"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setIsDialogOpen(false);
                  setValidationError('');
                }}
                className="h-[32px] text-[12px] text-[var(--muted-foreground)] hover:bg-[var(--card)] rounded-md"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="h-[32px] text-[12px] bg-[var(--primary)] hover:bg-[var(--trace-success)] text-white rounded-md"
              >
                Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

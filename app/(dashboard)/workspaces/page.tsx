'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, LayoutGrid, Trash2, Calendar, Briefcase } from 'lucide-react';
import { useWorkspace } from '@/lib/WorkspaceContext';
import { createWorkspace, deleteWorkspace } from '@/lib/api';
import PageHeader from '@/components/shared/PageHeader';
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

export default function WorkspacesPage() {
  const router = useRouter();
  const {
    workspaces,
    activeProjectId,
    activeWorkspaceId,
    setActiveWorkspaceId,
    refreshWorkspaces
  } = useWorkspace();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [validationError, setValidationError] = useState('');

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      setValidationError('Please enter a workspace name.');
      return;
    }

    if (activeProjectId === null) {
      setValidationError('No active project selected.');
      return;
    }

    try {
      const created = await createWorkspace(activeProjectId, newName.trim());
      await refreshWorkspaces(activeProjectId);
      if (created?.id) {
        setActiveWorkspaceId(created.id);
      }
      setNewName('');
      setValidationError('');
      setIsDialogOpen(false);
    } catch (err) {
      console.error(err);
      setValidationError('Failed to create workspace on backend.');
    }
  };

  const handleDeleteWorkspace = async (id: number) => {
    if (activeProjectId === null) return;
    try {
      await deleteWorkspace(id);
      const remaining = await refreshWorkspaces(activeProjectId);
      if (activeWorkspaceId === id) {
        if (remaining.length > 0) {
          setActiveWorkspaceId(remaining[0].id);
        } else {
          setActiveWorkspaceId(null);
        }
      }
    } catch (err) {
      console.error(err);
      alert('Failed to delete workspace on backend.');
    }
  };

  if (activeProjectId === null) {
    return (
      <div className="flex flex-col flex-1">
        <PageHeader title="Workspaces" subtitle="Logical partitions containing event logs, configs, and reports." />
        <EmptyState
          icon={Briefcase}
          title="No active project"
          description="Please select or create a project first to manage workspaces."
          actionText="Go to Projects"
          onAction={() => router.push('/projects')}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1">
      <PageHeader
        title="Workspaces"
        subtitle="Logical partitions containing event logs, configs, and reports."
        action={
          <div className="flex gap-2">
            <Button
              onClick={() => setIsDialogOpen(true)}
              variant="outline"
              className="h-[32px] text-[12px] font-sans font-medium border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--accent)] hover:text-[var(--primary)] flex items-center gap-1.5 rounded-md"
            >
              <Plus className="w-4 h-4" />
              <span>New Workspace</span>
            </Button>
          </div>
        }
      />

      {workspaces.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {workspaces.map((w) => {
            const isActive = activeWorkspaceId === w.id;
            return (
              <div
                key={w.id}
                onClick={() => setActiveWorkspaceId(w.id)}
                className={`border rounded-md p-5 flex flex-col justify-between h-[150px] relative cursor-pointer transition-colors ${
                  isActive 
                    ? 'bg-[var(--accent)] border-[var(--primary)]' 
                    : 'bg-[var(--card)] border-[var(--border)] hover:bg-[#ECEAE4]'
                }`}
              >
                {/* Header Info */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-start pr-6">
                    <h3 className="text-[14px] font-sans font-medium text-[var(--foreground)] tracking-tight">
                      {w.name}
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm("WARNING: Deleting this workspace will permanently erase its stored audit analysis snapshot. Are you sure you want to proceed?")) {
                          handleDeleteWorkspace(w.id);
                        }
                      }}
                      className="h-[24px] w-[24px] p-0 text-[var(--destructive)] hover:bg-[var(--trace-danger-light)] hover:text-[var(--destructive)] rounded-md absolute top-3 right-3 animate-none"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  
                  {isActive && (
                    <span className="text-[10px] font-medium text-[var(--primary)] bg-[var(--accent)] border border-[var(--primary)]/20 px-2 py-0.5 rounded block w-fit">
                      Active Workspace
                    </span>
                  )}
                </div>

                {/* Bottom modified stamp */}
                <div className="flex items-center gap-1 text-[11px] text-[var(--trace-subtle)] font-mono border-t border-[var(--border)] pt-2">
                  <Calendar className="w-3 h-3" />
                  <span>Created: {new Date(w.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={LayoutGrid}
          title="No workspaces yet"
          description="Create a workspace to group related event logs and configuration metrics."
          actionText="Create Workspace"
          onAction={() => setIsDialogOpen(true)}
        />
      )}

      {/* New Workspace Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[400px] bg-[var(--background)] border border-[var(--border)] rounded-md shadow-sm">
          <DialogHeader>
            <DialogTitle className="text-[16px] font-sans font-medium text-[var(--foreground)]">
              New Workspace
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateWorkspace} className="space-y-4 py-2">
            {validationError && (
              <div className="p-2 bg-[var(--trace-danger-light)] text-[var(--destructive)] text-[11px] font-sans rounded-md border border-[var(--destructive)]/10">
                {validationError}
              </div>
            )}
            
            <div className="space-y-1">
              <label className="text-[10px] font-sans font-medium text-[var(--muted-foreground)] uppercase tracking-wider block">
                Workspace Name
              </label>
              <Input
                placeholder="e.g. Primary SC Logs"
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

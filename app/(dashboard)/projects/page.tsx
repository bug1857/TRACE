'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Briefcase, Plus, Trash2, ArrowRight } from 'lucide-react';
import { mockProjects } from '@/lib/mockData';
import { Project } from '@/lib/types';
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
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [validationError, setValidationError] = useState('');

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      setValidationError('Please enter a project name.');
      return;
    }

    const newProj: Project = {
      id: `proj-${Date.now()}`,
      organizationId: 'org-1',
      name: newName,
      description: newDesc || 'No description provided.',
      eventLogsCount: 0,
      lastUpdated: new Date().toISOString().split('T')[0]
    };

    setProjects([newProj, ...projects]);
    setNewName('');
    setNewDesc('');
    setValidationError('');
    setIsDialogOpen(false);
  };

  const handleDeleteProject = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setProjects(projects.filter(p => p.id !== id));
  };

  const columns: Column<Project>[] = [
    {
      header: 'Name',
      accessorKey: 'name',
      sortable: true,
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-medium text-[#1A1917]">{row.name}</span>
          <span className="text-[11px] text-[#6B6963] max-w-[280px] truncate">{row.description}</span>
        </div>
      )
    },
    {
      header: 'Description',
      accessorKey: 'description',
      sortable: true,
      cell: (row) => <span className="text-[#6B6963] text-[13px]">{row.description}</span>
    },
    {
      header: 'Event Logs',
      accessorKey: 'eventLogsCount',
      isNumeric: true,
      sortable: true
    },
    {
      header: 'Last Updated',
      accessorKey: 'lastUpdated',
      sortable: true
    },
    {
      header: 'Actions',
      accessorKey: 'actions',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/workspaces')}
            className="h-[28px] text-[11px] font-sans text-[#2D6A4F] border-[#2D6A4F] hover:bg-[#E8F0EB] hover:text-[#2D6A4F] flex items-center gap-1 rounded-md"
          >
            <span>Enter Project</span>
            <ArrowRight className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => handleDeleteProject(row.id, e)}
            className="h-[28px] w-[28px] p-0 text-[#C0392B] hover:bg-[#FDECEA] hover:text-[#C0392B] rounded-md"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      )
    }
  ];

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
              className="h-[32px] text-[12px] font-sans font-medium border-[#2D6A4F] text-[#2D6A4F] hover:bg-[#E8F0EB] hover:text-[#2D6A4F] flex items-center gap-1.5 rounded-md"
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
          onRowClick={() => router.push('/workspaces')}
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
        <DialogContent className="max-w-[400px] bg-[#FAFAF8] border border-[#E2E0D8] rounded-md shadow-sm">
          <DialogHeader>
            <DialogTitle className="text-[16px] font-sans font-medium text-[#1A1917]">
              New Project
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateProject} className="space-y-4 py-2">
            {validationError && (
              <div className="p-2 bg-[#FDECEA] text-[#C0392B] text-[11px] font-sans rounded-md border border-[#C0392B]/10">
                {validationError}
              </div>
            )}
            
            <div className="space-y-1">
              <label className="text-[10px] font-sans font-medium text-[#6B6963] uppercase tracking-wider block">
                Project Name
              </label>
              <Input
                placeholder="e.g. Q3 Supply Chain Audit 2024"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="h-[34px] text-[13px] bg-[#F3F2EE] border-[#E2E0D8] text-[#1A1917] rounded-md focus:border-[#2D6A4F]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-sans font-medium text-[#6B6963] uppercase tracking-wider block">
                Description
              </label>
              <Input
                placeholder="Brief summary of the audit scope..."
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="h-[34px] text-[13px] bg-[#F3F2EE] border-[#E2E0D8] text-[#1A1917] rounded-md focus:border-[#2D6A4F]"
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
                className="h-[32px] text-[12px] text-[#6B6963] hover:bg-[#F3F2EE] rounded-md"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="h-[32px] text-[12px] bg-[#2D6A4F] hover:bg-[#166534] text-white rounded-md"
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

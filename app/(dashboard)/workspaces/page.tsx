'use client';

import React, { useState } from 'react';
import { Plus, LayoutGrid, Trash2, Calendar, FileCode } from 'lucide-react';
import { mockWorkspaces } from '@/lib/mockData';
import { Workspace } from '@/lib/types';
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
  const [workspaces, setWorkspaces] = useState<Workspace[]>(mockWorkspaces);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newConfig, setNewConfig] = useState('');
  const [validationError, setValidationError] = useState('');

  const handleCreateWorkspace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newConfig.trim()) {
      setValidationError('Please fill in both fields.');
      return;
    }

    const newWork: Workspace = {
      id: `work-${Date.now()}`,
      projectId: 'proj-1',
      name: newName,
      lastModified: new Date().toISOString().replace('T', ' ').substring(0, 16),
      configSummary: newConfig
    };

    setWorkspaces([...workspaces, newWork]);
    setNewName('');
    setNewConfig('');
    setValidationError('');
    setIsDialogOpen(false);
  };

  const handleDeleteWorkspace = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setWorkspaces(workspaces.filter(w => w.id !== id));
  };

  return (
    <div className="flex flex-col flex-1">
      <PageHeader
        title="Workspaces — Q3 Supply Chain Audit 2024"
        subtitle="Logical partitions containing event logs, configs, and reports."
        action={
          <div className="flex gap-2">
            <Button
              onClick={() => setIsDialogOpen(true)}
              variant="outline"
              className="h-[32px] text-[12px] font-sans font-medium border-[#2D6A4F] text-[#2D6A4F] hover:bg-[#E8F0EB] hover:text-[#2D6A4F] flex items-center gap-1.5 rounded-md"
            >
              <Plus className="w-4 h-4" />
              <span>New Workspace</span>
            </Button>
          </div>
        }
      />

      {workspaces.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {workspaces.map((w) => (
            <div
              key={w.id}
              className="bg-[#F3F2EE] border border-[#E2E0D8] rounded-md p-5 flex flex-col justify-between h-[150px] relative transition-colors hover:bg-[#ECEAE4]"
            >
              {/* Header Info */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-start pr-6">
                  <h3 className="text-[14px] font-sans font-medium text-[#1A1917] tracking-tight">
                    {w.name}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleDeleteWorkspace(w.id, e)}
                    className="h-[24px] w-[24px] p-0 text-[#C0392B] hover:bg-[#FDECEA] hover:text-[#C0392B] rounded-md absolute top-3 right-3"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
                
                <div className="flex items-center gap-1 text-[#6B6963] text-[12px]">
                  <FileCode className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{w.configSummary}</span>
                </div>
              </div>

              {/* Bottom modified stamp */}
              <div className="flex items-center gap-1 text-[11px] text-[#9B9891] font-mono border-t border-[#E2E0D8] pt-2">
                <Calendar className="w-3 h-3" />
                <span>Modified: {w.lastModified}</span>
              </div>
            </div>
          ))}
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
        <DialogContent className="max-w-[400px] bg-[#FAFAF8] border border-[#E2E0D8] rounded-md shadow-sm">
          <DialogHeader>
            <DialogTitle className="text-[16px] font-sans font-medium text-[#1A1917]">
              New Workspace
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateWorkspace} className="space-y-4 py-2">
            {validationError && (
              <div className="p-2 bg-[#FDECEA] text-[#C0392B] text-[11px] font-sans rounded-md border border-[#C0392B]/10">
                {validationError}
              </div>
            )}
            
            <div className="space-y-1">
              <label className="text-[10px] font-sans font-medium text-[#6B6963] uppercase tracking-wider block">
                Workspace Name
              </label>
              <Input
                placeholder="e.g. Primary SC Logs"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="h-[34px] text-[13px] bg-[#F3F2EE] border-[#E2E0D8] text-[#1A1917] rounded-md focus:border-[#2D6A4F]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-sans font-medium text-[#6B6963] uppercase tracking-wider block">
                Configuration Summary / Log Info
              </label>
              <Input
                placeholder="e.g. OCEL 2.0 Log • 1,247 events"
                value={newConfig}
                onChange={(e) => setNewConfig(e.target.value)}
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

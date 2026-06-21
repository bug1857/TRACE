'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Building2, Plus, Trash2, ArrowRight } from 'lucide-react';
import { mockOrganizations } from '@/lib/mockData';
import { Organization } from '@/lib/types';
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

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>(mockOrganizations);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCountry, setNewCountry] = useState('India');
  const [validationError, setValidationError] = useState('');

  const handleCreateOrg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newCountry.trim()) {
      setValidationError('Please enter both name and country.');
      return;
    }

    const newOrg: Organization = {
      id: `org-${Date.now()}`,
      name: newName,
      country: newCountry,
      projectsCount: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setOrganizations([newOrg, ...organizations]);
    setNewName('');
    setNewCountry('India');
    setValidationError('');
    setIsDialogOpen(false);
  };

  const handleDeleteOrg = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOrganizations(organizations.filter(o => o.id !== id));
  };

  const columns: Column<Organization>[] = [
    {
      header: 'Name',
      accessorKey: 'name',
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-[#6B6963]" />
          <span className="font-medium text-[#1A1917]">{row.name}</span>
        </div>
      )
    },
    {
      header: 'Country',
      accessorKey: 'country',
      sortable: true
    },
    {
      header: 'Projects',
      accessorKey: 'projectsCount',
      isNumeric: true,
      sortable: true
    },
    {
      header: 'Created',
      accessorKey: 'createdAt',
      sortable: true
    },
    {
      header: 'Actions',
      accessorKey: 'actions',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Link href="/projects">
            <Button
              variant="outline"
              size="sm"
              className="h-[28px] text-[11px] font-sans text-[#2D6A4F] border-[#2D6A4F] hover:bg-[#E8F0EB] hover:text-[#2D6A4F] flex items-center gap-1 rounded-md"
            >
              <span>View Projects</span>
              <ArrowRight className="w-3 h-3" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => handleDeleteOrg(row.id, e)}
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
        title="Organizations"
        subtitle="Manage your enterprise divisions and operational entities."
        action={
          <div className="flex gap-2">
            <Button
              onClick={() => setIsDialogOpen(true)}
              variant="outline"
              className="h-[32px] text-[12px] font-sans font-medium border-[#2D6A4F] text-[#2D6A4F] hover:bg-[#E8F0EB] hover:text-[#2D6A4F] flex items-center gap-1.5 rounded-md"
            >
              <Plus className="w-4 h-4" />
              <span>New Organization</span>
            </Button>
          </div>
        }
      />

      {organizations.length > 0 ? (
        <DataTable columns={columns} data={organizations} />
      ) : (
        <EmptyState
          icon={Building2}
          title="No organizations yet"
          description="Create your first organization to begin process mining and carbon audit analyses."
          actionText="Create Organization"
          onAction={() => setIsDialogOpen(true)}
        />
      )}

      {/* New Organization Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[400px] bg-[#FAFAF8] border border-[#E2E0D8] rounded-md shadow-sm">
          <DialogHeader>
            <DialogTitle className="text-[16px] font-sans font-medium text-[#1A1917]">
              New Organization
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateOrg} className="space-y-4 py-2">
            {validationError && (
              <div className="p-2 bg-[#FDECEA] text-[#C0392B] text-[11px] font-sans rounded-md border border-[#C0392B]/10">
                {validationError}
              </div>
            )}
            
            <div className="space-y-1">
              <label className="text-[10px] font-sans font-medium text-[#6B6963] uppercase tracking-wider block">
                Organization Name
              </label>
              <Input
                placeholder="e.g. Louis India Pvt. Ltd."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="h-[34px] text-[13px] bg-[#F3F2EE] border-[#E2E0D8] text-[#1A1917] rounded-md focus:border-[#2D6A4F]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-sans font-medium text-[#6B6963] uppercase tracking-wider block">
                Country / Region
              </label>
              <Input
                placeholder="e.g. India"
                value={newCountry}
                onChange={(e) => setNewCountry(e.target.value)}
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

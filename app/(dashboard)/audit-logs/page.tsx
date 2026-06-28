/* eslint-disable */
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Download, Search, CheckCircle } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import DataTable, { Column } from '@/components/shared/DataTable';
import DemoDataBanner from '@/components/shared/DemoDataBanner';
import { mockAuditLogs } from '@/lib/mockData';
import { AuditLog } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getAuditLogs } from '@/lib/api';

interface BackendAuditLog {
  id: number;
  timestamp: string;
  action_type: string;
  target: string;
  details?: string;
  project_id?: string;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isRealData, setIsRealData] = useState(false);
  const [filterAction, setFilterAction] = useState('ALL');
  const [searchUser, setSearchUser] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState('');

  useEffect(() => {
    let active = true;
    getAuditLogs()
      .then((data) => {
        if (!active) return;
        if (data && data.length > 0) {
          const mappedLogs: AuditLog[] = data.map((item: BackendAuditLog) => ({
            id: String(item.id),
            timestamp: item.timestamp,
            user: '—',
            action: item.action_type,
            target: item.target,
            ip: '—',
            status: 'success',
            details: item.details
          }));
          setLogs(mappedLogs);
          setIsRealData(true);
        } else {
          setLogs(mockAuditLogs);
          setIsRealData(false);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch audit logs:', err);
        if (!active) return;
        setLogs(mockAuditLogs);
        setIsRealData(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleExportCSV = () => {
    if (filteredLogs.length === 0) return;

    const escapeCSV = (val: string | number | undefined | null) => {
      if (val === undefined || val === null) return '""';
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const headers = ['Timestamp', 'User', 'Action', 'Target/Entity', 'Details', 'IP Address', 'Status'];
    const rows = filteredLogs.map((log) => [
      log.timestamp,
      log.user,
      log.action,
      log.target,
      log.details || '',
      log.ip,
      log.status
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map(escapeCSV).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setFeedbackMsg('Audit logs exported to CSV successfully.');
    setTimeout(() => setFeedbackMsg(''), 4000);
  };

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchAction = filterAction === 'ALL' || log.action === filterAction;
      const matchUser = isRealData
        ? true
        : searchUser.trim() === '' || log.user.toLowerCase().includes(searchUser.toLowerCase());
      return matchAction && matchUser;
    });
  }, [logs, filterAction, searchUser, isRealData]);

  const columns: Column<AuditLog>[] = [
    {
      header: 'Timestamp',
      accessorKey: 'timestamp',
      sortable: true,
      cell: (row) => <span className="font-mono text-[var(--foreground)]">{row.timestamp}</span>
    },
    {
      header: 'User',
      accessorKey: 'user',
      sortable: true,
      cell: (row) => <span className="font-sans font-medium">{row.user}</span>
    },
    {
      header: 'Action',
      accessorKey: 'action',
      sortable: true,
      cell: (row) => (
        <span className="font-mono text-[11px] text-[var(--primary)] bg-[var(--accent)] px-2 py-0.5 border border-[var(--primary)]/10 rounded-sm">
          {row.action}
        </span>
      )
    },
    {
      header: 'Target / Entity',
      accessorKey: 'target',
      sortable: true
    },
    {
      header: 'Details',
      accessorKey: 'details',
      cell: (row) => <span className="font-sans text-[var(--muted-foreground)]">{row.details || '—'}</span>
    },
    {
      header: 'IP Address',
      accessorKey: 'ip',
      sortable: true,
      cell: (row) => <span className="font-mono text-[var(--muted-foreground)]">{row.ip}</span>
    },
    {
      header: 'Status',
      accessorKey: 'status',
      sortable: true,
      cell: (row) => {
        const isSuccess = row.status === 'success';
        return (
          <span className={`inline-flex items-center gap-1 font-sans font-medium text-[12px] ${
            isSuccess ? 'text-[var(--trace-success)]' : 'text-[var(--destructive)]'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isSuccess ? 'bg-[var(--trace-success)]' : 'bg-[var(--destructive)]'}`} />
            <span>{isSuccess ? 'Success' : 'Failed'}</span>
          </span>
        );
      }
    }
  ];

  return (
    <div className="flex flex-col flex-1 space-y-6">
      <PageHeader
        title="Audit Logs Ledger"
        subtitle="System compliance and security action trails tracking user inputs, configuration updates, and report generations."
        action={
          <Button
            onClick={handleExportCSV}
            variant="outline"
            className="h-[32px] text-[12px] font-sans font-medium border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--accent)] hover:text-[var(--primary)] flex items-center gap-1.5 rounded-md"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </Button>
        }
      />

      <DemoDataBanner show={!isRealData} />

      {/* Feedback Banner */}
      {feedbackMsg && (
        <div className="p-3 bg-[var(--trace-success-light)] border border-[var(--trace-success)]/10 text-[var(--trace-success)] text-[13px] rounded-md font-sans flex items-center gap-2 select-none">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Search Filter Panel */}
      <div className="border border-[var(--border)] bg-[var(--background)] p-4 rounded-md shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4 items-center select-none">
        
        {/* Filter 1: Search by User */}
        <div className="space-y-1">
          <label className="text-[10px] font-sans font-medium text-[var(--muted-foreground)] uppercase tracking-wider block">
            Filter by Auditor User
          </label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[var(--trace-subtle)] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="e.g. rajesh.sharma@louisindia.com"
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
              disabled={isRealData}
              className="h-[32px] text-[12px] pl-8 bg-[var(--card)] border-[var(--border)] text-[var(--foreground)] rounded-md focus:border-[var(--primary)] disabled:opacity-50"
            />
          </div>
        </div>

        {/* Filter 2: Search by Action Type */}
        <div className="space-y-1">
          <label className="text-[10px] font-sans font-medium text-[var(--muted-foreground)] uppercase tracking-wider block">
            Filter by Action Type
          </label>
          <Select value={filterAction} onValueChange={(val) => setFilterAction(val || 'ALL')}>
            <SelectTrigger className="h-[32px] text-[12px] bg-[var(--card)] border-[var(--border)] text-[var(--foreground)] rounded-md focus:ring-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[var(--background)] border-[var(--border)] rounded-md">
              <SelectItem value="ALL" className="text-[12px]">All Audit Actions</SelectItem>
              <SelectItem value="RUN_SIMULATION" className="text-[12px]">RUN_SIMULATION</SelectItem>
              <SelectItem value="UPLOAD_OCEL_LOG" className="text-[12px]">UPLOAD_OCEL_LOG</SelectItem>
              <SelectItem value="UPDATE_EMISSION_FACTOR" className="text-[12px]">UPDATE_EMISSION_FACTOR</SelectItem>
              <SelectItem value="REQUEST_CORRECTIVE_ACTION" className="text-[12px]">REQUEST_CORRECTIVE_ACTION</SelectItem>
              <SelectItem value="EXPORTS_PDF_REPORT" className="text-[12px]">EXPORTS_PDF_REPORT</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filter 3: Reset Button */}
        <div className="pt-5 flex justify-end">
          {(searchUser || filterAction !== 'ALL') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchUser('');
                setFilterAction('ALL');
              }}
              className="h-[32px] text-[12px] text-[var(--destructive)] hover:bg-[var(--card)] rounded-md"
            >
              Reset Filters
            </Button>
          )}
        </div>

      </div>

      {/* Audit Logs Table */}
      <div className="space-y-3">
        <h3 className="text-[13px] font-sans font-medium text-[var(--foreground)] uppercase tracking-wider">
          Audited Actions History
        </h3>
        <DataTable columns={columns} data={filteredLogs} />
      </div>
    </div>
  );
}

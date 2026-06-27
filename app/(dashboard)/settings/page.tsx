'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle, Save, Upload, Users } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockEmissionFactors } from '@/lib/mockData';
import { EmissionFactor, BackendTeamMember } from '@/lib/types';
import DataTable, { Column } from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import api from '@/lib/api';
import { useWorkspace } from '@/lib/WorkspaceContext';

const activityToCategory: Record<string, string> = {
  'Air Freight Dispatch': 'air_freight',
  'Road Transport Dispatch': 'road_transport',
  'Warehouse Pick & Pack': 'warehouse',
  'Customs Clearance Yard': 'customs',
  'Last Mile Delivery': 'last_mile'
};

export default function SettingsPage() {
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const { activeOrgId, organizations, refreshOrganizations } = useWorkspace();
  
  // General State
  const activeOrg = organizations.find(o => o.id === activeOrgId) ?? null;
  const orgName = activeOrg?.name ?? 'Louis India Pvt. Ltd.';
  const orgCountry = activeOrg?.country ?? 'India';
  const fiscalYear = activeOrg?.fiscal_year ?? '2024-2025';

  // Emission Factors State
  const [factors, setFactors] = useState<EmissionFactor[]>(mockEmissionFactors);

  // Model State
  const [modelFile] = useState('decarbonization_policy_rules_v2.pnml');
  const [ruleStatus, setRuleStatus] = useState<{ active: boolean; filename: string; rule_count: number } | null>(null);

  useEffect(() => {
    const fetchRules = async () => {
      try {
        const { data } = await api.get('/api/conformance-rules');
        setRuleStatus({
          active: data.active,
          filename: data.filename,
          rule_count: data.rule_count
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchRules();
  }, []);

  // Team State
  const [team, setTeam] = useState<BackendTeamMember[]>([]);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'admin' | 'editor' | 'viewer'>('viewer');

  // Load team members when activeOrgId changes
  useEffect(() => {
    const fetchTeam = async () => {
      if (activeOrgId === null) {
        setTeam([]);
        return;
      }
      try {
        const response = await api.get(`/api/organizations/${activeOrgId}/members`);
        setTeam(response.data);
      } catch (err) {
        console.error('Error fetching team members:', err);
        setTeam([]);
      }
    };
    fetchTeam();
  }, [activeOrgId]);

  const triggerFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(''), 4000);
  };

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeOrgId === null) {
      triggerFeedback('No active organization selected.');
      return;
    }
    try {
      await api.patch(`/api/organizations/${activeOrgId}`, {
        name: orgName,
        country: orgCountry,
        fiscal_year: fiscalYear
      });
      await refreshOrganizations();
      triggerFeedback('General organizational settings updated successfully.');
    } catch (err) {
      console.error('Failed to save settings:', err);
      triggerFeedback('Failed to save settings.');
    }
  };

  const handleFactorChange = (id: string, value: number) => {
    setFactors(factors.map(f => f.id === id ? { ...f, factor: value } : f));
  };

  // Load emission factors from backend on mount
  useEffect(() => {
    const fetchFactors = async () => {
      try {
        const response = await api.get('/api/emission-factors');
        const overrides = response.data;
        setFactors(prev => prev.map(f => {
          const cat = activityToCategory[f.activity];
          if (cat && overrides[cat] !== undefined) {
            return { ...f, factor: overrides[cat] };
          }
          return f;
        }));
      } catch (err) {
        console.error('Error fetching emission factors:', err);
      }
    };
    fetchFactors();
  }, []);

  const handleSaveFactors = async () => {
    try {
      const payload: Record<string, number> = {};
      factors.forEach(f => {
        const cat = activityToCategory[f.activity];
        if (cat) {
          payload[cat] = f.factor;
        }
      });
      const response = await api.post('/api/emission-factors', payload);
      if (response.status === 200) {
        triggerFeedback('Emission factors database saved and synced.');
      }
    } catch (err) {
      console.error('Error saving emission factors:', err);
      triggerFeedback('Failed to save emission factors.');
    }
  };

  const handleModelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await api.post('/api/conformance-rules/upload', formData);
      setRuleStatus({
        active: true,
        filename: file.name,
        rule_count: response.data.rule_count
      });
      triggerFeedback(`Normative model updated: ${file.name} (${response.data.rule_count} rule group(s) loaded)`);
    } catch (err) {
      const apiErr = err as { response?: { status: number, data: { detail: string } } };
      if (apiErr.response && apiErr.response.status === 422) {
        triggerFeedback(`Invalid CSV: ${apiErr.response.data.detail}`);
      } else {
        triggerFeedback('Failed to upload model file.');
      }
    }
  };

  const handleResetRules = async () => {
    try {
      await api.delete('/api/conformance-rules');
      setRuleStatus(prev => prev ? { ...prev, active: false, filename: 'decarbonization_policy_rules_v2.pnml (default)' } : null);
      triggerFeedback('Reverted to default conformance rules.');
    } catch {
      triggerFeedback('Failed to reset rules.');
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberEmail.trim()) return;
    if (activeOrgId === null) {
      triggerFeedback('No active organization selected.');
      return;
    }

    const email = newMemberEmail.trim();
    const name = email.split('@')[0].split('.').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');

    try {
      const response = await api.post(`/api/organizations/${activeOrgId}/members`, {
        name,
        email,
        role: newMemberRole
      });
      setTeam([...team, response.data]);
      setNewMemberEmail('');
      triggerFeedback(`Added ${name} as ${newMemberRole}.`);
    } catch (err) {
      const apiErr = err as { response?: { status: number } };
      if (apiErr.response && apiErr.response.status === 400) {
        triggerFeedback('A member with this email already exists.');
      } else {
        triggerFeedback('Failed to add member.');
      }
    }
  };

  // Team Columns for DataTable
  const teamColumns: Column<BackendTeamMember>[] = [
    {
      header: 'Name',
      accessorKey: 'name',
      sortable: true,
      cell: (row) => <span className="font-medium text-[var(--foreground)]">{row.name}</span>
    },
    {
      header: 'Email Address',
      accessorKey: 'email',
      sortable: true,
      cell: (row) => <span className="font-mono text-[var(--muted-foreground)]">{row.email}</span>
    },
    {
      header: 'Access Role',
      accessorKey: 'role',
      sortable: true,
      cell: (row) => {
        const roleMap: Record<string, 'critical' | 'warning' | 'pass' | 'info'> = {
          admin: 'critical',
          editor: 'warning',
          viewer: 'info'
        };
        return <StatusBadge status={roleMap[row.role]} label={row.role.toUpperCase()} />;
      }
    },
    {
      header: 'Actions',
      accessorKey: 'actions',
      cell: (row) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={async () => {
            if (activeOrgId === null) return;
            try {
              await api.delete(`/api/organizations/${activeOrgId}/members/${row.id}`);
              setTeam(team.filter(t => t.id !== row.id));
              triggerFeedback(`Removed ${row.name}.`);
            } catch {
              triggerFeedback('Failed to remove member.');
            }
          }}
          className="h-[28px] text-[var(--destructive)] hover:bg-[var(--trace-danger-light)] hover:text-[var(--destructive)] rounded-md"
        >
          Remove
        </Button>
      )
    }
  ];

  return (
    <div className="flex flex-col flex-1 space-y-6">
      <PageHeader
        title="Settings & Configurations"
        subtitle="Manage organization boundaries, configure Scope 3 CO₂ emission factors, and set up compliance models."
      />

      {/* Feedback Banner */}
      {feedbackMsg && (
        <div className="p-3 bg-[var(--trace-success-light)] border border-[var(--trace-success)]/10 text-[var(--trace-success)] text-[13px] rounded-md font-sans flex items-center gap-2 select-none">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="bg-[var(--card)] border border-[var(--border)] p-0.5 rounded-md h-[34px] mb-6">
          <TabsTrigger value="general" className="text-[12px] font-sans px-4 h-[28px] rounded-sm data-[state=active]:bg-[var(--background)] text-[var(--muted-foreground)] focus-visible:ring-0">General</TabsTrigger>
          <TabsTrigger value="factors" className="text-[12px] font-sans px-4 h-[28px] rounded-sm data-[state=active]:bg-[var(--background)] text-[var(--muted-foreground)] focus-visible:ring-0">Emission Factors</TabsTrigger>
          <TabsTrigger value="model" className="text-[12px] font-sans px-4 h-[28px] rounded-sm data-[state=active]:bg-[var(--background)] text-[var(--muted-foreground)] focus-visible:ring-0">Normative Model</TabsTrigger>
          <TabsTrigger value="team" className="text-[12px] font-sans px-4 h-[28px] rounded-sm data-[state=active]:bg-[var(--background)] text-[var(--muted-foreground)] focus-visible:ring-0">Team Access</TabsTrigger>
        </TabsList>

        {/* Tab 1: General Settings */}
        <TabsContent value="general" className="outline-none focus:outline-none">
          <div className="max-w-[460px] border border-[var(--border)] bg-[var(--background)] p-6 rounded-md shadow-sm space-y-6">
            <h3 className="text-[13px] font-sans font-medium text-[var(--foreground)] uppercase tracking-wider border-b border-[var(--border)] pb-2">
              Organizational Parameters
            </h3>

            <form onSubmit={handleSaveGeneral} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-sans font-medium text-[var(--muted-foreground)] uppercase tracking-wider block">
                  Organization Legal Name
                </label>
                <Input
                  value={orgName} 
                  readOnly
                  className="h-[34px] text-[13px] bg-[var(--card)] border-[var(--border)] text-[var(--foreground)] rounded-md focus:border-[var(--primary)]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-sans font-medium text-[var(--muted-foreground)] uppercase tracking-wider block">
                  Country / Headquarters
                </label>
                <Input
                  value={orgCountry} 
                  readOnly
                  className="h-[34px] text-[13px] bg-[var(--card)] border-[var(--border)] text-[var(--foreground)] rounded-md focus:border-[var(--primary)]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-sans font-medium text-[var(--muted-foreground)] uppercase tracking-wider block">
                  Reporting Fiscal Year
                </label>
                <Select value={fiscalYear}>
                  <SelectTrigger className="h-[32px] text-[12px] bg-[var(--card)] border-[var(--border)] text-[var(--foreground)] rounded-md focus:ring-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[var(--background)] border-[var(--border)] rounded-md">
                    <SelectItem value="2024-2025" className="text-[12px]">FY 2024 - 2025</SelectItem>
                    <SelectItem value="2023-2024" className="text-[12px]">FY 2023 - 2024</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                className="h-[34px] bg-[var(--primary)] hover:bg-[var(--trace-success)] text-white text-[13px] rounded-md flex items-center gap-1.5 transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Save Configuration</span>
              </Button>
            </form>
          </div>
        </TabsContent>

        {/* Tab 2: Emission Factors */}
        <TabsContent value="factors" className="outline-none focus:outline-none space-y-4">
          <div className="flex justify-between items-center select-none">
            <div>
              <h3 className="text-[13px] font-sans font-medium text-[var(--foreground)] uppercase tracking-wider">
                Activity Carbon Coefficients Database
              </h3>
              <p className="text-[11px] text-[var(--muted-foreground)] font-sans mt-0.5">
                Changes apply to all future uploads — already-analyzed data is not retroactively recalculated.
              </p>
            </div>
            <Button
              onClick={handleSaveFactors}
              className="h-[32px] bg-[var(--primary)] hover:bg-[var(--trace-success)] text-white text-[12px] rounded-md flex items-center gap-1.5 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save Factors Ledger</span>
            </Button>
          </div>

          <div className="border border-[var(--border)] rounded-md bg-[var(--background)]">
            <table className="border-collapse w-full text-[13px]">
              <thead className="bg-[var(--card)] border-b-2 border-[var(--border)]">
                <tr className="h-[38px] text-[var(--trace-subtle)] text-[10px] font-sans uppercase font-medium tracking-wider">
                  <th className="px-4 py-2 text-left">Activity Node Name</th>
                  <th className="px-4 py-2 text-right">Factor (kg CO₂e)</th>
                  <th className="px-4 py-2 text-left">Reference Source</th>
                  <th className="px-4 py-2 text-left">Standard Unit</th>
                </tr>
              </thead>
              <tbody>
                {factors.map((f) => (
                  <tr key={f.id} className="h-[44px] border-b border-[var(--border)] last:border-b-0">
                    <td className="px-4 py-2 text-[var(--foreground)] font-medium">{f.activity}</td>
                    <td className="px-4 py-2 text-right font-mono w-[160px]">
                      <Input
                        type="number"
                        step="0.01"
                        value={f.factor}
                        onChange={(e) => handleFactorChange(f.id, parseFloat(e.target.value) || 0)}
                        className="h-[28px] text-[12px] font-mono text-right bg-[var(--card)] border-[var(--border)] text-[var(--foreground)] rounded-md focus:border-[var(--primary)]"
                      />
                    </td>
                    <td className="px-4 py-2 text-[var(--muted-foreground)]">{f.source}</td>
                    <td className="px-4 py-2 text-[var(--trace-subtle)] font-mono text-[11px]">{f.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* Tab 3: Normative Model */}
        <TabsContent value="model" className="outline-none focus:outline-none">
          <div className="max-w-[500px] border border-[var(--border)] bg-[var(--background)] p-6 rounded-md shadow-sm space-y-6 select-none">
            <h3 className="text-[13px] font-sans font-medium text-[var(--foreground)] uppercase tracking-wider border-b border-[var(--border)] pb-2">
              Normative Process Policy Model
            </h3>

            <div className="space-y-4">
              <div className="p-3.5 bg-[var(--card)] border border-[var(--border)] rounded-md text-[13px] space-y-2">
                <div>
                  <span className="text-[10px] text-[var(--muted-foreground)] uppercase block">Currently Active Policy ruleset</span>
                  <span className="font-mono text-[12px] font-semibold text-[var(--foreground)]">
                    {ruleStatus?.filename ?? modelFile}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[var(--muted-foreground)] uppercase block">Rules Count</span>
                  <span className="font-sans font-medium text-[var(--primary)]">
                    {ruleStatus ? `${ruleStatus.rule_count} rule group(s) — ${ruleStatus.active ? 'custom' : 'default'}` : '4 Active ESG constraints'}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-sans font-medium text-[var(--muted-foreground)] uppercase tracking-wider block">
                  Replace Ruleset Model File
                </label>
                <div className="border border-dashed border-[var(--border)] bg-[var(--card)] hover:bg-[#ECEAE4] rounded-md p-6 text-center cursor-pointer transition-colors relative">
                  <input
                    type="file"
                    accept=".pnml,.csv"
                    onChange={handleModelUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <Upload className="w-8 h-8 text-[var(--muted-foreground)] mx-auto mb-2" strokeWidth={1.5} />
                  <span className="text-[12px] font-sans font-medium text-[var(--foreground)] block">Drop PNML model file here, or click to upload</span>
                  <span className="text-[10px] text-[var(--muted-foreground)] block mt-1">Accepts standard PNML or structured CSV rulesets</span>
                </div>
                {ruleStatus?.active === true && (
                  <Button variant="outline" onClick={handleResetRules} className="w-full h-[32px] text-[11px] border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--card)] rounded-md">Revert to Default Rules</Button>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Tab 4: Team Access */}
        <TabsContent value="team" className="outline-none focus:outline-none space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start">
            {/* Team Add form */}
            <div className="border border-[var(--border)] bg-[var(--background)] p-5 rounded-md shadow-sm space-y-4 select-none">
              <h3 className="text-[13px] font-sans font-medium text-[var(--foreground)] uppercase tracking-wider border-b border-[var(--border)] pb-2">
                Invite Member
              </h3>

              <form onSubmit={handleAddMember} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-sans font-medium text-[var(--muted-foreground)] uppercase tracking-wider block">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    placeholder="name@louisindia.com"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    className="h-[34px] text-[13px] bg-[var(--card)] border-[var(--border)] text-[var(--foreground)] rounded-md focus:border-[var(--primary)]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-sans font-medium text-[var(--muted-foreground)] uppercase tracking-wider block">
                    Access Level
                  </label>
                  <Select
                    value={newMemberRole}
                    onValueChange={(val) => setNewMemberRole((val as 'admin' | 'editor' | 'viewer') || 'viewer')}
                  >
                    <SelectTrigger className="h-[32px] text-[12px] bg-[var(--card)] border-[var(--border)] text-[var(--foreground)] rounded-md focus:ring-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[var(--background)] border-[var(--border)] rounded-md">
                      <SelectItem value="viewer" className="text-[12px]">Viewer (Read Only)</SelectItem>
                      <SelectItem value="editor" className="text-[12px]">Editor (Read/Write)</SelectItem>
                      <SelectItem value="admin" className="text-[12px]">Admin (Full Access)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="submit"
                  className="w-full h-[34px] bg-[var(--primary)] hover:bg-[var(--trace-success)] text-white text-[12px] rounded-md flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Send Invite</span>
                </Button>
              </form>
            </div>

            {/* Team Roster */}
            <div className="space-y-3">
              <h3 className="text-[13px] font-sans font-medium text-[var(--foreground)] uppercase tracking-wider">
                Auditor Roster Access Ledger
              </h3>
              <DataTable columns={teamColumns} data={team} />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

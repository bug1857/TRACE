'use client';

import React, { useState } from 'react';
import { CheckCircle, Save, Upload, Users, Cpu, Database } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockEmissionFactors, mockTeamMembers } from '@/lib/mockData';
import { EmissionFactor, TeamMember } from '@/lib/types';
import DataTable, { Column } from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';

export default function SettingsPage() {
  const [feedbackMsg, setFeedbackMsg] = useState('');
  
  // General State
  const [orgName, setOrgName] = useState('Louis India Pvt. Ltd.');
  const [orgCountry, setOrgCountry] = useState('India');
  const [fiscalYear, setFiscalYear] = useState('2024-2025');

  // Emission Factors State
  const [factors, setFactors] = useState<EmissionFactor[]>(mockEmissionFactors);

  // Model State
  const [modelFile, setModelFile] = useState('decarbonization_policy_rules_v2.pnml');

  // Team State
  const [team, setTeam] = useState<TeamMember[]>(mockTeamMembers);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'admin' | 'editor' | 'viewer'>('viewer');

  const triggerFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(''), 4000);
  };

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    triggerFeedback('General organizational settings updated successfully.');
  };

  const handleFactorChange = (id: string, value: number) => {
    setFactors(factors.map(f => f.id === id ? { ...f, factor: value } : f));
  };

  const handleSaveFactors = () => {
    triggerFeedback('Emission factors database saved and synced.');
  };

  const handleModelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileName = e.target.files[0].name;
      setModelFile(fileName);
      triggerFeedback(`Normative process model updated to ${fileName}`);
    }
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberEmail.trim()) return;

    const email = newMemberEmail.trim();
    const name = email.split('@')[0].split('.').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');

    const newMemb: TeamMember = {
      id: `t-${Date.now()}`,
      name,
      email,
      role: newMemberRole
    };

    setTeam([...team, newMemb]);
    setNewMemberEmail('');
    triggerFeedback(`Added team member ${name} as ${newMemberRole}.`);
  };

  // Team Columns for DataTable
  const teamColumns: Column<TeamMember>[] = [
    {
      header: 'Name',
      accessorKey: 'name',
      sortable: true,
      cell: (row) => <span className="font-medium text-[#1A1917]">{row.name}</span>
    },
    {
      header: 'Email Address',
      accessorKey: 'email',
      sortable: true,
      cell: (row) => <span className="font-mono text-[#6B6963]">{row.email}</span>
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
          onClick={() => {
            setTeam(team.filter(t => t.id !== row.id));
            triggerFeedback(`Removed ${row.name} from project.`);
          }}
          className="h-[28px] text-[#C0392B] hover:bg-[#FDECEA] hover:text-[#C0392B] rounded-md"
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
        <div className="p-3 bg-[#DCFCE7] border border-[#166534]/10 text-[#166534] text-[13px] rounded-md font-sans flex items-center gap-2 select-none">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="bg-[#F3F2EE] border border-[#E2E0D8] p-0.5 rounded-md h-[34px] mb-6">
          <TabsTrigger value="general" className="text-[12px] font-sans px-4 h-[28px] rounded-sm data-[state=active]:bg-[#FAFAF8] text-[#6B6963] focus-visible:ring-0">General</TabsTrigger>
          <TabsTrigger value="factors" className="text-[12px] font-sans px-4 h-[28px] rounded-sm data-[state=active]:bg-[#FAFAF8] text-[#6B6963] focus-visible:ring-0">Emission Factors</TabsTrigger>
          <TabsTrigger value="model" className="text-[12px] font-sans px-4 h-[28px] rounded-sm data-[state=active]:bg-[#FAFAF8] text-[#6B6963] focus-visible:ring-0">Normative Model</TabsTrigger>
          <TabsTrigger value="team" className="text-[12px] font-sans px-4 h-[28px] rounded-sm data-[state=active]:bg-[#FAFAF8] text-[#6B6963] focus-visible:ring-0">Team Access</TabsTrigger>
          <TabsTrigger value="integrations" className="text-[12px] font-sans px-4 h-[28px] rounded-sm data-[state=active]:bg-[#FAFAF8] text-[#6B6963] focus-visible:ring-0">Integrations</TabsTrigger>
        </TabsList>

        {/* Tab 1: General Settings */}
        <TabsContent value="general" className="outline-none focus:outline-none">
          <div className="max-w-[460px] border border-[#E2E0D8] bg-[#FAFAF8] p-6 rounded-md shadow-sm space-y-6">
            <h3 className="text-[13px] font-sans font-medium text-[#1A1917] uppercase tracking-wider border-b border-[#E2E0D8] pb-2">
              Organizational Parameters
            </h3>

            <form onSubmit={handleSaveGeneral} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-sans font-medium text-[#6B6963] uppercase tracking-wider block">
                  Organization Legal Name
                </label>
                <Input
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="h-[34px] text-[13px] bg-[#F3F2EE] border-[#E2E0D8] text-[#1A1917] rounded-md focus:border-[#2D6A4F]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-sans font-medium text-[#6B6963] uppercase tracking-wider block">
                  Country / Headquarters
                </label>
                <Input
                  value={orgCountry}
                  onChange={(e) => setOrgCountry(e.target.value)}
                  className="h-[34px] text-[13px] bg-[#F3F2EE] border-[#E2E0D8] text-[#1A1917] rounded-md focus:border-[#2D6A4F]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-sans font-medium text-[#6B6963] uppercase tracking-wider block">
                  Reporting Fiscal Year
                </label>
                <Select value={fiscalYear} onValueChange={(val) => setFiscalYear(val || '2024-2025')}>
                  <SelectTrigger className="h-[32px] text-[12px] bg-[#F3F2EE] border-[#E2E0D8] text-[#1A1917] rounded-md focus:ring-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#FAFAF8] border-[#E2E0D8] rounded-md">
                    <SelectItem value="2024-2025" className="text-[12px]">FY 2024 - 2025</SelectItem>
                    <SelectItem value="2023-2024" className="text-[12px]">FY 2023 - 2024</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                className="h-[34px] bg-[#2D6A4F] hover:bg-[#166534] text-white text-[13px] rounded-md flex items-center gap-1.5 transition-colors"
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
            <h3 className="text-[13px] font-sans font-medium text-[#1A1917] uppercase tracking-wider">
              Activity Carbon Coefficients Database
            </h3>
            <Button
              onClick={handleSaveFactors}
              className="h-[32px] bg-[#2D6A4F] hover:bg-[#166534] text-white text-[12px] rounded-md flex items-center gap-1.5 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save Factors Ledger</span>
            </Button>
          </div>

          <div className="border border-[#E2E0D8] rounded-md bg-[#FAFAF8]">
            <table className="border-collapse w-full text-[13px]">
              <thead className="bg-[#F3F2EE] border-b-2 border-[#E2E0D8]">
                <tr className="h-[38px] text-[#9B9891] text-[10px] font-sans uppercase font-medium tracking-wider">
                  <th className="px-4 py-2 text-left">Activity Node Name</th>
                  <th className="px-4 py-2 text-right">Factor (kg CO₂e)</th>
                  <th className="px-4 py-2 text-left">Reference Source</th>
                  <th className="px-4 py-2 text-left">Standard Unit</th>
                </tr>
              </thead>
              <tbody>
                {factors.map((f) => (
                  <tr key={f.id} className="h-[44px] border-b border-[#E2E0D8] last:border-b-0">
                    <td className="px-4 py-2 text-[#1A1917] font-medium">{f.activity}</td>
                    <td className="px-4 py-2 text-right font-mono w-[160px]">
                      <Input
                        type="number"
                        step="0.01"
                        value={f.factor}
                        onChange={(e) => handleFactorChange(f.id, parseFloat(e.target.value) || 0)}
                        className="h-[28px] text-[12px] font-mono text-right bg-[#F3F2EE] border-[#E2E0D8] text-[#1A1917] rounded-md focus:border-[#2D6A4F]"
                      />
                    </td>
                    <td className="px-4 py-2 text-[#6B6963]">{f.source}</td>
                    <td className="px-4 py-2 text-[#9B9891] font-mono text-[11px]">{f.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* Tab 3: Normative Model */}
        <TabsContent value="model" className="outline-none focus:outline-none">
          <div className="max-w-[500px] border border-[#E2E0D8] bg-[#FAFAF8] p-6 rounded-md shadow-sm space-y-6 select-none">
            <h3 className="text-[13px] font-sans font-medium text-[#1A1917] uppercase tracking-wider border-b border-[#E2E0D8] pb-2">
              Normative Process Policy Model
            </h3>

            <div className="space-y-4">
              <div className="p-3.5 bg-[#F3F2EE] border border-[#E2E0D8] rounded-md text-[13px] space-y-2">
                <div>
                  <span className="text-[10px] text-[#6B6963] uppercase block">Currently Active Policy ruleset</span>
                  <span className="font-mono text-[12px] font-semibold text-[#1A1917]">{modelFile}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#6B6963] uppercase block">Rules Count</span>
                  <span className="font-sans font-medium text-[#2D6A4F]">4 Active ESG constraints</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-sans font-medium text-[#6B6963] uppercase tracking-wider block">
                  Replace Ruleset Model File
                </label>
                <div className="border border-dashed border-[#E2E0D8] bg-[#F3F2EE] hover:bg-[#ECEAE4] rounded-md p-6 text-center cursor-pointer transition-colors relative">
                  <input
                    type="file"
                    accept=".pnml,.csv"
                    onChange={handleModelUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <Upload className="w-8 h-8 text-[#6B6963] mx-auto mb-2" strokeWidth={1.5} />
                  <span className="text-[12px] font-sans font-medium text-[#1A1917] block">Drop PNML model file here, or click to upload</span>
                  <span className="text-[10px] text-[#6B6963] block mt-1">Accepts standard PNML or structured CSV rulesets</span>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Tab 4: Team Access */}
        <TabsContent value="team" className="outline-none focus:outline-none space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start">
            {/* Team Add form */}
            <div className="border border-[#E2E0D8] bg-[#FAFAF8] p-5 rounded-md shadow-sm space-y-4 select-none">
              <h3 className="text-[13px] font-sans font-medium text-[#1A1917] uppercase tracking-wider border-b border-[#E2E0D8] pb-2">
                Invite Member
              </h3>

              <form onSubmit={handleAddMember} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-sans font-medium text-[#6B6963] uppercase tracking-wider block">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    placeholder="name@louisindia.com"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    className="h-[34px] text-[13px] bg-[#F3F2EE] border-[#E2E0D8] text-[#1A1917] rounded-md focus:border-[#2D6A4F]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-sans font-medium text-[#6B6963] uppercase tracking-wider block">
                    Access Level
                  </label>
                  <Select
                    value={newMemberRole}
                    onValueChange={(val) => setNewMemberRole((val as 'admin' | 'editor' | 'viewer') || 'viewer')}
                  >
                    <SelectTrigger className="h-[32px] text-[12px] bg-[#F3F2EE] border-[#E2E0D8] text-[#1A1917] rounded-md focus:ring-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#FAFAF8] border-[#E2E0D8] rounded-md">
                      <SelectItem value="viewer" className="text-[12px]">Viewer (Read Only)</SelectItem>
                      <SelectItem value="editor" className="text-[12px]">Editor (Read/Write)</SelectItem>
                      <SelectItem value="admin" className="text-[12px]">Admin (Full Access)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="submit"
                  className="w-full h-[34px] bg-[#2D6A4F] hover:bg-[#166534] text-white text-[12px] rounded-md flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Send Invite</span>
                </Button>
              </form>
            </div>

            {/* Team Roster */}
            <div className="space-y-3">
              <h3 className="text-[13px] font-sans font-medium text-[#1A1917] uppercase tracking-wider">
                Auditor Roster Access Ledger
              </h3>
              <DataTable columns={teamColumns} data={team} />
            </div>
          </div>
        </TabsContent>

        {/* Tab 5: Integrations */}
        <TabsContent value="integrations" className="outline-none focus:outline-none select-none">
          <div className="max-w-[600px] border border-[#E2E0D8] bg-[#FAFAF8] p-6 rounded-md shadow-sm space-y-6">
            <h3 className="text-[13px] font-sans font-medium text-[#1A1917] uppercase tracking-wider border-b border-[#E2E0D8] pb-2">
              External System Integrations
            </h3>

            <div className="space-y-4">
              {/* Integration 1: SAP ERP */}
              <div className="border border-[#E2E0D8] rounded-md p-4 bg-[#F3F2EE] flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Database className="w-8 h-8 text-[#2D6A4F]" strokeWidth={1.5} />
                  <div>
                    <h4 className="text-[14px] font-sans font-semibold text-[#1A1917]">SAP ERP Connector</h4>
                    <p className="text-[12px] text-[#6B6963] font-sans mt-0.5">Automate log pulling from SAP logistics modules.</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => triggerFeedback('SAP ERP credentials requested. Connection pending.')}
                  className="h-[28px] text-[11px] font-sans border-[#2D6A4F] text-[#2D6A4F] hover:bg-[#E8F0EB] rounded-md"
                >
                  Configure
                </Button>
              </div>

              {/* Integration 2: AWS S3 */}
              <div className="border border-[#E2E0D8] rounded-md p-4 bg-[#F3F2EE] flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Cpu className="w-8 h-8 text-[#2D6A4F]" strokeWidth={1.5} />
                  <div>
                    <h4 className="text-[14px] font-sans font-semibold text-[#1A1917]">Amazon Web Services (S3)</h4>
                    <p className="text-[12px] text-[#6B6963] font-sans mt-0.5">Stream live carbon telemetry directly to TRACE buckets.</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => triggerFeedback('Amazon S3 bucket sync enabled.')}
                  className="h-[28px] text-[11px] font-sans border-[#2D6A4F] text-[#2D6A4F] hover:bg-[#E8F0EB] rounded-md"
                >
                  Configure
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

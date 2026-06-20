'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    // Simulate authentication
    router.push('/organizations');
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col justify-center items-center px-4 select-none">
      <div className="w-full max-w-[360px] bg-[#FAFAF8] border border-[#E2E0D8] p-6 rounded-md shadow-sm">
        {/* Header / Logo */}
        <div className="text-center mb-8">
          <h1 className="font-mono text-2xl font-bold tracking-tight text-[#1A1917]">
            TRACE.
          </h1>
          <p className="text-[12px] text-[#6B6963] font-sans mt-1">
            Process & Carbon Intelligence Platform
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-2.5 bg-[#FDECEA] border border-[#C0392B]/20 text-[#C0392B] text-[12px] rounded-md font-sans">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[11px] font-sans font-medium text-[#6B6963] uppercase tracking-wider block">
              Email Address
            </label>
            <Input
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-[34px] text-[13px] bg-[#F3F2EE] border-[#E2E0D8] text-[#1A1917] rounded-md focus:border-[#2D6A4F] focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-sans font-medium text-[#6B6963] uppercase tracking-wider block">
                Password
              </label>
              <a href="#" className="text-[11px] text-[#2D6A4F] hover:underline font-sans">
                Forgot?
              </a>
            </div>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-[34px] text-[13px] bg-[#F3F2EE] border-[#E2E0D8] text-[#1A1917] rounded-md focus:border-[#2D6A4F] focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>

          <Button
            type="submit"
            className="w-full h-[36px] bg-[#2D6A4F] hover:bg-[#166534] text-white text-[13px] font-sans font-medium rounded-md transition-colors mt-2"
          >
            Sign In
          </Button>
        </form>

        <div className="mt-6 pt-4 border-t border-[#E2E0D8] text-center">
          <p className="text-[12px] text-[#6B6963] font-sans">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-[#2D6A4F] font-medium hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

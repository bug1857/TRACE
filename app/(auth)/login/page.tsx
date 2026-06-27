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
    <div className="min-h-screen bg-white/5 backdrop-blur-md flex flex-col justify-center items-center px-4 select-none">
      <div className="w-full max-w-[360px] bg-white/5 backdrop-blur-md border border-trace-border p-6 rounded-md shadow-sm">
        {/* Header / Logo */}
        <div className="text-center mb-8">
          <h1 className="font-mono text-2xl font-bold tracking-tight text-trace-text">
            TRACE.
          </h1>
          <p className="text-[12px] text-trace-muted font-sans mt-1">
            Process & Carbon Intelligence Platform
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-2.5 bg-rose-400/10 border border-[var(--destructive)]/20 text-rose-400 text-[12px] rounded-md font-sans">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[11px] font-sans font-medium text-trace-muted uppercase tracking-wider block">
              Email Address
            </label>
            <Input
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-[34px] text-[13px] bg-white/5 border-trace-border text-trace-text rounded-md focus:border-trace-accent focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-sans font-medium text-trace-muted uppercase tracking-wider block">
                Password
              </label>
              <a href="#" className="text-[11px] text-trace-accent hover:underline font-sans">
                Forgot?
              </a>
            </div>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-[34px] text-[13px] bg-white/5 border-trace-border text-trace-text rounded-md focus:border-trace-accent focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>

          <Button
            type="submit"
            className="w-full h-[36px] bg-trace-accent hover:bg-trace-accent/80 text-white text-[13px] font-sans font-medium rounded-md transition-colors mt-2"
          >
            Sign In
          </Button>
        </form>

        <div className="mt-6 pt-4 border-t border-trace-border text-center">
          <p className="text-[12px] text-trace-muted font-sans">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-trace-accent font-medium hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { AnalysisProvider } from './AnalysisContext';
import { WorkspaceProvider } from './WorkspaceContext';
import { ThemeProvider } from 'next-themes';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" themes={['light', 'dark', 'green']} enableSystem>
      <AnalysisProvider>
        <WorkspaceProvider>
          {children}
        </WorkspaceProvider>
      </AnalysisProvider>
    </ThemeProvider>
  );
}

import { useState } from 'react';
import { mockOcelMetadata } from '@/lib/mockData';
import { OcelMetadata } from '@/lib/types';

export function useLog() {
  const [logMetadata, setLogMetadata] = useState<OcelMetadata>(mockOcelMetadata);
  
  return {
    logMetadata,
    setLogMetadata
  };
}

import type { ReactNode } from 'react';
import PembukaHalaman from '@/components/PembukaHalaman';

export default function Template({ children }: { children: ReactNode }) {
  return <PembukaHalaman>{children}</PembukaHalaman>;
}

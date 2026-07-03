'use client';

import { MantineProvider } from '@mantine/core';
import type { ReactNode } from 'react';

type ProvidersProps = {
  children: ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  return <MantineProvider>{children}</MantineProvider>;
}

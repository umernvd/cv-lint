import React from 'react';
import { AuthBrandPanel } from '@/components/auth/AuthBrandPanel';

export default function AuthLayout({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <div className="flex min-h-screen">
      <AuthBrandPanel />
      <div className="flex w-full items-center justify-center bg-background bg-dot-grid p-6 lg:w-[55%]">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}

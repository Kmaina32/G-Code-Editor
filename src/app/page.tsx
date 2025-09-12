
'use client';

import dynamic from 'next/dynamic';
import { Code } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const CodePilotPage = dynamic(
  () => import('@/components/codepilot-page').then((mod) => mod.CodePilotPage),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        <LoadingSpinner className="w-12 h-12" />
        <div className="flex items-center gap-2 mt-4">
          <Code className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-bold font-headline">CodePilot</h1>
        </div>
      </div>
    ),
  }
);

export default function Page() {
  return <CodePilotPage />;
}

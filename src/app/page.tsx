
'use client';

import dynamic from 'next/dynamic';
import { Code } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useAuthState } from 'react-firebase-hooks/auth';
import { getAuth } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';

const CodePilotPage = dynamic(
  () => import('@/components/codepilot-page').then((mod) => mod.CodePilotPage),
  {
    ssr: false,
    loading: () => <AuthLoader />,
  }
);

function AuthLoader() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background">
      <div className="flex items-center gap-2 mb-4">
        <Code className="w-8 h-8 text-primary" />
        <h1 className="text-2xl font-bold font-headline">CodePilot</h1>
      </div>
      <LoadingSpinner className="w-10 h-10" />
      <p className="text-sm text-muted-foreground mt-4">Loading your project...</p>
    </div>
  )
}


export default function Page() {
  const auth = getAuth(app);
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const { loadProject, isLoading: isProjectLoading } = useStore();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    if (!loading && user) {
        loadProject(user.uid);
    }
  }, [user, loading, router, loadProject]);


  if (loading || !user || isProjectLoading) {
    return <AuthLoader />;
  }

  return <CodePilotPage />;
}

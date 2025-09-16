
'use client';

import dynamic from 'next/dynamic';
import { Code } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useAuthState } from 'react-firebase-hooks/auth';
import { getAuth } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
      <LoadingSpinner className="w-12 h-12" />
      <div className="flex items-center gap-2 mt-4">
        <Code className="w-6 h-6 text-primary" />
        <h1 className="text-xl font-bold font-headline">CodePilot</h1>
      </div>
    </div>
  )
}


export default function Page() {
  const auth = getAuth(app);
  const [user, loading] = useAuthState(auth);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);


  if (loading || !user) {
    return <AuthLoader />;
  }

  return <CodePilotPage />;
}

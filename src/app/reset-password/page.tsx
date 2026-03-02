'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ResetPasswordForm } from '@/components/reset-password-form';

function ValidatedResetPassword() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  if (!token) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <header className="sticky top-0 z-50 w-full border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <Link href="/" className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Terug naar home
            </Link>
          </div>
        </header>

        <main className="flex-1 container mx-auto px-4 py-12 pb-24">
          <div className="max-w-md mx-auto">
            <Card className="border-2 border-red-200 dark:border-red-900">
              <CardContent className="pt-6 text-center">
                <p className="text-red-600 dark:text-red-400">
                  Ongeldige of verlopen reset link
                </p>
                <Button asChild variant="outline" className="mt-4">
                  <Link href="/forgot-password">Nieuwe reset link aanvragen</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return <ResetPasswordForm token={token} />;
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <header className="sticky top-0 z-50 w-full border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <Link href="/" className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Terug naar home
            </Link>
          </div>
        </header>

        <main className="flex-1 container mx-auto px-4 py-12 pb-24">
          <div className="max-w-md mx-auto">
            <Card className="border-2">
              <CardContent className="pt-6 text-center">
                <p className="text-slate-600 dark:text-slate-400">
                  Laden...
                </p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    }>
      <ValidatedResetPassword />
    </Suspense>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MobileNav } from '@/components/mobile-nav';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Er ging iets mis');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Er ging iets mis');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
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
            <CardHeader className="text-center pb-8">
              <div className="mx-auto h-16 w-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
                <Mail className="h-8 w-8 text-slate-600 dark:text-slate-400" />
              </div>
              <CardTitle className="text-2xl">Wachtwoord Vergeten</CardTitle>
              <CardDescription>
                Voer je emailadres in en we sturen je een link om je wachtwoord te resetten
              </CardDescription>
            </CardHeader>

            <CardContent>
              {!success ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg text-sm text-red-700 dark:text-red-400">
                      {error}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email">Emailadres</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="je@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Versturen...' : 'Verstuur Reset Link'}
                  </Button>
                </form>
              ) : (
                <div className="text-center space-y-4">
                  <div className="mx-auto h-16 w-16 bg-emerald-100 dark:bg-emerald-950/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                      Email verzonden!
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Als dit emailadres bestaat in ons systeem, ontvang je binnen enkele ogenblikken een link om je wachtwoord te resetten.
                    </p>
                  </div>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/login">Terug naar inloggen</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="mt-6 text-center text-sm">
            <p className="text-slate-600 dark:text-slate-400">
              Weet je je wachtwoord weer?{' '}
              <Link href="/login" className="font-medium text-slate-900 dark:text-white hover:underline">
                Inloggen
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  );
}

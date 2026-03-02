'use client';

import { useState } from 'react';
import { Target, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MobileNav } from '@/components/mobile-nav';
import Link from 'next/link';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Inloggen mislukt');
      }

      // Store token
      if (data.token) {
        localStorage.setItem('token', data.token);
      }

      // Redirect to dashboard or challenges
      window.location.href = '/challenges';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Inloggen mislukt');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-slate-100">
        <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <Link href="/" className="flex items-center gap-2">
              <Target className="h-8 w-8 text-emerald-600" />
              <h1 className="text-2xl font-bold text-slate-900">DartsPro</h1>
            </Link>
          </div>
        </header>

        <main className="flex-1 container mx-auto px-4 py-16 flex items-center justify-center">
          <Card className="max-w-md w-full border-2 border-emerald-300">
            <CardHeader className="text-center">
              <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-emerald-600" />
              </div>
              <CardTitle className="text-2xl">Ingelogd!</CardTitle>
              <CardDescription className="text-base">
                Je wordt doorgestuurd naar de challenges pagina...
              </CardDescription>
            </CardHeader>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <Target className="h-8 w-8 text-emerald-600" />
            <h1 className="text-2xl font-bold text-slate-900">DartsPro</h1>
          </Link>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 md:py-16 pb-24">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Welkom terug!</h2>
            <p className="text-slate-600">
              Log in om je challenges en statistieken te bekijken
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Inloggen</CardTitle>
              <CardDescription>
                Voer je e-mail en wachtwoord in
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="naam@bedrijf.nl"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Wachtwoord</Label>
                    <Link href="/forgot-password" className="text-sm text-emerald-600 hover:text-emerald-700">
                      Wachtwoord vergeten?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  disabled={loading}
                >
                  {loading ? 'Bezig met inloggen...' : 'Inloggen'}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm">
                <span className="text-slate-600">Nog geen account? </span>
                <Link href="/register" className="text-emerald-600 hover:text-emerald-700 font-medium">
                  Registreer
                </Link>
              </div>

              <div className="mt-6 pt-6 border-t">
                <p className="text-xs text-slate-500 text-center">
                  Gebruik de <Link href="/scoreboard" className="text-emerald-600 hover:underline">scoreteller</Link> en{' '}
                  <Link href="/training" className="text-emerald-600 hover:underline">training</Link> zonder account!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  );
}

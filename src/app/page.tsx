'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Trophy, Target, Users, Zap, Crosshair, Palette, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MobileNav } from '@/components/mobile-nav';
import { useSettings } from '@/contexts/settings-context';

export default function HomePage() {
  const { preferences, loading } = useSettings();

  const getAccentColorClass = (color: string) => {
    const colors: Record<string, string> = {
      emerald: 'bg-emerald-600',
      blue: 'bg-blue-600',
      purple: 'bg-purple-600',
      rose: 'bg-rose-600',
      amber: 'bg-amber-600',
      orange: 'bg-orange-600',
      teal: 'bg-teal-600',
      slate: 'bg-slate-600',
    };
    return colors[color] || 'bg-emerald-600';
  };

  const getAccentTextColor = (color: string) => {
    const colors: Record<string, string> = {
      emerald: 'text-emerald-600',
      blue: 'text-blue-600',
      purple: 'text-purple-600',
      rose: 'text-rose-600',
      amber: 'text-amber-600',
      orange: 'text-orange-600',
      teal: 'text-teal-600',
      slate: 'text-slate-600',
    };
    return colors[color] || 'text-emerald-600';
  };

  const getAccentHoverClass = (color: string) => {
    const colors: Record<string, string> = {
      emerald: 'hover:bg-emerald-700',
      blue: 'hover:bg-blue-700',
      purple: 'hover:bg-purple-700',
      rose: 'hover:bg-rose-700',
      amber: 'hover:bg-amber-700',
      orange: 'hover:bg-orange-700',
      teal: 'hover:bg-teal-700',
      slate: 'hover:bg-slate-700',
    };
    return colors[color] || 'hover:bg-emerald-700';
  };

  const getAccentColorClassWithOpacity = (color: string, opacity: number = 0.2) => {
    const colors: Record<string, string> = {
      emerald: 'rgb(16, 185, 129)',
      blue: 'rgb(37, 99, 235)',
      purple: 'rgb(147, 51, 234)',
      rose: 'rgb(244, 63, 94)',
      amber: 'rgb(245, 158, 11)',
      orange: 'rgb(249, 115, 22)',
      teal: 'rgb(20, 184, 166)',
      slate: 'rgb(71, 85, 105)',
    };
    const baseColor = colors[color] || colors.emerald;
    return baseColor.replace(')', `, ${opacity})`).replace('rgb', 'rgba');
  };

  return (
    <div className="min-h-screen flex flex flex-col bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: getAccentColorClass(preferences.accentColor) }}>
                <Target className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">
                {preferences.groupName || 'DartsPro'}
              </h1>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/challenges" className={`text-slate-600 ${getAccentHoverClass(preferences.accentColor)} font-medium transition-colors`}>
                Challenges
              </Link>
              <Link href="/scoreboard" className={`text-slate-600 ${getAccentHoverClass(preferences.accentColor)} font-medium transition-colors`}>
                Scoreteller
              </Link>
              <Link href="/training" className={`text-slate-600 ${getAccentHoverClass(preferences.accentColor)} font-medium transition-colors`}>
                Training
              </Link>
              <Link href="/leaderboard" className={`text-slate-600 ${getAccentHoverClass(preferences.accentColor)} font-medium transition-colors`}>
                Leaderboard
              </Link>
            </nav>

            <div className="hidden md:flex items-center gap-3">
              <Button variant="outline" asChild>
                <Link href="/login">Inloggen</Link>
              </Button>
              <Button asChild style={{ backgroundColor: getAccentColorClass(preferences.accentColor) }} className={`hover:opacity-90 text-white`}>
                <Link href="/register">Registreren</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="container mx-auto px-4 py-16 md:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6 text-white" style={{ backgroundColor: getAccentColorClass(preferences.accentColor) }}>
              <Zap className="h-4 w-4" />
              Nieuwe challenges elke dag!
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">
              Verbeter je darts skills
              <span className="font-medium" style={{ color: getAccentTextColor(preferences.accentColor) }}>samen</span>
            </h2>
            <p className="text-lg md:text-xl text-slate-600 mb-8">
              Dagelijkse challenges, competities met collega's, en professionele training tools.
              Alles wat je nodig hebt om je darts spel naar een hoger niveau te tillen.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className={`text-white text-lg px-8`} style={{ backgroundColor: getAccentColorClass(preferences.accentColor) }}>
                <Link href="/register">Start met spelen</Link>
              </Button>
              <Button size="lg" variant="outline" className={`text-lg px-8`} style={{ color: getAccentTextColor(preferences.accentColor), borderColor: getAccentTextColor(preferences.accentColor) }}>
                <Link href="/scoreboard">Probeer Scoreteller</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-slate-900 mb-4">
              Alles wat je nodig hebt
            </h3>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Compleet darts platform voor individuele verbetering en competitie met je team
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Card className="border-2 transition-all hover:shadow-lg" style={{ '--hover-border': getAccentTextColor(preferences.accentColor) } as React.CSSProperties}>
              <CardHeader>
                <div className="h-12 w-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: getAccentColorClassWithOpacity(preferences.accentColor) }}>
                  <Target className="h-6 w-6" style={{ color: getAccentTextColor(preferences.accentColor) }} />
                </div>
                <CardTitle>Dagelijkse Challenges</CardTitle>
                <CardDescription>
                  Elke dag nieuwe darts games en challenges. Competeer met collega's en verbeter je skills!
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-amber-300 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="h-12 w-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                  <Trophy className="h-6 w-6 text-amber-600" />
                </div>
                <CardTitle>Leaderboards</CardTitle>
                <CardDescription>
                  Per week en overall rankings. Zie wie de beste darter is in jouw groep!
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-blue-300 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Wedstrijd Statistieken</CardTitle>
                <CardDescription>
                  Houd je onderlinge wedstrijden bij en bekijk je statistieken tegen anderen spelers.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-purple-300 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Crosshair className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Professionele Scoreteller</CardTitle>
                <CardDescription>
                  Digitale scoreteller met check-out suggesties. Ondersteunt 501, 301, Cricket en meer!
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-rose-300 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="h-12 w-12 bg-rose-100 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-rose-600" />
                </div>
                <CardTitle>Training & Tips</CardTitle>
                <CardDescription>
                  Professionele training oefeningen en tips om je spel te verbeteren, van beginner tot pro.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-teal-300 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="h-12 w-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-teal-600" />
                </div>
                <CardTitle>Geen Registratie Nodig</CardTitle>
                <CardDescription>
                  Gebruik de scoreteller en bekijk training oefeningen zonder account!
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 transition-all hover:shadow-lg" style={{ '--hover-border': getAccentTextColor(preferences.accentColor) } as React.CSSProperties}>
              <CardHeader>
                <div className="h-12 w-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: getAccentColorClassWithOpacity(preferences.accentColor) }}>
                  <Palette className="h-6 w-6" style={{ color: getAccentTextColor(preferences.accentColor) }} />
                </div>
                <CardTitle>Personaliseerbaar</CardTitle>
                <CardDescription>
                  Log in om kleuren, logo en app-naam aan te passen
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16" style={{ backgroundColor: getAccentColorClass(preferences.accentColor) }}>
          <div className="container mx-auto px-4 text-center">
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Klaar om te beginnen?
            </h3>
            <p className="text-lg mb-8 max-w-2xl mx-auto" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
              Registreer nu en word lid van een darts groep, of gebruik de scoreteller zonder account!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="text-lg px-8 text-white" style={{ borderColor: getAccentTextColor(preferences.accentColor) }}>
                <Link href="/register">Maak een account</Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 border-white text-white hover:bg-white/10">
                <Link href="/scoreboard">Probeer Scoreteller</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Mobile Navigation - Sticky Bottom */}
      <MobileNav />

      {/* Desktop Footer */}
      <footer className="border-t bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full" style={{ backgroundColor: getAccentColorClass(preferences.accentColor) }}>
                <Target className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-slate-900">
                {preferences.groupName || 'DartsPro'}
              </span>
            </div>
            <p className="text-slate-600 text-sm text-center">
              © 2025 {preferences.groupName || 'DartsPro'}. Made with ❤️ for darts enthusiasts
            </p>
            <div className="flex gap-6 text-sm">
              <Link href="/challenges" className={getAccentTextColor(preferences.accentColor)}>
                Challenges
              </Link>
              <Link href="/training" className={getAccentTextColor(preferences.accentColor)}>
                Training
              </Link>
              <Link href="/scoreboard" className={getAccentTextColor(preferences.accentColor)}>
                Scoreteller
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

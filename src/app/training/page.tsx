'use client';

import { Target, Zap, Award, Clock, TrendingUp, BookOpen, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MobileNav } from '@/components/mobile-nav';
import Link from 'next/link';

const trainingExercises = [
  {
    id: 1,
    name: '20 rondes op D20',
    description: 'Gooi 3 darts per ronde op double 20. Probeer zoveel mogelijk te raken.',
    difficulty: 'beginner',
    duration: '15 min',
    target: 'Zoveel mogelijk double 20s raken',
    icon: Target,
    tips: [
      'Focus op je grip en pose',
      'Blijf stil staan tijdens je worp',
      'Visualiseer de hit voor je gooit'
    ]
  },
  {
    id: 2,
    name: 'Treble Hunt',
    description: 'Begin bij T1 en werk door tot T20. Ga naar de volgende als je de treble raakt.',
    difficulty: 'intermediate',
    duration: '20 min',
    target: 'Alle trebles raken in zo min mogelijk darts',
    icon: Zap,
    tips: [
      'Neem je tijd voor elke worp',
      'Focus op consistentie, niet snelheid',
      'Houd je tempo gelijkmatig'
    ]
  },
  {
    id: 3,
    name: '501 Practice',
    description: 'Speel een solo 501 tegen jezelf. Probeer zo min mogelijk darts te gebruiken.',
    difficulty: 'intermediate',
    duration: '30 min',
    target: 'Uitchecken in zo min mogelijk darts',
    icon: Award,
    tips: [
      'Plan je check-out van tevoren',
      'Houd je gemiddelde per 3 darts bij',
      'Oefen verschillende finish combinaties'
    ]
  },
  {
    id: 4,
    name: '180 Club',
    description: 'Probeer zo vaak mogelijk 180 te gooien. Houd je totale score bij.',
    difficulty: 'advanced',
    duration: '15 min',
    target: 'Zoveel mogelijk 180s in 15 minuten',
    icon: TrendingUp,
    tips: [
      'Focus op T20, T20, T20',
      'Blijf relaxed en gefocust',
      'Accepteer dat het moeilijk is'
    ]
  },
  {
    id: 5,
    name: 'Bullseye Master',
    description: 'Gooi 3 darts per ronde op bull (50) en bullseye (25).',
    difficulty: 'advanced',
    duration: '20 min',
    target: 'Zoveel mogelijk bulls/bullseyes raken',
    icon: Target,
    tips: [
      'Verander je sta-hoogte lichtjes',
      'Focus op het midden van het bord',
      'Gebruik een fluide werpbeweging'
    ]
  },
  {
    id: 6,
    name: 'Cricket Training',
    description: 'Oefen alle cricket nummers (20-15 en bull). Sluit ze zo snel mogelijk af.',
    difficulty: 'intermediate',
    duration: '25 min',
    target: 'Alle nummers sluiten in zo min mogelijk darts',
    icon: Zap,
    tips: [
      'Begin met je sterkste nummers',
      'Houd bij welke nummers je moeilijk vindt',
      'Focus op trebles en doubles'
    ]
  }
];

const tips = [
  {
    category: 'Stance & Grip',
    icon: Target,
    tips: [
      'Zet je voeten op schouderbreedte uit elkaar',
      'Houd je dart met een relaxte grip, niet te strak',
      'Punt je voet in de richting van het bord',
      'Houd je ellebog op dezelfde hoogte tijdens je werp'
    ]
  },
  {
    category: 'Werp Techniek',
    icon: Zap,
    tips: [
      'Gebruik een consistente werpbeweging',
      'Laat je arm volledig strekken bij de follow-through',
      'Houd je stil tijdens je werp',
      'Gooi met je vingers, niet met je pols'
    ]
  },
  {
    category: 'Focus & Mindset',
    icon: Award,
    tips: [
      'Visualiseer je worp voor je gooit',
      'Blijf gefocust, ook na een slechte worp',
      'Adem rustig in en uit',
      'Neem je tijd, haast je niet'
    ]
  },
  {
    category: 'Routine',
    icon: Clock,
    tips: [
      'Ontwikkel een consistente pre-shot routine',
      'Oefen minimaal 3x per week',
      'Houd je voortgang bij',
      'Begin met warming-up oefeningen'
    ]
  }
];

const difficultyColors = {
  beginner: 'bg-emerald-100 text-emerald-700',
  intermediate: 'bg-amber-100 text-amber-700',
  advanced: 'bg-rose-100 text-rose-700'
};

export default function TrainingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Target className="h-8 w-8 text-emerald-600" />
              <h1 className="text-2xl font-bold text-slate-900">DartsPro</h1>
            </Link>
            <Badge variant="secondary" className="bg-purple-100 text-purple-700">
              <BookOpen className="h-4 w-4 mr-1" />
              Training & Tips
            </Badge>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 pb-24">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="text-center mb-8">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Verbeter je darts skills
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Professionele training oefeningen en tips om je spel naar een hoger niveau te tillen
            </p>
          </div>

          <Tabs defaultValue="exercises" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="exercises">Training Oefeningen</TabsTrigger>
              <TabsTrigger value="tips">Tips & Advies</TabsTrigger>
            </TabsList>

            <TabsContent value="exercises" className="space-y-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trainingExercises.map((exercise) => {
                  const Icon = exercise.icon;
                  return (
                    <Card key={exercise.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between mb-4">
                          <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Icon className="h-6 w-6 text-purple-600" />
                          </div>
                          <Badge className={difficultyColors[exercise.difficulty as keyof typeof difficultyColors]}>
                            {exercise.difficulty}
                          </Badge>
                        </div>
                        <CardTitle className="text-xl">{exercise.name}</CardTitle>
                        <CardDescription>{exercise.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-4 text-sm text-slate-600">
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {exercise.duration}
                          </span>
                          <span className="flex items-center gap-1">
                            <Target className="h-4 w-4" />
                            {exercise.target}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <Zap className="h-4 w-4 text-amber-500" />
                            Tips
                          </h4>
                          <ul className="space-y-1">
                            {exercise.tips.map((tip, i) => (
                              <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                                <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="tips" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {tips.map((category, index) => {
                  const Icon = category.icon;
                  return (
                    <Card key={index}>
                      <CardHeader>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="h-10 w-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                            <Icon className="h-5 w-5 text-emerald-600" />
                          </div>
                          <CardTitle>{category.category}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3">
                          {category.tips.map((tip, i) => (
                            <li key={i} className="flex items-start gap-3 text-slate-700">
                              <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Quick Tips Section */}
              <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                    Snel Verbeteren
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div className="p-4 bg-white rounded-lg">
                      <h4 className="font-semibold mb-2 text-emerald-700">Week 1</h4>
                      <p className="text-slate-600">Focus op je stance en grip. Oefen 20 min per dag op D20.</p>
                    </div>
                    <div className="p-4 bg-white rounded-lg">
                      <h4 className="font-semibold mb-2 text-emerald-700">Week 2</h4>
                      <p className="text-slate-600">Begin met treble oefeningen. T1 tot T20 in volgorde.</p>
                    </div>
                    <div className="p-4 bg-white rounded-lg">
                      <h4 className="font-semibold mb-2 text-emerald-700">Week 3+</h4>
                      <p className="text-slate-600">Speel 501 games en volg je gemiddelde. Oefen check-outs.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  );
}

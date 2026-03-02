'use client';

import { useState, useEffect } from 'react';
import { Palette, Upload, Save, ArrowLeft, Check, X, RotateCcw, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MobileNav } from '@/components/mobile-nav';
import Link from 'next/link';

const accentColors = [
  { value: 'emerald', name: 'Groen', bg: 'bg-emerald-500', text: 'text-white' },
  { value: 'blue', name: 'Blauw', bg: 'bg-blue-500', text: 'text-white' },
  { value: 'purple', name: 'Paars', bg: 'bg-purple-500', text: 'text-white' },
  { value: 'rose', name: 'Roze', bg: 'bg-rose-500', text: 'text-white' },
  { value: 'amber', name: 'Amber', bg: 'bg-amber-500', text: 'text-white' },
  { value: 'orange', name: 'Oranje', bg: 'bg-orange-500', text: 'text-white' },
  { value: 'teal', name: 'Teal', bg: 'bg-teal-500', text: 'text-white' },
  { value: 'slate', name: 'Grijs', bg: 'bg-slate-500', text: 'text-white' },
];

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

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

  // Form state
  const [groupName, setGroupName] = useState('');
  const [accentColor, setAccentColor] = useState('emerald');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Current settings
  const [currentSettings, setCurrentSettings] = useState({
    groupName: 'DartsPro',
    accentColor: 'emerald',
    logoUrl: null
  });

  useEffect(() => {
    // Load current settings
    fetch('/api/settings')
      .then(res => res.json(res))
      .then(data => {
        if (data.success && data.user) {
          setGroupName(data.user.groupName || 'DartsPro');
          setAccentColor(data.user.accentColor || 'emerald');
          setLogoUrl(data.user.logoUrl);
          setLogoPreview(data.user.logoUrl);
          setCurrentSettings({
            groupName: data.user.groupName || 'DartsProPro',
            accentColor: data.user.accentColor || 'emerald',
            logoUrl: data.user.logoUrl || null
          });
        }
      })
      .catch(err => console.error('Failed to load settings:', err));
  }, []);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setMessage('');
    setMessageType('success');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/settings/logo', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      if (data.success) {
        setLogoUrl(data.logoUrl);
        setLogoPreview(data.logoUrl);
        setCurrentSettings(prev => ({ ...prev, logoUrl: data.logoUrl }));
      } else {
        throw new Error(data.error || 'Upload mislukt');
      }
    } catch (err) {
      setMessage('Logo upload mislukt. Probeer opnieuw.');
      setMessageType('error');
      console.error('Logo upload error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage('');
    setMessageType('success');

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accentColor,
          logoUrl,
          groupName
        })
      });

      const data = await res.json();

      if (data.success) {
        setCurrentSettings({
          groupName: data.user.groupName || 'DartsPro',
          accentColor: data.user.accentColor || 'emerald',
          logoUrl: data.user.logoUrl || null
        });
        setMessage('Instellingen opgeslagen!');
        setMessageType('success');
      } else {
        throw new Error(data.error || 'Opslaan mislukt');
      }
    } catch (err) {
      setMessage('Opslaan mislukt. Probeer opnieuw.');
      setMessageType('error');
      console.error('Save settings error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setGroupName('DartsPro');
    setAccentColor('emerald');
    setLogoUrl(null);
    setLogoPreview(null);
    setCurrentSettings({
      groupName: 'DartsPro',
      accentColor: 'emerald',
      logoUrl: null
    });
    setMessage('');
  };

  return (
    <div className="min-h-screen flex flex flex-col bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: getAccentColorClass(currentSettings.accentColor) }}>
                  <Target className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-slate-900">
                  {currentSettings.groupName}
                </h1>
              </Link>
              <Link href="/scoreboard" className="ml-auto">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Terug
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 pb-24">
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center mb-6">
            <div className={`w-12 h-12 rounded-xl ${getAccentColorClass(currentSettings.accentColor)} flex items-center justify-center mb-2 mx-auto`}>
              <Palette className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">
              Personaliseer je App
            </h2>
            <p className="text-slate-600">
              Kies je eigen accentkleur, upload je logo en geef de app een persoonlijk tintje
            </p>
          </div>

          {message && (
            <div className={`p-4 rounded-lg text-center text-sm ${
              messageType === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700'
            }`}>
              {message}
            </div>
          )}

          {/* Group Name */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                App Naam
              </CardTitle>
              <CardDescription>
                De naam die bovenin je app wordt getoond
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="groupName">Naam</Label>
                  <Input
                    id="groupName"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="Bijv: Bedrijfs Darts"
                    className="max-w-md"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Helper function */}
          {(() => {
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
            return null;
          })()}

          {/* Accent Color */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                <Palette className="h-5 w-5 mr-2" />
                Accent Kleur
              </CardTitle>
              <CardDescription>
                Kies de hoofdkleur van de app
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-4 md:grid-cols-4 gap-3">
                  {accentColors.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setAccentColor(color.value)}
                      className={`
                        relative p-4 rounded-xl border-2 transition-all
                        ${accentColor === color.value
                          ? `${color.bg} text-white border-transparent ring-4 ring-offset-2 ring-${color.value}/50`
                          : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                        }
                      `}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className={`w-8 h-8 rounded-full ${color.bg} ${color.text} flex items-center justify-center`}>
                          <Check className="h-5 w-5" />
                        </div>
                        <span className="text-xs font-medium">{color.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Logo Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                <Upload className="h-5 w-5 mr-2" />
                Logo
              </CardTitle>
              <CardDescription>
                Upload je bedrijfslogo (JPG, PNG, GIF, WebP - max 2MB)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <Input
                      id="logoUrl"
                      value={logoUrl || ''}
                      onChange={(e) => {
                        setLogoUrl(e.target.value);
                        setLogoPreview(e.target.value);
                      }}
                      placeholder="https://voorbeeld.nl/logo.png"
                      className="w-full"
                    />
                  </div>

                  {logoPreview && (
                    <div className="flex items-center justify-center p-4 bg-slate-50 rounded-lg border-2 border-slate-200">
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="h-16 w-auto max-w-full object-contain"
                        onError={() => setLogoPreview(null)}
                      />
                    </div>
                  )}

                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setLogoUrl(null);
                        setLogoPreview(null);
                      }}
                      className="w-full md:w-auto"
                    >
                      Verwijder
                    </Button>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      onChange={handleLogoUpload}
                      disabled={loading}
                      className="hidden"
                      id="logo-upload"
                    />
                    <Button
                      onClick={() => document.getElementById('logo-upload')?.click()}
                      disabled={loading}
                      className="w-full md:w-auto"
                    >
                      {loading ? 'Uploaden...' : 'Upload Logo'}
                    </Button>
                  </div>
                </div>

                <p className="text-xs text-slate-500">
                  Het logo wordt getoond in de header en in de app
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Save/Reset Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleSave}
              disabled={loading}
              className="flex-1"
              style={{ backgroundColor: getAccentColorClass(accentColor) }}
            >
              <Save className="h-4 w-4 mr-2" />
              Opslaan
            </Button>
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={loading}
              className="flex-1"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>

          {/* Preview Card */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-base">
                <Check className="h-5 w-5 mr-2" />
                Voorbeeld
              </CardTitle>
              <CardDescription>
                Zo ziet je gepersonaliseerde app eruit
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6 p-4 bg-white rounded-lg border-2">
                <div className="flex-shrink-0">
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Logo"
                      className="h-12 w-12 object-contain"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: getAccentColorClass(currentSettings.accentColor) }}>
                      <Target className="h-6 w-6 text-white" />
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">
                    {currentSettings.groupName}
                  </div>
                  <div className="text-sm text-slate-600">
                    Scoreteller
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Powered by DartsPro
                  </div>
                </div>
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

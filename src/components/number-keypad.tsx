'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface NumberKeypadProps {
  onScore: (score: number) => void;
  disabled?: boolean;
  accentColor?: string;
}

export function NumberKeypad({ onScore, disabled, accentColor = 'emerald' }: NumberKeypadProps) {
  const [input, setInput] = useState('');

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

  const getAccentTextClass = (color: string) => {
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

  const getAccentLightClass = (color: string) => {
    const colors: Record<string, string> = {
      emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      blue: 'bg-blue-50 text-blue-700 border-blue-200',
      purple: 'bg-purple-50 text-purple-700 border-purple-200',
      rose: 'bg-rose-50 text-rose-700 border-rose-200',
      amber: 'bg-amber-50 text-amber-700 border-amber-200',
      orange: 'bg-orange-50 text-orange-700 border-orange-200',
      teal: 'bg-teal-50 text-teal-700 border-teal-200',
      slate: 'bg-slate-50 text-slate-700 border-slate-200',
    };
    return colors[color] || colors.emerald;
  };

  const handleNumber = (num: string) => {
    if (input.length >= 3) return; // Max 3 cijfers
    setInput(input + num);
  };

  const handleClear = () => {
    setInput('');
  };

  const handleBackspace = () => {
    setInput(input.slice(0, -1));
  };

  const handleConfirm = () => {
    const score = parseInt(input);
    if (!isNaN(score) && score >= 0 && score <= 180) {
      onScore(score);
      setInput('');
    }
  };

  return (
    <div className="space-y-2">
      {/* Display */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => {
            const val = e.target.value.replace(/[^0-9]/g, '');
            if (val.length <= 3) setInput(val);
          }}
          placeholder="Score"
          className="flex-1 text-center text-xl font-bold p-2 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all"
          style={{
            borderColor: input ? getAccentColorClass(accentColor) : 'rgb(226, 232, 240)',
            focusRingColor: getAccentColorClass(accentColor)
          }}
          disabled={disabled}
        />
        <Button
          onClick={handleConfirm}
          disabled={disabled || !input}
          className={`text-white px-4 ${getAccentColorClass(accentColor)} ${getAccentHoverClass(accentColor)}`}
        >
          ✓
        </Button>
      </div>

      {/* Number Grid - Compact for Mobile */}
      <div className="grid grid-cols-5 gap-1">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0, '←', 'C'].map((key, i) => {
          if (key === '←') {
            return (
              <Button
                key="backspace"
                variant="outline"
                onClick={handleBackspace}
                disabled={disabled || !input}
                className="h-10 text-lg font-semibold"
              >
                ←
              </Button>
            );
          }
          if (key === 'C') {
            return (
              <Button
                key="clear"
                variant="outline"
                onClick={handleClear}
                disabled={disabled || !input}
                className="h-10 text-xs font-semibold bg-slate-100 hover:bg-slate-200"
              >
                C
              </Button>
            );
          }
          return (
            <Button
              key={key}
              variant="outline"
              onClick={() => handleNumber(key.toString())}
              disabled={disabled}
              className="h-10 text-lg font-semibold"
            >
              {key}
            </Button>
          );
        })}
      </div>

      {/* Quick Scores - Compact 2 rows */}
      <div className="grid grid-cols-5 gap-1">
        {[60, 100, 140, 180, 26, 57, 81, 85, 120, 170].map((score) => (
          <Button
            key={score}
            variant="outline"
            size="sm"
            onClick={() => {
              onScore(score);
              setInput('');
            }}
            disabled={disabled}
            className={`h-9 text-xs font-semibold ${getAccentLightClass(accentColor)}`}
          >
            {score}
          </Button>
        ))}
      </div>
    </div>
  );
}

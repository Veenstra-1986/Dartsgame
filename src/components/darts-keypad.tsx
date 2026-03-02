'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

interface DartsKeypadProps {
  onScore: (score: number) => void;
  onClear?: () => void;
  disabled?: boolean;
  accentColor?: string;
}

const DARTS_NUMBERS = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];

export function DartsKeypad({ onScore, onClear, disabled, accentColor = 'emerald' }: DartsKeypadProps) {
  const [modifier, setModifier] = useState<'single' | 'double' | 'triple' | 'bull' | 'bullseye'>('single');

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

  const getAccentLightClass = (color: string) => {
    const colors: Record<string, string> = {
      emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
      blue: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
      purple: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
      rose: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100',
      amber: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
      orange: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100',
      teal: 'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100',
      slate: 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100',
    };
    return colors[color] || colors.emerald;
  };

  const handleNumberClick = (num: number) => {
    let score = 0;
    switch (modifier) {
      case 'single':
        score = num;
        break;
      case 'double':
        score = num * 2;
        break;
      case 'triple':
        score = num * 3;
        break;
      case 'bull':
        score = 25;
        break;
      case 'bullseye':
        score = 50;
        break;
    }
    onScore(score);
  };

  const getModifierButtonClass = (type: string) => {
    const baseClass = "h-10 text-xs font-semibold transition-colors ";
    switch (type) {
      case 'single':
        return baseClass + (modifier === 'single'
          ? 'bg-slate-700 text-white'
          : 'bg-slate-200 text-slate-700 hover:bg-slate-300');
      case 'double':
        return baseClass + (modifier === 'double'
          ? 'bg-emerald-600 text-white'
          : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200');
      case 'triple':
        return baseClass + (modifier === 'triple'
          ? 'bg-amber-500 text-white'
          : 'bg-amber-100 text-amber-700 hover:bg-amber-200');
      case 'bull':
        return baseClass + (modifier === 'bull'
          ? getAccentColorClass(accentColor) + ' text-white'
          : getAccentLightClass(accentColor));
      case 'bullseye':
        return baseClass + (modifier === 'bullseye'
          ? 'bg-red-500 text-white'
          : 'bg-red-100 text-red-700 hover:bg-red-200');
      default:
        return baseClass;
    }
  };

  return (
    <div className="space-y-2">
      {/* Modifiers Row */}
      <div className="grid grid-cols-5 gap-1">
        <button
          type="button"
          onClick={() => setModifier('single')}
          disabled={disabled}
          className={getModifierButtonClass('single')}
        >
          S
        </button>
        <button
          type="button"
          onClick={() => setModifier('double')}
          disabled={disabled}
          className={getModifierButtonClass('double')}
        >
          D
        </button>
        <button
          type="button"
          onClick={() => setModifier('triple')}
          disabled={disabled}
          className={getModifierButtonClass('triple')}
        >
          T
        </button>
        <button
          type="button"
          onClick={() => setModifier('bull')}
          disabled={disabled}
          className={getModifierButtonClass('bull')}
        >
          SB
        </button>
        <button
          type="button"
          onClick={() => setModifier('bullseye')}
          disabled={disabled}
          className={getModifierButtonClass('bullseye')}
        >
          DB
        </button>
      </div>

      {/* Numbers Grid - 4 columns x 5 rows */}
      <div className="grid grid-cols-4 gap-1">
        {DARTS_NUMBERS.map((num) => (
          <Button
            key={num}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleNumberClick(num)}
            disabled={disabled || modifier === 'bull' || modifier === 'bullseye'}
            className={`h-10 text-sm font-bold transition-colors ${
              modifier === 'bull' || modifier === 'bullseye'
                ? 'opacity-30 cursor-not-allowed'
                : modifier === 'single'
                ? 'bg-white hover:bg-slate-50 border-slate-300'
                : modifier === 'double'
                ? getAccentLightClass(accentColor)
                : 'bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-800'
            }`}
          >
            {num}
          </Button>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2">
        {onClear && (
          <Button
            type="button"
            variant="outline"
            onClick={onClear}
            disabled={disabled}
            className="h-10 text-sm font-semibold bg-slate-100 hover:bg-slate-200"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Wissen
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          onClick={() => onScore(0)}
          disabled={disabled}
          className="h-10 text-sm font-semibold bg-slate-100 hover:bg-slate-200"
        >
          Mis (0)
        </Button>
      </div>
    </div>
  );
}

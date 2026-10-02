import React, { useState } from 'react';
import type { CustomFilterOptions } from '../types/lotto';
import { NumberBall } from './NumberBall';
import { audioService } from '../services/audioService';
import { X, Check, RotateCcw, SlidersHorizontal, Plus, Ban } from 'lucide-react';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFilter: CustomFilterOptions;
  onSaveFilter: (filter: CustomFilterOptions) => void;
}

export const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  currentFilter,
  onSaveFilter,
}) => {
  const [fixed, setFixed] = useState<number[]>(currentFilter.fixedNumbers || []);
  const [excluded, setExcluded] = useState<number[]>(currentFilter.excludedNumbers || []);
  const [oddEven, setOddEven] = useState<CustomFilterOptions['oddEvenRatio']>(currentFilter.oddEvenRatio || 'balanced');
  const [sumRange, setSumRange] = useState<[number, number]>(currentFilter.sumRange || [100, 175]);
  const [noConsecutive, setNoConsecutive] = useState<boolean>(currentFilter.noConsecutiveTriplets ?? true);
  const [selectMode, setSelectMode] = useState<'fixed' | 'excluded'>('fixed');

  if (!isOpen) return null;

  const toggleNumber = (num: number) => {
    audioService.playTick();
    if (selectMode === 'fixed') {
      if (fixed.includes(num)) {
        setFixed(fixed.filter((n) => n !== num));
      } else {
        if (fixed.length >= 5) {
          alert('고정수는 최대 5개까지만 선택할 수 있습니다.');
          return;
        }
        // 고정수로 선택하면 제외수에서 자동 제거
        setExcluded(excluded.filter((n) => n !== num));
        setFixed([...fixed, num].sort((a, b) => a - b));
      }
    } else {
      if (excluded.includes(num)) {
        setExcluded(excluded.filter((n) => n !== num));
      } else {
        // 제외수로 선택하면 고정수에서 자동 제거
        setFixed(fixed.filter((n) => n !== num));
        setExcluded([...excluded, num].sort((a, b) => a - b));
      }
    }
  };

  const handleReset = () => {
    audioService.playTick();
    setFixed([]);
    setExcluded([]);
    setOddEven('balanced');
    setSumRange([100, 175]);
    setNoConsecutive(true);
  };

  const handleSave = () => {
    audioService.playTick();
    onSaveFilter({
      fixedNumbers: fixed,
      excludedNumbers: excluded,
      oddEvenRatio: oddEven,
      sumRange,
      noConsecutiveTriplets: noConsecutive,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-2xl bg-gradient-to-b from-[#14151e] to-[#0c0d12] border-2 border-amber-500/40 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-amber-500/20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-300">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-amber-300">VIP 정밀 커스텀 필터링 설정</h3>
              <p className="text-xs text-zinc-400">고정수/제외수 및 통계학적 필터를 직접 커스터마이징</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6 py-4">
          {/* Number Selector Toggle Tabs (Fixed vs Excluded) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectMode('fixed')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    selectMode === 'fixed'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-400 shadow-sm'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  고정수 설정 ({fixed.length}/5)
                </button>
                <button
                  onClick={() => setSelectMode('excluded')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    selectMode === 'excluded'
                      ? 'bg-red-500/20 text-red-300 border-red-400 shadow-sm'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <Ban className="w-3.5 h-3.5" />
                  제외수 설정 ({excluded.length}개)
                </button>
              </div>

              <span className="text-[11px] text-zinc-400">
                {selectMode === 'fixed' ? '선택한 번호가 무조건 포함됨' : '선택한 번호가 절대 나오지 않음'}
              </span>
            </div>

            {/* 1~45 Number Picker Grid */}
            <div className="p-3.5 rounded-xl bg-black/50 border border-zinc-800">
              <div className="grid grid-cols-5 sm:grid-cols-9 gap-2">
                {Array.from({ length: 45 }, (_, i) => i + 1).map((n) => {
                  const isFixed = fixed.includes(n);
                  const isExcluded = excluded.includes(n);

                  return (
                    <button
                      key={n}
                      onClick={() => toggleNumber(n)}
                      className={`relative p-1 rounded-lg flex items-center justify-center transition-all ${
                        isFixed
                          ? 'ring-2 ring-amber-400 bg-amber-500/20'
                          : isExcluded
                          ? 'ring-2 ring-red-500/80 bg-red-950/40 opacity-40'
                          : 'hover:bg-zinc-800/80'
                      }`}
                    >
                      <NumberBall num={n} size="xs" />
                      {isFixed && (
                        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 text-black text-[9px] font-black rounded-full flex items-center justify-center">
                          ✓
                        </span>
                      )}
                      {isExcluded && (
                        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-600 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                          ✕
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Odd/Even Ratio Preferences */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-300">홀짝 비율 필터</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'balanced', label: '황금 밸런스 (3:3, 4:2, 2:4)' },
                { id: '3:3', label: '3:3 비율 (정석)' },
                { id: '4:2', label: '4:2 (홀수 우세)' },
                { id: '2:4', label: '2:4 (짝수 우세)' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setOddEven(opt.id as CustomFilterOptions['oddEvenRatio'])}
                  className={`p-2 rounded-xl text-xs font-bold border transition-all text-center ${
                    oddEven === opt.id
                      ? 'bg-amber-500/20 text-amber-300 border-amber-400'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sum Range & Consecutive Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-300 flex justify-between">
                <span>총합 구간 설정</span>
                <span className="font-mono text-amber-300">{sumRange[0]} ~ {sumRange[1]}</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="50"
                  max="150"
                  value={sumRange[0]}
                  onChange={(e) => setSumRange([Number(e.target.value), sumRange[1]])}
                  className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-white"
                />
                <span className="text-zinc-500">~</span>
                <input
                  type="number"
                  min="150"
                  max="250"
                  value={sumRange[1]}
                  onChange={(e) => setSumRange([sumRange[0], Number(e.target.value)])}
                  className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-white"
                />
              </div>
            </div>

            <div className="space-y-2 flex flex-col justify-end">
              <label className="text-xs font-bold text-zinc-300">연속 번호 제한</label>
              <button
                type="button"
                onClick={() => setNoConsecutive(!noConsecutive)}
                className={`p-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-between ${
                  noConsecutive
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                }`}
              >
                <span>3연번(11-12-13) 절대 발생 금지</span>
                <span>{noConsecutive ? '적용 중' : '해제됨'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-amber-500/20 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 px-3 py-2 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> 필터 초기화
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-white rounded-xl transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-black text-black bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 rounded-xl shadow-lg shadow-amber-500/30 transition-all"
            >
              <Check className="w-4 h-4" /> 커스텀 필터 적용하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

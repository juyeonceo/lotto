import React, { useState } from 'react';
import { audioService } from '../services/audioService';
import { X, MoonStar, Sparkles, Wand2 } from 'lucide-react';

interface FortuneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFortune: (keyword: string) => void;
  currentKeyword?: string;
}

export const FortuneModal: React.FC<FortuneModalProps> = ({
  isOpen,
  onClose,
  onApplyFortune,
  currentKeyword = '',
}) => {
  const [keyword, setKeyword] = useState<string>(currentKeyword);

  if (!isOpen) return null;

  const presets = [
    { title: '🐷 황금 돼지꿈', desc: '재물과 횡재수를 상징하는 길몽' },
    { title: '🐉 용이 승천하는 꿈', desc: '최고의 영예와 대운' },
    { title: '💰 조상님의 돈보따리', desc: '가문의 은덕과 로또 1등 길몽' },
    { title: '🐢 맑은 물과 황금 거북', desc: '장수와 안정적 대박 운세' },
    { title: '🔥 거대한 불길 꿈', desc: '운기가 폭발적으로 일어나는 불꿈' },
    { title: '🌟 777 행운의 별자리', desc: '우주의 길한 기운 집약' },
  ];

  const handleSubmit = (selectedKeyword: string) => {
    if (!selectedKeyword.trim()) return;
    audioService.playTick();
    onApplyFortune(selectedKeyword.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-2xl bg-gradient-to-b from-[#181226] via-[#120e1d] to-[#0a0812] border-2 border-purple-500/40 p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-purple-500/20 text-purple-300">
              <MoonStar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-purple-200">운세 & 꿈 해몽 행운 알고리즘</h3>
              <p className="text-xs text-zinc-400">간밤의 꿈이나 사주 키워드로 고유 행운 시드 생성</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Box */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-purple-300 flex items-center justify-between">
            <span>꿈 내용 또는 생년월일 / 소원 입력</span>
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="예: 간밤에 큰 황금잉어를 잡은 꿈, 1990-05-12"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit(keyword)}
              className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-purple-500/40 text-sm text-purple-100 placeholder-zinc-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
            />
            <button
              onClick={() => handleSubmit(keyword)}
              className="px-4 py-2.5 rounded-xl font-bold text-xs bg-purple-600 hover:bg-purple-500 text-white shrink-0 flex items-center gap-1.5 shadow-md shadow-purple-600/30"
            >
              <Wand2 className="w-4 h-4" /> 적용
            </button>
          </div>
        </div>

        {/* Preset Quick Badges */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-zinc-400">대한민국 대표 길몽 추천 프리셋:</span>
          <div className="grid grid-cols-2 gap-2">
            {presets.map((p) => (
              <button
                key={p.title}
                onClick={() => {
                  setKeyword(p.title);
                  handleSubmit(p.title);
                }}
                className="p-2.5 rounded-xl bg-purple-950/20 hover:bg-purple-900/30 border border-purple-500/30 hover:border-purple-400 text-left transition-all group"
              >
                <div className="text-xs font-bold text-purple-200 group-hover:text-white">
                  {p.title}
                </div>
                <div className="text-[10px] text-zinc-400 mt-0.5">{p.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer Note */}
        <div className="pt-3 border-t border-purple-500/20 text-[11px] text-zinc-400 text-center">
          입력하신 키워드의 음운과 해시 엔트로피를 연산하여 불변의 고유 행운 번호 6개를 산출합니다.
        </div>
      </div>
    </div>
  );
};

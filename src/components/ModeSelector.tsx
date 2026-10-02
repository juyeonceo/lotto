import React from 'react';
import type { GeneratorMode } from '../types/lotto';
import { audioService } from '../services/audioService';
import { Cpu, Flame, Snowflake, MoonStar, SlidersHorizontal } from 'lucide-react';

interface ModeSelectorProps {
  currentMode: GeneratorMode;
  onSelectMode: (mode: GeneratorMode) => void;
  onOpenCustomModal: () => void;
  onOpenFortuneModal: () => void;
  customFilterCount?: number;
  fortuneKeyword?: string;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  currentMode,
  onSelectMode,
  onOpenCustomModal,
  onOpenFortuneModal,
  customFilterCount = 0,
  fortuneKeyword,
}) => {
  const modes: {
    id: GeneratorMode;
    title: string;
    badge: string;
    desc: string;
    icon: React.ReactNode;
    hasModal?: boolean;
    onExtraClick?: () => void;
  }[] = [
    {
      id: 'quant',
      title: 'AI 퀀트 밸런스',
      badge: 'PRO VIP',
      desc: '역대 출현빈도 + 황금총합 + 홀짝비율 종합 퀀트 필터링',
      icon: <Cpu className="w-4 h-4 text-amber-400" />,
    },
    {
      id: 'hot',
      title: '골든 핫(HOT) 맹공',
      badge: '다빈도',
      desc: '최근 50회차 최다 출현 기세 좋은 핫넘버 집중 공략',
      icon: <Flame className="w-4 h-4 text-orange-400" />,
    },
    {
      id: 'cold',
      title: '역발상 콜드(COLD)',
      badge: '미출현수',
      desc: '장기 미출현 통계 주기 도래 번호 회귀 이론 적용',
      icon: <Snowflake className="w-4 h-4 text-cyan-400" />,
    },
    {
      id: 'fortune',
      title: '운세 & 꿈 해몽',
      badge: 'LUCKY',
      desc: fortuneKeyword ? `키워드: "${fortuneKeyword}" 적용 중` : '꿈 키워드 또는 사주 기반 고유 행운 시드 생성',
      icon: <MoonStar className="w-4 h-4 text-purple-400" />,
      hasModal: true,
      onExtraClick: onOpenFortuneModal,
    },
    {
      id: 'custom',
      title: '마스터 커스텀 필터',
      badge: customFilterCount > 0 ? `${customFilterCount}개 설정` : 'CUSTOM',
      desc: '고정수, 제외수, 홀짝 비율, 총합 구간 정밀 커스텀',
      icon: <SlidersHorizontal className="w-4 h-4 text-emerald-400" />,
      hasModal: true,
      onExtraClick: onOpenCustomModal,
    },
  ];

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#F59E0B]" />
          VIP 추천 알고리즘 엔진 선택
        </h3>
        <span className="text-xs text-zinc-400">선택 즉시 알고리즘 변경</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {modes.map((m) => {
          const isActive = currentMode === m.id;
          return (
            <div
              key={m.id}
              onClick={() => {
                audioService.playTick();
                onSelectMode(m.id);
                if (m.hasModal && m.onExtraClick) {
                  m.onExtraClick();
                }
              }}
              className={`relative cursor-pointer group rounded-xl p-3.5 transition-all duration-200 border flex flex-col justify-between ${
                isActive
                  ? 'bg-gradient-to-b from-amber-500/15 via-black/80 to-black/90 border-amber-400/80 shadow-[0_0_20px_rgba(212,175,55,0.2)]'
                  : 'bg-zinc-900/60 hover:bg-zinc-900/90 border-zinc-800 hover:border-amber-500/30'
              }`}
            >
              {/* Active Indicator Top Light */}
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-amber-400 shadow-[0_0_10px_#F59E0B]" />
              )}

              <div>
                <div className="flex items-center justify-between gap-1 mb-2">
                  <div className="p-1.5 rounded-lg bg-black/60 border border-white/5">
                    {m.icon}
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isActive
                        ? 'bg-amber-400/20 text-amber-300 border-amber-400/40'
                        : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                    }`}
                  >
                    {m.badge}
                  </span>
                </div>

                <h4
                  className={`text-sm font-bold tracking-tight mb-1 ${
                    isActive ? 'text-amber-200' : 'text-zinc-200 group-hover:text-amber-300'
                  }`}
                >
                  {m.title}
                </h4>
                <p className="text-[11px] text-zinc-400 leading-tight">{m.desc}</p>
              </div>

              {m.hasModal && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    audioService.playTick();
                    if (m.onExtraClick) m.onExtraClick();
                  }}
                  className="mt-3 w-full py-1 text-[11px] font-semibold text-amber-300/80 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 rounded border border-amber-500/30 transition-colors"
                >
                  옵션 설정 열기 →
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

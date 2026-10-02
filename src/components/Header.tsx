import React, { useState } from 'react';
import { audioService } from '../services/audioService';
import { Crown, Volume2, VolumeX, TrendingUp, BarChart2, Bookmark, Dices } from 'lucide-react';

interface HeaderProps {
  activeTab: 'generator' | 'stats' | 'backtest' | 'saved';
  onSelectTab: (tab: 'generator' | 'stats' | 'backtest' | 'saved') => void;
  targetRound: number;
  savedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  targetRound,
  savedCount,
}) => {
  const [isMuted, setIsMuted] = useState<boolean>(audioService.getMuted());

  const handleToggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    audioService.setMuted(nextMute);
    if (!nextMute) {
      audioService.playTick();
    }
  };

  return (
    <header className="w-full border-b border-amber-500/20 bg-black/60 backdrop-blur-xl sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Brand Logo & Title */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onSelectTab('generator')}>
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-200 shadow-[0_0_20px_rgba(212,175,55,0.4)] border border-amber-300">
              <Crown className="w-6 h-6 text-black drop-shadow-sm" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg md:text-xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-300 to-yellow-500">
                  AURA LOTTO VIP
                </span>
                <span className="px-1.5 py-0.5 text-[9px] font-black uppercase rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  ROYALE
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 flex items-center gap-1">
                <span>0.1% 하이엔드 퀀트 알고리즘</span>
                <span className="text-amber-500/80">•</span>
                <span className="text-amber-400 font-medium">제 {targetRound}회 대비</span>
              </p>
            </div>
          </div>

          {/* Sound Toggle (Mobile right align) */}
          <button
            onClick={handleToggleMute}
            className="md:hidden p-2 rounded-xl bg-zinc-900 border border-amber-500/30 text-amber-300 hover:text-white"
            title={isMuted ? '음소거 해제' : '음소거'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Tabs & Sound (Desktop) */}
        <div className="flex items-center justify-between md:justify-end gap-1.5 sm:gap-2 overflow-x-auto pb-1 md:pb-0">
          <nav className="flex items-center gap-1 bg-zinc-950/80 p-1 rounded-xl border border-zinc-800">
            <button
              onClick={() => {
                audioService.playTick();
                onSelectTab('generator');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'generator'
                  ? 'bg-gradient-to-r from-amber-500/30 to-yellow-600/30 text-amber-300 border border-amber-400/50 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Dices className="w-3.5 h-3.5" />
              <span>VIP 생성기</span>
            </button>

            <button
              onClick={() => {
                audioService.playTick();
                onSelectTab('stats');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'stats'
                  ? 'bg-gradient-to-r from-amber-500/30 to-yellow-600/30 text-amber-300 border border-amber-400/50 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>역대 통계 분석</span>
            </button>

            <button
              onClick={() => {
                audioService.playTick();
                onSelectTab('backtest');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'backtest'
                  ? 'bg-gradient-to-r from-amber-500/30 to-yellow-600/30 text-amber-300 border border-amber-400/50 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>50회 백테스팅</span>
            </button>

            <button
              onClick={() => {
                audioService.playTick();
                onSelectTab('saved');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'saved'
                  ? 'bg-gradient-to-r from-amber-500/30 to-yellow-600/30 text-amber-300 border border-amber-400/50 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>보관함</span>
              {savedCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-amber-400 text-black text-[10px] font-black flex items-center justify-center">
                  {savedCount}
                </span>
              )}
            </button>
          </nav>

          {/* Sound Toggle (Desktop) */}
          <button
            onClick={handleToggleMute}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-amber-300 hover:text-amber-200 hover:border-amber-500/40 text-xs font-medium transition-all"
            title={isMuted ? '음악 효과 켜기' : '음악 효과 끄기'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-zinc-500" /> : <Volume2 className="w-4 h-4 text-amber-400 animate-pulse" />}
            <span className="text-[11px] text-zinc-400">{isMuted ? '음소거' : '사운드 ON'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

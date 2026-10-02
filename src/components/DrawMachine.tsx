import React, { useEffect, useState, useRef } from 'react';
import { NumberBall } from './NumberBall';
import { audioService } from '../services/audioService';
import { fireGoldConfetti } from '../services/confettiService';
import { Sparkles, Dices, RotateCcw, Zap } from 'lucide-react';

interface DrawMachineProps {
  currentNumbers: number[];
  isDrawing: boolean;
  onDrawSingle: () => void;
  onDraw5Games: () => void;
  vipGoldBalls: boolean;
  onToggleVipGold: () => void;
  algorithmScore?: number;
  tags?: string[];
}

export const DrawMachine: React.FC<DrawMachineProps> = ({
  currentNumbers,
  isDrawing,
  onDrawSingle,
  onDraw5Games,
  vipGoldBalls,
  onToggleVipGold,
  algorithmScore = 98.4,
  tags = ['황금 총합구간 (100~175)', '3:3 홀짝 밸런스', '3연번 방지 통과'],
}) => {
  // Revealed balls animation state
  const [revealedCount, setRevealedCount] = useState<number>(6);
  const [tumblerBalls, setTumblerBalls] = useState<{ id: number; num: number; x: number; y: number; vx: number; vy: number }[]>([]);
  const animFrameRef = useRef<number | null>(null);

  // Initialize random floating balls inside the glass tumbler
  useEffect(() => {
    const balls = Array.from({ length: 18 }, (_, i) => ({
      id: i,
      num: Math.floor(Math.random() * 45) + 1,
      x: 20 + Math.random() * 60,
      y: 20 + Math.random() * 60,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5,
    }));
    setTumblerBalls(balls);
  }, []);

  // Animate floating tumbler balls
  useEffect(() => {
    const speedMultiplier = isDrawing ? 4.5 : 0.8;

    const updatePhysics = () => {
      setTumblerBalls((prev) =>
        prev.map((b) => {
          let nx = b.x + b.vx * speedMultiplier;
          let ny = b.y + b.vy * speedMultiplier;
          let nvx = b.vx;
          let nvy = b.vy;

          // Boundary bouncing in circle/box
          if (nx < 10 || nx > 90) nvx = -nvx;
          if (ny < 10 || ny > 90) nvy = -nvy;

          return {
            ...b,
            x: Math.max(10, Math.min(90, nx)),
            y: Math.max(10, Math.min(90, ny)),
            vx: nvx,
            vy: nvy,
          };
        })
      );
      animFrameRef.current = requestAnimationFrame(updatePhysics);
    };

    animFrameRef.current = requestAnimationFrame(updatePhysics);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isDrawing]);

  // Step-by-step ball drop effect when drawing starts
  useEffect(() => {
    if (isDrawing) {
      setRevealedCount(0);
      let step = 0;
      const interval = setInterval(() => {
        step++;
        setRevealedCount(step);
        audioService.playBallReveal(step - 1);
        if (step >= 6) {
          clearInterval(interval);
          audioService.playJackpot();
          fireGoldConfetti();
        }
      }, 350);
      return () => clearInterval(interval);
    } else {
      setRevealedCount(6);
    }
  }, [isDrawing, currentNumbers]);

  return (
    <div className="relative w-full rounded-2xl bg-gradient-to-b from-[#13131a] via-[#0d0d12] to-[#08080c] border border-amber-500/30 p-6 md:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.8),0_0_50px_rgba(212,175,55,0.08)] overflow-hidden">
      {/* Ambient Golden Background Glow */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 blur-[100px] pointer-events-none rounded-full" />
      <div className="absolute -bottom-24 right-0 w-72 h-72 bg-amber-600/5 blur-[80px] pointer-events-none rounded-full" />

      {/* Top Header Badge & Gold Switch */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 relative z-10 border-b border-amber-500/20 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-700 text-black shadow-lg shadow-amber-500/20">
            <Sparkles className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg md:text-xl font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-300 to-yellow-500">
                VIP 퀀트 추첨 머신
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                ROYALE 24K
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              실시간 회전 시뮬레이션 및 동행복권 가중치 알고리즘 적용
            </p>
          </div>
        </div>

        {/* 24K Golden Ball Switch */}
        <button
          onClick={onToggleVipGold}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
            vipGoldBalls
              ? 'bg-gradient-to-r from-amber-500/30 to-yellow-600/30 border-amber-400 text-amber-200 shadow-[0_0_15px_rgba(212,175,55,0.3)]'
              : 'bg-zinc-900/60 border-zinc-700 text-zinc-400 hover:border-zinc-500'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${vipGoldBalls ? 'bg-amber-400 animate-ping' : 'bg-zinc-600'}`} />
          24K 황금 에디션 볼 {vipGoldBalls ? 'ON' : 'OFF'}
        </button>
      </div>

      {/* Main Glass Tumbler Machine */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        {/* Left: 3D Transparent Globe Tumbler */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="relative w-56 h-56 md:w-64 md:h-64 rounded-full border-2 border-amber-500/40 bg-radial from-amber-500/10 via-black/60 to-[#0b0b10] shadow-[inset_0_0_30px_rgba(212,175,55,0.25),0_15px_30px_rgba(0,0,0,0.9)] flex items-center justify-center overflow-hidden">
            {/* Glass Reflection Highlight */}
            <div className="absolute top-2 left-6 w-32 h-16 rounded-full bg-gradient-to-b from-white/20 to-transparent transform -rotate-45 pointer-events-none blur-[1px]" />
            <div className="absolute inset-0 rounded-full border border-amber-400/20 pointer-events-none" />

            {/* Tumbler Center Whirl Mechanism */}
            <div
              className={`absolute w-16 h-16 rounded-full border border-amber-500/30 bg-amber-500/10 transition-transform duration-1000 ${
                isDrawing ? 'animate-spin' : ''
              }`}
            />

            {/* Bouncing Tumbler Lotto Balls inside Glass */}
            {tumblerBalls.map((b) => (
              <div
                key={b.id}
                className="absolute transition-all duration-75 pointer-events-none"
                style={{
                  left: `${b.x}%`,
                  top: `${b.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <NumberBall num={b.num} size="xs" vipGold={vipGoldBalls} />
              </div>
            ))}

            {/* Center Status Glow when Drawing */}
            {isDrawing && (
              <div className="absolute inset-0 bg-amber-500/10 backdrop-blur-[0.5px] flex items-center justify-center">
                <span className="px-3 py-1 text-xs font-black tracking-widest text-amber-200 bg-black/70 rounded-full border border-amber-400/50 animate-pulse">
                  알고리즘 연산 중...
                </span>
              </div>
            )}
          </div>

          {/* Machine Metal Base Stand */}
          <div className="w-36 h-4 bg-gradient-to-r from-amber-700 via-yellow-500 to-amber-700 rounded-b-lg border-t border-amber-300 shadow-md -mt-1" />
          <div className="w-48 h-2 bg-zinc-950 rounded-b-md shadow-lg" />
        </div>

        {/* Right: Selected Drawn Numbers & Actions */}
        <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
          {/* Algorithm Score & Live Tags */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-amber-500/5 border border-amber-500/20 rounded-xl px-4 py-2.5">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-zinc-300 font-medium">VIP 퀀트 적합도:</span>
              <span className="text-sm font-black text-amber-300">{algorithmScore}%</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {tags.slice(0, 2).map((t, idx) => (
                <span
                  key={idx}
                  className="text-[10px] px-2 py-0.5 rounded bg-zinc-800/80 text-amber-200/90 border border-amber-500/20"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Main 6 Drawn Balls Chute Display */}
          <div className="bg-gradient-to-r from-black/80 via-zinc-950/80 to-black/80 border border-amber-500/40 rounded-2xl p-5 shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)]">
            <div className="text-xs font-semibold text-zinc-400 mb-3 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                추출된 1등 당첨 유력 조합 (6개 번호)
              </span>
              <span className="text-amber-400 text-[11px] font-mono">
                {revealedCount}/6 확정
              </span>
            </div>

            <div className="flex items-center justify-between gap-1.5 sm:gap-3 py-2 px-1">
              {currentNumbers.map((num, idx) => {
                const isRevealed = idx < revealedCount;
                return (
                  <div key={idx} className="flex flex-col items-center gap-1.5">
                    <div
                      className={`transition-all duration-500 transform ${
                        isRevealed
                          ? 'scale-100 opacity-100 translate-y-0'
                          : 'scale-75 opacity-30 translate-y-4'
                      }`}
                    >
                      {isRevealed ? (
                        <NumberBall
                          num={num}
                          size="lg"
                          vipGold={vipGoldBalls}
                          highlight={true}
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full border-2 border-dashed border-amber-500/30 flex items-center justify-center text-zinc-600 font-mono text-sm">
                          ?
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500">#{idx + 1}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Luxury Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => {
                audioService.playTick();
                onDrawSingle();
              }}
              disabled={isDrawing}
              className="relative group overflow-hidden px-5 py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all duration-200 bg-gradient-to-b from-zinc-800 to-zinc-900 hover:from-zinc-700 hover:to-zinc-800 text-amber-200 border border-amber-500/40 hover:border-amber-400 shadow-md hover:shadow-amber-500/20 active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <RotateCcw className={`w-4 h-4 text-amber-400 ${isDrawing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
              단일 게임 재추첨 (1게임)
            </button>

            <button
              onClick={() => {
                audioService.playTick();
                onDraw5Games();
              }}
              disabled={isDrawing}
              className="relative group overflow-hidden px-5 py-3.5 rounded-xl font-black text-sm tracking-wide transition-all duration-200 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:via-yellow-400 hover:to-amber-400 text-black border border-amber-300 shadow-[0_4px_25px_rgba(212,175,55,0.4)] active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Dices className="w-5 h-5 text-black animate-bounce-short" />
              <span>VIP 5게임 일괄 추출 (5,000원)</span>
              {/* Shimmer Light Bar */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import type { Ticket5Games, GeneratedGame } from '../types/lotto';
import { NumberBall } from './NumberBall';
import { audioService } from '../services/audioService';
import { Copy, Bookmark, TrendingUp, Check, ShieldCheck, QrCode } from 'lucide-react';

interface TicketSlipProps {
  ticket: Ticket5Games;
  vipGoldBalls: boolean;
  onRerollGame: (gameLabel: 'A' | 'B' | 'C' | 'D' | 'E') => void;
  onSaveToVault: (ticket: Ticket5Games) => void;
  onRunBacktest: (games: GeneratedGame[]) => void;
  onOpenCertificate: (ticket: Ticket5Games) => void;
  isSaved?: boolean;
}

export const TicketSlip: React.FC<TicketSlipProps> = ({
  ticket,
  vipGoldBalls,
  onRerollGame,
  onSaveToVault,
  onRunBacktest,
  onOpenCertificate,
  isSaved = false,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopyAll = () => {
    audioService.playTick();
    const textLines = [
      `[AURA LOTTO VIP 제 ${ticket.roundTarget}회 추천 조합]`,
      ...ticket.games.map(
        (g) => `${g.gameLabel} : ${g.numbers.map((n) => n.toString().padStart(2, '0')).join(', ')} (${g.score}점)`
      ),
      `추첨일: 매주 토요일 20:35 / AURA VIP ROYALE`,
    ].join('\n');

    navigator.clipboard.writeText(textLines).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="w-full relative rounded-2xl bg-gradient-to-b from-[#14141d] via-[#0f0f15] to-[#0a0a0f] border-2 border-amber-500/40 p-5 md:p-7 shadow-[0_15px_45px_rgba(0,0,0,0.85),0_0_35px_rgba(212,175,55,0.12)]">
      {/* Decorative Gold Header Stamp */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-dashed border-amber-500/30">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-300">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-widest font-black text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                VIP OFFICIAL SLIP
              </span>
              <span className="text-xs font-mono text-zinc-400">
                ID: {ticket.id.slice(-8)}
              </span>
            </div>
            <h3 className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 tracking-tight mt-0.5">
              제 {ticket.roundTarget}회 로또6/45 VIP 5게임 슬립
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              발행일자: {new Date(ticket.createdAt).toLocaleDateString('ko-KR')} | 판매금액: ₩5,000 (1세트)
            </p>
          </div>
        </div>

        {/* QR Code Icon Simulation */}
        <div className="flex items-center gap-3 self-end sm:self-center">
          <div className="flex flex-col items-center p-2 rounded-lg bg-black/60 border border-amber-500/30">
            <QrCode className="w-10 h-10 text-amber-400" />
            <span className="text-[9px] font-mono text-amber-300 mt-1">VERIFIED</span>
          </div>
        </div>
      </div>

      {/* 5 Games (A, B, C, D, E) Listing */}
      <div className="divide-y divide-amber-500/10 my-4">
        {ticket.games.map((game) => (
          <div
            key={game.id}
            className="py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 group hover:bg-amber-500/[0.03] px-2 rounded-lg transition-colors"
          >
            {/* Game Slot Label & Info */}
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 text-black font-black text-sm flex items-center justify-center shadow-md">
                {game.gameLabel}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-zinc-200 uppercase">
                    자/수동 {game.mode.toUpperCase()}
                  </span>
                  <span className="text-[11px] font-semibold text-amber-400 font-mono">
                    적합도 {game.score}%
                  </span>
                </div>
                <div className="flex gap-1.5 mt-0.5">
                  {game.tags.slice(0, 1).map((t, i) => (
                    <span key={i} className="text-[10px] text-zinc-500">
                      • {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Lotto Ball Numbers 6개 */}
            <div className="flex items-center gap-2 sm:gap-2.5">
              {game.numbers.map((num, idx) => (
                <NumberBall
                  key={idx}
                  num={num}
                  size="md"
                  vipGold={vipGoldBalls}
                  highlight={false}
                />
              ))}
            </div>

            {/* Individual Reroll Button */}
            <div className="flex items-center gap-2 self-end md:self-center">
              <button
                onClick={() => onRerollGame(game.gameLabel)}
                className="text-xs px-2.5 py-1 rounded bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-amber-300 border border-zinc-700 hover:border-amber-500/40 transition-colors"
              >
                {game.gameLabel} 개별 재추첨
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Slip Footer Actions */}
      <div className="pt-4 border-t border-dashed border-amber-500/30 flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-zinc-400 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>대한민국 동행복권 표준 규격 6/45 알고리즘 검증 완료</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Backtest Button */}
          <button
            onClick={() => {
              audioService.playTick();
              onRunBacktest(ticket.games);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-cyan-300 bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-500/40 hover:border-cyan-400 rounded-xl transition-all shadow-sm"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            과거 50회차 백테스팅 검증
          </button>

          {/* Copy Button */}
          <button
            onClick={handleCopyAll}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-zinc-200 bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700 rounded-xl transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? '복사 완료!' : '5게임 복사'}
          </button>

          {/* Save to Vault */}
          <button
            onClick={() => {
              audioService.playTick();
              onSaveToVault(ticket);
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all border ${
              isSaved
                ? 'bg-amber-500/20 text-amber-300 border-amber-400'
                : 'bg-zinc-800/80 hover:bg-zinc-700 text-amber-300 border-amber-500/40'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            {isSaved ? '보관함에 저장됨' : 'VIP 보관함 저장'}
          </button>

          {/* VIP Certificate / Share Card */}
          <button
            onClick={() => {
              audioService.playTick();
              onOpenCertificate(ticket);
            }}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-black text-black bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 rounded-xl shadow-[0_2px_15px_rgba(212,175,55,0.3)] transition-all"
          >
            VIP 황금 인증서 보기
          </button>
        </div>
      </div>
    </div>
  );
};

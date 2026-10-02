import React from 'react';
import type { Ticket5Games } from '../types/lotto';
import { NumberBall } from './NumberBall';
import { audioService } from '../services/audioService';
import { Bookmark, Trash2, Calendar, Award, ExternalLink } from 'lucide-react';

interface SavedTicketsProps {
  savedTickets: Ticket5Games[];
  onDeleteTicket: (ticketId: string) => void;
  onSelectTicket: (ticket: Ticket5Games) => void;
}

export const SavedTickets: React.FC<SavedTicketsProps> = ({
  savedTickets,
  onDeleteTicket,
  onSelectTicket,
}) => {
  if (savedTickets.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-12 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-zinc-800/80 text-zinc-500 flex items-center justify-center mx-auto">
          <Bookmark className="w-6 h-6" />
        </div>
        <h4 className="text-base font-bold text-zinc-300">저장된 VIP 티켓이 없습니다</h4>
        <p className="text-xs text-zinc-500 max-w-sm mx-auto">
          번호 생성기에서 마음에 드는 5게임 세트를 추출한 뒤, [VIP 보관함 저장] 버튼을 눌러 소장해보세요.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bookmark className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold text-zinc-200">
            VIP 티켓 금고 보관함 ({savedTickets.length}개 세트)
          </h3>
        </div>
        <span className="text-xs text-zinc-500">브라우저 로컬 암호화 보관 중</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {savedTickets.map((tk) => (
          <div
            key={tk.id}
            className="rounded-2xl bg-gradient-to-b from-[#15151f] to-[#0c0c12] border border-amber-500/30 p-5 space-y-4 shadow-lg hover:border-amber-400 transition-all"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 font-bold text-xs border border-amber-400/30">
                  제 {tk.roundTarget}회차
                </span>
                <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-zinc-500" />
                  {new Date(tk.createdAt).toLocaleDateString('ko-KR')}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    audioService.playTick();
                    onSelectTicket(tk);
                  }}
                  className="p-1.5 text-xs text-amber-300 hover:text-white bg-amber-500/10 hover:bg-amber-500/20 rounded-lg transition-colors flex items-center gap-1"
                  title="티켓 슬립으로 보기"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  보기
                </button>
                <button
                  onClick={() => {
                    audioService.playTick();
                    onDeleteTicket(tk.id);
                  }}
                  className="p-1.5 text-zinc-500 hover:text-red-400 rounded-lg hover:bg-zinc-800 transition-colors"
                  title="삭제"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 5 Games compact list */}
            <div className="space-y-2">
              {tk.games.map((g) => (
                <div key={g.id} className="flex items-center justify-between text-xs">
                  <span className="w-5 h-5 rounded bg-zinc-800 font-bold text-amber-300 text-[10px] flex items-center justify-center">
                    {g.gameLabel}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {g.numbers.map((n) => (
                      <NumberBall key={n} num={n} size="xs" />
                    ))}
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500">
                    {g.score}%
                  </span>
                </div>
              ))}
            </div>

            {/* Note badge */}
            {tk.note && (
              <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400">
                <span className="flex items-center gap-1 text-amber-300/80">
                  <Award className="w-3 h-3" /> {tk.note}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

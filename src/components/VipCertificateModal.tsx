import React, { useRef } from 'react';
import type { Ticket5Games } from '../types/lotto';
import { NumberBall } from './NumberBall';
import { audioService } from '../services/audioService';
import { X, Award, Printer, Copy, Check, QrCode } from 'lucide-react';

interface VipCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket5Games;
}

export const VipCertificateModal: React.FC<VipCertificateModalProps> = ({
  isOpen,
  onClose,
  ticket,
}) => {
  const [copied, setCopied] = React.useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    audioService.playTick();
    window.print();
  };

  const handleCopy = () => {
    audioService.playTick();
    const summary = [
      `★ [AURA LOTTO VIP GOLD CERTIFICATE] ★`,
      `회차: 제 ${ticket.roundTarget}회 (발행: ${new Date(ticket.createdAt).toLocaleDateString()})`,
      ...ticket.games.map((g) => `[${g.gameLabel}]: ${g.numbers.join(', ')}`),
      `알고리즘: 동행복권 VIP 퀀트 인증 통과`,
    ].join('\n');

    navigator.clipboard.writeText(summary).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-3xl bg-gradient-to-b from-[#1b1713] via-[#100e0b] to-[#0a0806] border-2 border-amber-400 p-6 md:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_50px_rgba(212,175,55,0.25)]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full bg-black/40 hover:bg-black/80 transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* The Printable / Capturable Certificate Body */}
        <div
          ref={cardRef}
          className="relative rounded-2xl border-2 border-amber-400/80 p-6 md:p-8 bg-gradient-to-b from-[#14110d] to-[#090806] shadow-[inset_0_0_20px_rgba(212,175,55,0.2)] overflow-hidden print:bg-white print:text-black"
        >
          {/* Corner Golden Filigrees */}
          <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-amber-400 pointer-events-none" />
          <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-amber-400 pointer-events-none" />
          <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-amber-400 pointer-events-none" />
          <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-amber-400 pointer-events-none" />

          {/* Watermark in background */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
            <Award className="w-80 h-80 text-amber-300" />
          </div>

          {/* Certificate Header */}
          <div className="text-center pb-6 border-b border-amber-500/30 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-[11px] font-black uppercase tracking-widest mb-2">
              <Award className="w-3.5 h-3.5" /> 24K AURA ROYALE CERTIFICATION
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-300 to-yellow-500 tracking-wide">
              VIP 황금 복권 인증서
            </h2>
            <p className="text-xs text-amber-200/70 mt-1 font-mono">
              제 {ticket.roundTarget}회 동행복권 6/45 공식 퀀트 추천
            </p>
          </div>

          {/* 5 Games Display */}
          <div className="py-5 space-y-3 relative z-10">
            {ticket.games.map((g) => (
              <div
                key={g.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-amber-500/20"
              >
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-amber-400 text-black font-black text-xs flex items-center justify-center">
                    {g.gameLabel}
                  </span>
                  <span className="text-[11px] font-mono text-amber-300 hidden sm:inline">
                    [{g.score}%]
                  </span>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2">
                  {g.numbers.map((n) => (
                    <NumberBall key={n} num={n} size="xs" vipGold={true} />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Certificate Footer Seal & Stamp */}
          <div className="pt-4 border-t border-amber-500/30 flex items-center justify-between text-xs relative z-10">
            <div className="space-y-0.5">
              <div className="text-zinc-400 text-[10px]">발행 시리얼 넘버:</div>
              <div className="text-amber-400 font-mono text-xs font-bold">{ticket.id}</div>
              <div className="text-zinc-500 text-[10px]">
                발행일: {new Date(ticket.createdAt).toLocaleString('ko-KR')}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="p-1 rounded bg-black/70 border border-amber-400/40">
                <QrCode className="w-9 h-9 text-amber-300" />
              </div>
              <div className="w-12 h-12 rounded-full border-2 border-amber-400 bg-gradient-to-br from-amber-400/20 to-yellow-600/30 flex flex-col items-center justify-center text-center shadow-md">
                <span className="text-[8px] font-black text-amber-300 uppercase leading-none">
                  VIP SEAL
                </span>
                <span className="text-[7px] text-amber-400 font-mono">100%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 relative z-10">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-white rounded-xl transition-colors"
          >
            닫기
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-zinc-200 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-all border border-zinc-700"
            >
              <Printer className="w-3.5 h-3.5" /> 인쇄하기
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-black text-black bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 rounded-xl shadow-md transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-black" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? '복사 완료' : '인증 정보 복사'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

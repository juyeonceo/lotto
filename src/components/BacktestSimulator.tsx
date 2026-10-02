import React, { useState, useMemo } from 'react';
import type { GeneratedGame } from '../types/lotto';
import { runBacktestSimulation } from '../services/lottoBacktest';
import { LOTTO_HISTORY_DATA } from '../data/lottoHistory';
import { NumberBall } from './NumberBall';
import { audioService } from '../services/audioService';
import { TrendingUp, Award, DollarSign, Calendar, ChevronDown, ChevronUp } from 'lucide-react';

interface BacktestSimulatorProps {
  games: GeneratedGame[];
  onClose?: () => void;
}

export const BacktestSimulator: React.FC<BacktestSimulatorProps> = ({
  games,
}) => {
  const [roundsCount, setRoundsCount] = useState<number>(50);
  const [selectedGameIdx, setSelectedGameIdx] = useState<number>(0);
  const [showAllRows, setShowAllRows] = useState<boolean>(false);

  const summary = useMemo(() => {
    return runBacktestSimulation(games, roundsCount, LOTTO_HISTORY_DATA);
  }, [games, roundsCount]);

  const activeGameDetail = summary.details[selectedGameIdx] || summary.details[0];

  return (
    <div className="rounded-2xl bg-gradient-to-b from-[#13141c] via-[#0d0e14] to-[#09090d] border border-cyan-500/30 p-5 md:p-7 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-cyan-500/20">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-teal-300 to-emerald-400">
                과거 실제 당첨 데이터 백테스팅 시뮬레이터
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                PRO QUANT
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              현재 추천된 조합으로 과거 실제 동행복권 회차를 매주 구매했다고 가정한 가상 모의투자 분석
            </p>
          </div>
        </div>

        {/* Rounds Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400">테스트 구간:</span>
          {[20, 50, 60].map((count) => (
            <button
              key={count}
              onClick={() => {
                audioService.playTick();
                setRoundsCount(count);
              }}
              className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all ${
                roundsCount === count
                  ? 'bg-cyan-500/30 text-cyan-200 border-cyan-400 shadow-sm'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              최근 {count}회
            </button>
          ))}
        </div>
      </div>

      {/* Top 4 Metric KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {/* Total Investment */}
        <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800">
          <div className="flex items-center gap-2 text-zinc-400 text-xs mb-1">
            <Calendar className="w-4 h-4 text-zinc-500" />
            <span>가상 총 투자금</span>
          </div>
          <div className="text-xl font-black text-zinc-100 font-mono">
            ₩{summary.investment.toLocaleString()}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">
            {games.length}게임 × {summary.totalSimulations}주
          </div>
        </div>

        {/* Total Return */}
        <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800">
          <div className="flex items-center gap-2 text-zinc-400 text-xs mb-1">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>총 회수 당첨금</span>
          </div>
          <div className="text-xl font-black text-emerald-400 font-mono">
            ₩{summary.totalReturn.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-500/80 mt-1">
            {summary.rankCounts[1] + summary.rankCounts[2] + summary.rankCounts[3] + summary.rankCounts[4] + summary.rankCounts[5]}회 당첨 발생
          </div>
        </div>

        {/* ROI % */}
        <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800">
          <div className="flex items-center gap-2 text-zinc-400 text-xs mb-1">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <span>투자 수익률 (ROI)</span>
          </div>
          <div
            className={`text-xl font-black font-mono ${
              summary.roi >= 0 ? 'text-amber-300' : 'text-zinc-300'
            }`}
          >
            {summary.roi > 0 ? `+${summary.roi}%` : `${summary.roi}%`}
          </div>
          <div className="text-[11px] text-zinc-400 mt-1">
            {summary.roi >= 0 ? '순수익 달성' : '복권 통계 정상 범위'}
          </div>
        </div>

        {/* Best Rank */}
        <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800">
          <div className="flex items-center gap-2 text-zinc-400 text-xs mb-1">
            <Award className="w-4 h-4 text-yellow-400" />
            <span>최고 달성 등수</span>
          </div>
          <div className="text-xl font-black text-amber-300">
            {summary.bestRank > 0 ? `${summary.bestRank}등 당첨` : '미당첨'}
          </div>
          <div className="text-[11px] text-zinc-400 mt-1">
            5등 {summary.rankCounts[5]}회 | 4등 {summary.rankCounts[4]}회
          </div>
        </div>
      </div>

      {/* Game Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs text-zinc-400 font-semibold mr-1">분석 게임 선택:</span>
        {summary.details.map((dt, idx) => (
          <button
            key={dt.gameId}
            onClick={() => {
              audioService.playTick();
              setSelectedGameIdx(idx);
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
              selectedGameIdx === idx
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-sm'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'
            }`}
          >
            <span>게임 {dt.gameLabel}</span>
            <span className="font-mono text-[10px] text-zinc-400">
              ({dt.results.filter((r) => r.rank > 0).length}회 적중)
            </span>
          </button>
        ))}
      </div>

      {/* Selected Game Numbers Summary */}
      {activeGameDetail && (
        <div className="p-4 rounded-xl bg-black/50 border border-zinc-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded bg-cyan-500 text-black font-black text-xs flex items-center justify-center">
              {activeGameDetail.gameLabel}
            </span>
            <span className="text-xs text-zinc-300 font-medium">검증 조합:</span>
            <div className="flex items-center gap-1.5">
              {activeGameDetail.numbers.map((n) => (
                <NumberBall key={n} num={n} size="xs" />
              ))}
            </div>
          </div>

          <div className="text-xs text-zinc-400">
            당첨 횟수: <strong className="text-cyan-300">{activeGameDetail.results.filter((r) => r.rank > 0).length}회</strong> / 총 {activeGameDetail.results.length}회차
          </div>
        </div>
      )}

      {/* Detailed Rounds Matching Table */}
      <div className="rounded-xl border border-zinc-800 bg-black/40 overflow-hidden">
        <div className="p-3 bg-zinc-900/60 border-b border-zinc-800 text-xs font-bold text-zinc-300 flex justify-between items-center">
          <span>과거 회차별 정밀 매칭 내역</span>
          <span className="text-zinc-500">당첨 회차 우선 표시</span>
        </div>

        <div className="divide-y divide-zinc-900 max-h-80 overflow-y-auto">
          {activeGameDetail?.results
            .slice(0, showAllRows ? undefined : 12)
            .map((res) => {
              const hasWon = res.rank > 0;
              return (
                <div
                  key={res.round}
                  className={`p-3 flex flex-wrap items-center justify-between gap-3 text-xs transition-colors ${
                    hasWon ? 'bg-amber-500/5 hover:bg-amber-500/10' : 'hover:bg-zinc-900/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-zinc-300 w-16">
                      제 {res.round}회
                    </span>
                    <span className="text-zinc-500 text-[11px] hidden sm:inline">
                      {res.date}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-zinc-400 mr-1 text-[11px]">일치 번호:</span>
                    {res.matchedNumbers.length > 0 ? (
                      res.matchedNumbers.map((m) => (
                        <NumberBall key={m} num={m} size="xs" highlight={true} />
                      ))
                    ) : (
                      <span className="text-zinc-600 text-[11px]">일치 없음</span>
                    )}
                    {res.bonusMatched && (
                      <span className="text-amber-400 font-bold text-[10px] ml-1">+보너스</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {hasWon ? (
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-400 text-black shadow-sm">
                        {res.rank}등 당첨 (+₩{res.prizeAmount.toLocaleString()})
                      </span>
                    ) : (
                      <span className="text-zinc-500 text-[11px]">낙첨</span>
                    )}
                  </div>
                </div>
              );
            })}
        </div>

        {activeGameDetail?.results && activeGameDetail.results.length > 12 && (
          <div className="p-2.5 bg-zinc-900/50 text-center border-t border-zinc-800">
            <button
              onClick={() => setShowAllRows(!showAllRows)}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center justify-center gap-1 mx-auto"
            >
              {showAllRows ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5" /> 상위 12개만 보기
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5" /> 전체 {activeGameDetail.results.length}회차 결과 모두 보기
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

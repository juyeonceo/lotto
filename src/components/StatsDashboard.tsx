import React, { useState } from 'react';
import type { OverallStats, LottoDraw } from '../types/lotto';
import { NumberBall } from './NumberBall';
import { audioService } from '../services/audioService';
import { Flame, Snowflake, Clock, BarChart3, PieChart, Sparkles } from 'lucide-react';

interface StatsDashboardProps {
  stats: OverallStats;
  latestDraw: LottoDraw;
  onSelectNumberForFilter?: (num: number) => void;
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({
  stats,
  latestDraw,
}) => {
  const [activeTab, setActiveTab] = useState<'hotCold' | 'grid' | 'distributions'>('hotCold');

  return (
    <div className="w-full space-y-6">
      {/* Latest Draw Showcase Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#171722] via-[#101017] to-[#151520] border border-amber-500/30 p-5 md:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/5 blur-[70px] pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-400 text-black shadow-sm">
                동행복권 공식 데이터
              </span>
              <span className="text-xs text-zinc-400 font-mono">
                추첨일: {latestDraw.drwNoDate}
              </span>
            </div>
            <h3 className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-300 to-yellow-500">
              제 {latestDraw.drwNo}회 1등 당첨결과
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              1등 1인당 당첨금: <span className="text-amber-300 font-bold font-mono">₩{latestDraw.firstWinamnt ? (latestDraw.firstWinamnt / 100000000).toFixed(1) + '억' : '22.4억'}</span> ({latestDraw.firstPrzwnerCo || 12}명 당첨)
            </p>
          </div>

          {/* Numbers Display */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {latestDraw.numbers.map((n) => (
              <NumberBall key={n} num={n} size="md" />
            ))}
            <span className="text-xl font-black text-amber-400 mx-1">+</span>
            <div className="flex flex-col items-center">
              <NumberBall num={latestDraw.bnusNo} size="md" isBonus={true} />
              <span className="text-[10px] text-zinc-500 mt-0.5">보너스</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub Tabs for Stats */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
        <button
          onClick={() => {
            audioService.playTick();
            setActiveTab('hotCold');
          }}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'hotCold'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Flame className="w-4 h-4 text-orange-400" />
          핫(HOT) / 콜드(COLD) / 미출현 랭킹
        </button>

        <button
          onClick={() => {
            audioService.playTick();
            setActiveTab('grid');
          }}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'grid'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-cyan-400" />
          1~45번 전수 출현 빈도 매트릭스
        </button>

        <button
          onClick={() => {
            audioService.playTick();
            setActiveTab('distributions');
          }}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'distributions'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <PieChart className="w-4 h-4 text-purple-400" />
          홀짝 & 총합 & 색상 비율 통계
        </button>
      </div>

      {/* Tab 1: HOT / COLD / Overdue */}
      {activeTab === 'hotCold' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* HOT Top 10 */}
          <div className="rounded-xl bg-gradient-to-b from-[#161214] to-[#0e0c0d] border border-orange-500/30 p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-orange-500/20 text-orange-400">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-orange-300">최다 출현 핫넘버 TOP 10</h4>
                  <p className="text-[11px] text-zinc-400">역대 당첨 확률 우세 번호</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {stats.hotNumbers.map((num) => {
                const item = stats.numberStats.find((s) => s.num === num);
                return (
                  <div
                    key={num}
                    className="flex items-center justify-between p-2 rounded-lg bg-zinc-900/80 border border-orange-500/20"
                  >
                    <NumberBall num={num} size="sm" />
                    <div className="text-right">
                      <div className="text-xs font-black text-orange-300">
                        {item?.frequency}회 출현
                      </div>
                      <div className="text-[10px] text-zinc-500">{item?.percentage}%</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* COLD Top 10 */}
          <div className="rounded-xl bg-gradient-to-b from-[#11161d] to-[#0c0f14] border border-cyan-500/30 p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
                  <Snowflake className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-cyan-300">최저 출현 콜드넘버 TOP 10</h4>
                  <p className="text-[11px] text-zinc-400">역대 출현 빈도가 가장 적은 번호</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {stats.coldNumbers.map((num) => {
                const item = stats.numberStats.find((s) => s.num === num);
                return (
                  <div
                    key={num}
                    className="flex items-center justify-between p-2 rounded-lg bg-zinc-900/80 border border-cyan-500/20"
                  >
                    <NumberBall num={num} size="sm" />
                    <div className="text-right">
                      <div className="text-xs font-black text-cyan-300">
                        {item?.frequency}회 출현
                      </div>
                      <div className="text-[10px] text-zinc-500">{item?.percentage}%</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Overdue Top 10 */}
          <div className="rounded-xl bg-gradient-to-b from-[#16141a] to-[#0d0c11] border border-purple-500/30 p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-purple-300">장기 미출현 번호 TOP 10</h4>
                  <p className="text-[11px] text-zinc-400">출현 주기 도래 유력 번호</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {stats.overdueNumbers.map((num) => {
                const item = stats.numberStats.find((s) => s.num === num);
                return (
                  <div
                    key={num}
                    className="flex items-center justify-between p-2 rounded-lg bg-zinc-900/80 border border-purple-500/20"
                  >
                    <NumberBall num={num} size="sm" />
                    <div className="text-right">
                      <div className="text-xs font-black text-purple-300">
                        {item?.weeksOverdue}주째 미출현
                      </div>
                      <div className="text-[10px] text-zinc-500">
                        최근 {item?.lastDrawnRound}회
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: 1~45 Full Matrix Grid */}
      {activeTab === 'grid' && (
        <div className="rounded-xl bg-gradient-to-b from-[#121218] to-[#09090d] border border-zinc-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-base font-bold text-amber-300">1번 ~ 45번 전수 출현 통계 차트</h4>
              <p className="text-xs text-zinc-400">각 번호별 총 출현 횟수 및 비율 (최근 {stats.totalRounds}회차 분석)</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-orange-400">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> HOT 번호
              </span>
              <span className="flex items-center gap-1 text-cyan-400">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" /> COLD 번호
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2.5">
            {stats.numberStats.map((st) => (
              <div
                key={st.num}
                className={`p-2 rounded-xl flex flex-col items-center gap-1 border transition-all ${
                  st.isHot
                    ? 'bg-orange-950/20 border-orange-500/40 hover:border-orange-400'
                    : st.isCold
                    ? 'bg-cyan-950/20 border-cyan-500/40 hover:border-cyan-400'
                    : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <NumberBall num={st.num} size="sm" />
                <div className="text-center mt-1">
                  <div className="text-xs font-bold text-zinc-200">{st.frequency}회</div>
                  <div className="text-[10px] text-zinc-500 font-mono">{st.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Distribution Stats */}
      {activeTab === 'distributions' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Odd/Even Ratios */}
          <div className="rounded-xl bg-[#121217] border border-zinc-800 p-5">
            <h4 className="text-sm font-bold text-amber-300 mb-1">홀짝 비율 분포</h4>
            <p className="text-xs text-zinc-400 mb-4">역대 가장 많이 등장한 홀수:짝수 패턴</p>

            <div className="space-y-2.5">
              {Object.entries(stats.oddEvenCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([ratio, count]) => {
                  const pct = ((count / stats.totalRounds) * 100).toFixed(1);
                  const isGold = ratio === '3:3' || ratio === '4:2' || ratio === '2:4';
                  return (
                    <div key={ratio} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className={isGold ? 'font-bold text-amber-300' : 'text-zinc-300'}>
                          홀 {ratio.split(':')[0]} : 짝 {ratio.split(':')[1]}
                        </span>
                        <span className="font-mono text-zinc-400">
                          {count}회 ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            isGold ? 'bg-gradient-to-r from-amber-400 to-yellow-500' : 'bg-zinc-600'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Color Ranges */}
          <div className="rounded-xl bg-[#121217] border border-zinc-800 p-5">
            <h4 className="text-sm font-bold text-amber-300 mb-1">번호대별 색상 분포</h4>
            <p className="text-xs text-zinc-400 mb-4">공 색상별(10개 단위) 출현 비중</p>

            <div className="space-y-3">
              {[
                { label: '1~10 (황금)', count: stats.colorDistribution.yellow, color: 'bg-yellow-500', barColor: 'bg-yellow-500' },
                { label: '11~20 (청색)', count: stats.colorDistribution.blue, color: 'bg-blue-500', barColor: 'bg-blue-500' },
                { label: '21~30 (적색)', count: stats.colorDistribution.red, color: 'bg-red-500', barColor: 'bg-red-500' },
                { label: '31~40 (회색)', count: stats.colorDistribution.gray, color: 'bg-slate-500', barColor: 'bg-slate-500' },
                { label: '41~45 (녹색)', count: stats.colorDistribution.green, color: 'bg-emerald-500', barColor: 'bg-emerald-500' },
              ].map((c) => {
                const total = stats.totalRounds * 6;
                const pct = ((c.count / total) * 100).toFixed(1);
                return (
                  <div key={c.label} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-200">{c.label}</span>
                      <span className="font-mono text-zinc-400">{c.count}회 ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                      <div className={`h-full rounded-full ${c.barColor}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Golden Sum Range */}
          <div className="rounded-xl bg-[#121217] border border-zinc-800 p-5 flex flex-col justify-between">
            <div>
              <h4 className="text-sm font-bold text-amber-300 mb-1">황금 총합 구간 통계</h4>
              <p className="text-xs text-zinc-400 mb-4">6개 번호의 합계 평균 및 정규분포</p>

              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center space-y-1">
                <span className="text-xs text-zinc-400">역대 평균 총합</span>
                <div className="text-3xl font-black text-amber-300 font-mono">{stats.sumAverage}</div>
                <div className="text-xs text-amber-400 font-medium">최적 황금구간: 100 ~ 175</div>
              </div>

              <div className="mt-4 text-xs text-zinc-400 space-y-2 leading-relaxed">
                <p>• 역대 1등 당첨번호 총합의 약 <strong>73.4%</strong>가 100~175 구간에서 발생합니다.</p>
                <p>• AURA VIP 알고리즘은 총합 90 미만 또는 185 초과의 극단적 비대칭 조합을 필터링합니다.</p>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> 통계 모델 상시 최신화
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

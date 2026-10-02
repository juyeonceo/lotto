import { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { DrawMachine } from './components/DrawMachine';
import { ModeSelector } from './components/ModeSelector';
import { TicketSlip } from './components/TicketSlip';
import { StatsDashboard } from './components/StatsDashboard';
import { BacktestSimulator } from './components/BacktestSimulator';
import { SavedTickets } from './components/SavedTickets';
import { FilterModal } from './components/FilterModal';
import { FortuneModal } from './components/FortuneModal';
import { VipCertificateModal } from './components/VipCertificateModal';
import type { CustomFilterOptions, GeneratorMode, Ticket5Games } from './types/lotto';
import { generateSingleGameNumbers, generateVip5GameTicket } from './services/lottoEngine';
import { calculateOverallStats } from './services/lottoStats';
import { LOTTO_HISTORY_DATA, LATEST_DRAW } from './data/lottoHistory';
import { audioService } from './services/audioService';
import { Crown, Sparkles, Shield, Trophy } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'aura_lotto_vip_saved_tickets';

export function App() {
  const stats = useMemo(() => calculateOverallStats(LOTTO_HISTORY_DATA), []);
  const targetRound = (LATEST_DRAW.drwNo || 1160) + 1;

  // App Navigation & Modes
  const [activeTab, setActiveTab] = useState<'generator' | 'stats' | 'backtest' | 'saved'>('generator');
  const [currentMode, setCurrentMode] = useState<GeneratorMode>('quant');
  const [vipGoldBalls, setVipGoldBalls] = useState<boolean>(false);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);

  // Filters & Custom Options
  const [customFilter, setCustomFilter] = useState<CustomFilterOptions>({
    fixedNumbers: [],
    excludedNumbers: [],
    oddEvenRatio: 'balanced',
    sumRange: [100, 175],
    noConsecutiveTriplets: true,
  });
  const [fortuneKeyword, setFortuneKeyword] = useState<string>('');

  // Modals
  const [filterModalOpen, setFilterModalOpen] = useState<boolean>(false);
  const [fortuneModalOpen, setFortuneModalOpen] = useState<boolean>(false);
  const [certModalOpen, setCertModalOpen] = useState<boolean>(false);

  // Tickets & Numbers State
  const [currentTicket, setCurrentTicket] = useState<Ticket5Games>(() => {
    return generateVip5GameTicket(targetRound, 'quant');
  });

  const [currentSingleNumbers, setCurrentSingleNumbers] = useState<number[]>(() => {
    return currentTicket.games[0]?.numbers || [2, 14, 25, 31, 38, 44];
  });

  const [algorithmScore, setAlgorithmScore] = useState<number>(() => {
    return currentTicket.games[0]?.score || 98.4;
  });

  const [tags, setTags] = useState<string[]>(() => {
    return currentTicket.games[0]?.tags || ['황금 총합구간 (100~175)', '3:3 홀짝 밸런스'];
  });

  // Saved Vault in LocalStorage
  const [savedTickets, setSavedTickets] = useState<Ticket5Games[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(savedTickets));
    } catch {
      // LocalStorage error handled
    }
  }, [savedTickets]);

  // Draw 1 Single Game
  const handleDrawSingle = () => {
    if (isDrawing) return;
    setIsDrawing(true);

    const { numbers, score, tags: newTags } = generateSingleGameNumbers(
      currentMode,
      currentMode === 'custom' ? customFilter : undefined,
      currentMode === 'fortune' ? fortuneKeyword : undefined
    );

    setTimeout(() => {
      setCurrentSingleNumbers(numbers);
      setAlgorithmScore(score);
      setTags(newTags);

      // Update game A in current ticket
      const updatedGames = [...currentTicket.games];
      updatedGames[0] = {
        ...updatedGames[0],
        numbers,
        score,
        tags: newTags,
        mode: currentMode,
      };
      setCurrentTicket({
        ...currentTicket,
        games: updatedGames,
      });

      setIsDrawing(false);
    }, 2100);
  };

  // Draw 5 Games All At Once
  const handleDraw5Games = () => {
    if (isDrawing) return;
    setIsDrawing(true);

    const newTicket = generateVip5GameTicket(
      targetRound,
      currentMode,
      currentMode === 'custom' ? customFilter : undefined,
      currentMode === 'fortune' ? fortuneKeyword : undefined
    );

    setTimeout(() => {
      setCurrentTicket(newTicket);
      setCurrentSingleNumbers(newTicket.games[0].numbers);
      setAlgorithmScore(newTicket.games[0].score);
      setTags(newTicket.games[0].tags);
      setIsDrawing(false);
    }, 2100);
  };

  // Reroll single game in ticket slip (A, B, C, D, E)
  const handleRerollGame = (label: 'A' | 'B' | 'C' | 'D' | 'E') => {
    audioService.playTick();
    const { numbers, score, tags: newTags } = generateSingleGameNumbers(
      currentMode,
      currentMode === 'custom' ? customFilter : undefined,
      currentMode === 'fortune' ? fortuneKeyword : undefined
    );

    const updatedGames = currentTicket.games.map((g) => {
      if (g.gameLabel === label) {
        return {
          ...g,
          numbers,
          score,
          tags: newTags,
          mode: currentMode,
        };
      }
      return g;
    });

    setCurrentTicket({
      ...currentTicket,
      games: updatedGames,
    });
  };

  // Save ticket to vault
  const handleSaveToVault = (ticket: Ticket5Games) => {
    if (savedTickets.some((t) => t.id === ticket.id)) {
      return;
    }
    setSavedTickets([ticket, ...savedTickets]);
  };

  const handleDeleteFromVault = (ticketId: string) => {
    audioService.playTick();
    setSavedTickets(savedTickets.filter((t) => t.id !== ticketId));
  };

  const handleSelectFromVault = (ticket: Ticket5Games) => {
    setCurrentTicket(ticket);
    setCurrentSingleNumbers(ticket.games[0].numbers);
    setAlgorithmScore(ticket.games[0].score);
    setActiveTab('generator');
  };

  const handleApplyFortune = (kw: string) => {
    setFortuneKeyword(kw);
    setCurrentMode('fortune');
    handleDraw5Games();
  };

  const handleApplyCustomFilter = (filter: CustomFilterOptions) => {
    setCustomFilter(filter);
    setCurrentMode('custom');
    handleDraw5Games();
  };

  const isCurrentTicketSaved = savedTickets.some((t) => t.id === currentTicket.id);

  return (
    <div className="min-h-screen bg-[#07070a] text-zinc-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      {/* Top VIP Header */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        targetRound={targetRound}
        savedCount={savedTickets.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 md:py-8 space-y-8">
        {/* TAB 1: VIP GENERATOR */}
        {activeTab === 'generator' && (
          <div className="space-y-8 animate-fadeIn">
            {/* VIP Algorithm Mode Selector */}
            <ModeSelector
              currentMode={currentMode}
              onSelectMode={(mode) => {
                setCurrentMode(mode);
                if (mode !== 'custom' && mode !== 'fortune') {
                  handleDraw5Games();
                }
              }}
              onOpenCustomModal={() => setFilterModalOpen(true)}
              onOpenFortuneModal={() => setFortuneModalOpen(true)}
              customFilterCount={customFilter.fixedNumbers.length + customFilter.excludedNumbers.length}
              fortuneKeyword={fortuneKeyword}
            />

            {/* 3D Ball Drawing Machine */}
            <DrawMachine
              currentNumbers={currentSingleNumbers}
              isDrawing={isDrawing}
              onDrawSingle={handleDrawSingle}
              onDraw5Games={handleDraw5Games}
              vipGoldBalls={vipGoldBalls}
              onToggleVipGold={() => {
                audioService.playTick();
                setVipGoldBalls(!vipGoldBalls);
              }}
              algorithmScore={algorithmScore}
              tags={tags}
            />

            {/* 5-Game VIP Luxury OMR Slip */}
            <TicketSlip
              ticket={currentTicket}
              vipGoldBalls={vipGoldBalls}
              onRerollGame={handleRerollGame}
              onSaveToVault={handleSaveToVault}
              onRunBacktest={() => setActiveTab('backtest')}
              onOpenCertificate={() => setCertModalOpen(true)}
              isSaved={isCurrentTicketSaved}
            />

            {/* Value Proposition & Feature Highlights (100만원 가치의 앱 브랜딩) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-zinc-800/80">
              <div className="p-4 rounded-xl bg-zinc-950/60 border border-amber-500/20 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
                  <Crown className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-amber-300">0.1% VIP 퀀트 엔진</h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">
                    단순 무작위 난수가 아닌 역대 1,160회차 실제 당첨 데이터의 통계적 정규분포와 출현 가중치를 반영합니다.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-zinc-950/60 border border-amber-500/20 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 shrink-0">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-cyan-300">3연번 & 비대칭 필터링</h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">
                    통계학적으로 출현 빈도가 극히 희박한 3연번(예: 12-13-14) 및 극단적 홀짝 편향(6:0, 0:6)을 사전에 차단합니다.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-zinc-950/60 border border-amber-500/20 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-400 shrink-0">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-yellow-300">과거 50주 백테스팅 검증</h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">
                    생성된 번호 세트가 과거 실제 회차에서 어떠한 성과(1~5등 적중 및 수익률)를 냈는지 실시간으로 모의 추적합니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: STATS DASHBOARD */}
        {activeTab === 'stats' && (
          <div className="animate-fadeIn">
            <StatsDashboard stats={stats} latestDraw={LATEST_DRAW} />
          </div>
        )}

        {/* TAB 3: BACKTEST SIMULATOR */}
        {activeTab === 'backtest' && (
          <div className="animate-fadeIn">
            <BacktestSimulator games={currentTicket.games} />
          </div>
        )}

        {/* TAB 4: SAVED VAULT */}
        {activeTab === 'saved' && (
          <div className="animate-fadeIn">
            <SavedTickets
              savedTickets={savedTickets}
              onDeleteTicket={handleDeleteFromVault}
              onSelectTicket={handleSelectFromVault}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-zinc-900 bg-black/80 py-6 mt-12 text-center text-xs text-zinc-500 space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-bold text-zinc-400">AURA LOTTO VIP 24K ROYALE EDITION</span>
          <span className="text-zinc-600">|</span>
          <span>Commercial License Ready</span>
        </div>
        <p className="text-[11px] text-zinc-600 max-w-md mx-auto">
          본 소프트웨어는 동행복권 통계 데이터 기반 알고리즘 분석 도구이며 복권 구매를 강요하지 않습니다. 복권은 소액으로 건전하게 즐기세요.
        </p>
      </footer>

      {/* Modals */}
      <FilterModal
        isOpen={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        currentFilter={customFilter}
        onSaveFilter={handleApplyCustomFilter}
      />

      <FortuneModal
        isOpen={fortuneModalOpen}
        onClose={() => setFortuneModalOpen(false)}
        onApplyFortune={handleApplyFortune}
        currentKeyword={fortuneKeyword}
      />

      <VipCertificateModal
        isOpen={certModalOpen}
        onClose={() => setCertModalOpen(false)}
        ticket={currentTicket}
      />
    </div>
  );
}

export default App;

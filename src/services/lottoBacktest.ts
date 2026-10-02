import type { BacktestResult, BacktestSummary, GeneratedGame, LottoDraw } from '../types/lotto';
import { LOTTO_HISTORY_DATA } from '../data/lottoHistory';

/**
 * 단일 게임 번호와 특정 회차 당첨 번호 대조
 */
export function checkRoundMatch(gameNumbers: number[], draw: LottoDraw): BacktestResult {
  const drawNumSet = new Set(draw.numbers);
  const matchedNumbers = gameNumbers.filter((n) => drawNumSet.has(n));
  const matchCount = matchedNumbers.length;
  const bonusMatched = gameNumbers.includes(draw.bnusNo);

  let rank: 1 | 2 | 3 | 4 | 5 | 0 = 0;
  let prizeAmount = 0;

  if (matchCount === 6) {
    rank = 1;
    prizeAmount = draw.firstWinamnt || 2000000000;
  } else if (matchCount === 5 && bonusMatched) {
    rank = 2;
    prizeAmount = 50000000;
  } else if (matchCount === 5) {
    rank = 3;
    prizeAmount = 1500000;
  } else if (matchCount === 4) {
    rank = 4;
    prizeAmount = 50000;
  } else if (matchCount === 3) {
    rank = 5;
    prizeAmount = 5000;
  }

  return {
    round: draw.drwNo,
    date: draw.drwNoDate,
    matchedNumbers,
    bonusMatched,
    rank,
    prizeAmount,
  };
}

/**
 * 과거 N개 회차에 대해 게임 세트 백테스팅 실행
 */
export function runBacktestSimulation(
  games: GeneratedGame[],
  roundsToTest: number = 50,
  history: LottoDraw[] = LOTTO_HISTORY_DATA
): BacktestSummary {
  const targetHistory = history.slice(0, Math.min(roundsToTest, history.length));
  const totalRounds = targetHistory.length;
  const investment = games.length * totalRounds * 1000; // 게임당 1,000원

  let totalReturn = 0;
  const rankCounts: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
    miss: number;
  } = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    miss: 0,
  };
  let bestRank = 0;

  const details = games.map((game) => {
    const results: BacktestResult[] = targetHistory.map((draw) => {
      const res = checkRoundMatch(game.numbers, draw);
      if (res.rank > 0) {
        rankCounts[res.rank as 1 | 2 | 3 | 4 | 5]++;
        totalReturn += res.prizeAmount;
        if (bestRank === 0 || res.rank < bestRank) {
          bestRank = res.rank;
        }
      } else {
        rankCounts.miss++;
      }
      return res;
    });

    return {
      gameId: game.id,
      gameLabel: game.gameLabel,
      numbers: game.numbers,
      results,
    };
  });

  const roi = investment > 0 ? Number((((totalReturn - investment) / investment) * 100).toFixed(2)) : 0;

  return {
    totalSimulations: totalRounds,
    investment,
    totalReturn,
    roi,
    rankCounts,
    bestRank: bestRank || 0,
    details,
  };
}

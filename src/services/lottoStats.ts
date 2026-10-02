import type { LottoDraw, NumberStat, OverallStats } from '../types/lotto';
import { LOTTO_HISTORY_DATA } from '../data/lottoHistory';

/**
 * 역대 당첨 데이터 기반 통계 분석 계산
 */
export function calculateOverallStats(draws: LottoDraw[] = LOTTO_HISTORY_DATA): OverallStats {
  const totalRounds = draws.length;
  const counts: { [num: number]: number } = {};
  const lastDrawnMap: { [num: number]: number } = {};

  // 초기화 (1 ~ 45)
  for (let i = 1; i <= 45; i++) {
    counts[i] = 0;
    lastDrawnMap[i] = 0;
  }

  const latestRound = draws[0]?.drwNo || 1160;
  let totalSumAll = 0;
  const oddEvenCounts: { [ratio: string]: number } = {
    '3:3': 0,
    '4:2': 0,
    '2:4': 0,
    '5:1': 0,
    '1:5': 0,
    '6:0': 0,
    '0:6': 0,
  };

  const colorDistribution = {
    yellow: 0, // 1~10
    blue: 0,   // 11~20
    red: 0,    // 21~30
    gray: 0,   // 31~40
    green: 0,  // 41~45
  };

  draws.forEach((draw) => {
    let odd = 0;
    let drawSum = 0;

    draw.numbers.forEach((num) => {
      counts[num] = (counts[num] || 0) + 1;
      drawSum += num;

      // 가장 최근 출현 회차 기록
      if (!lastDrawnMap[num] || draw.drwNo > lastDrawnMap[num]) {
        lastDrawnMap[num] = draw.drwNo;
      }

      // 색상 통계
      if (num <= 10) colorDistribution.yellow++;
      else if (num <= 20) colorDistribution.blue++;
      else if (num <= 30) colorDistribution.red++;
      else if (num <= 40) colorDistribution.gray++;
      else colorDistribution.green++;

      if (num % 2 !== 0) odd++;
    });

    totalSumAll += drawSum;
    const even = 6 - odd;
    const ratioKey = `${odd}:${even}`;
    oddEvenCounts[ratioKey] = (oddEvenCounts[ratioKey] || 0) + 1;
  });

  // NumberStat 배열 구축
  const rawStats: NumberStat[] = [];
  for (let i = 1; i <= 45; i++) {
    const freq = counts[i];
    const lastRound = lastDrawnMap[i] || 0;
    const overdue = latestRound - lastRound;
    rawStats.push({
      num: i,
      frequency: freq,
      percentage: Number(((freq / (totalRounds * 6)) * 100).toFixed(2)),
      lastDrawnRound: lastRound,
      weeksOverdue: overdue,
      isHot: false,
      isCold: false,
    });
  }

  // 출현 빈도 기준 정렬하여 Hot/Cold 구분
  const sortedByFreq = [...rawStats].sort((a, b) => b.frequency - a.frequency);
  const hotNumSet = new Set(sortedByFreq.slice(0, 10).map((s) => s.num));
  const coldNumSet = new Set(sortedByFreq.slice(-10).map((s) => s.num));

  // 장기 미출현수 Top 10
  const sortedByOverdue = [...rawStats].sort((a, b) => b.weeksOverdue - a.weeksOverdue);
  const overdueNumbers = sortedByOverdue.slice(0, 10).map((s) => s.num);

  const numberStats = rawStats.map((st) => ({
    ...st,
    isHot: hotNumSet.has(st.num),
    isCold: coldNumSet.has(st.num),
  }));

  const sumAverage = Math.round(totalSumAll / totalRounds);

  return {
    totalRounds,
    numberStats,
    hotNumbers: Array.from(hotNumSet),
    coldNumbers: Array.from(coldNumSet),
    overdueNumbers,
    oddEvenCounts,
    colorDistribution,
    sumAverage,
  };
}

/**
 * 로또 번호의 공 색상 분류 (한국 동행복권 표준 컬러)
 */
export function getBallColorInfo(num: number): {
  bg: string;
  glow: string;
  border: string;
  text: string;
  category: string;
} {
  if (num <= 10) {
    return {
      bg: 'radial-gradient(circle at 35% 35%, #FDE047 0%, #EAB308 55%, #A16207 100%)',
      glow: 'rgba(234, 179, 8, 0.45)',
      border: '#CA8A04',
      text: '#1C1917',
      category: '1-10 (황금)',
    };
  } else if (num <= 20) {
    return {
      bg: 'radial-gradient(circle at 35% 35%, #60A5FA 0%, #2563EB 55%, #1D4ED8 100%)',
      glow: 'rgba(37, 99, 235, 0.45)',
      border: '#1D4ED8',
      text: '#FFFFFF',
      category: '11-20 (청색)',
    };
  } else if (num <= 30) {
    return {
      bg: 'radial-gradient(circle at 35% 35%, #F87171 0%, #DC2626 55%, #991B1B 100%)',
      glow: 'rgba(220, 38, 38, 0.45)',
      border: '#B91C1C',
      text: '#FFFFFF',
      category: '21-30 (적색)',
    };
  } else if (num <= 40) {
    return {
      bg: 'radial-gradient(circle at 35% 35%, #94A3B8 0%, #475569 55%, #1E293B 100%)',
      glow: 'rgba(100, 116, 139, 0.45)',
      border: '#334155',
      text: '#FFFFFF',
      category: '31-40 (회색)',
    };
  } else {
    return {
      bg: 'radial-gradient(circle at 35% 35%, #34D399 0%, #059669 55%, #064E3B 100%)',
      glow: 'rgba(5, 150, 105, 0.45)',
      border: '#047857',
      text: '#FFFFFF',
      category: '41-45 (녹색)',
    };
  }
}

/**
 * 24K VIP 황금 에디션 볼 스타일 (VIP 럭셔리 모드)
 */
export function getVipGoldBallStyle(): {
  bg: string;
  glow: string;
  border: string;
  text: string;
} {
  return {
    bg: 'radial-gradient(circle at 32% 30%, #FFFBEB 0%, #FDE68A 25%, #D4AF37 55%, #926C15 85%, #583F05 100%)',
    glow: 'rgba(212, 175, 55, 0.65)',
    border: '#AA771C',
    text: '#261801',
  };
}

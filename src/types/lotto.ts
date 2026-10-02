export interface LottoDraw {
  drwNo: number;            // 회차
  drwNoDate: string;        // 추첨일자
  numbers: number[];        // 당첨 번호 6개 (오름차순)
  bnusNo: number;           // 보너스 번호
  firstWinamnt?: number;    // 1등 1인당 당첨금액 (원)
  firstPrzwnerCo?: number;  // 1등 당첨인원
  totSellamnt?: number;     // 총 판매금액
}

export type GeneratorMode = 'quant' | 'hot' | 'cold' | 'fortune' | 'custom' | 'balanced';

export interface CustomFilterOptions {
  fixedNumbers: number[];     // 고정수 (반드시 포함)
  excludedNumbers: number[];  // 제외수 (반드시 제외)
  oddEvenRatio?: 'all' | '3:3' | '4:2' | '2:4' | 'balanced'; // 홀짝 비율
  sumRange?: [number, number]; // 총합 범위 (예: [100, 175])
  noConsecutiveTriplets: boolean; // 3연번 방지
}

export interface GeneratedGame {
  id: string;
  gameLabel: 'A' | 'B' | 'C' | 'D' | 'E';
  numbers: number[];
  mode: GeneratorMode;
  score: number; // 알고리즘 적합도 점수 (예: 98.4%)
  tags: string[];
  createdAt: number;
}

export interface Ticket5Games {
  id: string;
  roundTarget: number;
  games: GeneratedGame[];
  createdAt: number;
  note?: string;
}

export interface NumberStat {
  num: number;
  frequency: number; // 출현 횟수
  percentage: number; // 출현 백분율
  lastDrawnRound: number; // 최근 출현 회차
  weeksOverdue: number; // 연속 미출현 주(회)
  isHot: boolean;
  isCold: boolean;
}

export interface OverallStats {
  totalRounds: number;
  numberStats: NumberStat[];
  hotNumbers: number[]; // Top 10 다빈도
  coldNumbers: number[]; // Bottom 10 최저빈도
  overdueNumbers: number[]; // 장기 미출현 Top 10
  oddEvenCounts: { [ratio: string]: number };
  colorDistribution: {
    yellow: number; // 1~10
    blue: number;   // 11~20
    red: number;    // 21~30
    gray: number;   // 31~40
    green: number;  // 41~45
  };
  sumAverage: number;
}

export interface BacktestResult {
  round: number;
  date: string;
  matchedNumbers: number[];
  bonusMatched: boolean;
  rank: 1 | 2 | 3 | 4 | 5 | 0; // 0 = 낙첨
  prizeAmount: number;
}

export interface BacktestSummary {
  totalSimulations: number; // 총 테스트 회차 수
  investment: number; // 총 투자 가상금액 (게임수 * 1,000원 * 회차수)
  totalReturn: number; // 총 당첨금
  roi: number; // 수익률 (%)
  rankCounts: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
    miss: number;
  };
  bestRank: number;
  details: {
    gameId: string;
    gameLabel: string;
    numbers: number[];
    results: BacktestResult[];
  }[];
}

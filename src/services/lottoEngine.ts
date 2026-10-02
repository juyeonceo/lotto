import type { CustomFilterOptions, GeneratedGame, GeneratorMode, Ticket5Games } from '../types/lotto';
import { calculateOverallStats } from './lottoStats';
import { LOTTO_HISTORY_DATA } from '../data/lottoHistory';

const stats = calculateOverallStats(LOTTO_HISTORY_DATA);

/**
 * 단순 해시 함수 (문자열 -> 정수 시드)
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * 3연번(예: 12, 13, 14) 존재 여부 체크
 */
export function hasConsecutiveTriplets(numbers: number[]): boolean {
  const sorted = [...numbers].sort((a, b) => a - b);
  for (let i = 0; i < sorted.length - 2; i++) {
    if (sorted[i + 1] === sorted[i] + 1 && sorted[i + 2] === sorted[i] + 2) {
      return true;
    }
  }
  return false;
}

/**
 * 홀짝 비율 검사
 */
export function getOddEvenRatio(numbers: number[]): { odd: number; even: number; ratioStr: string } {
  const odd = numbers.filter((n) => n % 2 !== 0).length;
  const even = 6 - odd;
  return { odd, even, ratioStr: `${odd}:${even}` };
}

/**
 * 번호 총합 계산
 */
export function getNumbersSum(numbers: number[]): number {
  return numbers.reduce((acc, curr) => acc + curr, 0);
}

/**
 * 조합의 퀀트 알고리즘 적합도 점수 계산 (0 ~ 100점)
 */
export function evaluateCombinationScore(numbers: number[]): { score: number; tags: string[] } {
  let score = 70;
  const tags: string[] = [];

  const sum = getNumbersSum(numbers);
  // 합계 점수: 100 ~ 175 사이면 보너스
  if (sum >= 100 && sum <= 175) {
    score += 15;
    tags.push('황금 총합구간 (100~175)');
  } else if (sum >= 80 && sum <= 190) {
    score += 8;
  } else {
    score -= 10;
  }

  // 홀짝 비율: 3:3, 4:2, 2:4 우대
  const { ratioStr } = getOddEvenRatio(numbers);
  if (ratioStr === '3:3') {
    score += 10;
    tags.push('최적 3:3 홀짝 밸런스');
  } else if (ratioStr === '4:2' || ratioStr === '2:4') {
    score += 8;
    tags.push(`안정적 ${ratioStr} 홀짝 비율`);
  } else {
    score -= 10;
  }

  // 3연번 방지
  if (!hasConsecutiveTriplets(numbers)) {
    score += 5;
    tags.push('3연번 제거 필터 통과');
  } else {
    score -= 15;
  }

  // Hot/Cold 분포 균형
  const hotCount = numbers.filter((n) => stats.hotNumbers.includes(n)).length;
  const overdueCount = numbers.filter((n) => stats.overdueNumbers.includes(n)).length;

  if (hotCount >= 2 && hotCount <= 4) {
    score += 5;
    tags.push(`핫넘버 ${hotCount}개 조화`);
  }
  if (overdueCount >= 1 && overdueCount <= 3) {
    score += 5;
    tags.push(`미출현 번호 ${overdueCount}개 편입`);
  }

  // 색상 쏠림 방지 (최소 3개 이상의 색상 영역 분산)
  const colors = new Set(numbers.map((n) => Math.floor((n - 1) / 10)));
  if (colors.size >= 4) {
    score += 5;
    tags.push('4색상 다각화 분산');
  }

  // 점수 범위 캡핑
  const finalScore = Math.min(99.8, Math.max(68.5, score + (Math.random() * 2 - 1)));
  return { score: Number(finalScore.toFixed(1)), tags };
}

/**
 * 단일 6개 로또 번호 생성기
 */
export function generateSingleGameNumbers(
  mode: GeneratorMode = 'quant',
  customFilter?: CustomFilterOptions,
  fortuneSeedText?: string
): { numbers: number[]; score: number; tags: string[] } {
  let numbers: number[] = [];
  const maxAttempts = 1000;
  let attempts = 0;

  while (attempts < maxAttempts) {
    attempts++;
    const candidateSet = new Set<number>();

    // 1. 커스텀 고정수 포함
    if (customFilter?.fixedNumbers?.length) {
      customFilter.fixedNumbers.slice(0, 5).forEach((fn) => candidateSet.add(fn));
    }

    // 모드별 번호 추천 로직
    if (mode === 'fortune' && fortuneSeedText) {
      let seed = hashString(fortuneSeedText) + attempts * 7919;
      while (candidateSet.size < 6) {
        seed = (seed * 9301 + 49297) % 233280;
        const num = (Math.abs(seed) % 45) + 1;
        if (!customFilter?.excludedNumbers?.includes(num)) {
          candidateSet.add(num);
        }
      }
    } else if (mode === 'hot') {
      // 핫 번호에서 최소 3~4개 우선 선택
      const hotPool = [...stats.hotNumbers];
      // 셔플
      hotPool.sort(() => Math.random() - 0.5);
      const pickHotCount = Math.min(4, 6 - candidateSet.size);
      for (let i = 0; i < pickHotCount && candidateSet.size < 6; i++) {
        if (!customFilter?.excludedNumbers?.includes(hotPool[i])) {
          candidateSet.add(hotPool[i]);
        }
      }
    } else if (mode === 'cold') {
      // 장기 미출현/최저 빈도수에서 3~4개 우선 선택
      const coldPool = [...stats.overdueNumbers, ...stats.coldNumbers];
      coldPool.sort(() => Math.random() - 0.5);
      const pickColdCount = Math.min(4, 6 - candidateSet.size);
      for (let i = 0; i < pickColdCount && candidateSet.size < 6; i++) {
        if (!customFilter?.excludedNumbers?.includes(coldPool[i])) {
          candidateSet.add(coldPool[i]);
        }
      }
    }

    // 부족한 번호는 가중치 기반 또는 랜덤 보충
    const remainingPool = Array.from({ length: 45 }, (_, i) => i + 1).filter(
      (n) => !candidateSet.has(n) && !customFilter?.excludedNumbers?.includes(n)
    );

    // 가중치 확률 생성
    while (candidateSet.size < 6 && remainingPool.length > 0) {
      const idx = Math.floor(Math.random() * remainingPool.length);
      candidateSet.add(remainingPool[idx]);
      remainingPool.splice(idx, 1);
    }

    if (candidateSet.size < 6) {
      continue;
    }

    const testNumbers = Array.from(candidateSet).sort((a, b) => a - b);

    // 필터 검증
    if (customFilter?.noConsecutiveTriplets && hasConsecutiveTriplets(testNumbers)) {
      continue;
    }

    if (customFilter?.sumRange) {
      const s = getNumbersSum(testNumbers);
      if (s < customFilter.sumRange[0] || s > customFilter.sumRange[1]) {
        continue;
      }
    }

    if (customFilter?.oddEvenRatio && customFilter.oddEvenRatio !== 'all') {
      const { ratioStr } = getOddEvenRatio(testNumbers);
      if (customFilter.oddEvenRatio === 'balanced') {
        if (ratioStr !== '3:3' && ratioStr !== '4:2' && ratioStr !== '2:4') {
          continue;
        }
      } else if (ratioStr !== customFilter.oddEvenRatio) {
        continue;
      }
    }

    // 퀀트 모드일 경우 기본적인 극단 조합(예: 6홀, 6짝, 총합 극단치) 자체 거르기
    if (mode === 'quant') {
      const s = getNumbersSum(testNumbers);
      if (s < 90 || s > 185) continue;
      if (hasConsecutiveTriplets(testNumbers)) continue;
      const { odd } = getOddEvenRatio(testNumbers);
      if (odd === 0 || odd === 6) continue;
    }

    numbers = testNumbers;
    break;
  }

  // 타임아웃 등으로 실패 시 무조건 유효한 번호 반환
  if (numbers.length !== 6) {
    const fallbackSet = new Set<number>();
    while (fallbackSet.size < 6) {
      fallbackSet.add(Math.floor(Math.random() * 45) + 1);
    }
    numbers = Array.from(fallbackSet).sort((a, b) => a - b);
  }

  const { score, tags } = evaluateCombinationScore(numbers);
  return { numbers, score, tags };
}

/**
 * 5게임 VIP 티켓 일괄 생성 (A, B, C, D, E)
 */
export function generateVip5GameTicket(
  targetRound: number = (LOTTO_HISTORY_DATA[0]?.drwNo || 1160) + 1,
  mode: GeneratorMode = 'quant',
  customFilter?: CustomFilterOptions,
  fortuneSeedText?: string
): Ticket5Games {
  const gameLabels: ('A' | 'B' | 'C' | 'D' | 'E')[] = ['A', 'B', 'C', 'D', 'E'];
  const games: GeneratedGame[] = [];

  for (let i = 0; i < 5; i++) {
    const label = gameLabels[i];
    // 각 슬롯별로 다양성을 위한 마이크로 시드 추가
    const subSeed = fortuneSeedText ? `${fortuneSeedText}_${i}` : undefined;
    const { numbers, score, tags } = generateSingleGameNumbers(mode, customFilter, subSeed);

    games.push({
      id: `game_${Date.now()}_${label}_${Math.random().toString(36).substring(2, 6)}`,
      gameLabel: label,
      numbers,
      mode,
      score,
      tags,
      createdAt: Date.now(),
    });
  }

  return {
    id: `ticket_${Date.now()}`,
    roundTarget: targetRound,
    games,
    createdAt: Date.now(),
    note: `VIP ${mode.toUpperCase()} 알고리즘 추천`,
  };
}

export class PopularSearchDto {
  keyword: string; // 검색어
  currentRank: number; // 현재 순위
  previousRank?: number; // 이전 순위 (optional, 없을 수도 있음)
  rankChange: 'UP' | 'DOWN' | 'NEW' | 'SAME'; // 순위 변화 상태
  rankDifference?: number; // 순위 변동량 (optional, 없을 수도 있음)
  checkTime: Date; // 순위 체크 시간
}

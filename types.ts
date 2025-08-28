
export enum GameState {
  BETTING = 'BETTING',
  COUNTDOWN = 'COUNTDOWN',
  IN_PROGRESS = 'IN_PROGRESS',
  CRASHED = 'CRASHED',
}

export interface HistoryItem {
  id: number;
  multiplier: number;
}

export interface CoinAnimationData {
  id: number;
  type: 'win' | 'loss' | 'bet';
  startX: number;
  startY: number;
  endX?: number;
  endY?: number;
}
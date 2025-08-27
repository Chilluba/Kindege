
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

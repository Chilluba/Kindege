// --- Game Settings ---
export const INITIAL_BALANCE = 1000;
export const MIN_BET = 10;
export const MAX_BET = 5000;
export const COUNTDOWN_SECONDS = 1; 
export const GAME_LOOP_INTERVAL_MS = 16;
export const POST_ROUND_DELAY_MS = 2000; 

// --- Economic Balance & Volatility ---
export const CRASH_POINT_MAX = 25.00; // Max possible crash point in rare cases
export const THEORETICAL_RTP = 95; // Target Return-To-Player in percent
export const DRAIN_EXPONENT = 2.5; // Controls how aggressively the shadow plane drains the payout. Higher = more punishing.

// --- Adaptive Difficulty (DDA) ---
export const DIFFICULTY_INITIAL = 1.0; // Normal difficulty
export const DIFFICULTY_MIN = 0.8;     // Easiest
export const DIFFICULTY_MAX = 1.5;     // Hardest
export const DIFFICULTY_WIN_INCREASE = 0.1;  // How much winning increases difficulty
export const DIFFICULTY_LOSS_DECREASE = 0.05; // How much losing decreases difficulty

// --- Reinforcement ---
export const SAFE_ZONE_CHANCE = 0.05; // 5% chance of a safe zone round
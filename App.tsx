import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameState } from './types';
import type { HistoryItem } from './types';
import { GoogleGenAI } from "@google/genai";
import { API_KEY } from './config';
import {
  INITIAL_BALANCE,
  MIN_BET,
  MAX_BET,
  GAME_LOOP_INTERVAL_MS,
  COUNTDOWN_SECONDS,
  POST_ROUND_DELAY_MS,
  DIFFICULTY_INITIAL,
  DIFFICULTY_MIN,
  DIFFICULTY_MAX,
  DIFFICULTY_WIN_INCREASE,
  DIFFICULTY_LOSS_DECREASE,
  SAFE_ZONE_CHANCE,
  THEORETICAL_RTP,
  CRASH_POINT_MAX,
  DRAIN_EXPONENT
} from './constants';
import HistoryBar from './components/HistoryBar';
import GameScreen from './components/GameScreen';
import Controls from './components/Controls';
import Introduction from './components/Introduction';
import useSound from './hooks/useSound';
import useVibration from './hooks/useVibration';

const ai = new GoogleGenAI({ apiKey: API_KEY });

const App: React.FC = () => {
  const [showIntroduction, setShowIntroduction] = useState<boolean>(true);
  const [gameState, setGameState] = useState<GameState>(GameState.BETTING);
  const [balance, setBalance] = useState<number>(INITIAL_BALANCE);
  const [betAmount, setBetAmount] = useState<number>(MIN_BET);
  const [inputBet, setInputBet] = useState<string>(MIN_BET.toString());
  
  const [multiplier, setMultiplier] = useState<number>(1.00);
  const [effectiveMultiplier, setEffectiveMultiplier] = useState<number>(1.00);
  const [crashMultiplier, setCrashMultiplier] = useState<number>(1.00);
  
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [countdown, setCountdown] = useState<number>(COUNTDOWN_SECONDS);
  
  const [flightLog, setFlightLog] = useState<string>('Prepare for takeoff...');
  const [isGeneratingLog, setIsGeneratingLog] = useState<boolean>(true);
  
  const [hasCashedOut, setHasCashedOut] = useState<boolean>(false);
  const [difficultyFactor, setDifficultyFactor] = useState<number>(DIFFICULTY_INITIAL);
  const [isSafeZone, setIsSafeZone] = useState<boolean>(false);

  const [flightDynamics, setFlightDynamics] = useState({ planeY: 0, shadowY: 0, proximity: 0, isWarning: false });
  const [isShaking, setIsShaking] = useState<boolean>(false);
  
  const [animationText, setAnimationText] = useState<{ key: number; amount: number; type: 'win' | 'loss' } | null>(null);

  const { 
    playTakeoff, 
    playDing, 
    playExplosion,
    startPlayerPlaneSound,
    stopPlayerPlaneSound,
    startShadowPlaneSound,
    stopShadowPlaneSound,
    playBetPlaced,
    playQuickBet,
    playMissionStart,
    startDrainSound,
    updateDrainSound,
    stopDrainSound,
  } = useSound();

  const {
    playCrashVibration,
    playWarningVibration,
    playCashOutVibration,
    playBetPlacedVibration,
    playQuickBetVibration,
  } = useVibration();

  const gameLoopRef = useRef<number | null>(null);
  const wasWarningRef = useRef<boolean>(false);
  
  useEffect(() => {
    if (animationText) {
        const timer = setTimeout(() => {
            setAnimationText(null);
        }, 2000); // Corresponds to animation duration
        return () => clearTimeout(timer);
    }
  }, [animationText]);

  const generateFlightLog = useCallback(async () => {
    setIsGeneratingLog(true);
    setFlightLog('');
    try {
        const prompt = `Generate a short, futuristic flight log for a dangerous single-round mission codenamed "Shadow Flight".
        The mission is a high-risk flight where an enemy "shadow" vehicle will give chase.
        Include a creative callsign, a destination, and a brief, slightly ominous status update.
        Keep it concise, under 200 characters.
        Example: "Callsign: Viper-1. Target: Ganymede Relay. Status: Shadow signature detected. Engaging thrust."`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const text = response.text;
        setFlightLog(text.trim());
    } catch (error) {
        console.error("Error generating flight log:", error);
        setFlightLog("Mission details corrupted. Proceed with caution.");
    } finally {
        setIsGeneratingLog(false);
    }
  }, []);
  
  useEffect(() => {
    if (gameState === GameState.BETTING && !isGeneratingLog) {
        generateFlightLog();
    }
  }, [gameState, isGeneratingLog, generateFlightLog]);

  // Effect to control continuous plane sounds
  useEffect(() => {
    if (gameState === GameState.IN_PROGRESS) {
      startPlayerPlaneSound();
      startShadowPlaneSound();
      startDrainSound();
    } else {
      stopPlayerPlaneSound();
      stopShadowPlaneSound();
      stopDrainSound();
    }
    // Cleanup on unmount
    return () => {
      stopPlayerPlaneSound();
      stopShadowPlaneSound();
      stopDrainSound();
    };
  }, [gameState, startPlayerPlaneSound, stopPlayerPlaneSound, startShadowPlaneSound, stopShadowPlaneSound, startDrainSound, stopDrainSound]);


  const generateCrashPoint = useCallback((isSafe: boolean, difficulty: number) => {
    if (isSafe) {
        // Safe zones guarantee a better-than-average outcome (2x-20x), but are still volatile.
        // Skewed towards the lower end of the range.
        return 2.0 + Math.pow(Math.random(), 2) * 18;
    }

    const roll = Math.random();
    // difficultyFactor (0.8 to 1.5) adjusts the probability curve.
    // > 1.0 makes lower rolls more likely (harder)
    // < 1.0 makes higher rolls more likely (easier)
    const effectiveRoll = Math.pow(roll, difficulty);

    // [3% chance] Instant crash
    if (effectiveRoll < 0.03) {
        return 1.00;
    }
    // [55% chance] The Danger Zone (1.01x - 1.49x)
    if (effectiveRoll < 0.58) { // 0.03 + 0.55
        // Skewed heavily towards 1.01x
        return 1.01 + Math.pow(Math.random(), 2) * 0.48;
    }
    // [20% chance] The Safe Bet (1.50x - 1.99x)
    if (effectiveRoll < 0.78) { // 0.58 + 0.20
        return 1.50 + Math.random() * 0.49;
    }
    // [12% chance] Good Wins (2.00x - 4.99x)
    if (effectiveRoll < 0.90) { // 0.78 + 0.12
        return 2.00 + Math.pow(Math.random(), 1.5) * 2.99;
    }
    // [6% chance] Great Wins (5.00x - 9.99x)
    if (effectiveRoll < 0.96) { // 0.90 + 0.06
        return 5.00 + Math.pow(Math.random(), 2) * 4.99;
    }
    // [3% chance] Jackpots (10.00x - 49.99x)
    if (effectiveRoll < 0.99) { // 0.96 + 0.03
        return 10.00 + Math.pow(Math.random(), 2.5) * 39.99;
    }
    // [1% chance] Legendary Wins (50.00x+)
    else {
        // Skewed heavily towards 50x
        return 50.00 + Math.pow(Math.random(), 3) * 50.00;
    }
  }, []);

  const handleCashOut = useCallback(() => {
    if (gameState === GameState.IN_PROGRESS && !hasCashedOut) {
      const winnings = betAmount * effectiveMultiplier;
      setBalance(prev => prev + winnings);
      setHasCashedOut(true);
      playDing();
      playCashOutVibration();
      setAnimationText({ key: Date.now(), amount: winnings, type: 'win' });
    }
  }, [gameState, hasCashedOut, effectiveMultiplier, betAmount, playDing, playCashOutVibration]);


  const endRound = useCallback(() => {
    if (gameLoopRef.current) {
      window.clearInterval(gameLoopRef.current);
      gameLoopRef.current = null;
    }
    
    playExplosion();
    playCrashVibration();
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500); // Match animation duration

    setGameState(GameState.CRASHED);

    // Adaptive Difficulty Adjustment
    if (hasCashedOut) {
        setDifficultyFactor(prev => Math.min(DIFFICULTY_MAX, prev + DIFFICULTY_WIN_INCREASE));
    } else {
        setDifficultyFactor(prev => Math.max(DIFFICULTY_MIN, prev - DIFFICULTY_LOSS_DECREASE));
        setAnimationText({ key: Date.now(), amount: betAmount, type: 'loss' });
    }
    
    setHistory(prevHistory => {
        const newItem: HistoryItem = { id: Date.now(), multiplier: crashMultiplier };
        return [newItem, ...prevHistory].slice(0, 5);
    });

    setTimeout(() => {
        setGameState(GameState.BETTING);
    }, POST_ROUND_DELAY_MS);

  }, [crashMultiplier, playExplosion, hasCashedOut, betAmount, playCrashVibration]);


  const startRound = useCallback(() => {
    const safeZone = Math.random() < SAFE_ZONE_CHANCE;
    setIsSafeZone(safeZone);
    
    setGameState(GameState.IN_PROGRESS);
    setMultiplier(1.00);
    setEffectiveMultiplier(1.00);
    setHasCashedOut(false);
    wasWarningRef.current = false; // Reset warning state for new round

    const newCrashMultiplier = generateCrashPoint(safeZone, difficultyFactor);
    setCrashMultiplier(newCrashMultiplier);
    playTakeoff();

    const multiplierRiseRate = 0.01 + Math.random() * 0.02; // Make rise rate more consistent

    gameLoopRef.current = window.setInterval(() => {
      setMultiplier(prevMultiplier => {
        const nextMultiplier = prevMultiplier + multiplierRiseRate * (Math.log(prevMultiplier) + 1) * 0.05;
        
        if (nextMultiplier >= newCrashMultiplier) {
          if(gameLoopRef.current) window.clearInterval(gameLoopRef.current);
          setMultiplier(newCrashMultiplier);
          endRound();
          return newCrashMultiplier;
        }

        // --- New Payout Drain Logic ---
        const safeCrashPoint = Math.max(newCrashMultiplier, 1.01);
        const normalizedProgress = Math.min(1, Math.log(nextMultiplier) / Math.log(safeCrashPoint));
        const planeY = Math.log(nextMultiplier) / Math.log(CRASH_POINT_MAX) * 80;

        let gapFactor = Math.pow(1 - normalizedProgress, 2.0);
        if (safeZone) {
            gapFactor = Math.pow(1 - normalizedProgress, 0.5);
        }

        const initialGap = 15;
        const maxGap = (initialGap / difficultyFactor) + 1.0;
        const currentGap = (gapFactor * (initialGap / difficultyFactor)) + 1.0;
        const shadowY = planeY - currentGap;

        const proximity = Math.max(0, 1 - (currentGap / maxGap));
        const drainPercentage = Math.pow(proximity, DRAIN_EXPONENT);
        updateDrainSound(drainPercentage);
        const newEffectiveMultiplier = nextMultiplier * (1 - drainPercentage);

        const warningThreshold = safeZone ? 0.99 : 0.95;
        const isWarning = normalizedProgress > warningThreshold;
        
        // Trigger vibration only when warning state begins
        if (isWarning && !wasWarningRef.current) {
            playWarningVibration();
        }
        wasWarningRef.current = isWarning;

        setFlightDynamics({ planeY, shadowY, proximity, isWarning });
        setEffectiveMultiplier(newEffectiveMultiplier);
        // --- End of New Logic ---

        return nextMultiplier;
      });
    }, GAME_LOOP_INTERVAL_MS);
  }, [generateCrashPoint, playTakeoff, endRound, difficultyFactor, updateDrainSound, playWarningVibration]);


  useEffect(() => {
    let countdownInterval: number | null = null;
    if (gameState === GameState.COUNTDOWN) {
      countdownInterval = window.setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            if(countdownInterval) window.clearInterval(countdownInterval);
            startRound();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (countdownInterval) window.clearInterval(countdownInterval);
    };
  }, [gameState, startRound]);
  
  const handlePlaceBet = () => {
    if (gameState !== GameState.BETTING) return;

    // Validate the raw input string first.
    let numValue = parseFloat(inputBet);

    // Apply validation and clamping rules.
    if (isNaN(numValue) || numValue < MIN_BET) {
      numValue = MIN_BET;
    }
    if (numValue > MAX_BET) {
      numValue = MAX_BET;
    }
    if (numValue > balance) {
      numValue = balance;
    }
    
    // Update state for both input and internal bet amount for consistency.
    setInputBet(numValue.toString());
    setBetAmount(numValue);

    // Proceed to place the bet with the validated and cleaned amount.
    if (balance >= numValue) {
      setBalance(prev => prev - numValue);
      setGameState(GameState.COUNTDOWN);
      setCountdown(COUNTDOWN_SECONDS);
      playBetPlaced();
      playBetPlacedVibration();
    } else {
      // This is a fallback and should not be reached due to clamping.
      alert("Insufficient balance!");
    }
  };
  
  const handleBetChange = (value: string) => {
    setInputBet(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= MIN_BET && numValue <= MAX_BET) {
        setBetAmount(numValue);
    }
  };
  
  const validateAndSetBet = () => {
      let numValue = parseFloat(inputBet);
      if (isNaN(numValue) || numValue < MIN_BET) numValue = MIN_BET;
      if (numValue > MAX_BET) numValue = MAX_BET;
      if (numValue > balance) numValue = balance;
      setBetAmount(numValue);
      setInputBet(numValue.toString());
  };

  const handleStartGame = () => {
    playMissionStart();
    setShowIntroduction(false);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-b from-gray-900 via-indigo-900 to-black text-white font-mono flex flex-col items-center justify-center p-2 sm:p-4 ${isShaking ? 'crash-shake' : ''}`}>
      <style>{`
        @keyframes crash-shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }
        .crash-shake {
          animation: crash-shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
        @keyframes float-up {
          from {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
          to {
            transform: translateY(-40px) scale(0.8);
            opacity: 0;
          }
        }
        .animate-float-up {
          animation: float-up 2s ease-out forwards;
        }
      `}</style>
      {showIntroduction ? (
        <Introduction onStartGame={handleStartGame} />
      ) : (
        <>
          <div className="w-full max-w-5xl mx-auto flex flex-col gap-4">
            <HistoryBar history={history} />
            <GameScreen 
              gameState={gameState}
              multiplier={multiplier}
              effectiveMultiplier={effectiveMultiplier}
              betAmount={betAmount}
              countdown={countdown}
              flightLog={flightLog}
              isGeneratingLog={isGeneratingLog}
              isSafeZone={isSafeZone}
              flightDynamics={flightDynamics}
            />
            <Controls
              gameState={gameState}
              balance={balance}
              betAmount={betAmount}
              inputBet={inputBet}
              handleBetChange={handleBetChange}
              validateAndSetBet={validateAndSetBet}
              setBetAmount={setBetAmount}
              handlePlaceBet={handlePlaceBet}
              handleCashOut={handleCashOut}
              multiplier={multiplier}
              effectiveMultiplier={effectiveMultiplier}
              hasCashedOut={hasCashedOut}
              difficultyFactor={difficultyFactor}
              playQuickBet={playQuickBet}
              playQuickBetVibration={playQuickBetVibration}
              animationText={animationText}
            />
          </div>
          <footer className="text-center text-xs text-gray-400 mt-8">
            <p>Shadow Flight - Created by Salmin Habibu</p>
            <p className="font-bold">Theoretical RTP: ~{THEORETICAL_RTP}%</p>
            <p>Disclaimer: This is a simulation game for entertainment purposes only. No real money is involved.</p>
          </footer>
        </>
      )}
    </div>
  );
};

export default App;

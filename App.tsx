import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameState } from './types';
// Import new type
import type { HistoryItem, CoinAnimationData, DetailedHistoryItem } from './types'; 
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
  CRASH_POINT_MAX,
  DRAIN_EXPONENT
} from './constants';
import Header from './components/Header';
import HistoryBar from './components/HistoryBar';
import GameScreen from './components/GameScreen';
import { Controls } from './components/Controls';
import Introduction from './components/Introduction';
import CoinAnimationManager from './components/CoinAnimation';
import HistoryModal from './components/HistoryModal'; // Import new modal
import useSound from './hooks/useSound';
import useVibration from './hooks/useVibration';
import { useTranslation } from './i18n/useTranslation';

const DETAILED_HISTORY_STORAGE_KEY = 'shadowFlightDetailedHistory';

const App: React.FC = () => {
  const { t, getMissions } = useTranslation();
  const [showIntroduction, setShowIntroduction] = useState<boolean>(true);
  const [gameState, setGameState] = useState<GameState>(GameState.BETTING);
  const [balance, setBalance] = useState<number>(INITIAL_BALANCE);
  const [betAmount, setBetAmount] = useState<number>(MIN_BET);
  const [inputBet, setInputBet] = useState<string>(MIN_BET.toString());
  
  const [multiplier, setMultiplier] = useState<number>(1.00);
  const [effectiveMultiplier, setEffectiveMultiplier] = useState<number>(1.00);
  const [crashMultiplier, setCrashMultiplier] = useState<number>(1.00);
  
  // Simple history for the bar
  const [history, setHistory] = useState<HistoryItem[]>([]);
  // Detailed history for the modal
  const [detailedHistory, setDetailedHistory] = useState<DetailedHistoryItem[]>([]);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);

  const [countdown, setCountdown] = useState<number>(COUNTDOWN_SECONDS);
  
  const [flightLog, setFlightLog] = useState<string>('Prepare for takeoff...');
  const [isGeneratingLog, setIsGeneratingLog] = useState<boolean>(true);
  
  const [hasCashedOut, setHasCashedOut] = useState<boolean>(false);
  const [difficultyFactor, setDifficultyFactor] = useState<number>(DIFFICULTY_INITIAL);
  const [isSafeZone, setIsSafeZone] = useState<boolean>(false);

  const [flightDynamics, setFlightDynamics] = useState({ planeY: 0, shadowY: 0, proximity: 0, isWarning: false });
  const [isShaking, setIsShaking] = useState<boolean>(false);
  
  const [coinAnimations, setCoinAnimations] = useState<CoinAnimationData[]>([]);

  // Auto-Bet State
  const [isAutoBetActive, setIsAutoBetActive] = useState<boolean>(false);
  const [autoBetRounds, setAutoBetRounds] = useState<string>('10');
  const [roundsRemaining, setRoundsRemaining] = useState<number>(0);
  const [autoBetInitialBalance, setAutoBetInitialBalance] = useState<number>(0);
  const [stopOnProfit, setStopOnProfit] = useState<string>('');
  const [stopOnLoss, setStopOnLoss] = useState<string>('');

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
  const lastMissionIndex = useRef<number | null>(null);
  const balanceRef = useRef<HTMLDivElement>(null);
  const actionButtonRef = useRef<HTMLButtonElement>(null);
  
  // Load detailed history from localStorage on mount
  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem(DETAILED_HISTORY_STORAGE_KEY);
      if (storedHistory) {
        setDetailedHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error("Failed to load detailed history from localStorage", error);
    }
  }, []);

  // Save detailed history to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(DETAILED_HISTORY_STORAGE_KEY, JSON.stringify(detailedHistory));
    } catch (error) {
      console.error("Failed to save detailed history to localStorage", error);
    }
  }, [detailedHistory]);

  const triggerCoinAnimation = useCallback((type: 'win' | 'loss' | 'bet') => {
    const startRect = (type === 'win' ? actionButtonRef.current : balanceRef.current)?.getBoundingClientRect();
    const endRect = (type === 'win' ? balanceRef.current : actionButtonRef.current)?.getBoundingClientRect();

    if (!startRect) return;

    const newAnimation: CoinAnimationData = {
      id: Date.now() + Math.random(),
      type,
      startX: startRect.left + startRect.width / 2,
      startY: startRect.top + startRect.height / 2,
    };

    if (endRect && type !== 'loss') {
      newAnimation.endX = endRect.left + endRect.width / 2;
      newAnimation.endY = endRect.top + endRect.height / 2;
    }

    setCoinAnimations(prev => [...prev, newAnimation]);
  }, []);

  const generateFlightLog = useCallback(() => {
    const predefinedMissions = getMissions();
    setIsGeneratingLog(true);
    setTimeout(() => {
      let nextIndex;
      do {
        nextIndex = Math.floor(Math.random() * predefinedMissions.length);
      } while (predefinedMissions.length > 1 && nextIndex === lastMissionIndex.current);
      
      lastMissionIndex.current = nextIndex;
      setFlightLog(predefinedMissions[nextIndex]);
      setIsGeneratingLog(false);
    }, 500);
  }, [getMissions]);
  
  useEffect(() => {
    if (gameState === GameState.BETTING) {
        generateFlightLog();
    }
  }, [gameState, generateFlightLog]);

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
    return () => {
      stopPlayerPlaneSound();
      stopShadowPlaneSound();
      stopDrainSound();
    };
  }, [gameState, startPlayerPlaneSound, stopPlayerPlaneSound, startShadowPlaneSound, stopShadowPlaneSound, startDrainSound, stopDrainSound]);

  const generateCrashPoint = useCallback((isSafe: boolean, difficulty: number) => {
    if (isSafe) {
        return 2.0 + Math.pow(Math.random(), 2) * 18;
    }

    const roll = Math.random();
    const effectiveRoll = Math.pow(roll, difficulty);

    if (effectiveRoll < 0.03) return 1.00;
    if (effectiveRoll < 0.58) return 1.01 + Math.pow(Math.random(), 2) * 0.48;
    if (effectiveRoll < 0.78) return 1.50 + Math.random() * 0.49;
    if (effectiveRoll < 0.90) return 2.00 + Math.pow(Math.random(), 1.5) * 2.99;
    if (effectiveRoll < 0.96) return 5.00 + Math.pow(Math.random(), 2) * 4.99;
    if (effectiveRoll < 0.99) return 10.00 + Math.pow(Math.random(), 2.5) * 39.99;
    else return 50.00 + Math.pow(Math.random(), 3) * 50.00;
  }, []);

  const handleCashOut = useCallback(() => {
    if (gameState === GameState.IN_PROGRESS && !hasCashedOut) {
      const winnings = betAmount * effectiveMultiplier;
      setBalance(prev => prev + winnings);
      setHasCashedOut(true);
      playDing();
      playCashOutVibration();
      triggerCoinAnimation('win');
    }
  }, [gameState, hasCashedOut, effectiveMultiplier, betAmount, playDing, playCashOutVibration, triggerCoinAnimation]);

  const endRound = useCallback(() => {
    if (gameLoopRef.current) {
      window.clearInterval(gameLoopRef.current);
      gameLoopRef.current = null;
    }
    
    playExplosion();
    playCrashVibration();
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);

    setGameState(GameState.CRASHED);
    
    // Create new detailed history item
    const newDetailedHistoryItem: DetailedHistoryItem = {
      id: Date.now(),
      betAmount: betAmount,
      cashedOutAt: hasCashedOut ? effectiveMultiplier : null,
      crashMultiplier: crashMultiplier,
      profit: hasCashedOut ? (betAmount * effectiveMultiplier) - betAmount : -betAmount,
    };
    setDetailedHistory(prev => [newDetailedHistoryItem, ...prev]);

    if (hasCashedOut) {
        setDifficultyFactor(prev => Math.min(DIFFICULTY_MAX, prev + DIFFICULTY_WIN_INCREASE));
    } else {
        setDifficultyFactor(prev => Math.max(DIFFICULTY_MIN, prev - DIFFICULTY_LOSS_DECREASE));
        triggerCoinAnimation('loss');
    }
    
    setHistory(prevHistory => {
        const newItem: HistoryItem = { id: Date.now(), multiplier: crashMultiplier };
        return [newItem, ...prevHistory].slice(0, 5);
    });

    setTimeout(() => {
        setGameState(GameState.BETTING);
    }, POST_ROUND_DELAY_MS);

  }, [crashMultiplier, playExplosion, hasCashedOut, playCrashVibration, triggerCoinAnimation, betAmount, effectiveMultiplier]);

  const startRound = useCallback(() => {
    const safeZone = Math.random() < SAFE_ZONE_CHANCE;
    setIsSafeZone(safeZone);
    
    setGameState(GameState.IN_PROGRESS);
    setMultiplier(1.00);
    setEffectiveMultiplier(1.00);
    setHasCashedOut(false);
    wasWarningRef.current = false;

    const newCrashMultiplier = generateCrashPoint(safeZone, difficultyFactor);
    setCrashMultiplier(newCrashMultiplier);
    playTakeoff();

    const multiplierRiseRate = 0.01 + Math.random() * 0.02;

    gameLoopRef.current = window.setInterval(() => {
      setMultiplier(prevMultiplier => {
        const nextMultiplier = prevMultiplier + multiplierRiseRate * (Math.log(prevMultiplier) + 1) * 0.05;
        
        if (nextMultiplier >= newCrashMultiplier) {
          if(gameLoopRef.current) window.clearInterval(gameLoopRef.current);
          setMultiplier(newCrashMultiplier);
          endRound();
          return newCrashMultiplier;
        }

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
        
        if (isWarning && !wasWarningRef.current) {
            playWarningVibration();
        }
        wasWarningRef.current = isWarning;

        setFlightDynamics({ planeY, shadowY, proximity, isWarning });
        setEffectiveMultiplier(newEffectiveMultiplier);
        
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

    let numValue = parseFloat(inputBet);

    if (isNaN(numValue) || numValue < MIN_BET) numValue = MIN_BET;
    if (numValue > MAX_BET) numValue = MAX_BET;
    if (numValue > balance) numValue = balance;
    
    setInputBet(numValue.toString());
    setBetAmount(numValue);

    if (balance >= numValue) {
      setBalance(prev => prev - numValue);
      setGameState(GameState.COUNTDOWN);
      setCountdown(COUNTDOWN_SECONDS);
      playBetPlaced();
      playBetPlacedVibration();
      triggerCoinAnimation('bet');
    } else {
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

  const handleToggleAutoBet = () => {
    if (isAutoBetActive) {
      setIsAutoBetActive(false);
    } else {
      const rounds = parseInt(autoBetRounds, 10);
      if (gameState === GameState.BETTING && !isNaN(rounds) && rounds > 0) {
        validateAndSetBet();
        if (balance >= betAmount) {
          setIsAutoBetActive(true);
          setRoundsRemaining(rounds);
          setAutoBetInitialBalance(balance);
        }
      }
    }
  };
  
  const handleClearHistory = () => {
    setDetailedHistory([]);
  };

  useEffect(() => {
    if (!isAutoBetActive || gameState !== GameState.BETTING) {
      return;
    }

    if (roundsRemaining <= 0) {
      setIsAutoBetActive(false);
      return;
    }

    const profit = balance - autoBetInitialBalance;
    const stopProfitAmount = parseFloat(stopOnProfit);
    const stopLossAmount = parseFloat(stopOnLoss);

    if (
      (!isNaN(stopProfitAmount) && stopProfitAmount > 0 && profit >= stopProfitAmount) ||
      (!isNaN(stopLossAmount) && stopLossAmount > 0 && -profit >= stopLossAmount)
    ) {
      setIsAutoBetActive(false);
      return;
    }

    if (balance >= betAmount && betAmount >= MIN_BET) {
      setBalance(prev => prev - betAmount);
      setRoundsRemaining(prev => prev - 1);
      setGameState(GameState.COUNTDOWN);
      setCountdown(COUNTDOWN_SECONDS);
      playBetPlaced();
      playBetPlacedVibration();
      triggerCoinAnimation('bet');
    } else {
      setIsAutoBetActive(false);
    }
  }, [isAutoBetActive, gameState, balance, betAmount, roundsRemaining, autoBetInitialBalance, stopOnProfit, stopOnLoss, playBetPlaced, playBetPlacedVibration, triggerCoinAnimation]);

  return (
    <div className={`min-h-screen bg-gray-900 text-white font-mono flex flex-col items-center p-2 sm:p-4 ${isShaking ? 'crash-shake' : ''}`}>
      <style>{`
        body {
          background-color: #0c0a12;
        }
        @keyframes crash-shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }
        .crash-shake {
          animation: crash-shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>
      <CoinAnimationManager animations={coinAnimations} />
      <HistoryModal 
        isOpen={isHistoryModalOpen} 
        onClose={() => setIsHistoryModalOpen(false)}
        history={detailedHistory}
        onClear={handleClearHistory}
      />
      {showIntroduction ? (
        <Introduction onStartGame={handleStartGame} />
      ) : (
        <>
          <div className="w-full max-w-5xl mx-auto flex flex-col gap-4">
            <Header 
              balance={balance} 
              balanceRef={balanceRef} 
              difficultyFactor={difficultyFactor} 
              onOpenHistory={() => setIsHistoryModalOpen(true)}
            />
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
              playQuickBet={playQuickBet}
              playQuickBetVibration={playQuickBetVibration}
              actionButtonRef={actionButtonRef}
              // Auto-Bet Props
              isAutoBetActive={isAutoBetActive}
              autoBetRounds={autoBetRounds}
              roundsRemaining={roundsRemaining}
              stopOnProfit={stopOnProfit}
              stopOnLoss={stopOnLoss}
              setAutoBetRounds={setAutoBetRounds}
              setStopOnProfit={setStopOnProfit}
              setStopOnLoss={setStopOnLoss}
              handleToggleAutoBet={handleToggleAutoBet}
            />
          </div>
          <footer className="w-full max-w-5xl mx-auto text-center text-xs text-gray-400 mt-8 space-y-1">
            <p>{t('footerDisclaimer')}</p>
          </footer>
        </>
      )}
    </div>
  );
};

export default App;

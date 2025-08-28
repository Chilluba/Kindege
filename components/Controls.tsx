import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { GameState } from '../types';
import { MIN_BET, MAX_BET } from '../constants';
import { useTranslation } from '../i18n/useTranslation';

interface ControlsProps {
  gameState: GameState;
  balance: number;
  betAmount: number;
  inputBet: string;
  multiplier: number;
  effectiveMultiplier: number;
  hasCashedOut: boolean;
  difficultyFactor: number;
  animationText: { key: number; amount: number; type: 'win' | 'loss' } | null;
  handleBetChange: (value: string) => void;
  validateAndSetBet: () => void;
  setBetAmount: React.Dispatch<React.SetStateAction<number>>;
  handlePlaceBet: () => void;
  handleCashOut: () => void;
  playQuickBet: () => void;
  playQuickBetVibration: () => void;
  // Auto-Bet Props
  isAutoBetActive: boolean;
  autoBetRounds: string;
  roundsRemaining: number;
  stopOnProfit: string;
  stopOnLoss: string;
  setAutoBetRounds: (value: string) => void;
  setStopOnProfit: (value: string) => void;
  setStopOnLoss: (value: string) => void;
  handleToggleAutoBet: () => void;
}

interface FlyingCoinData {
  id: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  delay: number;
}

const FlyingCoin: React.FC<{ coin: FlyingCoinData; onAnimationEnd: (id: number) => void }> = ({ coin, onAnimationEnd }) => {
    const [style, setStyle] = useState<React.CSSProperties>({
        position: 'fixed',
        left: coin.startX - 5,
        top: coin.startY - 5,
        opacity: 1,
    });

    useEffect(() => {
        const animateTimeout = setTimeout(() => {
            setStyle(s => ({
                ...s,
                left: coin.endX,
                top: coin.endY,
                transform: 'scale(0.5)',
                opacity: 0,
            }));
        }, coin.delay);

        const endTimeout = setTimeout(() => {
            onAnimationEnd(coin.id);
        }, coin.delay + 1000); // Animation duration is 1s

        return () => {
            clearTimeout(animateTimeout);
            clearTimeout(endTimeout);
        };
    }, [coin, onAnimationEnd]);

    return (
        <div
            style={{
                ...style,
                width: '10px',
                height: '10px',
                backgroundColor: '#34d399', // emerald-400
                borderRadius: '50%',
                zIndex: 9999,
                transition: 'top 1s cubic-bezier(0.5, 0, 1, 0.5), left 1s cubic-bezier(0.15, 0.75, 0.35, 1), opacity 0.8s linear 0.2s, transform 1s cubic-bezier(0.5, 0, 1, 1)',
                boxShadow: '0 0 8px #34d399',
                pointerEvents: 'none',
            }}
        />
    );
};


// Fix: Changed from a default export to a named export to resolve module resolution error.
export const Controls: React.FC<ControlsProps> = ({
  gameState,
  balance,
  betAmount,
  inputBet,
  multiplier,
  effectiveMultiplier,
  hasCashedOut,
  difficultyFactor,
  animationText,
  handleBetChange,
  validateAndSetBet,
  setBetAmount,
  handlePlaceBet,
  handleCashOut,
  playQuickBet,
  playQuickBetVibration,
  isAutoBetActive,
  autoBetRounds,
  roundsRemaining,
  stopOnProfit,
  stopOnLoss,
  setAutoBetRounds,
  setStopOnProfit,
  setStopOnLoss,
  handleToggleAutoBet,
}) => {
  const { t } = useTranslation();
  const isBettingDisabled = gameState !== GameState.BETTING;
  
  const buttonAreaRef = useRef<HTMLDivElement>(null);
  const balanceRef = useRef<HTMLDivElement>(null);
  const [flyingCoins, setFlyingCoins] = useState<FlyingCoinData[]>([]);

  useEffect(() => {
    if (animationText && animationText.type === 'win' && buttonAreaRef.current && balanceRef.current) {
        const startRect = buttonAreaRef.current.getBoundingClientRect();
        const endRect = balanceRef.current.getBoundingClientRect();
        const startX = startRect.left + startRect.width / 2;
        const startY = startRect.top + startRect.height / 2;

        const newCoins = Array.from({ length: 15 }).map(() => ({
            id: Math.random(),
            startX,
            startY,
            endX: endRect.left + endRect.width / 2 + (Math.random() - 0.5) * 40,
            endY: endRect.top + endRect.height / 2 + (Math.random() - 0.5) * 20,
            delay: Math.random() * 400,
        }));
        
        setFlyingCoins(currentCoins => [...currentCoins, ...newCoins]);
    }
  }, [animationText]);
  
  const handleAnimationEnd = useCallback((id: number) => {
    setFlyingCoins(currentCoins => currentCoins.filter(c => c.id !== id));
  }, []);

  const quickBet = (amount: number) => {
    if (isBettingDisabled && !isAutoBetActive) return;
    playQuickBet();
    playQuickBetVibration();
    const newBet = Math.min(MAX_BET, betAmount + amount);
    handleBetChange(newBet.toString());
  }
  
  const { level: challengeLevel, color: challengeColor } = useMemo(() => {
    if (difficultyFactor < 0.9) return { level: t('challengeLow'), color: 'text-green-400' };
    if (difficultyFactor < 1.1) return { level: t('challengeNormal'), color: 'text-yellow-400' };
    if (difficultyFactor < 1.3) return { level: t('challengeHigh'), color: 'text-orange-400' };
    return { level: t('challengeIntense'), color: 'text-red-500' };
  }, [difficultyFactor, t]);
  
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (!isBettingDisabled && !isAutoBetActive) {
        handlePlaceBet();
      }
    }
  };

  const renderManualButton = () => {
    switch(gameState) {
        case GameState.IN_PROGRESS:
            if (hasCashedOut) {
                return (
                    <button disabled className="w-full h-full text-lg sm:text-xl font-bold bg-gray-600 rounded-lg cursor-not-allowed flex flex-col items-center justify-center p-2">
                        {t('cashedOut')}
                    </button>
                );
            }
            return (
              <button
                onClick={handleCashOut}
                className="w-full h-full text-lg sm:text-xl font-bold bg-green-500 hover:bg-green-600 transition-all duration-200 rounded-lg shadow-lg transform active:scale-95 flex flex-col items-center justify-center p-2"
              >
                <div>{t('cashOutButton')}</div>
                <div className="text-base sm:text-lg font-semibold">{(betAmount * effectiveMultiplier).toFixed(2)}</div>
              </button>
            );
        
        case GameState.COUNTDOWN:
             return (
                <button disabled className="w-full h-full text-lg sm:text-xl font-bold bg-gray-700 rounded-lg cursor-wait p-2">
                    {t('getReady')}
                </button>
            );

        case GameState.CRASHED:
             return (
                <button disabled className="w-full h-full text-lg sm:text-xl font-bold bg-red-800 rounded-lg cursor-not-allowed p-2">
                    {t('roundOver')}
                </button>
            );

        case GameState.BETTING:
        default:
            return (
              <button
                onClick={handlePlaceBet}
                disabled={balance < betAmount || betAmount < MIN_BET || isAutoBetActive}
                className="w-full h-full text-xl font-bold bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 disabled:cursor-not-allowed transition-all duration-200 rounded-lg shadow-lg transform active:scale-95 p-2"
              >
                {t('placeBetButton')}
              </button>
            );
    }
  };

  const renderAutoBetButton = () => {
      if (isAutoBetActive) {
        return (
          <button onClick={handleToggleAutoBet} className="w-full h-full text-base sm:text-lg font-bold bg-amber-600 hover:bg-amber-700 transition-all duration-200 rounded-lg shadow-lg transform active:scale-95 flex flex-col items-center justify-center p-2">
            <div>{t('stopAutoBetButton')}</div>
            <div className="text-sm font-semibold">{t('roundsLeft', { count: roundsRemaining })}</div>
          </button>
        );
      }
      return (
        <button 
            onClick={handleToggleAutoBet} 
            disabled={isBettingDisabled} 
            className="w-full h-full text-base sm:text-lg font-bold bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed transition-all duration-200 rounded-lg shadow-lg transform active:scale-95 p-2"
        >
          {t('startAutoBetButton')}
        </button>
      );
  };

  const autoBetInputStyle = "w-full mt-1 px-3 py-2 bg-gray-900 border border-gray-600 rounded-md text-white text-center text-lg font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-700";

  return (
    <div className="p-2 sm:p-4 bg-black bg-opacity-20 rounded-xl border border-indigo-500/30">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="md:col-span-3 flex flex-col gap-4">
            <div className="p-3 bg-gray-800/50 rounded-lg">
                <label htmlFor="bet-amount" className="text-sm text-gray-400">{t('betAmount')}</label>
                <input
                    id="bet-amount"
                    type="number"
                    value={inputBet}
                    onChange={(e) => handleBetChange(e.target.value)}
                    onBlur={validateAndSetBet}
                    onKeyDown={handleKeyDown}
                    disabled={isAutoBetActive || isBettingDisabled}
                    className={autoBetInputStyle}
                />
                <div className="grid grid-cols-4 gap-2 mt-2">
                    <button onClick={() => quickBet(10)} disabled={isAutoBetActive || isBettingDisabled} className="bet-btn">+10</button>
                    <button onClick={() => quickBet(50)} disabled={isAutoBetActive || isBettingDisabled} className="bet-btn">+50</button>
                    <button onClick={() => quickBet(100)} disabled={isAutoBetActive || isBettingDisabled} className="bet-btn">+100</button>
                    <button onClick={() => { playQuickBet(); playQuickBetVibration(); handleBetChange(MAX_BET.toString()); }} disabled={isAutoBetActive || isBettingDisabled} className="bet-btn">MAX</button>
                </div>
            </div>
            
            <div className="p-3 bg-gray-800/50 rounded-lg grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                    <label className="text-sm text-gray-400">{t('numberOfRounds')}</label>
                    <input type="number" value={autoBetRounds} onChange={(e) => setAutoBetRounds(e.target.value)} disabled={isAutoBetActive} className={autoBetInputStyle} />
                </div>
                <div>
                    <label className="text-sm text-gray-400">{t('stopOnProfit')}</label>
                    <input type="number" value={stopOnProfit} onChange={(e) => setStopOnProfit(e.target.value)} placeholder={t('optionalPlaceholder')} disabled={isAutoBetActive} className={autoBetInputStyle} />
                </div>
                <div>
                    <label className="text-sm text-gray-400">{t('stopOnLoss')}</label>
                    <input type="number" value={stopOnLoss} onChange={(e) => setStopOnLoss(e.target.value)} placeholder={t('optionalPlaceholder')} disabled={isAutoBetActive} className={autoBetInputStyle} />
                </div>
            </div>
        </div>

        <div className="md:col-span-2 flex flex-col justify-between min-h-[120px]">
            <div className="flex justify-between items-center text-sm mb-2">
                <div ref={balanceRef} className="relative">
                    <span className="text-gray-400">{t('balance')} <span className="text-white font-semibold text-base sm:text-lg">{balance.toFixed(2)}</span></span>
                    {animationText && (
                        <span 
                            key={animationText.key} 
                            className={`absolute bottom-full left-1/2 -translate-x-1/2 whitespace-nowrap font-bold text-lg animate-float-up ${animationText.type === 'win' ? 'text-green-400' : 'text-red-500'}`}
                        >
                            {animationText.type === 'win' ? '+' : '-'}{animationText.amount.toFixed(2)}
                        </span>
                    )}
                </div>
                <span className="text-gray-400">{t('challenge')} <span className={`font-semibold text-base sm:text-lg ${challengeColor}`}>{challengeLevel}</span></span>
            </div>
            <div ref={buttonAreaRef} className="flex-grow grid grid-cols-1 sm:grid-cols-2 gap-2">
              {renderManualButton()}
              {renderAutoBetButton()}
            </div>
        </div>
      </div>

       <style>{`
            .bet-btn {
                @apply bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-2 rounded disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors text-sm;
            }
        `}</style>

        {/* Render flying coins */}
        {flyingCoins.map(coin => (
            <FlyingCoin key={coin.id} coin={coin} onAnimationEnd={handleAnimationEnd} />
        ))}
    </div>
  );
};
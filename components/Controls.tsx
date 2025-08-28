import React, { useState, useEffect } from 'react';
import { GameState } from '../types';
import { MIN_BET } from '../constants';
import { useTranslation } from '../i18n/useTranslation';

interface ControlsProps {
  gameState: GameState;
  balance: number;
  betAmount: number;
  inputBet: string;
  multiplier: number;
  effectiveMultiplier: number;
  hasCashedOut: boolean;
  handleBetChange: (value: string) => void;
  validateAndSetBet: () => void;
  setBetAmount: React.Dispatch<React.SetStateAction<number>>;
  handlePlaceBet: () => void;
  handleCashOut: () => void;
  playQuickBet: () => void;
  playQuickBetVibration: () => void;
  actionButtonRef: React.RefObject<HTMLButtonElement>;
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

export const Controls: React.FC<ControlsProps> = (props) => {
  const { t } = useTranslation();
  const { 
    gameState, balance, betAmount, inputBet, effectiveMultiplier, hasCashedOut,
    handleBetChange, validateAndSetBet, handlePlaceBet, handleCashOut, playQuickBet, playQuickBetVibration,
    isAutoBetActive, autoBetRounds, roundsRemaining, stopOnProfit, stopOnLoss,
    setAutoBetRounds, setStopOnProfit, setStopOnLoss, handleToggleAutoBet, actionButtonRef
  } = props;
  
  const [activeTab, setActiveTab] = useState<'manual' | 'auto'>('manual');
  
  const isBettingDisabled = gameState !== GameState.BETTING;

  // Switch tabs if auto-bet becomes active/inactive from logic
  useEffect(() => {
    if (isAutoBetActive) {
      setActiveTab('auto');
    }
  }, [isAutoBetActive]);
  
  const quickSetBet = (amount: number) => {
    if (isBettingDisabled) return;
    playQuickBet();
    playQuickBetVibration();
    handleBetChange(amount.toString());
  }

  const handlePlusMinus = (amount: number) => {
     if (isBettingDisabled) return;
     playQuickBet();
     playQuickBetVibration();
     const currentBet = parseFloat(inputBet) || 0;
     const newBet = Math.max(MIN_BET, currentBet + amount);
     handleBetChange(newBet.toString());
  };
  
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (!isBettingDisabled && activeTab === 'manual') {
        handlePlaceBet();
      }
    }
  };

  const renderActionContent = () => {
    switch(gameState) {
        case GameState.IN_PROGRESS:
            if (hasCashedOut) {
                return (
                    <button disabled className="w-full h-full text-lg sm:text-xl font-bold bg-gray-600 rounded-lg cursor-not-allowed flex items-center justify-center p-2">
                        {t('cashedOut')}
                    </button>
                );
            }
            return (
              <button
                ref={actionButtonRef}
                onClick={handleCashOut}
                className="w-full h-full text-lg sm:text-xl font-bold bg-amber-500 hover:bg-amber-600 transition-all duration-200 rounded-lg shadow-[0_5px_15px_rgba(245,158,11,0.4)] transform active:scale-95 flex flex-col items-center justify-center p-2 text-gray-900"
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
            const betButtonContent = activeTab === 'manual' 
                ? (<><div>{t('placeBetButton')}</div><div className="text-base sm:text-lg">{parseFloat(inputBet).toFixed(2)}</div></>)
                : (<div>{t('startAutoBetButton')}</div>);

            const betButtonAction = activeTab === 'manual' ? handlePlaceBet : handleToggleAutoBet;
            
            if (isAutoBetActive) {
              return (
                <button onClick={handleToggleAutoBet} className="w-full h-full text-base sm:text-lg font-bold bg-red-600 hover:bg-red-700 transition-all duration-200 rounded-lg shadow-lg transform active:scale-95 flex flex-col items-center justify-center p-2">
                  <div>{t('stopAutoBetButton')}</div>
                  <div className="text-sm font-semibold">{t('roundsLeft', { count: roundsRemaining })}</div>
                </button>
              )
            }
            
            return (
              <button
                ref={actionButtonRef}
                onClick={betButtonAction}
                disabled={balance < betAmount || betAmount < MIN_BET}
                className="w-full h-full text-xl font-bold bg-green-500 hover:bg-green-600 disabled:bg-gray-700 disabled:cursor-not-allowed transition-all duration-200 rounded-lg shadow-[0_5px_15px_rgba(34,197,94,0.4)] transform active:scale-95 p-2 flex flex-col items-center justify-center text-gray-900"
              >
                {betButtonContent}
              </button>
            );
    }
  };
  
  const commonInputStyle = "w-full mt-1 px-3 py-2 bg-gray-900/50 border border-gray-600 rounded-md text-white text-center text-base sm:text-lg font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-800";
  const tabStyle = "px-4 py-2 text-base font-semibold rounded-t-lg transition-colors";
  const activeTabStyle = "bg-gray-800/60 text-white";
  const inactiveTabStyle = "bg-gray-900/50 text-gray-400 hover:bg-gray-800/40";

  return (
    <div className="p-2 sm:p-4 bg-black bg-opacity-30 rounded-xl border border-gray-800">
        <div className="flex">
            <button 
                onClick={() => setActiveTab('manual')} 
                disabled={isAutoBetActive}
                className={`${tabStyle} ${activeTab === 'manual' ? activeTabStyle : inactiveTabStyle}`}
            >
                {t('manualBet')}
            </button>
             <button 
                onClick={() => setActiveTab('auto')} 
                disabled={gameState !== GameState.BETTING && !isAutoBetActive}
                className={`${tabStyle} ${activeTab === 'auto' ? activeTabStyle : inactiveTabStyle}`}
            >
                {t('autoBet')}
            </button>
        </div>

        <div className="p-4 bg-gray-800/60 rounded-b-lg rounded-r-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left Side (Inputs) */}
                <div className="flex flex-col gap-4">
                    <div>
                        <label htmlFor="bet-amount" className="text-sm text-gray-400">{t('betAmount')}</label>
                        <div className="flex items-center gap-2 mt-1">
                          <button onClick={() => handlePlusMinus(-10)} disabled={isBettingDisabled} className="bet-op-btn">-</button>
                          <input
                              id="bet-amount"
                              type="number"
                              value={inputBet}
                              onChange={(e) => handleBetChange(e.target.value)}
                              onBlur={validateAndSetBet}
                              onKeyDown={handleKeyDown}
                              disabled={isBettingDisabled}
                              className={commonInputStyle + " text-lg sm:text-xl"}
                          />
                          <button onClick={() => handlePlusMinus(10)} disabled={isBettingDisabled} className="bet-op-btn">+</button>
                        </div>
                        <div className="flex justify-between gap-2 mt-2">
                            <button onClick={() => quickSetBet(50)} disabled={isBettingDisabled} className="quick-bet-btn">50</button>
                            <button onClick={() => quickSetBet(100)} disabled={isBettingDisabled} className="quick-bet-btn">100</button>
                            <button onClick={() => quickSetBet(500)} disabled={isBettingDisabled} className="quick-bet-btn">500</button>
                            <button onClick={() => quickSetBet(1000)} disabled={isBettingDisabled} className="quick-bet-btn">1000</button>
                        </div>
                    </div>
                    {activeTab === 'auto' && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-gray-700 pt-4">
                            <div>
                                <label className="text-sm text-gray-400">{t('numberOfRounds')}</label>
                                <input type="number" value={autoBetRounds} onChange={(e) => setAutoBetRounds(e.target.value)} disabled={isAutoBetActive} className={commonInputStyle} />
                            </div>
                            <div>
                                <label className="text-sm text-gray-400">{t('stopOnProfit')}</label>
                                <input type="number" value={stopOnProfit} onChange={(e) => setStopOnProfit(e.target.value)} placeholder={t('optionalPlaceholder')} disabled={isAutoBetActive} className={commonInputStyle} />
                            </div>
                            <div>
                                <label className="text-sm text-gray-400">{t('stopOnLoss')}</label>
                                <input type="number" value={stopOnLoss} onChange={(e) => setStopOnLoss(e.target.value)} placeholder={t('optionalPlaceholder')} disabled={isAutoBetActive} className={commonInputStyle} />
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Side (Action Button) */}
                <div className="flex flex-col justify-center min-h-[100px] sm:min-h-[120px]">
                  {renderActionContent()}
                </div>
            </div>
        </div>

       <style>{`
            .bet-op-btn {
                @apply bg-gray-700 hover:bg-gray-600 text-white font-bold w-12 h-12 rounded-full disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors text-2xl flex-shrink-0;
            }
            .quick-bet-btn {
                @apply bg-transparent hover:bg-gray-700 border border-gray-600 text-gray-300 font-semibold py-1 px-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs sm:text-sm w-full;
            }
        `}</style>
    </div>
  );
};
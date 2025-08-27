
import React, { useMemo } from 'react';
import { GameState } from '../types';
import { PlaneIcon, ExplosionIcon, ShieldIcon } from './icons';
import { GAME_LOOP_INTERVAL_MS } from '../constants';

interface GameScreenProps {
  gameState: GameState;
  multiplier: number;
  effectiveMultiplier: number;
  betAmount: number;
  countdown: number;
  flightLog: string;
  isGeneratingLog: boolean;
  isSafeZone: boolean;
  flightDynamics: {
    planeY: number;
    shadowY: number;
    isWarning: boolean;
    proximity: number;
  };
}

const PayoutIndicator: React.FC<{
    multiplier: number;
    effectiveMultiplier: number;
    betAmount: number;
}> = ({ multiplier, effectiveMultiplier, betAmount }) => {
    const drainPercent = multiplier > 1 ? 1 - (effectiveMultiplier / multiplier) : 0;
    
    const payoutColor = useMemo(() => {
        if (drainPercent > 0.5) return 'text-red-500 animate-pulse';
        if (drainPercent > 0.2) return 'text-yellow-400';
        return 'text-green-400';
    }, [drainPercent]);

    return (
        <div className={`text-lg sm:text-xl md:text-2xl font-bold transition-colors duration-200 ${payoutColor}`}>
            Payout: {(betAmount * effectiveMultiplier).toFixed(2)}
        </div>
    );
};


const GameScreen: React.FC<GameScreenProps> = (props) => {
  const { 
    gameState, 
    multiplier, 
    effectiveMultiplier,
    betAmount,
    countdown, 
    flightLog, 
    isGeneratingLog, 
    isSafeZone,
    flightDynamics
  } = props;
  
  const { planeY, shadowY, isWarning } = flightDynamics;

  const isPreGame = gameState === GameState.BETTING || gameState === GameState.COUNTDOWN;
  const isRunning = gameState === GameState.IN_PROGRESS;
  const isCrashed = gameState === GameState.CRASHED;

  const planeScale = useMemo(() => 1 + Math.log10(Math.max(1, multiplier)) * 0.15, [multiplier]);

  const multiplierColor = isRunning 
    ? `text-cyan-300` 
    : isCrashed
    ? `text-red-500` 
    : `text-gray-400`;

  const renderContent = () => {
    switch (gameState) {
      case GameState.BETTING:
         return (
            <div className="text-center p-4 max-w-md">
                {isGeneratingLog ? (
                    <>
                        <div className="text-lg text-indigo-300 animate-pulse">AWAITING MISSION BRIEF...</div>
                        <div className="text-sm text-gray-400 mt-2">Connecting to command...</div>
                    </>
                ) : (
                    <>
                        <div className="text-lg text-indigo-300">MISSION BRIEFING</div>
                        <pre className="text-base sm:text-lg md:text-xl font-mono text-cyan-300 whitespace-pre-wrap mt-2">{flightLog}</pre>
                    </>
                )}
            </div>
        );
      case GameState.COUNTDOWN:
        return (
          <div className="text-center">
            <div className="text-xl text-gray-300">Takeoff in</div>
            <div className="text-5xl sm:text-6xl font-bold text-white drop-shadow-lg">{countdown}</div>
            <pre className="text-sm font-mono text-cyan-400 whitespace-pre-wrap mt-2 opacity-70 max-w-xs sm:max-w-sm truncate">{flightLog}</pre>
          </div>
        );
      case GameState.IN_PROGRESS:
      case GameState.CRASHED:
        return (
          <div className="text-center relative">
            {isCrashed && <div className="text-xl sm:text-2xl md:text-3xl font-bold text-red-500 absolute -top-10 left-1/2 -translate-x-1/2 w-full">CRASHED!</div>}
            <div className={`text-5xl sm:text-6xl md:text-8xl font-bold transition-colors duration-300 ${multiplierColor} drop-shadow-[0_0_15px_rgba(100,200,255,0.5)]`}>
              {multiplier.toFixed(2)}x
            </div>
             {isRunning && <PayoutIndicator betAmount={betAmount} multiplier={multiplier} effectiveMultiplier={effectiveMultiplier} />}
            {isSafeZone && isRunning && (
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-green-500/80 text-white px-3 py-1 rounded-full text-base sm:text-lg animate-pulse">
                    <ShieldIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                    SAFE ZONE
                </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`relative w-full aspect-video bg-black bg-opacity-30 rounded-xl overflow-hidden shadow-2xl border border-indigo-500/30 transition-all duration-300 ${isWarning ? 'warning-glow' : ''}`}>
        <style>{`
          .grid-background {
            background-image:
              linear-gradient(to right, rgba(79, 70, 229, 0.2) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(79, 70, 229, 0.2) 1px, transparent 1px);
            background-size: 2rem 2rem;
          }
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
            20%, 40%, 60%, 80% { transform: translateX(2px); }
          }
          .warning-glow {
            box-shadow: 0 0 20px 5px rgba(239, 68, 68, 0.5), inset 0 0 20px 5px rgba(239, 68, 68, 0.3);
            animation: shake 0.5s infinite;
          }
          @keyframes pulse-green {
            0%, 100% {
              filter: drop-shadow(0 0 8px rgba(50, 255, 150, 0.8));
            }
            50% {
              filter: drop-shadow(0 0 16px rgba(50, 255, 150, 1));
            }
          }
          .safe-zone-glow {
            animation: pulse-green 2s infinite ease-in-out;
          }
          @keyframes hover-effect {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-3px); }
          }
          .animate-hover {
            animation: hover-effect 2s ease-in-out infinite;
          }
          @keyframes trail {
            from {
                transform: translate(-50%, 0) scale(1);
                opacity: 0.6;
            }
            to {
                transform: translate(-50%, 2rem) scale(0);
                opacity: 0;
            }
          }
          .animate-trail {
             animation: trail 0.6s ease-out forwards;
          }
          @keyframes sparks {
            0% {
                transform: scale(1) translate(0, 0);
                opacity: 1;
            }
            100% {
                transform: scale(0) translate(var(--tx), var(--ty));
                opacity: 0;
            }
          }
          .animate-sparks {
              animation: sparks 0.5s ease-out forwards;
          }
        `}</style>
        <div className="absolute inset-0 grid-background opacity-50"></div>
      
      <div className="absolute inset-0 flex items-center justify-center">
        {renderContent()}
      </div>

      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        {!isPreGame && (
          <>
            {/* Main Plane */}
            <div 
              className="absolute h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12" 
              style={{ 
                left: `calc(${planeY}% - 1rem)`, 
                bottom: `${planeY}%`, 
                transition: `all ${GAME_LOOP_INTERVAL_MS}ms linear`,
                transform: `scale(${planeScale})` 
              }}
            >
              {isCrashed ? (
                <div className="relative w-full h-full"><ExplosionIcon className="w-full h-full text-orange-500 animate-ping opacity-75" /><ExplosionIcon className="absolute top-0 left-0 w-full h-full text-yellow-400" /></div>
              ) : (
                 <div className="relative w-full h-full animate-hover">
                    <PlaneIcon className={`w-full h-full ${isSafeZone ? 'text-green-400 safe-zone-glow' : 'text-cyan-300 drop-shadow-[0_0_8px_rgba(100,200,255,0.8)]'}`} />
                    {isRunning && multiplier < 1.5 && (
                      <div className="absolute top-0 left-0 w-full h-full">
                          {Array.from({ length: 3 }).map((_, i) => (
                              <div
                                  key={i}
                                  className="absolute w-1 h-3 sm:w-1.5 sm:h-4 bg-cyan-200/50 rounded-full animate-trail"
                                  style={{
                                      animationDelay: `${i * 0.1}s`,
                                      bottom: '-0.5rem',
                                      left: '50%',
                                  }}
                              />
                          ))}
                      </div>
                    )}
                    {isRunning && isWarning && (
                        <div className="absolute top-0 left-0 w-full h-full">
                            {Array.from({ length: 7 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="absolute w-0.5 h-0.5 sm:w-1 sm:h-1 bg-yellow-400 rounded-full animate-sparks"
                                    style={{
                                        top: `${Math.random() * 100}%`,
                                        left: `${Math.random() * 100}%`,
                                        animationDelay: `${Math.random() * 0.3}s`,
                                        ['--tx' as any]: `${(Math.random() - 0.5) * 40}px`,
                                        ['--ty' as any]: `${(Math.random() - 0.5) * 40}px`,
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>
              )}
            </div>
            {/* Shadow Plane */}
             {!isCrashed && (
                <div 
                  className="absolute h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 animate-hover" 
                  style={{ 
                    left: `calc(${shadowY}% - 1rem)`, 
                    bottom: `${shadowY}%`, 
                    transition: `all ${GAME_LOOP_INTERVAL_MS}ms linear`,
                    transform: `scale(${planeScale})`
                  }}
                >
                    <PlaneIcon className="w-full h-full text-red-500 opacity-70 drop-shadow-[0_0_8px_rgba(255,0,0,0.8)]" />
                </div>
             )}
          </>
        )}
      </div>
    </div>
  );
};

export default GameScreen;

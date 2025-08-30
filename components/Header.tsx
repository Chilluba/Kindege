import React, { useMemo } from 'react';
import LanguageSwitcher from './LanguageSwitcher';
import { HistoryIcon } from './icons'; // Import new icon
import { useTranslation } from '../i18n/useTranslation';

interface HeaderProps {
    balance: number;
    balanceRef: React.RefObject<HTMLDivElement>;
    difficultyFactor: number;
    onOpenHistory: () => void; // Add prop to open modal
}

const Header: React.FC<HeaderProps> = ({ balance, balanceRef, difficultyFactor, onOpenHistory }) => {
    const { t } = useTranslation();

    const { level: challengeLevel, color: challengeColor } = useMemo(() => {
        if (difficultyFactor < 0.9) return { level: t('challengeLow'), color: 'text-green-400' };
        if (difficultyFactor < 1.1) return { level: t('challengeNormal'), color: 'text-yellow-400' };
        if (difficultyFactor < 1.3) return { level: t('challengeHigh'), color: 'text-orange-400' };
        return { level: t('challengeIntense'), color: 'text-red-500' };
    }, [difficultyFactor, t]);

    return (
        <header className="w-full max-w-5xl mx-auto p-3 bg-black bg-opacity-20 rounded-lg flex justify-between items-center border border-gray-800">
            <div>
                <h1 className="text-2xl font-bold text-cyan-300 drop-shadow-[0_0_8px_rgba(100,200,255,0.8)]">
                    Shadow Flight
                </h1>
                <div className="text-gray-400 text-sm mt-1">
                    {t('challenge')} <span className={`font-semibold ${challengeColor}`}>{challengeLevel}</span>
                </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
                 <button 
                    onClick={onOpenHistory} 
                    className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                    aria-label={t('historyButton')}
                 >
                    <HistoryIcon className="w-6 h-6 text-gray-300"/>
                 </button>
                 <div ref={balanceRef} className="relative text-right">
                    <div className="text-gray-400 text-sm">{t('balance')}</div>
                    <div className="text-white font-semibold text-lg sm:text-xl">{balance.toFixed(2)} <span className="text-gray-500 text-base">TZS</span></div>
                </div>
                <LanguageSwitcher />
            </div>
        </header>
    );
};

export default Header;

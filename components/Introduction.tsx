import React from 'react';
import { THEORETICAL_RTP } from '../constants';
import { useTranslation } from '../i18n/useTranslation';

interface IntroductionProps {
  onStartGame: () => void;
}

const Introduction: React.FC<IntroductionProps> = ({ onStartGame }) => {
  const { t } = useTranslation();

  return (
    <div className="w-full max-w-2xl mx-auto bg-black bg-opacity-40 rounded-xl border border-indigo-500/30 p-6 sm:p-8 text-center animate-fade-in">
      <h1 className="text-3xl sm:text-4xl font-bold text-cyan-300 drop-shadow-[0_0_8px_rgba(100,200,255,0.8)]">{t('welcomeTitle')}</h1>
      <p className="text-indigo-200 mt-2">{t('welcomeSubtitle')}</p>
      
      <div className="text-left mt-8 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white mb-2">{t('objectiveTitle')}</h2>
          <p className="text-gray-300">{t('objectiveText')}</p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-white mb-2">{t('howToPlayTitle')}</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-300">
            <li><span className="font-semibold text-white">{t('howToPlayStep1')}</span> {t('howToPlayStep1Text')}</li>
            <li><span className="font-semibold text-white">{t('howToPlayStep2')}</span> {t('howToPlayStep2Text')}</li>
            <li><span className="font-semibold text-white">{t('howToPlayStep3')}</span> {t('howToPlayStep3Text')}</li>
            <li><span className="font-semibold text-white">{t('howToPlayStep4')}</span> {t('howToPlayStep4Text')}</li>
          </ol>
        </div>

        <div>
            <h2 className="text-xl font-bold text-white mb-2">{t('newMechanicsTitle')}</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
                <li><span className="font-semibold text-yellow-400">{t('mechanicAdaptive')}</span> {t('mechanicAdaptiveText')}</li>
                <li><span className="font-semibold text-green-400">{t('mechanicSafeZones')}</span> {t('mechanicSafeZonesText')}</li>
                 <li><span className="font-semibold text-cyan-400">{t('mechanicFair')}</span> {t('mechanicFairText', { rtp: THEORETICAL_RTP })}</li>
            </ul>
        </div>
      </div>
      
      <button 
        onClick={onStartGame}
        className="mt-10 w-full md:w-auto px-10 py-4 text-xl font-bold bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 transition-all duration-200 rounded-lg shadow-lg transform active:scale-95"
      >
        {t('beginMissionButton')}
      </button>

      <p className="text-sm text-gray-400 mt-4">{t('creatorCredit')}</p>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Introduction;

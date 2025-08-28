import React from 'react';
import type { HistoryItem } from '../types';
import { useTranslation } from '../i18n/useTranslation';

interface HistoryBarProps {
  history: HistoryItem[];
}

const HistoryBar: React.FC<HistoryBarProps> = ({ history }) => {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-center gap-2 md:gap-4 p-2 bg-black bg-opacity-30 rounded-lg border border-gray-800">
      <span className="text-sm text-gray-400 hidden sm:block">{t('lastCrashes')}</span>
      <div className="flex gap-2 md:gap-3">
        {history.length > 0 ? (
          history.map(item => (
            <div
              key={item.id}
              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                item.multiplier < 1.5 ? 'bg-red-500/80 text-white' : item.multiplier < 5 ? 'bg-cyan-500/80 text-white' : 'bg-amber-400/80 text-gray-900'
              }`}
            >
              {item.multiplier.toFixed(2)}x
            </div>
          ))
        ) : (
          <span className="text-sm text-gray-500">{t('noHistory')}</span>
        )}
      </div>
    </div>
  );
};

export default HistoryBar;
